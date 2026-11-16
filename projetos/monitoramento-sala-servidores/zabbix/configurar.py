"""
configurar.py — configura o Zabbix inteiro pela API, lendo tudo do .env
=======================================================================

Como rodar (na pasta do projeto):
    python zabbix/configurar.py

É IDEMPOTENTE: pode rodar quantas vezes quiser. Ele procura cada coisa pelo
nome; se não existe, cria; se existe, atualiza para ficar igual ao que está
aqui. Nunca duplica. É assim que você aplica mudanças: edita o .env (ou este
arquivo) e roda de novo.

O que ele monta:
  1. Grupo de hosts "Sala do servidor" e grupo de templates.
  2. TEMPLATE "ESP32 Sala do Servidor": mapas de valor, item mestre, itens
     dependentes, gatilhos e macros (IP, intervalo, limites de temperatura).
  3. Host "esp32-sala" usando o template, com o IP do ESP32 do .env.
  4. Host "notebook-velho" (agente + ping), se NOTEBOOK_VELHO_IP estiver no .env.
  5. Telegram (tipo de mídia, mídia do Admin e ação), se TELEGRAM_TOKEN e
     TELEGRAM_CHAT_ID estiverem no .env. Sem eles, pula esta parte.
  5b. Usuário restrito "central-acoes" (papel com 11 métodos da API), usado
     pelo serviço acoes/ para os botões Reconhecer, Comentar e Manutenção.
  6. Exporta o template para zabbix/template_esp32_sala.yaml (backup/estudo).

🧠 A API do Zabbix é "JSON-RPC": mandamos um JSON dizendo o MÉTODO
(ex.: "host.create") e os PARÂMETROS; ele responde com o resultado. É a mesma
coisa que a tela do Zabbix faz por baixo dos panos quando você clica.

Só usa a biblioteca padrão do Python (nada para instalar).
"""

import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

PASTA_PROJETO = Path(__file__).resolve().parent.parent

# Nomes fixos (o Grafana e os gatilhos dependem deles — não mude à toa).
GRUPO_HOSTS = "Sala do servidor"
GRUPO_TEMPLATES = "Templates/Sala do servidor"
TEMPLATE = "ESP32 Sala do Servidor"
HOST_ESP32 = "esp32-sala"
HOST_NOTEBOOK = "notebook-velho"
HOST_DOCKER = "srv02-docker"
ACAO_TELEGRAM = "Sala do servidor -> Telegram"

# Tipos numéricos da API (estão na documentação de cada objeto).
ITEM_HTTP_AGENT = 19
ITEM_DEPENDENTE = 18
VALOR_FLOAT, VALOR_CARACTERE, VALOR_TEXTO, VALOR_INTEIRO = 0, 1, 4, 3
PRE_JSONPATH, PRE_REGEX_BATE, PRE_BOOL_DECIMAL = 12, 14, 6
ERRO_DESCARTAR = 1  # "se o passo falhar, jogue o valor fora" (não marca erro)
SEV_INFO, SEV_ATENCAO, SEV_ALTA, SEV_DESASTRE = 1, 2, 4, 5


# =====================================================================
# .env e conexão com a API
# =====================================================================
def ler_env():
    """Lê o .env (linhas CHAVE=valor). Por que não usar python-dotenv: para
    não precisar instalar nada."""
    caminho = PASTA_PROJETO / ".env"
    if not caminho.exists():
        sys.exit("Não achei o .env. Copie o .env.example para .env e preencha.")
    env = {}
    for linha in caminho.read_text(encoding="utf-8").splitlines():
        linha = linha.strip()
        if linha and not linha.startswith("#") and "=" in linha:
            chave, valor = linha.split("=", 1)
            env[chave.strip()] = valor.strip()
    return env


class ZabbixAPI:
    def __init__(self, url):
        self.url = url
        self.token = None
        self.id = 0

    def chamar(self, metodo, params):
        self.id += 1
        corpo = json.dumps({"jsonrpc": "2.0", "method": metodo, "params": params, "id": self.id})
        cabecalhos = {"Content-Type": "application/json-rpc"}
        if self.token:
            # Zabbix 7.0: o token de sessão vai no cabeçalho "Authorization".
            cabecalhos["Authorization"] = f"Bearer {self.token}"
        pedido = urllib.request.Request(self.url, corpo.encode(), cabecalhos)
        try:
            with urllib.request.urlopen(pedido, timeout=30) as resp:
                resposta = json.load(resp)
        except urllib.error.URLError as e:
            sys.exit(f"Não consegui falar com o Zabbix em {self.url}: {e}. "
                     "Os containers estão de pé? (docker compose ps)")
        if "error" in resposta:
            erro = resposta["error"]
            raise RuntimeError(f"{metodo}: {erro.get('message')} {erro.get('data')}")
        return resposta["result"]

    def entrar(self, usuario, senha):
        # Nunca imprimimos a senha; em caso de erro, só dizemos que falhou.
        try:
            self.token = self.chamar("user.login", {"username": usuario, "password": senha})
        except RuntimeError:
            sys.exit("Login no Zabbix falhou. Confira ZABBIX_USER e ZABBIX_PASSWORD no .env.")

    def sair(self):
        try:
            self.chamar("user.logout", [])
        except RuntimeError:
            pass


def passo(texto):
    print(f"  • {texto}")


# =====================================================================
# 1. Grupos
# =====================================================================
def garantir_grupo_hosts(api, nome):
    achado = api.chamar("hostgroup.get", {"filter": {"name": [nome]}, "output": ["groupid"]})
    if achado:
        passo(f"grupo de hosts '{nome}' já existe")
        return achado[0]["groupid"]
    passo(f"grupo de hosts '{nome}' criado")
    return api.chamar("hostgroup.create", {"name": nome})["groupids"][0]


def garantir_grupo_templates(api, nome):
    achado = api.chamar("templategroup.get", {"filter": {"name": [nome]}, "output": ["groupid"]})
    if achado:
        return achado[0]["groupid"]
    passo(f"grupo de templates '{nome}' criado")
    return api.chamar("templategroup.create", {"name": nome})["groupids"][0]


