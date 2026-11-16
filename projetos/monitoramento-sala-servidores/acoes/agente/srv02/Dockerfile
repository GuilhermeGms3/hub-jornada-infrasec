# Agente do SRV-02 = a imagem oficial + curl.
# O curl é o "controle remoto" do Docker: os scripts de ação
# (reiniciar-app.sh, encerrar-ociosas.sh) falam com a API do Docker pelo
# socket, e o wget que já vem na imagem não sabe usar socket.
FROM zabbix/zabbix-agent2:alpine-7.0.32
USER root
RUN apk add --no-cache curl
USER 1997
