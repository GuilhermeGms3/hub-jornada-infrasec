"""
gerador.py — gerador de carga e injeção de falhas para a aplicação Loja
==========================================================================

Por que existe: sem gente usando, a aplicação fica parada e os gráficos
ficam retos. Este programa finge ser clientes: lista produtos e faz pedidos,
num ritmo que você escolhe na página http://localhost:8092.

Botões da página:
  • Ritmo: parado / normal (~3 req/s) / pico (~25 req/s)
  • Cenários de falha (rota /admin/falha da própria Loja), em um alvo ou nos
    dois: lentidão, erros, banco lotado, CPU alta, derrubar a aplicação.
    Cada cartão diz o que acontece e qual alerta esperar no Zabbix.

Alvos: variável ALVOS (URLs separadas por vírgula) e ALVOS_NOMES (os nomes
na mesma ordem), ex. ALVOS=http://192.168.100.27:8080,http://loja2-proxy
                    ALVOS_NOMES=SRV-01,SRV-02
Usa só a biblioteca padrão do Python.
"""

import json
import os
import random
import threading
import time
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

ALVOS = [a.strip().rstrip("/") for a in os.environ.get("ALVOS", "").split(",") if a.strip()]
_nomes = [n.strip() for n in os.environ.get("ALVOS_NOMES", "").split(",") if n.strip()]
NOMES = dict(zip(ALVOS, _nomes + [f"alvo {i + 1}" for i in range(len(_nomes), len(ALVOS))]))
RITMOS = {"parado": 0, "normal": 3, "pico": 25}     # requisições por segundo (somando os alvos)
FALHAS = ("nenhuma", "lenta", "erros", "conexoes", "cpu", "cair")
estado = {"ritmo": "normal", "falhas": {NOMES[a]: "nenhuma" for a in ALVOS}}
placar = {"ok": 0, "erro": 0}
trava = threading.Lock()


def chamar(url, corpo=None, timeout=5):
    dados = json.dumps(corpo).encode() if corpo is not None else None
    req = urllib.request.Request(url, dados, {"Content-Type": "application/json"} if dados else {})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.status


def um_cliente(alvo):
    """Um "cliente": 70% só olha os produtos, 30% compra."""
    try:
        if random.random() < 0.7:
            chamar(f"{alvo}/api/produtos")
        else:
            chamar(f"{alvo}/api/pedidos", {"produto_id": random.randint(1, 5), "quantidade": random.randint(1, 3)})
        resultado = "ok"
    except urllib.error.HTTPError as e:
        resultado = "ok" if e.code == 409 else "erro"   # 409 = estoque reposto, é normal
    except OSError:
        resultado = "erro"
    with trava:
        placar[resultado] += 1


def laco():
    while True:
        rps = RITMOS[estado["ritmo"]]
        if not rps or not ALVOS:
            time.sleep(0.5)
            continue
        threading.Thread(target=um_cliente, args=(random.choice(ALVOS),), daemon=True).start()
        time.sleep(random.expovariate(rps))          # chegadas aleatórias, como clientes reais


def aplicar_falha(tipo, nome_alvo):
    """Liga um cenário num alvo ("SRV-01", "SRV-02") ou em "todos"."""
    for alvo in ALVOS:
        if nome_alvo not in ("todos", NOMES[alvo]):
            continue
        try:
            chamar(f"{alvo}/admin/falha", {"tipo": tipo})
            # "cair" é momentâneo: depois que a Loja volta, ela está normal.
            estado["falhas"][NOMES[alvo]] = "nenhuma" if tipo == "cair" else tipo
        except OSError as e:
            print("não consegui avisar", alvo, e, flush=True)