# =====================================================================
# 2. Template do ESP32
# =====================================================================

# Macros: "variáveis" do Zabbix. Ficam no template com um valor padrão e
# podem ser trocadas no host sem mexer em item nem gatilho.
MACROS_TEMPLATE = [
    {"macro": "{$ESP32.IP}", "value": "192.168.0.50",
     "description": "IP (ou nome) do ESP32. O host esp32-sala sobrescreve com o valor do .env."},
    {"macro": "{$ESP32.INTERVALO}", "value": "15s",
     "description": "De quanto em quanto tempo o Zabbix BUSCA o /status (polling). Serve para a "
                    "temperatura/umidade e como sinal de vida. Água, porta e energia não esperam "
                    "por isso: o ESP32 EMPURRA o JSON na hora em que mudam (push, porta 10051)."},
    {"macro": "{$ESP32.SEM_DADOS}", "value": "2m",
     "description": "Tempo sem resposta até alertar 'ESP32 parou de responder'."},
    {"macro": "{$TEMP.ATENCAO}", "value": "28", "description": "°C: alerta de Atenção."},
    {"macro": "{$TEMP.ALTA}", "value": "32", "description": "°C: alerta de severidade Alta."},
    {"macro": "{$PORTA.TEMPO}", "value": "1m", "description": "Porta aberta por mais que isso vira alerta."},
]

# Mapas de valor: traduzem 0/1 em texto ("Seco", "Água detectada"...).
MAPAS = {
    "Agua": [("0", "Seco"), ("1", "Água detectada")],
    "Porta": [("0", "Fechada"), ("1", "Aberta")],
    "Energia": [("0", "Sem energia"), ("1", "Com energia")],
    "DHT": [("0", "Falha"), ("1", "OK")],
}


def jsonpath(caminho, so_numero=False, extra=None):
    """Pré-processamento: recorta um campo do JSON com JSONPath.
    so_numero: se o campo vier null (ex.: DHT11 ainda sem leitura), descarta
    o valor em vez de deixar o item como "não suportado"."""
    passos = [{"type": PRE_JSONPATH, "params": caminho,
               "error_handler": ERRO_DESCARTAR, "error_handler_params": ""}]
    if so_numero:
        passos.append({"type": PRE_REGEX_BATE, "params": r"^-?[0-9]+(\.[0-9]+)?$",
                       "error_handler": ERRO_DESCARTAR, "error_handler_params": ""})
    passos += extra or []
    return passos


# Itens dependentes: cada um recorta um campo do JSON do item mestre.
# (nome, chave, JSONPath, tipo, unidade, mapa, pré-processamento extra, tag)
ITENS_DEPENDENTES = [
    ("Temperatura da sala", "esp32.temperatura", "$.temperatura", VALOR_FLOAT, "°C", None, True, "temperatura"),
    ("Umidade da sala", "esp32.umidade", "$.umidade", VALOR_INTEIRO, "%", None, True, "umidade"),
    ("Vazamento", "esp32.agua", "$.agua", VALOR_INTEIRO, "", "Agua", False, "agua"),
    ("Porta da sala", "esp32.porta", "$.porta_aberta", VALOR_INTEIRO, "", "Porta", False, "porta"),
    ("Energia da tomada", "esp32.energia", "$.energia", VALOR_INTEIRO, "", "Energia", False, "energia"),
    # Pino cru da porta: ajuda a conferir o MC-38 (NA ou NF) sem abrir a página da placa.
    ("Porta: pino cru (1=HIGH, 0=LOW)", "esp32.porta_raw", "$.porta_raw", VALOR_INTEIRO, "", None, False, "calibracao"),
    ("Água: leitura bruta", "esp32.agua_raw", "$.agua_raw", VALOR_INTEIRO, "", None, False, "calibracao"),
    ("Energia: leitura bruta", "esp32.energia_raw", "$.energia_raw", VALOR_INTEIRO, "", None, False, "calibracao"),
    # 0 = sensor de energia ainda não instalado: o pino 34 é ignorado pela placa.
    ("Energia: sensor instalado (1=sim)", "esp32.energia_instalada", "$.energia_instalada", VALOR_INTEIRO, "", None, False, "calibracao"),
    ("Sensor DHT11", "esp32.dht_ok", "$.dht_ok", VALOR_INTEIRO, "", "DHT", "bool", "temperatura"),
    ("ESP32: tempo ligado", "esp32.uptime", "$.uptime_s", VALOR_INTEIRO, "uptime", None, False, "esp32"),
    ("ESP32: sinal Wi-Fi", "esp32.rssi", "$.wifi_rssi", VALOR_FLOAT, "dBm", None, False, "esp32"),
    ("ESP32: versão do firmware", "esp32.versao", "$.versao", VALOR_CARACTERE, "", None, False, "esp32"),
]

