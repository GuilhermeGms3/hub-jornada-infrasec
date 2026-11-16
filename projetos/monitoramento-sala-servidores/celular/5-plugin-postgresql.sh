# 5º passo (no Termux, via SSH): compila o plugin PostgreSQL do Zabbix agent 2.
#
# Por quê compilar: o repositório oficial da Zabbix tem o agente para arm64,
# mas NÃO os plugins carregáveis (PostgreSQL, MongoDB...). O código-fonte é
# oficial e público; com o Go instalado no Debian, vira o mesmo programa.
# A versão acompanha a do agente (zabbix_agent2 -V).
set -e
proot-distro login debian -- bash -c '
set -e
V=$(zabbix_agent2 -V | head -1 | grep -oE "[0-9]+\.[0-9]+\.[0-9]+")
BASE=https://cdn.zabbix.com/zabbix-agent2-plugins/sources/postgresql
ARQ=zabbix-agent2-plugin-postgresql-$V.tar.gz
cd /opt
wget -q "$BASE/$ARQ" -O "$ARQ"
wget -q "$BASE/$ARQ.sha256" -O "$ARQ.sha256"
# Confere se o arquivo baixado é exatamente o publicado pela Zabbix.
echo "$(cut -d" " -f1 "$ARQ.sha256")  $ARQ" | sha256sum -c -
tar xzf "$ARQ"
cd "zabbix-agent2-plugin-postgresql-$V"
echo "compilando (alguns minutos)..."
make > /tmp/build-pg.log 2>&1 || { tail -20 /tmp/build-pg.log; exit 1; }
install -m 755 zabbix-agent2-plugin-postgresql /usr/sbin/
mkdir -p /etc/zabbix/zabbix_agent2.d/plugins.d
# Diz ao agente onde está o plugin.
echo "Plugins.PostgreSQL.System.Path=/usr/sbin/zabbix-agent2-plugin-postgresql" \
  > /etc/zabbix/zabbix_agent2.d/plugins.d/postgresql.conf
/usr/sbin/zabbix-agent2-plugin-postgresql -V 2>/dev/null | head -1 || true
'
~/bin/srv01-agente
echo PRONTO-PLUGIN
