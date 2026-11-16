# =====================================================================
# Dockerfile do GRAVADOR — compila o firmware e serve a página de gravação
# ---------------------------------------------------------------------
# "Multi-estágio" = duas etapas numa receita só:
#
#   Estágio 1 ("compilador"): uma imagem grande, com Python, PlatformIO e
#   todo o kit de compilação do ESP32 (centenas de MB). Ela compila o
#   firmware e gera os dois arquivos finais:
#     • sala-servidor.bin     → gravação pelo CABO (mesclado, endereço 0x0)
#     • sala-servidor-ota.bin → atualização pela REDE (só a aplicação)
#
#   Estágio 2 ("site"): uma imagem minúscula de nginx que recebe SÓ os .bin
#   e a página HTML. O kit de compilação fica para trás.
#
# Resultado: o container que fica rodando é leve, e o firmware é sempre
# compilado do código que está na pasta firmware/, do mesmo jeito.
#
# Mesmo esquema do workflow do M7 Access, só que local (sem GitHub Actions).
# =====================================================================

# ---------------------------------------------------------------------
# ESTÁGIO 1 — compilar
# ---------------------------------------------------------------------
FROM python:3.12-slim AS compilador

# PlatformIO compila; esptool mescla os 4 pedaços num binário só.
# esptool < 5: a série 5 renomeou os comandos (merge_bin -> merge-bin e as
# opções com "_" viraram "-"). Preso na série 4, igual ao M7.
RUN pip install --no-cache-dir "platformio==6.*" "esptool<5"

WORKDIR /firmware

# Truque de cache: copiamos PRIMEIRO só o platformio.ini e baixamos a
# plataforma, o compilador e as bibliotecas. O Docker guarda essa etapa
# pronta. Quando você muda só o código (src/), ele pula direto para a
# compilação em vez de baixar tudo de novo (economiza minutos).
COPY firmware/platformio.ini .
RUN pio pkg install --environment esp32dev

# Agora o código. Se algum arquivo de src/ mudou, daqui para baixo refaz.
COPY firmware/src ./src

# IP do PC com o Zabbix, vindo do .env (ZABBIX_HOST_IP) pelo docker-compose.
# Vira o arquivo config_build.h: a placa já sai sabendo para onde mandar os
# avisos imediatos (push). Vazio = push desligado até alguém preencher no portal.
ARG ZABBIX_SERVIDOR=""
RUN printf '#pragma once\n#define ZABBIX_SERVIDOR_PADRAO "%s"\n' "$ZABBIX_SERVIDOR" > src/config_build.h \
 && cat src/config_build.h \
 && pio run --environment esp32dev

# Mescla tudo num binário ÚNICO gravável no endereço 0x0.
# Um ESP32 normalmente precisa de 4 arquivos em 4 endereços:
#   0x1000  bootloader     (o "BIOS": acorda o chip e carrega o resto)
#   0x8000  partições      (o "mapa" da memória flash)
#   0xe000  boot_app0      (diz qual aplicação iniciar)
#   0x10000 aplicação      (o nosso firmware)
# Errar um endereço = placa que não liga. Mesclado, não há o que errar.
# dio / 40m / 4MB: modo, velocidade e tamanho da flash do ESP32-WROOM-32.
#
# O firmware.bin vai junto, com outro nome. Ele contém só a aplicação, que é o
# que o OTA troca. O mesclado não serve para o OTA, e o de aplicação não serve
# para o cabo no endereço 0x0.
RUN BUILD=.pio/build/esp32dev \
 && BOOT_APP0=/root/.platformio/packages/framework-arduinoespressif32/tools/partitions/boot_app0.bin \
 && mkdir -p /saida \
 && python -m esptool --chip esp32 merge_bin \
      -o /saida/sala-servidor.bin \
      --flash_mode dio --flash_freq 40m --flash_size 4MB \
      0x1000  "$BUILD/bootloader.bin" \
      0x8000  "$BUILD/partitions.bin" \
      0xe000  "$BOOT_APP0" \
      0x10000 "$BUILD/firmware.bin" \
 && cp "$BUILD/firmware.bin" /saida/sala-servidor-ota.bin \
 && VERSAO=$(sed -n 's/.*VERSAO = "\(.*\)".*/\1/p' src/main.cpp) \
 && TAMANHO=$(stat -c %s /saida/sala-servidor.bin) \
 && SHA=$(sha256sum /saida/sala-servidor.bin | cut -d' ' -f1) \
 && TAMANHO_OTA=$(stat -c %s /saida/sala-servidor-ota.bin) \
 && SHA_OTA=$(sha256sum /saida/sala-servidor-ota.bin | cut -d' ' -f1) \
 && DATA=$(date -u +%Y-%m-%dT%H:%M:%SZ) \
 && printf '{"arquivo":"sala-servidor.bin","versao":"%s","tamanho":%s,"sha256":"%s","compilado_em":"%s","ota":{"arquivo":"sala-servidor-ota.bin","tamanho":%s,"sha256":"%s"}}\n' \
      "$VERSAO" "$TAMANHO" "$SHA" "$DATA" "$TAMANHO_OTA" "$SHA_OTA" > /saida/firmware.json \
 && cat /saida/firmware.json

# ---------------------------------------------------------------------
# ESTÁGIO 2 — servir a página e o binário
# ---------------------------------------------------------------------
FROM nginx:1.28-alpine AS site

# Configuração do nginx (sem cache para o .bin: sempre a versão nova).
COPY gravador/nginx.conf /etc/nginx/conf.d/default.conf

# A página do gravador.
COPY gravador/site/ /usr/share/nginx/html/

# Do estágio 1 vêm SÓ os dois binários e a ficha deles.
COPY --from=compilador /saida/ /usr/share/nginx/html/firmware/