# Gatilhos. Nas expressões, "/ESP32 Sala do Servidor/" é o template: cada
# host que usar o template ganha uma cópia com o próprio nome.
T = TEMPLATE
GATILHOS = [
    # (nome, severidade, expressão, descrição, efeito)
    # "efeito" vira a tag efeito=<valor> no gatilho. A central lê essa tag
    # para saber QUAL animação mostrar na sala 3D (calor no rack, faixa na
    # porta...). Assim, quem decide é o Zabbix, e não o texto do alerta.
    ("Temperatura da sala acima de {$TEMP.ALTA} °C", SEV_ALTA,
     f"avg(/{T}/esp32.temperatura,2m)>{{$TEMP.ALTA}}",
     "Média dos últimos 2 minutos acima do limite alto. Verifique o ar-condicionado.", "temperatura"),
    ("Temperatura da sala acima de {$TEMP.ATENCAO} °C", SEV_ATENCAO,
     f"avg(/{T}/esp32.temperatura,2m)>{{$TEMP.ATENCAO}}",
     "Média dos últimos 2 minutos acima do limite de atenção.", "temperatura"),
    ("Água detectada no piso", SEV_DESASTRE,
     f"last(/{T}/esp32.agua)=1",
     "O sensor de chuva do piso está molhado. Possível goteira do ar-condicionado.", "agua"),
    ("Tomada sem energia", SEV_ALTA,
     f"last(/{T}/esp32.energia)=0",
     "O carregador-sentinela parou de dar 5 V: a tomada (filtro de linha) caiu. "
     "O servidor pode estar só na bateria/nobreak.", "energia"),
    ("Porta aberta há mais de {$PORTA.TEMPO}", SEV_ATENCAO,
     f"min(/{T}/esp32.porta,{{$PORTA.TEMPO}})=1",
     "A porta ficou aberta durante todo o período.", "porta"),
    ("ESP32 parou de responder", SEV_ALTA,
     f"nodata(/{T}/esp32.status,{{$ESP32.SEM_DADOS}})=1",
     "O Zabbix não recebe o /status do ESP32. Placa desligada, fora do Wi-Fi ou IP mudou.", "sensor"),
    ("Sensor DHT11 sem resposta", SEV_INFO,
     f"max(/{T}/esp32.dht_ok,1m)=0",
     "O DHT11 falhou em todas as leituras do último minuto. Confira o fio DATA (GPIO 4).", "dht"),
]

# Dependência: se "acima de 32" está ativo, esconde o "acima de 28"
# (não faz sentido receber dois alertas da mesma coisa).
DEPENDENCIAS = {"Temperatura da sala acima de {$TEMP.ATENCAO} °C": "Temperatura da sala acima de {$TEMP.ALTA} °C"}


def garantir_template(api, grupo_templates_id):
    achado = api.chamar("template.get", {"filter": {"host": [TEMPLATE]}, "output": ["templateid"]})
    dados = {
        "groups": [{"groupid": grupo_templates_id}],
        "macros": MACROS_TEMPLATE,
        "description": "Ambiente físico da sala do servidor via ESP32 (http://IP/status). "
                       "Gerado por zabbix/configurar.py.",
        "tags": [{"tag": "local", "value": "sala-servidor"}],
    }
    if achado:
        tid = achado[0]["templateid"]
        api.chamar("template.update", {"templateid": tid, **dados})
        passo(f"template '{TEMPLATE}' atualizado")
    else:
        tid = api.chamar("template.create", {"host": TEMPLATE, **dados})["templateids"][0]
        passo(f"template '{TEMPLATE}' criado")
    return tid


def garantir_mapas(api, hostid):
    """Cria/atualiza os mapas de valor do template. Devolve {nome: id}."""
    ids = {}
    existentes = {m["name"]: m["valuemapid"] for m in
                  api.chamar("valuemap.get", {"hostids": [hostid], "output": ["valuemapid", "name"]})}
    for nome, pares in MAPAS.items():
        mappings = [{"value": v, "newvalue": t} for v, t in pares]
        if nome in existentes:
            api.chamar("valuemap.update", {"valuemapid": existentes[nome], "mappings": mappings})
            ids[nome] = existentes[nome]
        else:
            ids[nome] = api.chamar("valuemap.create",
                                   {"hostid": hostid, "name": nome, "mappings": mappings})["valuemapids"][0]
    passo(f"mapas de valor: {', '.join(MAPAS)}")
    return ids


def garantir_item(api, hostid, chave, dados):
    achado = api.chamar("item.get", {"hostids": [hostid], "filter": {"key_": [chave]}, "output": ["itemid"]})
    if achado:
        api.chamar("item.update", {"itemid": achado[0]["itemid"], **dados})
        return achado[0]["itemid"]
    return api.chamar("item.create", {"hostid": hostid, "key_": chave, **dados})["itemids"][0]


def garantir_itens(api, tid, mapas):
    # Item MESTRE: o único que vai até o ESP32. Guarda o JSON inteiro.
    # Modelo HÍBRIDO, num item só:
    #   • polling — o Zabbix busca http://ESP32/status a cada {$ESP32.INTERVALO};
    #   • push    — "allow_traps" deixa o PRÓPRIO ESP32 entregar o mesmo JSON
    #               (porta 10051, protocolo do zabbix_sender) quando água,
    #               porta ou energia mudam. O alerta não espera a próxima busca.
    # Como os dois caminhos chegam no MESMO item, os itens dependentes, os
    # gatilhos, o painel e o Telegram não precisam saber de onde veio.
    mestre = garantir_item(api, tid, "esp32.status", {
        "name": "ESP32 status (JSON)",
        "type": ITEM_HTTP_AGENT,
        "value_type": VALOR_TEXTO,
        "url": "http://{$ESP32.IP}/status",
        "delay": "{$ESP32.INTERVALO}",
        "timeout": "5s",
        "allow_traps": 1,
        "history": "1d",   # texto ocupa espaço: o histórico útil fica nos dependentes
        "description": "JSON do ESP32: buscado a cada {$ESP32.INTERVALO} (polling) e também "
                       "recebido na hora quando algo muda (push). Os itens dependentes recortam cada campo.",
        "tags": [{"tag": "componente", "value": "esp32"}],
    })
    passo("item mestre esp32.status (HTTP agent + aceita push)")

    for nome, chave, caminho, tipo, unidade, mapa, extra, tag in ITENS_DEPENDENTES:
        if extra == "bool":
            pre = jsonpath(caminho, extra=[{"type": PRE_BOOL_DECIMAL, "params": "",
                                            "error_handler": 0, "error_handler_params": ""}])
        else:
            pre = jsonpath(caminho, so_numero=bool(extra))
        dados = {
            "name": nome,
            "type": ITEM_DEPENDENTE,
            "master_itemid": mestre,
            "value_type": tipo,
            "units": unidade,
            "preprocessing": pre,
            "valuemapid": mapas[mapa] if mapa else "0",
            "tags": [{"tag": "sensor", "value": tag}],
        }
        garantir_item(api, tid, chave, dados)
    passo(f"{len(ITENS_DEPENDENTES)} itens dependentes (JSONPath)")


