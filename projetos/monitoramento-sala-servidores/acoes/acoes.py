"""
acoes.py — o "balcão de ações" da central (triagem e correção)
==========================================================================

Por que existe: a ponte do Grafana até o Zabbix só deixa LER. Para AGIR
(reconhecer um alerta, pôr um servidor em manutenção) alguém precisa falar com
o Zabbix com permissão de escrita — e essa permissão não pode morar no
navegador, onde qualquer um abriria o "inspecionar elemento" e a veria.

Caminho de um clique:

   navegador ──(cookie do Grafana)──> ESTE serviço ──(usuário restrito)──> Zabbix
                                         │
                                         └─ pergunta ao Grafana "quem é esse cookie?"

1. QUEM é: o navegador manda o cookie de sessão do Grafana. Este serviço
   pergunta ao próprio Grafana (/api/user) de quem é. Sem login, nada feito.
2. PODE? só papel Editor ou Admin no Grafana (Viewer só olha).
3. O QUÊ: só as ações deste arquivo (catálogo fechado). Nada de "rode este
   comando": o navegador escolhe UMA ação da lista e manda os dados dela.
   Triagem: reconhecer, comentar, manutenção. Correção: reiniciar a
   aplicação e encerrar conexões ociosas (Scripts do Zabbix, rodados pelo
   agente de cada servidor).
4. COMO: com o usuário "central-acoes" do Zabbix, que só pode chamar meia
   dúzia de métodos da API (zabbix/configurar.py cria esse papel).
5. REGISTRO: cada ação vai para o log (docker compose logs acoes) e para o
   próprio Zabbix, com o nome da PESSOA no texto ("[Grafana: brendo] ...").

Usa só a biblioteca padrão do Python.
"""

import http.cookies
import json
import os
import re
import threading
import time
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

GRAFANA = os.environ.get("GRAFANA_URL", "http://grafana:3000")
ZABBIX = os.environ.get("ZABBIX_API_URL", "http://zabbix-web:8080/api_jsonrpc.php")
USUARIO_ZBX = os.environ.get("ACOES_ZABBIX_USUARIO", "central-acoes")
SENHA_ZBX = os.environ.get("ACOES_ZABBIX_SENHA", "")
# De onde vem a página da central. Pedidos de outro site são recusados.
ORIGENS = {o.strip() for o in os.environ.get("ORIGENS_PERMITIDAS", "http://localhost:3000").split(",") if o.strip()}
PAPEIS_QUE_AGEM = {"Editor", "Admin"}
GRUPO = "Sala do servidor"
PREFIXO_MANUTENCAO = "Central: "              # só mexemos nas manutenções que nós criamos
MINUTOS_PERMITIDOS = (15, 30, 60, 120, 240)
LIMITE_POR_MINUTO = 10                         # ações por pessoa por minuto


class Recusa(Exception):
    """Erro que vira resposta para o navegador (com o código HTTP)."""
    def __init__(self, codigo, mensagem):
        super().__init__(mensagem)
        self.codigo = codigo


# =====================================================================
# Zabbix: login com o usuário restrito, refeito sozinho se a sessão cair
# =====================================================================
class Zabbix:
    def __init__(self):
        self.token = None
        self.trava = threading.Lock()

    def _rpc(self, metodo, params, token):
        corpo = json.dumps({"jsonrpc": "2.0", "method": metodo, "params": params, "id": 1}).encode()
        cab = {"Content-Type": "application/json-rpc"}
        if token:
            cab["Authorization"] = f"Bearer {token}"
        # Reiniciar um serviço pode levar alguns segundos; o resto é rápido.
        espera = 45 if metodo == "script.execute" else 15
        with urllib.request.urlopen(urllib.request.Request(ZABBIX, corpo, cab), timeout=espera) as r:
            resposta = json.load(r)
        if "error" in resposta:
            raise RuntimeError(f"{resposta['error'].get('message')} {resposta['error'].get('data')}")
        return resposta["result"]

    def chamar(self, metodo, params):
        with self.trava:
            if not self.token:
                if not SENHA_ZBX:
                    raise Recusa(503, "ACOES_ZABBIX_SENHA não está no .env (rode zabbix/configurar.py).")
                self.token = self._rpc("user.login", {"username": USUARIO_ZBX, "password": SENHA_ZBX}, None)
            token = self.token
        try:
            return self._rpc(metodo, params, token)
        except RuntimeError as e:
            if "re-login" not in str(e) and "Session terminated" not in str(e) and "Not authorized" not in str(e):
                raise
            with self.trava:                    # sessão expirou: entra de novo e tenta uma vez
                self.token = None
            return self.chamar(metodo, params)


