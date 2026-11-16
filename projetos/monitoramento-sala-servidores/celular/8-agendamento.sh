#!/data/data/com.termux/files/usr/bin/bash
# =====================================================================
# 8-agendamento.sh — rede de segurança do SRV-01
# ---------------------------------------------------------------------
# O vigia geral é um processo do Termux. Quando a Samsung encerra o Termux,
# o vigia morre junto e ninguém religa nada. É como trancar o segurança
# dentro do prédio que ele deveria vigiar.
#
# Por isso, este script entrega a vigilância ao PRÓPRIO Android: o agendador
# do sistema (JobScheduler) guarda a tarefa fora do Termux e a dispara a cada
# 15 minutos, o menor intervalo que o Android permite, mesmo depois de um
# reinício do celular. O Android pode atrasar a tarefa para poupar bateria.
#
# Precisa do app Termux:API e do pacote termux-api, da mesma origem do Termux
# (aqui, F-Droid). Pode rodar mais de uma vez: a tarefa só é substituída.
# =====================================================================
set -eu

mkdir -p "$HOME/bin"

# O que roda a cada 15 minutos: uma única conferência, sem ficar na memória.
cat > "$HOME/bin/srv01-conferir" <<'SCRIPT'
#!/data/data/com.termux/files/usr/bin/bash
# Confere os serviços do SRV-01 uma vez e religa o que tiver caído.
# Quem chama é o agendador do Android (veja celular/8-agendamento.sh).
log() { echo "$(date '+%F %T') agendamento: $*" >> "$HOME/srv01-vigia.log"; }

# Mantém o processador acordado enquanto os serviços rodam.
termux-wake-lock
pgrep -x sshd > /dev/null || { log "sshd caído: religando"; sshd; }
pg_ctl -D "$PREFIX/var/lib/postgresql" status > /dev/null 2>&1 || { log "banco caído: religando"; "$HOME/bin/srv01-banco" > /dev/null 2>&1; }
pgrep -f "[s]rv01-vigia-app" > /dev/null || { log "app sem vigia: religando"; "$HOME/bin/srv01-app" > /dev/null 2>&1; }
pgrep -f "[z]abbix_agent2 -c" > /dev/null || { log "agente caído: religando"; "$HOME/bin/srv01-agente" > /dev/null 2>&1; }
pgrep -f "[s]rv01-vigia-geral" > /dev/null || { log "vigia geral caído: religando"; nohup "$HOME/bin/srv01-vigia-geral" > /dev/null 2>&1 < /dev/null & }
log "conferência feita"
SCRIPT
chmod 700 "$HOME/bin/srv01-conferir"

# --persisted: a tarefa continua agendada depois de reiniciar o celular.
# --battery-not-low false: roda mesmo com pouca bateria, quando um servidor
# caído é justamente o que menos se quer.
termux-job-scheduler \
  --job-id 1 \
  --script "$HOME/bin/srv01-conferir" \
  --period-ms 900000 \
  --persisted true \
  --battery-not-low false

termux-job-scheduler --pending