def garantir_gatilhos(api, tid):
    existentes = {g["description"]: g["triggerid"] for g in api.chamar(
        "trigger.get", {"hostids": [tid], "output": ["triggerid", "description"]})}
    ids = {}
    for nome, sev, expr, desc, efeito in GATILHOS:
        dados = {"expression": expr, "priority": sev, "comments": desc,
                 "tags": [{"tag": "local", "value": "sala-servidor"}, {"tag": "efeito", "value": efeito}]}
        if nome in existentes:
            api.chamar("trigger.update", {"triggerid": existentes[nome], **dados})
            ids[nome] = existentes[nome]
        else:
            ids[nome] = api.chamar("trigger.create", {"description": nome, **dados})["triggerids"][0]
    for filho, pai in DEPENDENCIAS.items():
        api.chamar("trigger.update", {"triggerid": ids[filho], "dependencies": [{"triggerid": ids[pai]}]})
    passo(f"{len(GATILHOS)} gatilhos")


# =====================================================================
# 3 e 4. Hosts
# =====================================================================
def id_template(api, nome):
    achado = api.chamar("template.get", {"filter": {"host": [nome]}, "output": ["templateid"]})
    if not achado:
        raise RuntimeError(f"template '{nome}' não existe nesta versão do Zabbix")
    return achado[0]["templateid"]


def garantir_host(api, nome, grupo_id, templates, macros=None, interface=None, desligar_templates=(),
                  nome_visivel=None):
    """nome = nome TÉCNICO (precisa bater com o Hostname do agente).
    nome_visivel = como o host APARECE: telas, painel e mensagens do Telegram."""
    achado = api.chamar("host.get", {"filter": {"host": [nome]}, "output": ["hostid"],
                                     "selectInterfaces": ["interfaceid", "type"],
                                     "selectParentTemplates": ["templateid"]})
    dados = {"groups": [{"groupid": grupo_id}],
             "templates": [{"templateid": t} for t in templates],
             "name": nome_visivel or nome}
    if macros is not None:
        dados["macros"] = macros
    if not achado:
        if interface:
            dados["interfaces"] = [interface]
        hid = api.chamar("host.create", {"host": nome, **dados})["hostids"][0]
        passo(f"host '{nome}' criado")
        return hid

    hid = achado[0]["hostid"]
    # Template de OUTRO sistema (ex.: era Linux, agora é Windows): desvincula
    # e limpa os itens dele, para não ficar lixo.
    vinculados = {t["templateid"] for t in achado[0]["parentTemplates"]}
    limpar = [{"templateid": t} for t in desligar_templates if t in vinculados]
    if limpar:
        dados["templates_clear"] = limpar
    api.chamar("host.update", {"hostid": hid, **dados})
    if interface:
        agentes = [i for i in achado[0]["interfaces"] if i["type"] == "1"]
        if agentes:
            api.chamar("hostinterface.update", {"interfaceid": agentes[0]["interfaceid"], **interface})
        else:
            api.chamar("hostinterface.create", {"hostid": hid, **interface})
    passo(f"host '{nome}' atualizado")
    return hid


# O que o Android NÃO entrega a aplicativos sem root. Os itens que pedem
# isso falham, e o uso de CPU chega a derrubar a conexão do agente (o Zabbix
# então pausa o host inteiro por 15 s a cada tentativa). Por isso são
# desligados só neste host; o template continua intacto para os outros.
ANDROID_SEM_ACESSO = {
    "itens": ("system.cpu.util", "system.sw.packages",    # /proc/stat é falso e congelado
              "kernel.maxfiles", "kernel.maxproc"),        # /proc/sys bloqueado
    "descobertas": ("vfs.dev.discovery", "net.if.discovery"),  # /proc/diskstats e /proc/net/dev bloqueados
}


def desligar_no_android(api, hostid):
    itens = [i["itemid"] for i in api.chamar("item.get", {"hostids": [hostid], "output": ["itemid", "key_"]})
             if i["key_"].startswith(ANDROID_SEM_ACESSO["itens"])]
    regras = [r["itemid"] for r in api.chamar("discoveryrule.get", {"hostids": [hostid], "output": ["itemid", "key_"]})
              if r["key_"] in ANDROID_SEM_ACESSO["descobertas"]]
    for iid in itens:
        api.chamar("item.update", {"itemid": iid, "status": 1})
    for rid in regras:
        api.chamar("discoveryrule.update", {"itemid": rid, "status": 1})
    passo(f"Android: {len(itens)} itens e {len(regras)} descobertas desligados (dados que o Android não libera)")