zbx = Zabbix()


# =====================================================================
# Quem está pedindo? (o Grafana responde)
# =====================================================================
def pessoa_do_grafana(cabecalho_cookie):
    """Devolve {login, nome, papel} de quem está logado no Grafana, ou recusa."""
    biscoitos = http.cookies.SimpleCookie()
    try:
        biscoitos.load(cabecalho_cookie or "")
    except http.cookies.CookieError:
        pass
    sessao = biscoitos.get("grafana_session")
    if not sessao:
        raise Recusa(401, "Entre no Grafana para usar as ações.")
    # Repassamos SÓ o cookie do Grafana (não os outros que o navegador tenha).
    cab = {"Cookie": f"grafana_session={sessao.value}"}

    def pegar(caminho):
        try:
            with urllib.request.urlopen(urllib.request.Request(GRAFANA + caminho, headers=cab), timeout=5) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code == 401:
                raise Recusa(401, "Sessão do Grafana expirada: entre de novo.")
            raise

    usuario = pegar("/api/user")
    papel = next((o["role"] for o in pegar("/api/user/orgs") if o["orgId"] == usuario.get("orgId")), "Viewer")
    return {"login": usuario["login"], "nome": usuario.get("name") or usuario["login"], "papel": papel}


# Limite de ações por pessoa (evita um clique preso disparando 100 vezes).
_recentes, _trava_recentes = {}, threading.Lock()


def conferir_limite(login):
    agora = time.time()
    with _trava_recentes:
        lista = [t for t in _recentes.get(login, []) if agora - t < 60]
        if len(lista) >= LIMITE_POR_MINUTO:
            raise Recusa(429, "Muitas ações em sequência. Espere um minuto.")
        _recentes[login] = lista + [agora]


def auditar(pessoa, acao, dados, resultado):
    registro = {"quando": time.strftime("%Y-%m-%d %H:%M:%S"), "quem": pessoa["login"], "papel": pessoa["papel"],
                "acao": acao, "dados": dados, "resultado": resultado}
    print("AUDITORIA " + json.dumps(registro, ensure_ascii=False), flush=True)


# =====================================================================
# Conferências dos dados que vêm do navegador (nunca confie neles)
# =====================================================================
def texto(dados, campo, minimo=3, maximo=300):
    valor = str(dados.get(campo) or "").strip()
    if len(valor) < minimo:
        raise Recusa(400, "Escreva o motivo (pelo menos 3 letras).")
    return valor[:maximo]


def numero_id(dados, campo):
    valor = str(dados.get(campo) or "")
    if not re.fullmatch(r"\d{1,20}", valor):
        raise Recusa(400, f"{campo} inválido.")
    return valor


def assinatura(pessoa, frase):
    # O Zabbix grava o usuário "central-acoes"; o nome da pessoa vai no texto.
    return f"[Grafana: {pessoa['nome']}] {frase}"


def evento_da_sala(eventid):
    """O evento existe e é de um host do grupo da sala? (o usuário restrito
    só enxerga esse grupo, então um id de fora volta vazio)."""
    ev = zbx.chamar("event.get", {"eventids": [eventid], "output": ["eventid", "name", "acknowledged"],
                                  "selectHosts": ["name"]})
    if not ev:
        raise Recusa(404, "Esse alerta não existe mais (ou não é da sala).")
    return ev[0]


