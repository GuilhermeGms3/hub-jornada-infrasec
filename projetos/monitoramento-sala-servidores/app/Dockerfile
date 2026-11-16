# =====================================================================
# Imagem da aplicação Loja (a mesma do celular, empacotada para o Docker)
# ---------------------------------------------------------------------
# Usada pelo SRV-02, o "servidor de containers" deste PC. Uma imagem é a
# "receita congelada": sistema + Python + bibliotecas + código. Qualquer
# máquina com Docker roda igual, sem instalar nada.
# =====================================================================
FROM python:3.12-alpine

# Versões fixas: a imagem sai igual hoje e daqui a um ano.
RUN pip install --no-cache-dir flask==3.1.2 gunicorn==23.0.0 psycopg2-binary==2.9.10

WORKDIR /app
COPY loja.py .

# Não roda como root: se alguém invadir a aplicação, não manda no container.
RUN adduser -D -H loja
USER loja

EXPOSE 8080
# Um processo com várias threads: as métricas (/metricas) ficam todas num lugar só.
CMD ["gunicorn", "-w", "1", "--threads", "8", "-b", "0.0.0.0:8080", "loja:app"]

# Docker sabe sozinho se a aplicação está saudável (aparece no Zabbix).
HEALTHCHECK --interval=15s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/saude > /dev/null || exit 1