# =====================================================================
# Template da aplicação Loja (app/loja.py) — monitoramento de APLICAÇÃO
# =====================================================================
# Mesmo desenho do template do ESP32: um item mestre (HTTP agent) busca o
# JSON de /metricas e itens dependentes recortam cada número.
TEMPLATE_APP = "App Loja por HTTP"
MACROS_APP = [
    {"macro": "{$APP.URL}", "value": "http://localhost:8080", "description": "Endereço da aplicação Loja."},
    {"macro": "{$APP.INTERVALO}", "value": "15s", "description": "De quanto em quanto tempo ler /metricas."},
    {"macro": "{$APP.LATENCIA.MAX}", "value": "800", "description": "ms: p95 acima disso = aplicação lenta."},
    {"macro": "{$APP.ERROS.MAX}", "value": "5", "description": "%: erros acima disso = aplicação com falhas."},
    {"macro": "{$APP.CPU.MAX}", "value": "70", "description": "%: CPU do processo acima disso por 2 min = alerta."},
]
# (nome, chave, JSONPath, tipo, unidade)
ITENS_APP = [
    ("Loja: disponível", "app.disponivel", "$.disponivel", VALOR_INTEIRO, ""),
    ("Loja: acesso ao banco", "app.banco_ok", "$.banco_ok", VALOR_INTEIRO, ""),
    ("Loja: requisições por segundo", "app.rps", "$.requisicoes_por_seg", VALOR_FLOAT, "req/s"),
    ("Loja: latência p95", "app.latencia_p95", "$.latencia_p95_ms", VALOR_FLOAT, "ms"),
    ("Loja: latência média", "app.latencia_media", "$.latencia_media_ms", VALOR_FLOAT, "ms"),
    ("Loja: erros", "app.erros_pct", "$.erros_pct", VALOR_FLOAT, "%"),
    ("Loja: pedidos (total)", "app.pedidos_total", "$.pedidos_total", VALOR_INTEIRO, ""),
    ("Loja: CPU do processo", "app.cpu_pct", "$.cpu_pct", VALOR_FLOAT, "%"),
    ("Loja: memória do processo", "app.memoria_mb", "$.memoria_mb", VALOR_FLOAT, "MB"),
    ("Loja: conexões com o banco", "app.conexoes_pool", "$.conexoes_pool", VALOR_INTEIRO, ""),
    ("Loja: tempo no ar", "app.uptime", "$.uptime_s", VALOR_INTEIRO, "uptime"),
    ("Loja: falha injetada", "app.falha_injetada", "$.falha_injetada", VALOR_CARACTERE, ""),
    ("Loja: conexões presas (cenário)", "app.conexoes_presas", "$.conexoes_presas", VALOR_INTEIRO, ""),
]
TA = TEMPLATE_APP
GATILHOS_APP = [
    # (nome, severidade, expressão, descrição) — todos com a tag efeito=app
    ("Loja fora do ar", SEV_ALTA, f"nodata(/{TA}/app.metricas,1m)=1",
     "A aplicação não responde /metricas há 1 minuto. Processo parado ou servidor fora."),
    ("Loja sem acesso ao banco", SEV_ALTA, f"last(/{TA}/app.banco_ok)=0",
     "A aplicação responde, mas não consegue falar com o PostgreSQL."),
    ("Loja com erros acima de {$APP.ERROS.MAX}%", SEV_ALTA, f"avg(/{TA}/app.erros_pct,1m)>{{$APP.ERROS.MAX}}",
     "Parte das requisições está falhando (respostas 5xx)."),
    ("Loja consumindo muita CPU (acima de {$APP.CPU.MAX}%)", SEV_ATENCAO,
     f"avg(/{TA}/app.cpu_pct,2m)>{{$APP.CPU.MAX}}",
     "O processo da aplicação está gastando muito processador: laço infinito, código pesado ou ataque."),
    ("Loja lenta: p95 acima de {$APP.LATENCIA.MAX} ms", SEV_ATENCAO,
     f"avg(/{TA}/app.latencia_p95,1m)>{{$APP.LATENCIA.MAX}}",
     "5% das requisições demoram mais que o limite: o cliente sente a lentidão."),
]


def garantir_template_app(api, grupo_templates_id):
    achado = api.chamar("template.get", {"filter": {"host": [TEMPLATE_APP]}, "output": ["templateid"]})
    dados = {"groups": [{"groupid": grupo_templates_id}], "macros": MACROS_APP,
             "description": "Aplicação Loja (app/loja.py): lê {$APP.URL}/metricas. Gerado por zabbix/configurar.py.",
             "tags": [{"tag": "camada", "value": "aplicacao"}]}
    if achado:
        tid = achado[0]["templateid"]
        api.chamar("template.update", {"templateid": tid, **dados})
    else:
        tid = api.chamar("template.create", {"host": TEMPLATE_APP, **dados})["templateids"][0]
    mestre = garantir_item(api, tid, "app.metricas", {
        "name": "Loja: métricas (JSON)", "type": ITEM_HTTP_AGENT, "value_type": VALOR_TEXTO,
        "url": "{$APP.URL}/metricas", "delay": "{$APP.INTERVALO}", "timeout": "5s", "history": "1d",
        "description": "JSON de /metricas da aplicação. Os itens dependentes recortam cada número.",
        "tags": [{"tag": "camada", "value": "aplicacao"}]})
    for nome, chave, caminho, tipo, unidade in ITENS_APP:
        garantir_item(api, tid, chave, {
            "name": nome, "type": ITEM_DEPENDENTE, "master_itemid": mestre, "value_type": tipo,
            "units": unidade, "preprocessing": jsonpath(caminho),
            "tags": [{"tag": "camada", "value": "aplicacao"}]})
    existentes = {g["description"]: g["triggerid"] for g in api.chamar(
        "trigger.get", {"hostids": [tid], "output": ["triggerid", "description"]})}
    for nome, sev, expr, desc in GATILHOS_APP:
        dados = {"expression": expr, "priority": sev, "comments": desc,
                 "tags": [{"tag": "efeito", "value": "app"}]}
        if nome in existentes:
            api.chamar("trigger.update", {"triggerid": existentes[nome], **dados})
        else:
            api.chamar("trigger.create", {"description": nome, **dados})
    passo(f"template '{TEMPLATE_APP}': 1 item mestre, {len(ITENS_APP)} dependentes, {len(GATILHOS_APP)} gatilhos")
    return tid


def garantir_gatilhos_reinicio(api, host):
    """O template oficial do Docker só alerta quando um container PARA com
    erro. Mas o problema mais comum na prática é o container que cai e o
    Docker religa sozinho (restart policy) — "parece" no ar, só que está
    falhando. Este gatilho acende quando o contador de reinícios sobe e fica
    aceso por 10 minutos, para dar tempo de alguém ver.
    Os itens vêm da descoberta do template Docker; se ainda não existirem
    (primeira execução), roda de novo daqui a um ou dois minutos."""
    hid = api.chamar("host.get", {"filter": {"host": [host]}, "output": ["hostid"]})[0]["hostid"]
    itens = api.chamar("item.get", {"hostids": [hid], "search": {"key_": "docker.container_info.restart_count"},
                                    "output": ["key_"]})
    existentes = {g["description"]: g["triggerid"] for g in api.chamar(
        "trigger.get", {"hostids": [hid], "output": ["triggerid", "description"], "inherited": False})}
    for item in itens:
        chave = item["key_"]
        nome_container = chave.split('"/')[1].rstrip('"]').replace("sala-servidor-", "").rsplit("-", 1)[0]
        nome = f"Container {nome_container} reiniciou (últimos 10 min)"
        expressao = f"last(/{host}/{chave})-min(/{host}/{chave},10m)>0"
        dados = {"expression": expressao, "priority": SEV_ATENCAO,
                 "comments": "O Docker religou o container sozinho: algo nele está caindo. Veja os logs.",
                 "tags": [{"tag": "efeito", "value": "container"}, {"tag": "container", "value": nome_container}]}
        if nome in existentes:
            api.chamar("trigger.update", {"triggerid": existentes[nome], **dados})
        else:
            api.chamar("trigger.create", {"description": nome, **dados})
    passo(f"{len(itens)} gatilhos 'container reiniciou'" if itens
          else "containers ainda não descobertos: rode o configurar.py de novo em 2 min")


