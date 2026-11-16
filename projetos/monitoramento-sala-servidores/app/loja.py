"""
loja.py — a aplicação monitorada: uma API de loja bem simples
==========================================================================

Por que existe: monitorar só hardware não basta. Numa empresa, o que importa
no fim é "o sistema está atendendo bem os clientes?". Esta API faz o papel
de um sistema real: recebe pedidos, grava no PostgreSQL e expõe as próprias
métricas para o Zabbix em /metricas.

Rotas:
  GET  /                    página simples com os últimos pedidos
  GET  /api/produtos        lista de produtos (lê o banco)
  POST /api/pedidos         cria um pedido {produto_id, quantidade} (escreve no banco)
  GET  /saude               200 se a API e o banco respondem, 503 se não
  GET  /metricas            JSON que o Zabbix lê (requisições, latência, erros, CPU...)
  POST /admin/falha         injeta falhas para testar os alertas (o gerador tem botões):
                              nenhuma   — tudo normal (desfaz os outros)
                              lenta     — respostas de 0,6 a 1,5 s
                              erros     — 30% das requisições falham (500)
                              conexoes  — abre ~92 conexões com o banco e não solta
                              cpu       — gasta processador à toa por 3 minutos
                              cair      — o processo morre (quem religa? Docker ou o vigia)

Configuração por variáveis de ambiente: LOJA_DB_HOST, LOJA_DB_PORTA, LOJA_DB_NOME,
LOJA_DB_USUARIO, LOJA_DB_SENHA, LOJA_PORTA.
"""

import os
import random
import signal
import threading
import time
from collections import deque

import psycopg2
import psycopg2.pool
from flask import Flask, g, jsonify, request

app = Flask(__name__)
INICIO = time.time()

BANCO = dict(
    host=os.environ.get("LOJA_DB_HOST", "127.0.0.1"),
    port=int(os.environ.get("LOJA_DB_PORTA", "5432")),
    dbname=os.environ.get("LOJA_DB_NOME", "loja"),
    user=os.environ.get("LOJA_DB_USUARIO", "loja"),
    password=os.environ.get("LOJA_DB_SENHA", ""),
    connect_timeout=3,
)
pool = psycopg2.pool.ThreadedConnectionPool(1, 10, **BANCO)

# ---------------------------------------------------------------------
# Métricas: cada requisição vira (instante, duração, deu_erro).
# Guardamos só os últimos 60 s — é a "janela" que o Zabbix enxerga.
# ---------------------------------------------------------------------
JANELA = 60
historico = deque()
trava = threading.Lock()
contador = {"total": 0, "erros": 0, "pedidos": 0}
falha = {"tipo": "nenhuma"}           # falha injetada pelo gerador
conexoes_presas = []                  # cenário "conexoes": conexões abertas de propósito


@app.before_request
def _inicio():
    g.t0 = time.perf_counter()


@app.after_request
def _fim(resposta):
    if request.path in ("/metricas", "/saude"):
        return resposta                     # o próprio monitoramento não conta como tráfego
    dur = time.perf_counter() - g.t0
    erro = resposta.status_code >= 500
    agora = time.time()
    with trava:
        historico.append((agora, dur, erro))
        contador["total"] += 1
        contador["erros"] += erro
        while historico and historico[0][0] < agora - JANELA:
            historico.popleft()
    return resposta


def banco():
    """Pega uma conexão do pool (devolvida no fim da requisição)."""
    if "con" not in g:
        g.con = pool.getconn()
    return g.con


@app.teardown_request
def _devolver(_erro):
    con = g.pop("con", None)
    if con is not None:
        if con.closed:
            pool.putconn(con, close=True)
        else:
            con.rollback()
            pool.putconn(con)


def aplicar_falha():
    """Falhas injetadas: deixam a API lenta ou fazem parte das chamadas falhar."""
    if falha["tipo"] == "lenta":
        time.sleep(random.uniform(0.6, 1.5))
    elif falha["tipo"] == "erros" and random.random() < 0.3:
        raise RuntimeError("falha injetada")