PAGINA = """<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Cenários da Loja</title>
<style>
 body{font-family:system-ui,Segoe UI,sans-serif;background:#15181d;color:#d8d9da;margin:0;padding:20px}
 main{max-width:760px;margin:auto} h1{font-size:20px;margin:0 0 4px} h2{font-size:13px;color:#8e959e;margin:24px 0 8px;font-weight:500}
 .linha{display:flex;gap:8px;flex-wrap:wrap}
 button{font:inherit;padding:10px 14px;border-radius:6px;border:1px solid #2c3038;background:#1b1e24;color:#d8d9da;cursor:pointer}
 button.on{border-color:#5794f2;background:#1d2a3d}
 .cenarios{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:10px}
 .cen{border:1px solid #2c3038;border-radius:8px;padding:12px;background:#1b1e24;display:flex;flex-direction:column;gap:6px}
 .cen b{font-size:14px} .cen p{margin:0;color:#8e959e;font-size:12.5px;line-height:1.4}
 .cen .alerta{color:#ff9830} .cen button{margin-top:auto}
 .cen.on{border-color:#f2495c;background:#2a1a1e}
 table{border-collapse:collapse;font-size:13px} td{padding:3px 12px 3px 0;color:#8e959e} td b{color:#d8d9da}
</style></head><body><main>
<h1>Cenários da Loja</h1>
<p style="color:#8e959e;font-size:13px;margin:0">Carga de clientes e falhas injetadas, para ver o Zabbix reagir.</p>

<h2>Ritmo dos clientes</h2>
<div class="linha"><button data-r="parado">Parado</button><button data-r="normal">Normal (~3/s)</button><button data-r="pico">Pico (~25/s)</button></div>

<h2>Em qual servidor aplicar o cenário</h2>
<div class="linha" id="alvos"></div>

<h2>Cenários de falha</h2>
<div class="cenarios" id="cenarios"></div>

<h2>Situação agora</h2>
<table id="situacao"></table>
</main><script>
var CEN = [
 ["lenta","Lentidão","Cada resposta demora de 0,6 a 1,5 s.","Loja lenta: p95 acima de 800 ms (~1 min)"],
 ["erros","Erros","30% das requisições falham com erro 500.","Loja com erros acima de 5% (~1 min)"],
 ["conexoes","Banco lotado","A aplicação abre ~92 conexões e não solta (vazamento).","SRV-01: PostgreSQL com conexões acima de 90%"],
 ["cpu","CPU alta","O processo gasta processador à toa por 3 min.","Loja consumindo muita CPU (~2 min)"],
 ["cair","Derrubar a aplicação","O processo morre. Quem religa? No SRV-02 o Docker; no SRV-01 o script vigia.","SRV-02: container reiniciou · SRV-01: Loja fora do ar"],
 ["nenhuma","Tudo normal","Desliga todos os cenários.","Os alertas se resolvem sozinhos"]];
var alvo = "todos", atual = {};
function post(c){return fetch('/controle',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(c)}).then(ver)}
document.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>post({ritmo:b.dataset.r}));
document.getElementById('cenarios').innerHTML = CEN.map(c=>`<div class="cen" data-cen="${c[0]}"><b>${c[1]}</b><p>${c[2]}</p><p class="alerta">${c[3]}</p><button data-f="${c[0]}">${c[0]==='nenhuma'?'Voltar ao normal':'Aplicar'}</button></div>`).join('');
document.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>post({falha:b.dataset.f, alvo:alvo}));
function ver(){fetch('/estado').then(r=>r.json()).then(e=>{
 atual=e;
 document.querySelectorAll('[data-r]').forEach(b=>b.classList.toggle('on',b.dataset.r===e.ritmo));
 var nomes=['todos'].concat(Object.keys(e.falhas));
 document.getElementById('alvos').innerHTML=nomes.map(n=>`<button data-a="${n}" class="${n===alvo?'on':''}">${n==='todos'?'Todos':n}</button>`).join('');
 document.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{alvo=b.dataset.a;ver();});
 var ligados=Object.entries(e.falhas).filter(([n,f])=>(alvo==='todos'||n===alvo)).map(([n,f])=>f);
 document.querySelectorAll('[data-cen]').forEach(c=>c.classList.toggle('on',c.dataset.cen!=='nenhuma'&&ligados.includes(c.dataset.cen)));
 document.getElementById('situacao').innerHTML=Object.entries(e.falhas).map(([n,f])=>`<tr><td>${n}</td><td><b>${f}</b></td></tr>`).join('')
  +`<tr><td>Respostas</td><td><b>${e.ok} ok · ${e.erro} com erro</b></td></tr>`;})}
ver(); setInterval(ver,2000);
</script></body></html>"""


class Tratador(BaseHTTPRequestHandler):
    def _json(self, codigo, obj):
        dados = json.dumps(obj).encode()
        self.send_response(codigo)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(dados)))
        self.end_headers()
        self.wfile.write(dados)

    def do_GET(self):
        if self.path == "/estado":
            with trava:
                self._json(200, {**estado, **placar, "alvos": ALVOS})
        else:
            dados = PAGINA.encode()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(dados)))
            self.end_headers()
            self.wfile.write(dados)

    def do_POST(self):
        try:
            pedido = json.loads(self.rfile.read(int(self.headers.get("Content-Length", 0))) or b"{}")
        except ValueError:
            return self._json(400, {"ok": False})
        if pedido.get("ritmo") in RITMOS:
            estado["ritmo"] = pedido["ritmo"]
        if pedido.get("falha") in FALHAS:
            alvo = pedido.get("alvo", "todos")
            threading.Thread(target=aplicar_falha, args=(pedido["falha"], alvo), daemon=True).start()
        print("controle:", estado, flush=True)
        self._json(200, {"ok": True})

    def log_message(self, *_):
        pass


if __name__ == "__main__":
    threading.Thread(target=laco, daemon=True).start()
    print("Gerador de tráfego na porta 80. Alvos:", ALVOS or "(nenhum)", flush=True)
    ThreadingHTTPServer(("0.0.0.0", 80), Tratador).serve_forever()