def interface_agente(endereco):
    """Interface de agente (porta 10050). Aceita IP ou nome DNS."""
    eh_ip = all(p.isdigit() for p in endereco.split(".")) and endereco.count(".") == 3
    return {"type": 1, "main": 1, "useip": 1 if eh_ip else 0,
            "ip": endereco if eh_ip else "", "dns": "" if eh_ip else endereco, "port": "10050"}


# =====================================================================
# 5. Telegram
# =====================================================================
MSG_PROBLEMA = (
    "🚨 {EVENT.NAME}\n"
    "Severidade: {EVENT.SEVERITY}\n"
    "Host: {HOST.NAME}\n"
    "Valor atual: {ITEM.VALUE1}\n"
    "Início: {EVENT.DATE} {EVENT.TIME}\n"
    "{TRIGGER.DESCRIPTION}"
)
MSG_RESOLVIDO = (
    "✅ Resolvido: {EVENT.NAME}\n"
    "Host: {HOST.NAME}\n"
    "Valor atual: {ITEM.VALUE1}\n"
    "Duração do problema: {EVENT.DURATION}"
)


def configurar_telegram(api, env, grupo_id):
    token, chat = env.get("TELEGRAM_TOKEN", ""), env.get("TELEGRAM_CHAT_ID", "")
    if not token or not chat:
        passo("Telegram: TELEGRAM_TOKEN/TELEGRAM_CHAT_ID vazios no .env — pulando (rode de novo depois)")
        return

    tipos = api.chamar("mediatype.get", {"filter": {"name": ["Telegram"]}, "output": "extend"})
    if not tipos:
        raise RuntimeError("o tipo de mídia 'Telegram' não existe nesta instalação")
    tipo = tipos[0]
    parametros = []
    for p in tipo["parameters"]:
        valor = token if p["name"] == "api_token" else p["value"]
        if p["name"] == "api_parse_mode":
            valor = ""  # texto puro: acentos e símbolos não quebram a mensagem
        parametros.append({"name": p["name"], "value": valor})
    api.chamar("mediatype.update", {"mediatypeid": tipo["mediatypeid"], "status": 0,
                                    "parameters": parametros})
    passo("Telegram: tipo de mídia ativado (token aplicado — não é exibido)")

    admin = api.chamar("user.get", {"filter": {"username": ["Admin"]}, "output": ["userid"],
                                    "selectMedias": ["mediatypeid", "sendto", "active",
                                                     "severity", "period"]})[0]
    midias = [m for m in admin["medias"] if m["mediatypeid"] != tipo["mediatypeid"]]
    midias.append({"mediatypeid": tipo["mediatypeid"], "sendto": chat, "active": 0,
                   "severity": 63, "period": "1-7,00:00-24:00"})
    for m in midias:
        m.pop("mediaid", None)
    api.chamar("user.update", {"userid": admin["userid"], "medias": midias})
    passo("Telegram: mídia adicionada ao usuário Admin")

    operacao = {"operationtype": 0, "opmessage": {"default_msg": 0, "mediatypeid": tipo["mediatypeid"],
                                                    "subject": "", "message": MSG_PROBLEMA},
                "opmessage_usr": [{"userid": admin["userid"]}]}
    recuperacao = {"operationtype": 0, "opmessage": {"default_msg": 0, "mediatypeid": tipo["mediatypeid"],
                                                       "subject": "", "message": MSG_RESOLVIDO},
                   "opmessage_usr": [{"userid": admin["userid"]}]}
    dados = {
        "status": 0,
        "esc_period": "1h",
        "filter": {"evaltype": 0, "conditions": [
            {"conditiontype": 0, "operator": 0, "value": grupo_id}]},  # grupo de hosts = Sala do servidor
        "operations": [operacao],
        "recovery_operations": [recuperacao],
    }
    achado = api.chamar("action.get", {"filter": {"name": [ACAO_TELEGRAM]}, "output": ["actionid"]})
    if achado:
        api.chamar("action.update", {"actionid": achado[0]["actionid"], **dados})
        passo(f"Telegram: ação '{ACAO_TELEGRAM}' atualizada e ativa")
    else:
        api.chamar("action.create", {"name": ACAO_TELEGRAM, "eventsource": 0, **dados})
        passo(f"Telegram: ação '{ACAO_TELEGRAM}' criada e ativa")


# =====================================================================
# 6. Exportar o template
# =====================================================================
# =====================================================================
# 5b. Usuário restrito das AÇÕES da central (acoes/acoes.py)
# =====================================================================
# Princípio do "menor privilégio": o serviço de ações não usa o Admin. Ele
# usa um usuário cujo PAPEL só libera estes métodos da API — mesmo que a
# senha vazasse, não daria para apagar hosts, mudar gatilhos, criar usuários...
PAPEL_ACOES = "Central - ações"
GRUPO_USUARIOS_ACOES = "Central - ações"
USUARIO_ACOES = "central-acoes"
METODOS_ACOES = ["event.get", "event.acknowledge", "problem.get", "host.get", "hostgroup.get",
                 "maintenance.get", "maintenance.create", "maintenance.delete",
                 "script.get", "script.execute", "user.logout"]