def host_da_sala(hostid):
    h = zbx.chamar("host.get", {"hostids": [hostid], "output": ["hostid", "name", "maintenance_status"]})
    if not h:
        raise Recusa(404, "Servidor não encontrado na sala.")
    return h[0]


# =====================================================================
# O CATÁLOGO: cada ação é uma função. Nada fora daqui é executado.
# =====================================================================
# event.acknowledge recebe uma SOMA de bandeiras (cada uma é um bit):
RECONHECER, MENSAGEM, DESRECONHECER = 2, 4, 16


def acao_reconhecer(pessoa, dados):
    """Reconhecer = "eu vi e estou cuidando". O alerta continua aberto (só
    some quando o problema acaba de verdade), mas a equipe sabe que tem dono
    e o Telegram para de cobrar (se houver escalonamento)."""
    eventid = numero_id(dados, "eventid")
    motivo = texto(dados, "motivo")
    ev = evento_da_sala(eventid)
    if ev["acknowledged"] == "1":
        raise Recusa(409, "Esse alerta já foi reconhecido.")
    zbx.chamar("event.acknowledge", {"eventids": [eventid], "action": RECONHECER | MENSAGEM,
                                     "message": assinatura(pessoa, motivo)})
    return f"Reconhecido: {ev['name']}"


def acao_comentar(pessoa, dados):
    """Comentário = anotação no histórico do alerta (o que já foi tentado,
    quem foi chamado). Fica gravado no Zabbix junto com o alerta."""
    eventid = numero_id(dados, "eventid")
    nota = texto(dados, "motivo")
    ev = evento_da_sala(eventid)
    zbx.chamar("event.acknowledge", {"eventids": [eventid], "action": MENSAGEM,
                                     "message": assinatura(pessoa, nota)})
    return f"Comentário anotado em: {ev['name']}"


def acao_manutencao(pessoa, dados):
    """Manutenção = "vou mexer nesse servidor, não me alarmem". O Zabbix
    continua COLETANDO (os gráficos seguem), mas os alertas ficam
    suprimidos e o Telegram não dispara até o horário acabar."""
    hostid = numero_id(dados, "hostid")
    motivo = texto(dados, "motivo")
    try:
        minutos = int(dados.get("minutos"))
    except (TypeError, ValueError):
        minutos = 0
    if minutos not in MINUTOS_PERMITIDOS:
        raise Recusa(400, "Duração inválida.")
    host = host_da_sala(hostid)
    agora = int(time.time())
    zbx.chamar("maintenance.create", {
        "name": f"{PREFIXO_MANUTENCAO}{host['name']} {time.strftime('%d/%m %H:%M:%S')}",
        "active_since": agora - 60,                   # 1 min de folga para relógios desencontrados
        "active_till": agora + minutos * 60,
        "maintenance_type": 0,                         # 0 = COM coleta de dados
        "description": assinatura(pessoa, motivo),
        "hosts": [{"hostid": hostid}],
        "timeperiods": [{"timeperiod_type": 0, "start_date": agora - 60, "period": minutos * 60 + 60}],
    })
    return f"{host['name']} em manutenção por {minutos} min (o Zabbix aplica em até 1 min)"


def acao_encerrar_manutencao(pessoa, dados):
    hostid = numero_id(dados, "hostid")
    texto(dados, "motivo")
    host = host_da_sala(hostid)
    minhas = [m["maintenanceid"] for m in zbx.chamar("maintenance.get", {
        "hostids": [hostid], "output": ["maintenanceid", "name"],
        "search": {"name": PREFIXO_MANUTENCAO}, "startSearch": True})]
    if not minhas:
        raise Recusa(404, "Não há manutenção da central neste servidor.")
    zbx.chamar("maintenance.delete", minhas)
    return f"Manutenção de {host['name']} encerrada (o Zabbix aplica em até 1 min)"


