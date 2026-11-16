#!/bin/sh
# SRV-02 (Docker): reinicia o container da API da Loja.
# Fala com o Docker pelo "socket" (/var/run/docker.sock), o mesmo canal que
# o comando "docker restart" usa. t=2: dá 2 s para a aplicação terminar o
# que está fazendo antes de ser desligada.
C=sala-servidor-loja2-api-1
codigo=$(curl -s -o /dev/null -w '%{http_code}' --max-time 25 \
  --unix-socket /var/run/docker.sock -X POST "http://docker/containers/$C/restart?t=2")
if [ "$codigo" = 204 ]; then
  echo "Container loja2-api reiniciado."
else
  echo "O Docker recusou o reinício (HTTP $codigo)."
  exit 1
fi
