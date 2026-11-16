"""
descobrir_chat_id.py — mostra o seu chat ID do Telegram
========================================================

Passo a passo:
  1. No Telegram, fale com o @BotFather, mande /newbot e siga as perguntas.
     Ele devolve um TOKEN (algo como 123456:ABC...). Cole no .env em
     TELEGRAM_TOKEN=  (nunca mande o token para ninguém nem mostre em vídeo).
  2. Abra a conversa com o SEU bot novo e mande qualquer mensagem ("oi").
  3. Rode:   python zabbix/descobrir_chat_id.py
  4. Copie o número que aparecer para TELEGRAM_CHAT_ID= no .env.
  5. Rode o configurar.py de novo: ele liga o Telegram no Zabbix.

O token é lido do .env e NUNCA é impresso na tela.
"""

import json
import sys
import urllib.error
import urllib.request

sys.path.insert(0, __import__("os").path.dirname(__file__))
from configurar import ler_env  # reaproveita a leitura do .env

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

token = ler_env().get("TELEGRAM_TOKEN", "")
if not token:
    sys.exit("TELEGRAM_TOKEN está vazio no .env. Crie o bot no @BotFather primeiro.")

try:
    with urllib.request.urlopen(f"https://api.telegram.org/bot{token}/getUpdates", timeout=15) as r:
        resposta = json.load(r)
except urllib.error.HTTPError as e:
    # Mensagem genérica de propósito: a URL do erro contém o token.
    sys.exit(f"O Telegram recusou (HTTP {e.code}). Confira o TELEGRAM_TOKEN no .env.")
except urllib.error.URLError:
    sys.exit("Sem conexão com api.telegram.org. Confira a internet.")

chats = {}
for atualizacao in resposta.get("result", []):
    msg = atualizacao.get("message") or atualizacao.get("channel_post") or {}
    chat = msg.get("chat")
    if chat:
        nome = chat.get("title") or " ".join(filter(None, [chat.get("first_name"), chat.get("last_name")]))
        chats[chat["id"]] = f"{nome} ({chat.get('type')})"

if not chats:
    print("Nenhuma mensagem encontrada. Mande um 'oi' para o seu bot no Telegram e rode de novo.")
else:
    print("Chats que falaram com o bot:")
    for chat_id, nome in chats.items():
        print(f"  TELEGRAM_CHAT_ID={chat_id}    ← {nome}")
