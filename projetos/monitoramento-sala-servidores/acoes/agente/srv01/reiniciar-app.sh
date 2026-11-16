#!/bin/bash
# SRV-01 (celular): reinicia a Loja.
#
# Com a Loja no ar: manda o sinal HUP ao processo principal do gunicorn. Ele
# sobe um processo novo da aplicação e só então desliga o antigo, sem fechar
# a porta 8080 ("reload" sem queda, como um systemctl reload).
# Com a Loja fora: o vigia (srv01-vigia-app) está no "sleep 90" antes de
# religar; encerrar esse sleep faz o vigia religar na hora.
mestre=$(pgrep -o -f '^/usr/bin/python3 /usr/bin/gunicorn .*loja:app')
if [ -n "$mestre" ]; then
  kill -HUP "$mestre"
  echo "Loja recarregada: o gunicorn trocou o processo da aplicação sem fechar a porta."
elif pkill -f '^sleep 90$'; then
  echo "A Loja estava fora: o vigia religa agora, sem esperar os 90 s."
else
  echo "Não achei a Loja nem o vigia dela."
  exit 1
fi