def consultar_manutencoes():
    """Até quando cada servidor fica em manutenção (só leitura)."""
    agora = int(time.time())
    lista = zbx.chamar("maintenance.get", {"output": ["name", "active_till", "description"],
                                           "selectHosts": ["hostid"], "search": {"name": PREFIXO_MANUTENCAO},
                                           "startSearch": True})
    saida = {}
    for m in lista:
        if int(m["active_till"]) <= agora:
            continue
        for h in m["hosts"]:
            fim = max(saida.get(h["hostid"], {}).get("ate", 0), int(m["active_till"]))
            saida[h["hostid"]] = {"ate": fim, "motivo": m["description"]}
    return saida


# ---------------------------------------------------------------------
# Ações que CORRIGEM: pedem ao Zabbix para rodar um Script no agente do
# servidor. O botão é o mesmo em qualquer servidor; quem decide COMO fazer
# é o arquivo /opt/acoes/<receita>.sh daquele servidor (Docker, celular...
# ou, na nuvem, uma chamada à AWS/Azure/Oracle).
# ---------------------------------------------------------------------
def executar_script(pessoa, dados, nome_script, rotulo):
    hostid = numero_id(dados, "hostid")
    motivo = texto(dados, "motivo")
    h = zbx.chamar("host.get", {"hostids": [hostid], "output": ["name"], "selectInterfaces": ["type", "available"]})
    if not h:
        raise Recusa(404, "Servidor não encontrado na sala.")
    host = h[0]
    agentes = [i for i in host["interfaces"] if i["type"] == "1"]
    if not agentes:
        raise Recusa(400, f"{host['name']} não tem agente Zabbix para executar ações.")
    # available 2 = o Zabbix já sabe que o agente não responde: avisa na hora,
    # em vez de deixar a pessoa esperando o tempo limite.
    if all(i["available"] == "2" for i in agentes):
        raise Recusa(503, f"{host['name']} está sem resposta: a ação não foi executada.")
    script = zbx.chamar("script.get", {"filter": {"name": nome_script}, "output": ["scriptid"]})
    if not script:
        raise Recusa(503, f"O script '{nome_script}' não existe no Zabbix (rode zabbix/configurar.py).")
    try:
        r = zbx.chamar("script.execute", {"scriptid": script[0]["scriptid"], "hostid": hostid})
    except RuntimeError as e:
        raise Recusa(502, f"{host['name']} não executou: {str(e)[:160]}")
    except (TimeoutError, urllib.error.URLError):
        raise Recusa(504, f"{host['name']} não respondeu a tempo: confira no servidor se a ação foi feita.")
    saida = (r.get("value") or "").strip()[:300]
    # Se a ação foi feita a partir de um alerta, a história fica nele também.
    if dados.get("eventid"):
        eventid = numero_id(dados, "eventid")
        zbx.chamar("event.acknowledge", {"eventids": [eventid], "action": MENSAGEM,
                                         "message": assinatura(pessoa, f"{rotulo}: {motivo} → {saida}")})
    if r.get("response") != "success":
        raise Recusa(502, f"{host['name']}: {saida or 'falhou'}")
    return f"{host['name']}: {saida}"


def acao_reiniciar_app(pessoa, dados):
    return executar_script(pessoa, dados, "Central: reiniciar aplicação", "Reiniciou a aplicação")


def acao_encerrar_ociosas(pessoa, dados):
    return executar_script(pessoa, dados, "Central: encerrar conexões ociosas", "Encerrou conexões ociosas")


CATALOGO = {
    "reconhecer": acao_reconhecer,
    "comentar": acao_comentar,
    "manutencao": acao_manutencao,
    "encerrar-manutencao": acao_encerrar_manutencao,
    "reiniciar-app": acao_reiniciar_app,
    "encerrar-ociosas": acao_encerrar_ociosas,
}


