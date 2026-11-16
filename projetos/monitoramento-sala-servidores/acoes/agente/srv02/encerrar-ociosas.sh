#!/bin/sh
# SRV-02 (Docker): encerra as conexões da Loja paradas há mais de 1 minuto.
# Roda o psql DENTRO do container do banco ("docker exec" pela API do
# Docker, em dois passos: cria o exec e depois o executa).
#
# Por que "paradas há mais de 1 minuto": a aplicação devolve as conexões ao
# pool entre um pedido e outro; essas ficam ociosas só por instantes. Uma
# conexão parada há 1 minuto inteiro está esquecida (vazamento) e só ocupa
# vaga no banco.
S=/var/run/docker.sock
C=sala-servidor-loja2-db-1
SQL="SELECT count(pg_terminate_backend(pid)) FROM pg_stat_activity
     WHERE datname = 'loja' AND usename = 'loja' AND pid <> pg_backend_pid()
       AND state IN ('idle', 'idle in transaction')
       AND state_change < now() - interval '1 minute'"

corpo=$(printf '{"AttachStdout":true,"AttachStderr":true,"Tty":true,"Cmd":["psql","-U","loja","-d","loja","-Atc","%s"]}' \
  "$(echo "$SQL" | tr '\n' ' ')")
id=$(curl -s --max-time 10 --unix-socket $S -H 'Content-Type: application/json' -X POST \
  -d "$corpo" "http://docker/containers/$C/exec" | sed -n 's/.*"Id":"\([0-9a-f]*\)".*/\1/p')
[ -n "$id" ] || { echo "Não consegui abrir o psql no container do banco."; exit 1; }
saida=$(curl -s --max-time 20 --unix-socket $S -H 'Content-Type: application/json' -X POST \
  -d '{"Detach":false,"Tty":true}' "http://docker/exec/$id/start" | tr -dc '0-9a-zA-Z :.\n' | tail -1)
case "$saida" in
  ''|*[!0-9]*) echo "O banco respondeu: $saida"; exit 1 ;;
  *) echo "$saida conexões ociosas encerradas no loja2-db." ;;
esac
