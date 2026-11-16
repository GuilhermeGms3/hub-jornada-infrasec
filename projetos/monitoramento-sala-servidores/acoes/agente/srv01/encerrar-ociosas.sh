#!/bin/bash
# SRV-01 (celular): encerra as conexões da Loja paradas há mais de 1 minuto.
#
# Entra no banco com o usuário zbx_acoes, que tem dois papéis do PostgreSQL:
#   • pg_use_reserved_connections — usa as vagas reservadas, então ENTRA
#     mesmo com o banco lotado (justamente quando esta ação é necessária);
#   • pg_signal_backend — pode encerrar conexões de outros usuários comuns.
# A senha fica em /opt/acoes/.env (só o root do Debian lê).
set -a; . /opt/acoes/.env; set +a
exec python3 - <<'PY'
import os
import psycopg2

SQL = """SELECT count(pg_terminate_backend(pid)) FROM pg_stat_activity
         WHERE datname = 'loja' AND usename = 'loja' AND pid <> pg_backend_pid()
           AND state IN ('idle', 'idle in transaction')
           AND state_change < now() - interval '1 minute'"""
conexao = psycopg2.connect(host="127.0.0.1", dbname="loja", user="zbx_acoes",
                           password=os.environ["ACOES_PG_SENHA"], connect_timeout=5)
conexao.autocommit = True
with conexao.cursor() as cur:
    cur.execute(SQL)
    print(f"{cur.fetchone()[0]} conexões ociosas encerradas no PostgreSQL do SRV-01.")
PY