# =====================================================================
# Servidor HTTP
# =====================================================================
class Tratador(BaseHTTPRequestHandler):
    def _origem_ok(self):
        return self.headers.get("Origin") in ORIGENS

    def _json(self, codigo, obj):
        corpo = json.dumps(obj, ensure_ascii=False).encode()
        self.send_response(codigo)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(corpo)))
        self.send_header("Cache-Control", "no-store")
        if self._origem_ok():
            # CORS: o navegador só entrega a resposta (e só manda o cookie)
            # se a página for de uma origem desta lista.
            self.send_header("Access-Control-Allow-Origin", self.headers["Origin"])
            self.send_header("Access-Control-Allow-Credentials", "true")
            self.send_header("Vary", "Origin")
        self.end_headers()
        self.wfile.write(corpo)

    def do_OPTIONS(self):
        # "Pré-voo": antes de um POST com JSON, o navegador pergunta se pode.
        if not self._origem_ok():
            self.send_response(403)
            self.end_headers()
            return
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", self.headers["Origin"])
        self.send_header("Access-Control-Allow-Credentials", "true")
        self.send_header("Access-Control-Allow-Methods", "GET, POST")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Max-Age", "600")
        self.send_header("Vary", "Origin")
        self.end_headers()

    def _pessoa(self):
        if not self._origem_ok():
            raise Recusa(403, "Origem não permitida.")
        return pessoa_do_grafana(self.headers.get("Cookie"))

    def do_GET(self):
        try:
            if self.path == "/saude":
                self._json(200, {"ok": True})
            elif self.path == "/quem-sou":
                pessoa = self._pessoa()
                self._json(200, {**pessoa, "pode_agir": pessoa["papel"] in PAPEIS_QUE_AGEM})
            elif self.path == "/manutencoes":
                self._pessoa()
                self._json(200, consultar_manutencoes())
            else:
                self._json(404, {"erro": "não existe"})
        except Recusa as e:
            self._json(e.codigo, {"erro": str(e)})
        except Exception as e:                       # noqa: BLE001 — responde em vez de derrubar
            print(f"ERRO GET {self.path}: {e}", flush=True)
            self._json(502, {"erro": "Falha ao falar com o Zabbix/Grafana."})

    def do_POST(self):
        nome = self.path.removeprefix("/acao/")
        pessoa, dados = None, {}
        try:
            if not self.path.startswith("/acao/") or nome not in CATALOGO:
                raise Recusa(404, "Ação fora do catálogo.")
            if self.headers.get("Content-Type", "").split(";")[0] != "application/json":
                raise Recusa(415, "Envie JSON.")
            tamanho = int(self.headers.get("Content-Length") or 0)
            if tamanho > 4096:
                raise Recusa(413, "Pedido grande demais.")
            pessoa = self._pessoa()
            if pessoa["papel"] not in PAPEIS_QUE_AGEM:
                raise Recusa(403, f"Seu papel no Grafana é {pessoa['papel']}: só Editor ou Admin podem agir.")
            conferir_limite(pessoa["login"])
            dados = json.loads(self.rfile.read(tamanho) or b"{}")
            if not isinstance(dados, dict):
                raise Recusa(400, "JSON inválido.")
            mensagem = CATALOGO[nome](pessoa, dados)
            auditar(pessoa, nome, dados, "ok")
            self._json(200, {"ok": True, "mensagem": mensagem})
        except Recusa as e:
            if pessoa:
                auditar(pessoa, nome, dados, f"recusado: {e}")
            self._json(e.codigo, {"erro": str(e)})
        except Exception as e:                       # noqa: BLE001
            if pessoa:
                auditar(pessoa, nome, dados, f"erro: {e}")
            print(f"ERRO POST {self.path}: {e}", flush=True)
            self._json(502, {"erro": "O Zabbix recusou a ação. Veja: docker compose logs acoes"})

    def log_message(self, *_):
        pass                                          # a auditoria já registra o que importa


if __name__ == "__main__":
    print(f"Ações da central em :80 (origens permitidas: {', '.join(sorted(ORIGENS))})", flush=True)
    ThreadingHTTPServer(("0.0.0.0", 80), Tratador).serve_forever()
