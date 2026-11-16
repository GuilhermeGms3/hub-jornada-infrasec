# 6º passo (no Termux, via SSH): limites e vigia geral.
#
# Lições do teste "banco lotado":
#  • cada conexão do PostgreSQL é um PROCESSO; ~92 conexões fizeram o
#    Android ("phantom process killer") derrubar o Termux inteiro;
#  • então o banco ganha um teto realista (40 conexões) e o servidor ganha
#    um vigia que religa o que cair — o papel do systemd num Linux comum.
set -e
. ~/srv01.env

echo "== 1/2 PostgreSQL com no máximo 40 conexões (3 reservadas ao monitoramento) =="
# reserved_connections (PostgreSQL 16+): vagas que só quem tem o papel
# pg_use_reserved_connections usa. Sem isso, com o banco lotado, nem o Zabbix
# entra — e o banco parece "fora do ar" justo quando mais precisamos olhar.
PGPASSWORD="$PG_ADMIN_SENHA" psql -h 127.0.0.1 -U postgres -q \
  -c "ALTER SYSTEM SET max_connections = 40" \
  -c "ALTER SYSTEM SET reserved_connections = 3" \
  -c "GRANT pg_use_reserved_connections TO zbx_monitor"
pg_ctl -D "$PREFIX/var/lib/postgresql" -l ~/postgres.log -w restart > /dev/null
PGPASSWORD="$PG_ADMIN_SENHA" psql -h 127.0.0.1 -U postgres -Atc "SHOW max_connections"

echo "== 2/2 vigia geral =="
mkdir -p ~/bin
cat > ~/bin/srv01-vigia-geral <<'EOF'
#!/data/data/com.termux/files/usr/bin/bash
# VIGIA GERAL: a cada 2 minutos confere os serviços do SRV-01 e religa o
# que tiver caído. Registra tudo em ~/srv01-vigia.log.
log() { echo "$(date '+%F %T') $*" >> ~/srv01-vigia.log; }
while true; do
  pgrep -x sshd > /dev/null                                   || { log "sshd caído: religando";   sshd; }
  pg_ctl -D "$PREFIX/var/lib/postgresql" status > /dev/null 2>&1 || { log "banco caído: religando";  ~/bin/srv01-banco > /dev/null; }
  pgrep -f "[s]rv01-vigia-app" > /dev/null                    || { log "app sem vigia: religando"; ~/bin/srv01-app > /dev/null; }
  pgrep -f "[z]abbix_agent2 -c" > /dev/null                   || { log "agente caído: religando"; ~/bin/srv01-agente > /dev/null; }
  sleep 120
done
EOF
chmod +x ~/bin/srv01-vigia-geral

# O boot passa a ligar só o essencial e o vigia (que liga o resto).
cat > ~/.termux/boot/srv01.sh <<'EOF'
#!/data/data/com.termux/files/usr/bin/bash
# Executado pelo Termux:Boot quando o celular termina de ligar.
termux-wake-lock
sshd
~/bin/srv01-banco
~/bin/srv01-app
~/bin/srv01-agente
nohup ~/bin/srv01-vigia-geral > /dev/null 2>&1 &
EOF
chmod +x ~/.termux/boot/srv01.sh

pkill -f "[s]rv01-vigia-geral" 2>/dev/null || true
nohup ~/bin/srv01-vigia-geral > /dev/null 2>&1 &
sleep 1
pgrep -f "[s]rv01-vigia-geral" > /dev/null && echo "vigia geral rodando"
echo PRONTO-VIGIA