# ---------------------------------------------------------------------
# Rotas da loja
# ---------------------------------------------------------------------
@app.get("/api/produtos")
def produtos():
    aplicar_falha()
    with banco().cursor() as cur:
        cur.execute("SELECT id, nome, preco, estoque FROM produtos ORDER BY id")
        linhas = cur.fetchall()
    return jsonify([{"id": i, "nome": n, "preco": float(p), "estoque": e} for i, n, p, e in linhas])


@app.post("/api/pedidos")
def novo_pedido():
    aplicar_falha()
    dados = request.get_json(silent=True) or {}
    produto_id = int(dados.get("produto_id", 1))
    quantidade = max(1, min(5, int(dados.get("quantidade", 1))))
    con = banco()
    with con.cursor() as cur:
        # Transação: baixa o estoque e registra o pedido juntos (ou nenhum dos dois).
        cur.execute("UPDATE produtos SET estoque = estoque - %s WHERE id = %s AND estoque >= %s RETURNING estoque",
                    (quantidade, produto_id, quantidade))
        if cur.fetchone() is None:
            # Sem estoque: "repõe" para a loja nunca parar (é um laboratório).
            cur.execute("UPDATE produtos SET estoque = estoque + 500 WHERE id = %s", (produto_id,))
            con.commit()
            return jsonify({"ok": False, "motivo": "estoque reposto, tente de novo"}), 409
        cur.execute("INSERT INTO pedidos (produto_id, quantidade) VALUES (%s, %s) RETURNING id", (produto_id, quantidade))
        pedido_id = cur.fetchone()[0]
    con.commit()
    with trava:
        contador["pedidos"] += 1
    return jsonify({"ok": True, "pedido": pedido_id}), 201


@app.get("/")
def inicio():
    with banco().cursor() as cur:
        cur.execute("""SELECT p.id, pr.nome, p.quantidade, to_char(p.criado_em, 'HH24:MI:SS')
                       FROM pedidos p JOIN produtos pr ON pr.id = p.produto_id
                       ORDER BY p.id DESC LIMIT 15""")
        linhas = cur.fetchall()
    itens = "".join(f"<tr><td>#{i}</td><td>{n}</td><td>{q}</td><td>{h}</td></tr>" for i, n, q, h in linhas)
    return (f"<!doctype html><meta charset=utf-8><title>Loja</title>"
            f"<style>body{{font-family:system-ui;background:#15181d;color:#d8d9da;padding:20px}}"
            f"td{{padding:4px 12px}}</style><h1>Loja — últimos pedidos</h1><table>{itens}</table>")


# ---------------------------------------------------------------------
# Saúde e métricas (o que o Zabbix lê)
# ---------------------------------------------------------------------
@app.get("/saude")
def saude():
    try:
        with banco().cursor() as cur:
            cur.execute("SELECT 1")
        return jsonify({"ok": True})
    except Exception as e:                  # noqa: BLE001 — qualquer falha = não saudável
        return jsonify({"ok": False, "erro": str(e)[:200]}), 503


_cpu_anterior = {"t": time.time(), "cpu": time.process_time()}


def cpu_do_processo():
    """% de CPU usada pela própria API desde a última leitura. Um processo
    sempre pode medir o próprio consumo, mesmo no Android sem root."""
    agora, cpu = time.time(), time.process_time()
    dt = agora - _cpu_anterior["t"]
    pct = 100 * (cpu - _cpu_anterior["cpu"]) / dt if dt > 0 else 0
    _cpu_anterior.update(t=agora, cpu=cpu)
    return round(pct, 1)


def memoria_mb():
    try:
        with open("/proc/self/statm") as f:            # o próprio processo: sempre legível
            return round(int(f.read().split()[1]) * os.sysconf("SC_PAGE_SIZE") / 1024 ** 2, 1)
    except OSError:
        return None