# Ações que CORRIGEM (fase 2): Scripts globais do Zabbix. O comando é o mesmo
# em todo servidor (/opt/acoes/<nome>.sh); o que muda é o conteúdo do arquivo
# em cada um (acoes/agente/srv01 e srv02). O agente só aceita esses dois
# comandos (acoes/agente/acoes.conf).
SCRIPTS_ACOES = {
    "Central: reiniciar aplicação": ("/opt/acoes/reiniciar-app.sh",
                                     "Reinicia a aplicação Loja deste servidor."),
    "Central: encerrar conexões ociosas": ("/opt/acoes/encerrar-ociosas.sh",
                                           "Encerra conexões da Loja paradas há mais de 1 minuto."),
}


def garantir_usuario_acoes(api, env, grupo_id):
    senha = env.get("ACOES_ZABBIX_SENHA", "")
    if not senha or senha.startswith("troque"):
        passo("ACOES_ZABBIX_SENHA vazia no .env — pulando (os botões da central não vão funcionar)")
        return
    regras = {
        "ui": [{"name": "monitoring.problems", "status": 1}],     # o papel exige 1 tela; a senha nunca é usada na tela
        "ui.default_access": 0,
        "api.access": 1,
        "api.mode": 1,                    # 1 = LISTA DE PERMITIDOS: o que não está na lista é negado
        "api": METODOS_ACOES,
        "actions": [{"name": n, "status": 1} for n in
                    ("acknowledge_problems", "add_problem_comments", "edit_maintenance", "execute_scripts")],
        "actions.default_access": 0,
        "modules.default_access": 0,
    }
    # Tipo 2 (Admin): manutenção é coisa de Admin no Zabbix. As regras acima
    # é que limitam o que ele pode fazer de fato.
    papel = api.chamar("role.get", {"filter": {"name": PAPEL_ACOES}, "output": ["roleid"]})
    if papel:
        roleid = papel[0]["roleid"]
        api.chamar("role.update", {"roleid": roleid, "type": 2, "rules": regras})
    else:
        roleid = api.chamar("role.create", {"name": PAPEL_ACOES, "type": 2, "rules": regras})["roleids"][0]
    passo(f"papel '{PAPEL_ACOES}': só {len(METODOS_ACOES)} métodos da API")

    # Grupo de usuários: leitura e escrita SÓ no grupo de hosts da sala.
    direitos = [{"id": grupo_id, "permission": 3}]
    g = api.chamar("usergroup.get", {"filter": {"name": GRUPO_USUARIOS_ACOES}, "output": ["usrgrpid"]})
    if g:
        usrgrpid = g[0]["usrgrpid"]
        api.chamar("usergroup.update", {"usrgrpid": usrgrpid, "hostgroup_rights": direitos})
    else:
        usrgrpid = api.chamar("usergroup.create", {"name": GRUPO_USUARIOS_ACOES,
                                                   "hostgroup_rights": direitos})["usrgrpids"][0]

    u = api.chamar("user.get", {"filter": {"username": USUARIO_ACOES}, "output": ["userid"]})
    dados = {"roleid": roleid, "usrgrps": [{"usrgrpid": usrgrpid}], "passwd": senha,
             "name": "Central", "surname": "(ações do painel)"}
    if u:
        api.chamar("user.update", {"userid": u[0]["userid"], **dados})
    else:
        api.chamar("user.create", {"username": USUARIO_ACOES, **dados})
    passo(f"usuário '{USUARIO_ACOES}' pronto (senha do .env, não exibida)")

    # Scripts: só o grupo "Central - ações" executa, só nos hosts da sala e só
    # com permissão de escrita no host. Tipo 0 = comando; execute_on 0 = no agente.
    for nome, (comando, descricao) in SCRIPTS_ACOES.items():
        dados = {"type": 0, "execute_on": 0, "command": comando, "scope": 2, "description": descricao,
                 "groupid": grupo_id, "usrgrpid": usrgrpid, "host_access": 3}
        existente = api.chamar("script.get", {"filter": {"name": nome}, "output": ["scriptid"]})
        if existente:
            api.chamar("script.update", {"scriptid": existente[0]["scriptid"], **dados})
        else:
            api.chamar("script.create", {"name": nome, **dados})
    passo(f"{len(SCRIPTS_ACOES)} scripts de ação ({', '.join(SCRIPTS_ACOES)})")


def exportar_template(api, tid):
    yaml = api.chamar("configuration.export", {"format": "yaml",
                                               "options": {"templates": [tid]}})
    destino = PASTA_PROJETO / "zabbix" / "template_esp32_sala.yaml"
    destino.write_text(yaml, encoding="utf-8")
    passo(f"template exportado em {destino.relative_to(PASTA_PROJETO)}")


