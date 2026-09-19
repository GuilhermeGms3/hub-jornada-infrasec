FROM nginx:1.27-alpine

COPY . /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/hub-estudos-infrasec.html > /dev/null || exit 1
