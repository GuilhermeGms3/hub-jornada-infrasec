# 4º passo (no Termux, via SSH): PostgreSQL nativo do Termux + aplicação
# Loja no Debian + plugin PostgreSQL do Zabbix agent 2.
#
# Antes de rodar, o PC copia para o celular:
#   ~/srv01.env        senhas (PG_ADMIN_SENHA, LOJA_DB_SENHA, PG_MONITOR_SENHA), permissão 600
#   ~/loja/loja.py     a aplicação
#   ~/loja/esquema.sql as tabelas
set -e
. ~/srv01.env
export PG_ADMIN_SENHA LOJA_DB_SENHA PG_MONITOR_SENHA
export DEBIAN_FRONTEND=noninteractive
APT="-y -o Dpkg::Options::=--force-confnew"
DADOS="$PREFIX/var/lib/postgresql"

echo "== 1/5 PostgreSQL (nativo do Termux: mais rápido que dentro do proot) =="
pkg install $APT postgresql
if [ ! -f "$DADOS/PG_VERSION" ]; then
  # Senha obrigatória (scram-sha-256) até para conexões locais.
  initdb -D "$DADOS" -U postgres -A scram-sha-256 --pwfile=<(printf '%s' "$PG_ADMIN_SENHA") > /dev/null
fi
pg_ctl -D "$DADOS" status > /dev/null 2>&1 || pg_ctl -D "$DADOS" -l ~/postgres.log -w start

echo "== 2/5 usuários e banco =="
# As senhas entram pelo \getenv do psql: nunca aparecem na linha de comando.
PGPASSWORD="$PG_ADMIN_SENHA" psql -h 127.0.0.1 -U postgres -v ON_ERROR_STOP=1 -q <<'SQL'
\getenv senha_loja LOJA_DB_SENHA
\getenv senha_mon PG_MONITOR_SENHA
SELECT format('CREATE ROLE loja LOGIN PASSWORD %L', :'senha_loja')
 WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'loja') \gexec
SELECT format('ALTER ROLE loja PASSWORD %L', :'senha_loja') \gexec
SELECT 'CREATE DATABASE loja OWNER loja'
 WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'loja') \gexec
-- Usuário do Zabbix: só leitura de estatísticas (papel pg_monitor).
SELECT format('CREATE ROLE zbx_monitor LOGIN PASSWORD %L', :'senha_mon')
 WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'zbx_monitor') \gexec
SELECT format('ALTER ROLE zbx_monitor PASSWORD %L', :'senha_mon') \gexec
GRANT pg_monitor TO zbx_monitor;
SQL
PGPASSWORD="$LOJA_DB_SENHA" psql -h 127.0.0.1 -U loja -d loja -v ON_ERROR_STOP=1 -q -f ~/loja/esquema.sql

echo "== 3/5 aplicação Loja no Debian (o plugin PostgreSQL vem do passo 5) =="
proot-distro login debian -- bash -c '
export DEBIAN_FRONTEND=noninteractive
apt-get install -y -q python3-flask python3-psycopg2 gunicorn > /dev/null
mkdir -p /opt/loja'
proot-distro login debian -- bash -c 'cat > /opt/loja/loja.py' < ~/loja/loja.py
# Arquivo de ambiente da aplicação (só o dono lê).
printf 'LOJA_DB_SENHA=%s\n' "$LOJA_DB_SENHA" | proot-distro login debian -- bash -c 'umask 077; cat > /opt/loja/.env'

echo "== 4/5 comandos de ligar e início automático =="
mkdir -p ~/bin
cat > ~/bin/srv01-banco <<'EOF'
#!/data/data/com.termux/files/usr/bin/bash
# Liga o PostgreSQL (se já estiver ligado, não faz nada).
D="$PREFIX/var/lib/postgresql"
pg_ctl -D "$D" status > /dev/null 2>&1 && { echo "banco já rodando"; exit 0; }
rm -f "$D/postmaster.pid"
pg_ctl -D "$D" -l ~/postgres.log -w start
EOF
cat > ~/bin/srv01-vigia-app <<'EOF'
#!/data/data/com.termux/files/usr/bin/bash
# VIGIA da aplicação Loja: roda o gunicorn e, se ele morrer, espera 90 s e
# religa. É o que o Docker (restart policy) ou o systemd fariam num servidor
# comum. Os 90 s de espera são de propósito: dão tempo de o Zabbix perceber
# ("Loja fora do ar") — num servidor real seriam poucos segundos.
while true; do
  proot-distro login debian -- bash -c \
    'set -a; . /opt/loja/.env; set +a; exec gunicorn -w 1 --threads 8 -b 0.0.0.0:8080 --chdir /opt/loja loja:app'
  echo "$(date '+%F %T') Loja caiu; o vigia religa em 90 s" >> ~/srv01-vigia.log
  sleep 90
done
EOF
cat > ~/bin/srv01-app <<'EOF'
#!/data/data/com.termux/files/usr/bin/bash
# Liga (ou religa) a aplicação Loja na porta 8080, sob o vigia.
# "srv01-app parar" desliga a aplicação e o vigia.
pkill -f srv01-vigia-app 2>/dev/null || true
pkill -f "gunicorn.*loja:app" 2>/dev/null || true
[ "$1" = "parar" ] && { echo "app parada"; exit 0; }
nohup ~/bin/srv01-vigia-app > ~/srv01-app.log 2>&1 &
sleep 5
curl -fsS http://127.0.0.1:8080/saude && echo || { echo "app NÃO subiu:"; tail -20 ~/srv01-app.log; }
EOF
chmod +x ~/bin/srv01-banco ~/bin/srv01-app ~/bin/srv01-vigia-app
cat > ~/.termux/boot/srv01.sh <<'EOF'
#!/data/data/com.termux/files/usr/bin/bash
# Executado pelo Termux:Boot quando o celular termina de ligar.
termux-wake-lock
sshd
~/bin/srv01-banco
~/bin/srv01-app
~/bin/srv01-agente
EOF
chmod +x ~/.termux/boot/srv01.sh

echo "== 5/5 ligando tudo =="
~/bin/srv01-app
~/bin/srv01-agente     # religa o agente para carregar o plugin PostgreSQL
echo PRONTO-BANCO-APP