# =====================================================================
# Principal
# =====================================================================
def main():
    # Acentos e emojis no terminal do Windows.
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    env = ler_env()
    url = env.get("ZABBIX_API_URL", "http://localhost:8080/api_jsonrpc.php")
    api = ZabbixAPI(url)
    print(f"Conectando em {url} ...")
    print(f"Versão da API: {api.chamar('apiinfo.version', [])}")
    api.entrar(env.get("ZABBIX_USER", "Admin"), env.get("ZABBIX_PASSWORD", ""))

    try:
        print("\n[1] Grupos")
        grupo = garantir_grupo_hosts(api, GRUPO_HOSTS)
        grupo_tpl = garantir_grupo_templates(api, GRUPO_TEMPLATES)

        print(f"\n[2] Template '{TEMPLATE}'")
        tid = garantir_template(api, grupo_tpl)
        mapas = garantir_mapas(api, tid)
        garantir_itens(api, tid, mapas)
        garantir_gatilhos(api, tid)

        print(f"\n[3] Host '{HOST_ESP32}'")
        esp32_ip = env.get("ESP32_IP", "")
        if not esp32_ip:
            passo("ESP32_IP vazio no .env — o host fica com o IP padrão do template")
        macros = [{"macro": "{$ESP32.IP}", "value": esp32_ip}] if esp32_ip else []
        garantir_host(api, HOST_ESP32, grupo, [tid], macros=macros,
                      nome_visivel=env.get("ESP32_NOME_EXIBICAO") or "Sensores da sala")
        passo(f"lendo http://{esp32_ip or '(padrão)'}/status")

        print(f"\n[4] Host '{HOST_NOTEBOOK}'")
        nb_ip = env.get("NOTEBOOK_VELHO_IP", "")
        so = env.get("NOTEBOOK_VELHO_SO", "").lower()
        if not nb_ip or so not in ("linux", "windows", "android"):
            passo("NOTEBOOK_VELHO_IP ou NOTEBOOK_VELHO_SO (linux/windows/android) vazios — pulando")
        else:
            tpl_linux = id_template(api, "Linux by Zabbix agent")
            tpl_win = id_template(api, "Windows by Zabbix agent")
            tpl_ping = id_template(api, "ICMP Ping")
            tpl_so, tpl_outro = (tpl_win, tpl_linux) if so == "windows" else (tpl_linux, tpl_win)
            # "android" = celular com Termux + Debian (celular/README.md). Usa o
            # template do Linux, com dois filtros para o que o Android esconde
            # ou mostra de um jeito que gera alarme falso:
            #   • discos: só o "/" — as partições do sistema (/system, /vendor,
            #     /apex...) são somente leitura e vivem 100% cheias de propósito;
            #   • rede: nenhuma interface — o Android bloqueia /proc/net/dev.
            macros = [
                {"macro": "{$VFS.FS.FSNAME.MATCHES}", "value": "^/$",
                 "description": "Android: só o disco principal (as partições do sistema vivem cheias)."},
                {"macro": "{$NET.IF.IFNAME.MATCHES}", "value": "^SEM_ACESSO_NO_ANDROID$",
                 "description": "Android bloqueia /proc/net/dev para aplicativos: não descobrir interfaces."},
            ] if so == "android" else []
            templates = [tpl_so, tpl_ping]
            # Banco e aplicação no servidor (celular/4-banco-app.sh): liga o
            # template oficial do PostgreSQL e o da Loja. A senha do usuário
            # de monitoramento vai numa macro SECRETA (type 1): o Zabbix não a
            # mostra na tela nem a devolve pela API.
            if env.get("PG_MONITOR_SENHA"):
                templates += [id_template(api, "PostgreSQL by Zabbix agent 2"), garantir_template_app(api, grupo_tpl)]
                macros += [
                    {"macro": "{$PG.PASSWORD}", "value": env["PG_MONITOR_SENHA"], "type": 1,
                     "description": "Senha do usuário zbx_monitor (vem do .env)."},
                    {"macro": "{$APP.URL}", "value": f"http://{nb_ip}:8080"},
                    # O banco tem 3 vagas reservadas ao monitoramento (celular/6-...sh):
                    # a aplicação não passa de ~87% das conexões, então o alerta vem em 80%.
                    {"macro": "{$PG.CONN_TOTAL_PCT.MAX.WARN}", "value": "80"},
                ]
            # Sem nenhum item de bateria: na história, quem vê a falta de
            # energia é o ESP32, não o servidor.
            hid = garantir_host(api, HOST_NOTEBOOK, grupo, templates, macros=macros or None,
                                interface=interface_agente(nb_ip), desligar_templates=[tpl_outro],
                                nome_visivel=env.get("SERVIDOR_NOME_EXIBICAO") or "SRV-01")
            if so == "android":
                desligar_no_android(api, hid)
            passo(f"agente em {nb_ip}:10050, templates: {'Windows' if so == 'windows' else 'Linux'} by Zabbix agent + ICMP Ping"
                  + (" (filtros de Android)" if so == "android" else ""))

        print(f"\n[4b] Host '{HOST_DOCKER}' (servidor de containers)")
        # O agente roda num container com o socket do Docker (docker-compose:
        # srv02-agente). O Zabbix server fala com ele pela rede do compose.
        # Templates:
        #   • Docker  — containers, CPU/memória/rede/reinícios/saúde de cada um;
        #   • Linux   — a máquina que roda o Docker (a VM do Docker Desktop);
        #   • Nginx   — o proxy na frente da Loja (contadores do stub_status);
        #   • App Loja — a mesma aplicação do SRV-01, agora em container.
        # Filtro: só os containers da Loja (loja2-*); os do Zabbix/Grafana são a
        # "sala de monitoramento", não o servidor que a gente está vigiando.
        macros_docker = [
            {"macro": "{$DOCKER.LLD.FILTER.CONTAINER.MATCHES}", "value": "loja2",
             "description": "Só os containers da Loja (o SRV-02)."},
            {"macro": "{$VFS.FS.FSNAME.MATCHES}", "value": "^/$",
             "description": "Só o disco principal do container."},
            {"macro": "{$NGINX.STUB_STATUS.HOST}", "value": "loja2-proxy"},
            {"macro": "{$NGINX.STUB_STATUS.PATH}", "value": "nginx_status"},
            {"macro": "{$APP.URL}", "value": "http://loja2-proxy"},
        ]
        garantir_host(api, HOST_DOCKER, grupo,
                      [id_template(api, "Docker by Zabbix agent 2"), id_template(api, "Linux by Zabbix agent"),
                       id_template(api, "Nginx by HTTP"), garantir_template_app(api, grupo_tpl)],
                      macros=macros_docker, interface=interface_agente("srv02-agente"),
                      nome_visivel=env.get("SERVIDOR2_NOME_EXIBICAO") or "SRV-02")
        passo("agente em srv02-agente:10050 (container com o socket do Docker)")
        garantir_gatilhos_reinicio(api, HOST_DOCKER)

        print("\n[5] Telegram")
        configurar_telegram(api, env, grupo)

        print("\n[5b] Ações da central")
        garantir_usuario_acoes(api, env, grupo)

        print("\n[6] Exportação")
        exportar_template(api, tid)
    finally:
        api.sair()

    print("\nPronto! Em 1–2 minutos os dados aparecem em Monitoramento > Dados recentes.")


if __name__ == "__main__":
    main()