@app.get("/metricas")
def metricas():
    agora = time.time()
    with trava:
        janela = [r for r in historico if r[0] >= agora - JANELA]
        total, erros, pedidos = contador["total"], contador["erros"], contador["pedidos"]
    duracoes = sorted(d for _, d, _ in janela)
    n = len(duracoes)
    p95 = duracoes[min(n - 1, int(n * 0.95))] if n else 0
    banco_ok = 1
    try:
        with banco().cursor() as cur:
            cur.execute("SELECT 1")
    except Exception:                       # noqa: BLE001
        banco_ok = 0
    return jsonify({
        "disponivel": 1,
        "banco_ok": banco_ok,
        "requisicoes_por_seg": round(n / JANELA, 2),
        "latencia_media_ms": round(1000 * sum(duracoes) / n, 1) if n else 0,
        "latencia_p95_ms": round(1000 * p95, 1),
        "erros_pct": round(100 * sum(1 for *_, e in janela if e) / n, 1) if n else 0,
        "requisicoes_total": total,
        "erros_total": erros,
        "pedidos_total": pedidos,
        "cpu_pct": cpu_do_processo(),
        "memoria_mb": memoria_mb(),
        "threads": threading.active_count(),
        "conexoes_pool": len(pool._used),      # conexões com o banco em uso agora
        "uptime_s": int(agora - INICIO),
        "falha_injetada": falha["tipo"],
        "conexoes_presas": len(conexoes_presas),
    })


# ---------------------------------------------------------------------
# Cenários de falha (só para o laboratório)
# ---------------------------------------------------------------------
def prender_conexoes(quantas=92):
    """Banco lotado: abre conexões e não devolve, como um código com
    "vazamento de conexão". O PostgreSQL tem um máximo (padrão 100); perto
    dele, ninguém mais consegue entrar."""
    for _ in range(quantas):
        if falha["tipo"] != "conexoes":
            break
        try:
            conexoes_presas.append(psycopg2.connect(**BANCO))
        except psycopg2.OperationalError:
            break                       # chegou no limite do banco


def soltar_conexoes():
    while conexoes_presas:
        try:
            conexoes_presas.pop().close()
        except Exception:               # noqa: BLE001
            pass


def queimar_cpu(segundos=180):
    """CPU alta: conta à toa, como um código ineficiente ou um laço infinito."""
    fim = time.time() + segundos
    while time.time() < fim and falha["tipo"] == "cpu":
        sum(i * i for i in range(10000))


def cair():
    """Derruba a aplicação inteira: avisa o processo principal (gunicorn)
    para encerrar. No Docker, a restart policy religa; no celular, o vigia."""
    time.sleep(0.5)                     # dá tempo de responder ao gerador
    os.kill(os.getppid(), signal.SIGTERM)
    time.sleep(3)
    os._exit(1)


TIPOS_FALHA = ("nenhuma", "lenta", "erros", "conexoes", "cpu", "cair")


@app.post("/admin/falha")
def admin_falha():
    tipo = (request.get_json(silent=True) or {}).get("tipo", "nenhuma")
    if tipo not in TIPOS_FALHA:
        return jsonify({"ok": False}), 400
    falha["tipo"] = tipo
    if tipo != "conexoes":
        soltar_conexoes()
    if tipo == "conexoes":
        threading.Thread(target=prender_conexoes, daemon=True).start()
    elif tipo == "cpu":
        threading.Thread(target=queimar_cpu, daemon=True).start()
    elif tipo == "cair":
        threading.Thread(target=cair, daemon=True).start()
    return jsonify({"ok": True, "falha": tipo})


@app.errorhandler(Exception)
def _erro(e):
    return jsonify({"ok": False, "erro": str(e)[:200]}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("LOJA_PORTA", "8080")), threaded=True)
