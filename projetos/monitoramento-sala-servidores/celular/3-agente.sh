# Roda no Termux (via SSH): configura o Zabbix agent 2 do Debian, cria o
# script de ligar/desligar e o início automático (Termux:Boot).
set -e
PC_IP="$1"                       # IP do PC com o Zabbix (vem como argumento)
# --- Configuração do agente ------------------------------------------------
# Server       = quem pode PERGUNTAR (o Zabbix server; via Docker chega com o IP do PC)
# ServerActive = para onde o agente MANDA dados por conta própria (modo ativo)
# Hostname     = nome técnico do host no Zabbix (igual ao configurar.py)
# A edição é feita por DENTRO do Debian: funciona em qualquer versão do
# proot-distro, sem depender de onde ele guarda os arquivos.
proot-distro login debian -- bash -c "
CONF=/etc/zabbix/zabbix_agent2.conf
sed -i \
  -e 's|^Server=.*|Server=${PC_IP},127.0.0.1|' \
  -e 's|^ServerActive=.*|ServerActive=${PC_IP}|' \
  -e 's|^Hostname=.*|Hostname=notebook-velho|' \
  -e 's|^LogFile=.*|LogFile=/var/log/zabbix/zabbix_agent2.log|' \
  \$CONF
grep -E '^(Server|ServerActive|Hostname|ListenPort)=' \$CONF || true
"

# --- Script para ligar o agente ---------------------------------------------
mkdir -p ~/bin
cat > ~/bin/srv01-agente <<'EOF'
#!/data/data/com.termux/files/usr/bin/bash
# Liga (ou religa) o Zabbix agent 2 que roda dentro do Debian.
# Uso: srv01-agente        → liga
#      srv01-agente parar  → desliga
pkill -f zabbix_agent2 2>/dev/null || true
[ "$1" = "parar" ] && { echo "agente parado"; exit 0; }
termux-wake-lock 2>/dev/null || true
nohup proot-distro login debian -- bash -c \
  'mkdir -p /run/zabbix /var/log/zabbix; exec zabbix_agent2 -c /etc/zabbix/zabbix_agent2.conf' \
  > ~/srv01-agente.log 2>&1 &
sleep 3
pgrep -f zabbix_agent2 > /dev/null && echo "agente rodando" || { echo "agente NÃO subiu:"; tail -20 ~/srv01-agente.log; }
EOF
chmod +x ~/bin/srv01-agente

# --- Início automático quando o celular liga (app Termux:Boot) ---------------
mkdir -p ~/.termux/boot
cat > ~/.termux/boot/srv01.sh <<'EOF'
#!/data/data/com.termux/files/usr/bin/bash
# Executado pelo Termux:Boot quando o celular termina de ligar.
termux-wake-lock
sshd
~/bin/srv01-agente
EOF
chmod +x ~/.termux/boot/srv01.sh

~/bin/srv01-agente
echo PRONTO-AGENTE
