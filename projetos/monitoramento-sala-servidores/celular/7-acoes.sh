# 7º passo (no Termux, via SSH): ações da central no SRV-01.
#
# Instala as duas "receitas" que a central pode pedir pelo Zabbix
# (reiniciar a Loja, encerrar conexões ociosas) e libera SÓ elas no agente.
#
# Antes, no PC, copie os arquivos para ~/acoes no celular:
#   scp -P 8022 -i ~/.ssh/celular_srv01 acoes/agente/srv01/*.sh acoes/agente/acoes.conf localhost:acoes/
# e tenha ACOES_PG_SENHA no ~/srv01.env (veja celular/README.md).
set -e
. ~/srv01.env
[ -n "$ACOES_PG_SENHA" ] || { echo "falta ACOES_PG_SENHA no ~/srv01.env"; exit 1; }
export ACOES_PG_SENHA

echo "== 1/3 usuário zbx_acoes no PostgreSQL =="
# Menor privilégio: não é superusuário. Só pode encerrar conexões
# (pg_signal_backend) e entrar pelas vagas reservadas, no máximo 2 vezes ao mesmo tempo.
PGPASSWORD="$PG_ADMIN_SENHA" psql -h 127.0.0.1 -U postgres -v ON_ERROR_STOP=1 -q <<'SQL'
\getenv senha ACOES_PG_SENHA
SELECT format('CREATE ROLE zbx_acoes LOGIN CONNECTION LIMIT 2 PASSWORD %L', :'senha')
 WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'zbx_acoes') \gexec
SELECT format('ALTER ROLE zbx_acoes LOGIN CONNECTION LIMIT 2 PASSWORD %L', :'senha') \gexec
GRANT pg_signal_backend, pg_use_reserved_connections TO zbx_acoes;
SQL

echo "== 2/3 receitas em /opt/acoes (Debian) =="
proot-distro login debian -- bash -c 'mkdir -p /opt/acoes && chmod 755 /opt/acoes'
for f in reiniciar-app.sh encerrar-ociosas.sh; do
  tr -d '\r' < ~/acoes/$f | proot-distro login debian -- bash -c "cat > /opt/acoes/$f && chmod 755 /opt/acoes/$f"
done
printf 'ACOES_PG_SENHA=%s\n' "$ACOES_PG_SENHA" | proot-distro login debian -- bash -c 'umask 077; cat > /opt/acoes/.env'
tr -d '\r' < ~/acoes/acoes.conf | proot-distro login debian -- bash -c 'cat > /etc/zabbix/zabbix_agent2.d/acoes.conf'

echo "== 3/3 religando o agente com a lista de comandos permitidos =="
~/bin/srv01-agente
sleep 2
proot-distro login debian -- zabbix_agent2 -c /etc/zabbix/zabbix_agent2.conf -t 'system.run[id]' | grep -q NOTSUPPORTED \
  && echo "ok: comando fora da lista é recusado"
echo PRONTO-ACOES
