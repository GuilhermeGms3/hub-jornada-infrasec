"""
gerar_dashboard.py — monta o dashboard "Sala do servidor" do Grafana
=====================================================================

O dashboard tem UM painel só, em tela cheia: a central de monitoramento
(NOC) feita à mão em grafana/noc/. Nada de gauge ou card padrão do Grafana.

Como funciona: o painel é do tipo "Business Text" (um painel que roda
HTML + JavaScript). O código dele só importa /public/noc/noc.js, que
monta a interface, a sala 3D e busca os dados no Zabbix sozinho.

Depois de mudar algo aqui:
    python grafana/gerar_dashboard.py
O Grafana relê a pasta em até 10 s. Mudou só os arquivos de grafana/noc/?
Nem precisa rodar isto: basta recarregar a página no navegador.

Para o vídeo (tela cheia, sem menus):
    http://localhost:3000/d/sala-do-servidor/sala-do-servidor?kiosk&viewPanel=panel-1&_dash.hideTimePicker
"""

import json
from pathlib import Path

DESTINO = Path(__file__).resolve().parent / "dashboards" / "sala-do-servidor.json"
DS = {"type": "alexanderzobnin-zabbix-datasource", "uid": "zabbix"}

# Código que o Business Text executa. "this" é guardado entre as execuções;
# o import() acontece uma vez por abertura da página (o ?v= evita cache velho).
CODIGO = """\
const self = this;
if (!self.noc) {
  self.noc = import('/public/noc/noc.js?v=' + Date.now());
}
self.noc
  .then((m) => m.iniciar(context))
  .catch((e) => {
    console.error('[noc]', e);
    context.element.textContent = 'Não consegui carregar a central: ' + e.message;
  });
"""


def montar():
    conteudo = '<div class="noc-raiz"></div>'
    painel = {
        "id": 1,
        "type": "marcusolsson-dynamictext-panel",
        "title": "",
        "transparent": True,
        "gridPos": {"x": 0, "y": 0, "w": 24, "h": 22},   # ~830 px: cabe numa tela comum
        "datasource": DS,
        # Uma consulta leve só para o painel ter "dados" e rodar o código.
        # Os dados de verdade a central busca sozinha (grafana/noc/dados.js).
        "targets": [{
            "refId": "A", "datasource": DS, "queryType": "0",
            "group": {"filter": "Sala do servidor"}, "host": {"filter": "esp32-sala"},
            "application": {"filter": ""}, "itemTag": {"filter": ""},
            "item": {"filter": "ESP32: tempo ligado"}, "functions": [],
            "options": {"showDisabledItems": False, "skipEmptyValues": False,
                        "disableDataAlignment": False, "useZabbixValueMapping": False},
        }],
        "options": {
            "renderMode": "data", "editors": ["afterRender"],
            "editor": {"language": "html", "format": "auto"},
            "content": conteudo, "defaultContent": conteudo,
            "afterRender": CODIGO, "helpers": "", "styles": "", "wrap": False,
            "contentPartials": [], "externalStyles": [],
        },
    }
    return {
        "uid": "sala-do-servidor",
        "title": "Nertysoft · Sala de servidores",
        "description": "Central de monitoramento da sala do servidor (ESP32 + Zabbix). "
                       "Gerado por grafana/gerar_dashboard.py.",
        "tags": ["esp32", "zabbix", "sala-servidor", "noc"],
        "timezone": "browser",
        "editable": True,
        "refresh": "",                   # a central se atualiza sozinha (5 s)
        "time": {"from": "now-30m", "to": "now"},
        "schemaVersion": 39,
        "version": 2,
        "panels": [painel],
        "templating": {"list": []},
        "annotations": {"list": []},
        "links": [],
    }


if __name__ == "__main__":
    DESTINO.parent.mkdir(parents=True, exist_ok=True)
    DESTINO.write_text(json.dumps(montar(), ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Dashboard gerado: {DESTINO}")
