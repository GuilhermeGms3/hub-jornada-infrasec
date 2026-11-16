# Monitoramento lógico e físico de sala de servidores

Em ambientes on-premise, o monitoramento costuma parar na parte lógica: servidores, CPU,
memória, banco de dados e aplicações. Mas a sala onde eles ficam também falha: infiltração no
teto, gotejamento do ar-condicionado, porta esquecida aberta, ar-condicionado parado.

Este laboratório junta os dois lados no mesmo painel. Um **ESP32 com sensores** vigia a sala
(**água no piso, temperatura/umidade e porta aberta**, com entrada pronta para um sensor de
energia), o **Zabbix** coleta e alerta no **Telegram**, e o **Grafana** vira uma central de
monitoramento (NOC) com a sala e o rack de servidores em 3D.

O ping do servidor continua **verde**, mas o ESP32 enxerga o que o ping não vê.

```
sensores ──fios──> ESP32 ──Wi-Fi/HTTP──> Zabbix ──> Telegram
                                           │
                                           └──────> Grafana (central NOC 3D)
SRV-01 e SRV-02 (Zabbix agent 2) ─────────> Zabbix
```

## Índice
1. [Componentes](#componentes)
2. [Endereços e logins](#endereços-e-logins)
3. [Como montar — passo a passo](#como-montar--passo-a-passo)
4. [Comandos do dia a dia](#comandos-do-dia-a-dia)
5. [Estrutura das pastas](#estrutura-das-pastas)
6. [Pré-requisitos](#pré-requisitos)
7. [Zabbix e Grafana em Docker](#zabbix-e-grafana-em-docker)
8. [Firmware do ESP32 e gravador web](#firmware-do-esp32-e-gravador-web)
9. [Zabbix configurado pela API (template)](#zabbix-configurado-pela-api-template)
10. [Central de monitoramento (NOC) no Grafana](#central-de-monitoramento-noc-no-grafana)
11. [Ações na central: Reconhecer, Comentar, Manutenção](#ações-na-central-reconhecer-comentar-manutenção)
    e [ações que corrigem](#ações-que-corrigem-reiniciar-e-encerrar-conexões)
12. [Problemas comuns](#problemas-comuns)

## Componentes

| Parte | O que é |
|---|---|
| Zabbix 7.0.32 LTS e Grafana 13.2.5 | em Docker, com versões fixadas |
| ESP32 DevKit V1 | DHT11 (temperatura e umidade), sensor de chuva (água no piso) e MC-38 (porta); firmware com portal de Wi-Fi, OTA e push para o Zabbix |
| Gravador web (:8090) | compila o firmware em Docker e grava a placa pelo navegador, sem instalar nada |
| Template do Zabbix | itens, gatilhos e Telegram criados pelo `zabbix/configurar.py` |
| Central NOC | sala e rack em 3D, gaveta do servidor, problemas e eventos |
| SRV-01 | celular Android com agente Zabbix, PostgreSQL e a aplicação Loja — veja [celular/README.md](celular/README.md) |
| SRV-02 | servidor de containers: nginx + API + PostgreSQL no Docker, template Docker |
| Banco e aplicação | templates PostgreSQL e App Loja — veja [app/README.md](app/README.md) |
| Ações na central | Reconhecer, Comentar, Manutenção, reiniciar a aplicação e encerrar conexões ociosas |

## Endereços e logins

| O quê | Endereço | Login |
|---|---|---|
| Zabbix | http://localhost:8080 | `Admin` / senha em `ZABBIX_PASSWORD` no `.env` (padrão `zabbix` — **troque**) |
| Grafana | http://localhost:3000 | `GRAFANA_ADMIN_USER` / `GRAFANA_ADMIN_PASSWORD` do `.env` |
| **Central em tela cheia** | http://localhost:3000/d/sala-do-servidor/sala-do-servidor?kiosk&viewPanel=panel-1&_dash.hideTimePicker | (sem menus) |
| Gravador do ESP32 | http://localhost:8090 (Chrome/Edge) | — |
| Gerador de carga da Loja | http://localhost:8092 | — |
| Aplicação Loja (no SRV-01, o celular) | http://IP-do-celular:8080 | — |
| Aplicação Loja (no SRV-02, containers) | http://localhost:8093 | — |
| Serviço de ações da central | http://localhost:8094/saude | só neste PC; quem age é quem está logado no Grafana |

> **Trocou a senha do Admin no Zabbix?** Coloque a nova em `ZABBIX_PASSWORD` no `.env` e rode
> `docker compose up -d grafana` (o Grafana usa essa senha para ler o Zabbix).

## Como montar — passo a passo

Siga na ordem. Cada passo tem o teste para saber se deu certo.

1. **Preparar o `.env`** — copie o `.env.example` para `.env`, preencha senhas e IPs e rode
   `docker compose up -d`.
2. **Montar o hardware** — ligações na tabela [A montagem](#a-montagem).
3. **Gravar o ESP32** — http://localhost:8090 → *Gravar no ESP32* (detalhes em
   [Firmware do ESP32](#firmware-do-esp32-e-gravador-web)).
4. **Wi-Fi pelo celular** — rede `Sala-Servidor-XXXX` → escolha a rede 2,4 GHz → senha.
   Em *Avisos imediatos ao Zabbix* o IP deste PC já vem preenchido (vem do `ZABBIX_HOST_IP`
   do `.env`); só mude se o IP do PC tiver mudado.
5. **IP e MAC** — no gravador, *Monitor Serial* → *Reiniciar a placa*. Anote os dois.
6. **Reservar o IP no roteador** — Reserva de DHCP com o MAC do ESP32.
7. **Calibrar** — `http://IP-do-ESP32/` → limites do sensor de chuva e da energia. Aproxime e
   afaste o ímã: se "aberta" e "fechada" vierem trocados, marque **Inverter porta**. Defina também
   a **senha do OTA**.
   ✅ Teste: `http://IP-do-ESP32/status` abre no navegador deste computador.
8. **Servidor monitorado** — instale o Zabbix agent 2 no SRV-01 (o guia do celular está em
   [celular/README.md](celular/README.md)) e anote o IP.
9. **Apontar o Zabbix para os aparelhos** — no `.env`:
   ```
   ESP32_IP=<IP do ESP32>
   NOTEBOOK_VELHO_IP=<IP do SRV-01>
   NOTEBOOK_VELHO_SO=linux   (windows ou android)
   ```
   e rode:
   ```bash
   docker compose up -d
   python zabbix/configurar.py
   ```
   ✅ Teste: em 1–2 min a central mostra, no cartão *Sensor ambiental*, `Online` com a versão do
   firmware, e o rack mostra o servidor (clique nele para ver CPU, memória…).
   ✅ Teste do push: com o *Monitor Serial* aberto, afaste o ímã da porta. Deve aparecer
   `Push: Zabbix recebeu` e a porta abrir na sala 3D em menos de 1 s. Se aparecer
   `Push: não conectou`, o Firewall do Windows está bloqueando a porta 10051 (veja
   [Problemas comuns](#problemas-comuns)); enquanto isso o polling continua funcionando.
10. **Telegram** — crie o bot no @BotFather, coloque `TELEGRAM_TOKEN` no `.env`, mande "oi"
   para o bot, rode `python zabbix/descobrir_chat_id.py`, coloque `TELEGRAM_CHAT_ID` no `.env`
   e rode `python zabbix/configurar.py` de novo.
   ✅ Teste: pingue água no sensor → chega "🚨 Água detectada no piso" no celular.

Nada mais precisa ser feito à mão no Zabbix nem no Grafana.

## Comandos do dia a dia

Rodar na pasta do projeto.

| Para… | Comando |
|---|---|
| Subir tudo | `docker compose up -d` |
| Ver o estado | `docker compose ps` |
| Ver logs (ex.: Zabbix server) | `docker compose logs -f zabbix-server` |
| Parar tudo (dados ficam guardados) | `docker compose down` |
| Recompilar o firmware | `docker compose up -d --build gravador` |
| Atualizar a placa sem cabo | baixe o `.bin` em http://localhost:8090 e envie em http://sala-servidor.local/atualizar |
| (Re)configurar o Zabbix pelo `.env` | `python zabbix/configurar.py` |
| Regerar o dashboard depois de mudar o gerador | `python grafana/gerar_dashboard.py` |
| Aplicar senha nova do Zabbix no Grafana | `docker compose up -d grafana` |

## Estrutura das pastas

| Pasta / arquivo | O que tem |
|---|---|
| [docker-compose.yml](docker-compose.yml) | Todos os serviços, comentados |
| `.env` / [.env.example](.env.example) | Senhas, token e IPs (o `.env` **nunca** vai para o Git) |
| [firmware/](firmware/) | Código do ESP32 (PlatformIO) |
| [gravador/](gravador/) | Dockerfile que compila + página que grava pelo navegador |
| [zabbix/configurar.py](zabbix/configurar.py) | Configura o Zabbix inteiro pela API (idempotente) |
| [zabbix/template_esp32_sala.yaml](zabbix/template_esp32_sala.yaml) | O template exportado (backup / importável à mão) |
| [zabbix/descobrir_chat_id.py](zabbix/descobrir_chat_id.py) | Mostra o chat ID do Telegram |
| [grafana/gerar_dashboard.py](grafana/gerar_dashboard.py) | Gera o JSON do dashboard |
| [grafana/noc/](grafana/noc/) | A central de monitoramento: `noc.js` (início), `dados.js` (Zabbix), `interface.js` (telas), `cena3d.js` (sala/rack 3D), `acoes.js` (botões que agem), `estilo.css` |
| [acoes/acoes.py](acoes/acoes.py) | Serviço das ações da central: confere quem está no Grafana e age no Zabbix com usuário restrito |
| [acoes/agente/](acoes/agente/) | As receitas de cada servidor (`srv01/`, `srv02/`) e a lista do que o agente pode executar (`acoes.conf`) |
| [grafana/provisioning/](grafana/provisioning/) | Plugins, fonte de dados e dashboards carregados sozinhos |

---

## Pré-requisitos

- Sistema: **Windows 11 Pro**, com **Docker Desktop** (WSL2). Ele precisa estar **aberto**
  para os comandos `docker` funcionarem — o Docker no Windows roda dentro de uma pequena
  máquina Linux (WSL2), e o Docker Desktop é quem liga ela.
- IP deste computador: `ZABBIX_HOST_IP` no `.env`. **Reserve-o no roteador** para não mudar.

**Por que um `.env`?** Nenhum segredo fica no código. O Docker Compose e os scripts Python
leem o `.env` sozinhos, e o `.gitignore` impede que ele vá para o GitHub.

## Zabbix e Grafana em Docker

| Serviço | Imagem | Endereço | Para que serve |
|---|---|---|---|
| `postgres` | `postgres:16-alpine` | só dentro do Docker | Banco onde o Zabbix guarda tudo |
| `zabbix-server` | `zabbix/zabbix-server-pgsql:alpine-7.0.32` | porta 10051 | O "cérebro": coleta, avalia gatilhos, alerta |
| `zabbix-web` | `zabbix/zabbix-web-nginx-pgsql:alpine-7.0.32` | :8080 | Tela do Zabbix e API |
| `grafana` | `grafana/grafana:13.2.5` | :3000 | Painel (plugins Zabbix 6.10.1 e Business Text 6.3.0) |

**Por que essas versões?** Zabbix **7.0 é a LTS** mais recente já lançada (a 8.0 LTS ainda
está planejada). Versões **fixadas** (`7.0.32`, não `latest`) para nada mudar sozinho.

**O que aprendi:** *container* = programa empacotado; *imagem* = a receita; *volume* = HD
virtual que sobrevive à recriação; `"8080:8080"` = porta do PC : porta do container; na rede
do Docker os serviços se acham **pelo nome**; *healthcheck* faz um serviço esperar o outro.
Plugin "app" do Grafana precisa ser instalado **e** habilitado; `GF_PLUGINS_PREINSTALL_SYNC`
baixa antes de o Grafana ligar (sem `_SYNC` ele travava na primeira subida).

**Aviso normal no log:** o host padrão "Zabbix server" tenta um agente em `127.0.0.1` que não
existe no container (`interface unavailable`). Não atrapalha.

## Firmware do ESP32 e gravador web

| Arquivo | Papel |
|---|---|
| [firmware/platformio.ini](firmware/platformio.ini) | Placa `esp32dev`, `espressif32@6.13.0`, bibliotecas fixadas |
| [firmware/src/main.cpp](firmware/src/main.cpp) | Wi-Fi, portal, sensores, `/status`, LED, botão BOOT |
| [firmware/src/pagina_portal.h](firmware/src/pagina_portal.h) | Página de configuração do Wi-Fi |
| [firmware/src/pagina_status.h](firmware/src/pagina_status.h) | Página de sensores e calibração |
| [firmware/src/pagina_atualizar.h](firmware/src/pagina_atualizar.h) | Página `/atualizar`, com barra de progresso |
| [gravador/Dockerfile](gravador/Dockerfile) | Estágio 1 compila e gera os dois `.bin`; estágio 2 é um nginx |
| [gravador/site/](gravador/site/) | Página do gravador (esptool-js 0.6.1) + Monitor Serial |

**O ESP32 responde:** `http://IP/` (página com sensores e ajustes), `http://IP/status` (JSON
que o Zabbix lê), `http://IP/atualizar` (firmware novo pela rede) e `http://sala-servidor.local/`.

### A montagem

| Sensor | Ligação | Como o firmware lê |
|---|---|---|
| DHT11 | DATA no GPIO 4 | a cada 2 s |
| Chuva YL-83/FC-37 (com LM393) | alimentado em 3V3, **AO** no GPIO 32; **DO** sem uso; sem resistor externo | analógico, 11 dB, média de 10 leituras, sem pull-up nem pull-down |
| Porta MC-38 | entre o GPIO 25 e o GND | `INPUT_PULLUP`, debounce de 50 ms |
| Energia (opcional) | carregador de 5 V pelo divisor 10k/20k no GPIO 34 | analógico, 11 dB, média de 10 leituras, limite padrão 2500; só vale com *Sensor de energia instalado* marcado na página da placa |

**Sensor de energia:** sem o carregador ligado ao divisor, o GPIO 34 fica solto e capta ruído, lendo
qualquer valor de 0 a 4095. Por isso, o firmware ignora esse pino até você marcar *Sensor de energia
instalado* na página da placa: até lá a energia conta como presente, nenhum alerta falso é gerado, e a
central mostra "Sem sensor" no lugar do número. Com o divisor montado, marque a opção e calibre o limite.

**Sensor de chuva e histerese:** seco lê alto (perto de 4095) e molhado lê mais baixo. O alerta
abre **abaixo** do limite (padrão 2000) e só fecha **acima do limite + 200**. Pense no termostato
de uma geladeira: ele não liga e desliga na mesma temperatura, senão ficaria batendo sem parar.
Por isso, o limite aceita no máximo 3895: acima disso, a volta passaria de 4095 e nunca aconteceria.

**Porta NA ou NF:** a página mostra o pino cru (`HIGH` ou `LOW`) e tem a caixinha **Inverter
porta**. Se "aberta" e "fechada" vierem trocados, marque e salve, sem regravar. A opção troca
só a interpretação em `porta_aberta`; `porta_raw` continua mostrando o pino de verdade.

### Atualizar pela rede (OTA)

| Arquivo | Caminho | Quando usar | Wi-Fi e ajustes |
|---|---|---|---|
| `sala-servidor.bin` (mesclado, endereço 0x0) | **cabo**, botão *Gravar no ESP32* | primeira gravação, troca da tabela de partições ou placa que não liga | **apagados** |
| `sala-servidor-ota.bin` (só a aplicação) | **rede**, página `/atualizar` | atualizações normais | mantidos |

**Passo a passo sem cabo:** defina a senha na página do ESP32 (só na primeira vez), baixe o
`sala-servidor-ota.bin` em http://localhost:8090, abra `http://sala-servidor.local/atualizar`,
escolha o arquivo, digite a senha e envie. No fim, a placa reinicia e a página mostra a versão nova.

**Se a atualização falhar no meio, o ESP32 continua rodando a versão anterior.** A memória tem
duas áreas de programa, como dois lados de uma estante: o arquivo novo é escrito no lado livre e a
placa só troca de lado depois de conferir que ele chegou inteiro. Queda de Wi-Fi, falta de energia
ou arquivo errado no meio do caminho não afetam o lado em uso.

**O limite dessa proteção:** um firmware que chega inteiro, mas tem um defeito no próprio código,
é aceito normalmente, e a placa não volta sozinha para a versão anterior. Se ele derrubar o Wi-Fi ou a
página, a saída é gravar pelo cabo. Por isso, teste cada versão com a placa ao alcance.

**Segurança:** sem senha definida, o OTA fica travado. Trocar a senha exige saber a atual, e quem
esqueceu segura o BOOT por 10 s, o que também apaga o Wi-Fi e os ajustes. A placa guarda só a
impressão digital (MD5) da senha. Como a página usa HTTP simples, sem criptografia, a senha viaja
legível na rede de casa: use uma senha exclusiva e não exponha a placa à internet. Os limites e
a opção da porta continuam sem senha, para qualquer aparelho da rede local, como já era antes.

**Pelo PC, com PlatformIO instalado (opcional):** o ambiente `ota` usa o ArduinoOTA na porta 3232,
com a mesma senha. O Firewall do Windows pode pedir permissão, porque a placa conecta de volta no PC.
```powershell
$env:ESP32_OTA_SENHA = "a senha definida na página do ESP32"
pio run -d firmware -e ota -t upload
```

| LED da placa | Significado |
|---|---|
| Pisca **devagar** | Modo configuração (esperando o Wi-Fi) |
| Pisca **rápido** | Alerta: água, sem energia ou porta aberta |
| **Aceso** | Tudo normal |

**Gravar e configurar:** veja o [passo a passo](#como-montar--passo-a-passo). Se travar em
"Connecting…", segure **BOOT**, clique em Gravar e solte quando a barra andar. Para trocar de
Wi-Fi: segure **BOOT** 10 s. Recompilar: `docker compose up -d --build gravador` (mude a
`VERSAO` no `main.cpp`).

**O que aprendi:** o ESP32 precisa de 4 pedaços em 4 endereços; *mesclar* junta tudo no 0x0, e os
vazios entre os pedaços viram 0xFF, inclusive onde o Wi-Fi fica salvo. Por isso a gravação pelo cabo
apaga a configuração, e o OTA não. *Tabela de partições*: o mapa da memória, que só o cabo troca.
*Multi-estágio*: um container pesado compila, um leve entrega. *WebSerial*: o navegador fala
com a USB só depois de você escolher a porta. *Portal cativo*: um DNS que manda tudo para a
página do ESP32. Só o *ADC1* (pinos 32–39) funciona com Wi-Fi. `millis()` em vez de `delay()`.

### Entrega híbrida: polling + push

| Caminho | Quem inicia | Quando | Para quê |
|---|---|---|---|
| **Polling** | o Zabbix busca `http://ESP32/status` | a cada 15 s (`{$ESP32.INTERVALO}`) | temperatura e umidade (mudam devagar) e **sinal de vida** |
| **Push** | o ESP32 entrega o mesmo JSON na porta **10051** | na hora em que água, porta ou energia **mudam** | alertas urgentes em menos de 1 s |

Os dois chegam no **mesmo item** (`esp32.status`, com "aceitar push" ligado), então itens,
gatilhos, central e Telegram não mudam nada. Medido na bancada: o alerta de água abre no
Zabbix em **0,1 s** (antes, com polling de 5 s, levava de 1 a 5 s).

Cuidados que o firmware já tem:
- **Relógio que volta a zero**: o `millis()` zera a cada 49,7 dias. A espera do push e o
  `uptime_s` foram feitos para continuar certos depois disso.
- **Tempo limite de 1 s**: se o Zabbix não atender, a placa não fica parada esperando.
- **No máximo 1 push por segundo**: um fio mal encostado não vira enxurrada.
- **Falhou? Espera 15 s** para tentar de novo; nesse meio-tempo o polling cobre.
- **Sinal de vida**: o polling de 15 s continua; o gatilho "ESP32 parou de responder" usa ele.

O IP do Zabbix vai para dentro do firmware na compilação (`ZABBIX_HOST_IP` do `.env` →
`firmware/src/config_build.h`) e pode ser trocado no portal de Wi-Fi sem recompilar.

## Zabbix configurado pela API (template)

Tudo é feito por [zabbix/configurar.py](zabbix/configurar.py), que lê o `.env` e pode rodar
quantas vezes quiser (**idempotente**: procura pelo nome; se existe, atualiza; se não, cria).

**O que ele cria:**

- Grupo de hosts **Sala do servidor**.
- **Template `ESP32 Sala do Servidor`** — reutilizável: outra sala = outro host com o mesmo
  template e outro IP. Contém:
  - **Macros** (variáveis ajustáveis sem mexer em item/gatilho): `{$ESP32.IP}`,
    `{$ESP32.INTERVALO}` (15s), `{$ESP32.SEM_DADOS}` (2m), `{$TEMP.ATENCAO}` (28),
    `{$TEMP.ALTA}` (32), `{$PORTA.TEMPO}` (1m).
  - **Mapas de valor**: Agua, Porta, Energia, DHT.
  - **Item mestre** `esp32.status` (HTTP agent, texto, a cada 15 s + aceita push).
  - **11 itens dependentes**: temperatura, umidade, água, porta, energia, leituras brutas,
    DHT11, tempo ligado, sinal Wi-Fi, versão.
  - **7 gatilhos**:

    | Gatilho | Severidade | Expressão (no template) |
    |---|---|---|
    | Temperatura da sala acima de 32 °C | Alta | `avg(...esp32.temperatura,2m)>{$TEMP.ALTA}` |
    | Temperatura da sala acima de 28 °C | Atenção | `avg(...esp32.temperatura,2m)>{$TEMP.ATENCAO}` (depende do de 32: não dispara se o de 32 já estiver ativo) |
    | Água detectada no piso | Desastre | `last(...esp32.agua)=1` |
    | Tomada sem energia | Alta | `last(...esp32.energia)=0` |
    | Porta aberta há mais de 1m | Atenção | `min(...esp32.porta,{$PORTA.TEMPO})=1` |
    | ESP32 parou de responder | Alta | `nodata(...esp32.status,{$ESP32.SEM_DADOS})=1` |
    | Sensor DHT11 sem resposta | Informação | `max(...esp32.dht_ok,1m)=0` |

- Host **esp32-sala** (sem interface) usando o template, com `{$ESP32.IP}` = `ESP32_IP` do `.env`.
- Host **notebook-velho** (exibido como SRV-01): interface de agente (`NOTEBOOK_VELHO_IP:10050`), templates
  *Linux/Windows by Zabbix agent* + *ICMP Ping*. **Sem item de bateria** (quem vê a falta de
  energia da sala é o ESP32). Se o sistema mudar, o template antigo é desvinculado e limpo.
- **Telegram** (quando `TELEGRAM_TOKEN` e `TELEGRAM_CHAT_ID` estiverem no `.env`): ativa o tipo
  de mídia, adiciona a mídia ao Admin e cria a ação *Sala do servidor -> Telegram* com
  mensagens em português de problema (🚨) e de resolvido (✅).
- Exporta o template para [zabbix/template_esp32_sala.yaml](zabbix/template_esp32_sala.yaml).

### 🧠 Para leigo: as palavras do Zabbix
- **Host**: a "coisa" monitorada (o ESP32 é um host; o SRV-01 é outro).
- **Template**: um "molde" de itens + gatilhos. Você aplica a quantos hosts quiser.
- **Item mestre**: o único item que vai até o ESP32. Busca o JSON inteiro de uma vez.
- **Item dependente**: não busca nada; recorta um pedaço do JSON do mestre. Assim o ESP32
  recebe **uma** visita a cada 15 s, não onze.
- **JSONPath**: o "endereço" de um campo no JSON. `$.temperatura` = "do JSON, o campo temperatura".
- **Gatilho**: a regra que vira alerta. `avg(...,2m)>28` = "a média dos últimos 2 minutos
  passou de 28". `nodata(...,2m)=1` = "faz 2 minutos que não chega nada" (avisa se o ESP32 morrer).
- **Macro**: uma variável. Mudou de ideia sobre o limite? Troca `{$TEMP.ATENCAO}` e pronto.

## Central de monitoramento (NOC) no Grafana

O dashboard **Sala do servidor** tem **um painel só**, em tela cheia, feito à mão em
[grafana/noc/](grafana/noc/) — sem gauge, sem card, sem gráfico padrão do Grafana.

**Em tela cheia:** http://localhost:3000/d/sala-do-servidor/sala-do-servidor?kiosk&viewPanel=panel-1&_dash.hideTimePicker

### Princípios do visual
- Aparência de ferramenta de operação (Grafana/Zabbix): fundo grafite, texto normal, números em
  fonte monoespaçada. **Cor só para estado** (verde, laranja, vermelho); **só o alarme pisca**.
- Ícones de linha fina, de uma cor só, no lugar de emojis coloridos. Eles pegam a cor do estado (cinza, verde ou vermelho) e têm a mesma cara em qualquer computador. Sem brilho neon e sem efeitos de "filme". Textos curtos, como um operador escreveria.
- Uma superfície só: os blocos não têm caixa nem borda, e o fundo tem a mesma cor da sala 3D, que se desfaz nas bordas. Uma sombra leve escurece os quatro cantos da tela (vinheta) e puxa o olhar para o centro. Só a gaveta do servidor flutua por cima, porque abre e fecha.
- **Nomes de exibição:** os hosts aparecem como `SRV-01` e `Sensores da sala` (variáveis
  `SERVIDOR_NOME_EXIBICAO` e `ESP32_NOME_EXIBICAO` no `.env`). Por dentro continuam
  `notebook-velho` e `esp32-sala` — é o que o agente usa. O Telegram também usa o nome de exibição.

### O que tem na tela

| Área | Conteúdo |
|---|---|
| **Topo** | Título, estado geral ("Sem problemas" / "2 problemas · desastre"), contagem por severidade e relógio |
| **Esquerda** | Temperatura (leitura, régua 15–40 °C com as faixas de 28 e 32, mín/máx de 30 min) · umidade · **Estado da sala** (energia, vazamento, porta, com a leitura ADC) · ficha do sensor (sinal, última leitura, firmware) |
| **Centro** | Sala em 3D **isométrica** (estilo planta técnica) · gráfico de temperatura e umidade de 30 min |
| **Direita** | Servidores (ping, CPU, memória, uptime) · **Problemas** ativos · **Eventos** das últimas 6 h |
| **Gaveta** | Ao **clicar no servidor** (no rack ou na lista): CPU, memória e disco, latência, perda, uptime, rede, processos, gráficos de 30 min e os problemas daquele servidor |

### A sala 3D

| Na cena | Comandado por | O que acontece |
|---|---|---|
| **Rack 42U** | hosts do grupo *Sala do servidor* | Cada host com agente vira um servidor de 2U com etiqueta de patrimônio; LED de estado; LEDs de disco piscam conforme a CPU. Novo servidor no Zabbix = novo servidor no rack |
| Switch | tráfego dos servidores | LEDs das portas piscam conforme o tráfego |
| Nobreak | Energia da tomada | Visor `ENTRADA OK` / `ENTRADA FALHA` |
| Tomada | Energia da tomada | Com energia: **pontinhos verdes** correm pelo cabo até o rack. Sem energia: indicador vermelho piscando, **as luzes da sala caem** e acende a **luz de emergência** |
| Piso | Vazamento | **Gotas** caindo do ar-condicionado e **poça** crescendo |
| Porta | Porta da sala | A porta **abre** e o batente fica vermelho |
| Sensor na parede | temperatura e umidade | Visor com °C e %; LED pisca rápido em alerta (igual à placa) |
| Ar-condicionado | Energia da tomada | **Névoa fria** saindo da grade; mais forte quando há problema de temperatura; para sem energia |
| **Rack + giroflex** | pior problema ativo | Qualquer problema: giroflex e contorno **laranja** (atenção/média) ou **vermelho** girando mais rápido (alta/desastre) |

**Vista explodida do servidor.** Clique num servidor do rack (ou na lista): ele **desliza para
fora do rack** e, ao lado, aparece o que ele roda, no caminho de uma requisição:

| Forma | Componente | Etiqueta mostra |
|---|---|---|
| caixa fina com portas | **proxy** (nginx) | req/s, conexões |
| bloco com faixas que piscam no ritmo das requisições | **aplicação** (Loja) | req/s, latência p95, % de erros |
| cilindro | **banco** (PostgreSQL) | conexões (% do máximo), tamanho |

Quem roda num **container** ganha um selo no cartão da gaveta lateral, com CPU, memória e reinícios.

Partículas correm nas ligações (velocidade ∝ req/s; laranja = lento, vermelho = erros). O
contorno de cada componente tem a cor do pior alerta ligado a ele, e a **moldura do servidor no
rack** acende com qualquer problema dele. Clicar num componente rola a gaveta até o cartão dele
(métricas, gráfico de 30 min, alertas). Os componentes vêm dos templates do host: Docker
(containers), App Loja, PostgreSQL e Nginx; um servidor sem eles não mostra a vista.

**Clicar num alerta mostra onde ele está.** Nas listas *Problemas* e *Eventos* (e nos alertas
da gaveta), passe o mouse: aparece o ícone de alvo. Ao clicar:

| Alerta | O que a central faz |
|---|---|
| Água, energia, porta, temperatura, sensor/DHT11 | a câmera voa até a poça, a tomada, a porta ou o sensor; um **anel pulsa** ali (cor = gravidade) e o cartão da coluna esquerda pisca |
| De um servidor (banco, aplicação, container, agente…) | abre o servidor na **vista explodida**, o anel pulsa no **componente exato** e a gaveta rola até o cartão dele |

O lugar vem da tag `efeito` do gatilho e do nome do alerta (`localDoAlerta` em `dados.js`).
Funciona também com eventos já resolvidos, para mostrar onde algo aconteceu.

**Uma reação para cada problema.** Cada gatilho do template tem a tag `efeito`, e a central
escolhe a animação por ela (não pelo texto do alerta, que pode mudar):

| Tag `efeito` | Gatilho | Reação na sala |
|---|---|---|
| `temperatura` | acima de 28 °C / 32 °C | **Calor subindo** do topo do rack (laranja / vermelho) |
| `agua` | Água detectada no piso | Gotas e poça |
| `energia` | Tomada sem energia | Luzes caem, emergência pisca, energia e ar param |
| `porta` | Porta aberta há mais de 1 min | **Brilho pulsando no chão** em frente à porta |
| `sensor` | ESP32 parou de responder | **Ondas vermelhas** saindo do sensor da parede |
| `dht` | Sensor DHT11 sem resposta | **Ondas laranja** saindo do sensor |
| *(sem tag)* | problema de um servidor (agente, ping, CPU...) | **Moldura piscando** naquele servidor do rack |

**Tempo de reação:** chuva, porta e energia chegam ao Zabbix por **push** (veja
[Entrega híbrida](#entrega-híbrida-polling--push)) e a central pergunta ao Zabbix a cada 1 s.
Medido com a placa real: do push até o valor sair na API pelo Grafana levam **cerca de 0,6 s**, e
somando a espera da próxima pergunta, a tela deve mudar em até cerca de 1,6 s. O cache da fonte de
dados (`cacheTTL` em `grafana/provisioning/datasources/zabbix.yaml`) precisa ser menor que esse
1 s: com 5 s, ele atrasava tudo em até 5 s, mesmo com o Zabbix já atualizado. Não é instantâneo
porque o Zabbix não avisa ninguém: a central precisa perguntar. A temperatura vem pela coleta de
15 s, e os alertas de temperatura (média de 2 min) e de porta (1 min aberta) demoram **de propósito**,
para não alarmar por um pico passageiro.

Arraste para girar · roda do mouse para aproximar · **duplo clique** volta à vista inicial.

### Como funciona por dentro
- **Dados:** o navegador pede ao Grafana, e o plugin do Zabbix repassa a chamada com a senha do
  `.env` (`/api/datasources/uid/zabbix/resources/zabbix-api`). Só métodos de **leitura** passam.
- **Ciclos:** últimos valores e problemas a cada **3 s**; histórico de 30 min a cada **30 s**;
  com a gaveta aberta, histórico do servidor a cada **15 s**.
- **Sensor parado:** sem leitura nova do `esp32.status` há mais de 60 s, tudo do sensor fica
  cinza "sem leitura" — nunca mostra um verde velho.
- **Painel Business Text:** só faz `import('/public/noc/noc.js')`; o Grafana serve a pasta
  `grafana/noc` (montada no compose). A Three.js está em `grafana/noc/vendor/` (licença MIT):
  **nada depende de internet**.
- A faixa "Powered by Grafana" do modo kiosk ficava por cima do painel; a central a esconde.
- Mudou algum arquivo de `grafana/noc/`? **Só recarregar a página** (F5).

## Ações na central: Reconhecer, Comentar, Manutenção

A central deixou de ser só para olhar. Três ações de **triagem**, que valem em qualquer
ambiente (servidor físico, AWS, Azure, Oracle) porque mexem no **Zabbix**, não no servidor:

| Botão | Onde | O que faz | Por que existe |
|---|---|---|---|
| **Reconhecer** | clique num problema (lista ou gaveta) | marca "alguém está cuidando", com o seu nome | a equipe não corre duas vezes para o mesmo alerta; reconhecidos descem na lista |
| **Comentar** | idem | anota no histórico do alerta (o que já foi tentado) | quem chegar depois lê a história sem perguntar |
| **Pôr em manutenção** | gaveta do servidor | silencia os alertas daquele servidor por 15 min a 4 h | vai mexer no servidor? não acorde ninguém à toa |

Toda ação pede um **motivo**. Ele vai para o Zabbix assinado (`[Grafana: Nome] motivo`) e para o
registro de auditoria (`docker compose logs acoes | grep AUDITORIA`). Na manutenção o Zabbix
**continua coletando** (os gráficos seguem), só os alertas e o Telegram ficam quietos; o topo e
a sala 3D também ignoram o alerta silenciado.

### 🧠 Para leigo: por que um serviço só para os botões?

```
navegador ──cookie do Grafana──▶ acoes (porta 8094) ──usuário "central-acoes"──▶ Zabbix
                                     │
                                     └── pergunta ao Grafana: "de quem é este cookie? é Editor/Admin?"
```

- **A ponte do Grafana só lê.** O plugin do Zabbix bloqueia métodos que alteram algo. Para agir
  precisamos de outro caminho.
- **Senha nenhuma no navegador.** A senha do usuário `central-acoes` fica no `.env`
  (`ACOES_ZABBIX_SENHA`) e só o serviço a conhece.
- **Quem você é, o Grafana diz.** O serviço repassa o cookie da sua sessão ao Grafana
  (`/api/user`). Sem login: recusado. Papel **Viewer**: só olha. **Editor/Admin**: pode agir.
- **Menor privilégio.** O papel "Central - ações" do Zabbix só pode chamar 11 métodos da API
  (ver `METODOS_ACOES` no `configurar.py`) e só enxerga o grupo "Sala do servidor". Testado:
  `user.get` e `host.delete` são **negados**, mesmo com a senha certa.
- **Catálogo fechado.** O navegador escolhe uma ação **da lista** e manda os dados dela; não
  existe "rode este comando". Ids são conferidos, motivo tem limite de tamanho, cada pessoa tem
  no máximo 10 ações por minuto e só a página do Grafana (`localhost:3000`) é aceita (CORS).
- **Porta só local.** O compose publica a 8094 em `127.0.0.1`: ninguém da rede de casa chega nela.

**Em produção** (Grafana em `https://noc.empresa.com`), o serviço ficaria atrás do mesmo
endereço (ex.: `/acoes/`) num proxy reverso, e `ORIGENS_PERMITIDAS` mudaria para esse endereço.

**Colocar no ar do zero:** `python zabbix/configurar.py` (cria papel, grupo e usuário) e
`docker compose up -d acoes`. Se o serviço estiver fora, a central funciona normal, só sem botões.

## Ações que corrigem: reiniciar e encerrar conexões

A triagem organiza o trabalho; estas duas ações **mexem no servidor**. Os botões aparecem no
cartão da aplicação e do banco (gaveta do servidor) e dentro do alerta aberto, quando ele é da
aplicação ou do banco. Feita a partir de um alerta, a ação fica anotada no histórico dele.

| Botão | SRV-02 (Docker) | SRV-01 (celular) |
|---|---|---|
| **Reiniciar aplicação** | API do Docker: reinicia o container `loja2-api` | sinal HUP ao gunicorn (troca o processo sem fechar a porta); com a Loja caída, faz o vigia religar na hora |
| **Encerrar conexões ociosas** | `psql` dentro do container `loja2-db` | usuário `zbx_acoes`, que entra pelas vagas reservadas mesmo com o banco lotado |

### 🧠 Para leigo: o mesmo botão, uma receita em cada servidor

```
botão ─▶ acoes ─▶ Zabbix (script.execute) ─▶ agente do servidor ─▶ /opt/acoes/reiniciar-app.sh
```

Pense num restaurante com a mesma comanda ("prato do dia") e uma cozinha diferente em cada
filial. A central só conhece o **nome** da ação; cada servidor guarda em `/opt/acoes/` o arquivo
que sabe fazê-la naquele ambiente. É isso que permite levar a ideia para a nuvem depois: lá o
arquivo chamaria AWS, Azure ou Oracle, e o botão continuaria igual.

- **O agente recusa todo o resto.** `acoes/agente/acoes.conf` libera exatamente dois comandos, sem
  curinga: com `*`, passaria `/opt/acoes/x.sh; rm -rf /`. Testado: `id` e esse truque do `;` são
  recusados.
- **"Ociosa há mais de 1 minuto".** A aplicação devolve conexões ao pool entre um pedido e outro,
  e elas ficam paradas só por instantes. Parada há 1 minuto inteiro, está esquecida.
- **Reiniciar alivia, não cura.** No laboratório limpa o cenário de falha porque ele mora na
  memória do processo; num sistema real, a causa continua lá. Por isso a caixa pede o motivo.
- **Limite conhecido:** a página de Cenários (:8092) não percebe o reinício e continua mostrando o
  cenário que você ligou.

**Colocar no ar do zero:** `docker compose up -d --build srv02-agente`, o passo 10 do
[guia do celular](celular/README.md) e `python zabbix/configurar.py` (cria os dois Scripts).

## Problemas comuns

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| Sensores cinza "sem dados" e "ESP32 SEM RESPOSTA" | Item mestre não suportado (IP errado/placa fora) | Zabbix → Dados recentes → `esp32.status`; abra `http://IP/status` no navegador |
| Central em branco ou "Não consegui carregar" | Erro em algum arquivo de `grafana/noc/` | F12 → Console no navegador; procure "[noc]" |
| Aviso vermelho "Sem dados do Zabbix" no topo | Grafana não consegue ler o Zabbix | Confira `ZABBIX_PASSWORD` no `.env` e `docker compose up -d grafana` |
| Rack vazio ("Nenhum host com agente") | Servidor fora do grupo *Sala do servidor* ou sem interface de agente | Rode `python zabbix/configurar.py` |
| Itens dependentes vazios | JSONPath com nome diferente do JSON | Compare o `/status` com os itens do template (maiúsculas contam) |
| Placa não reconhecida / lista de portas vazia | Cabo só de carga ou driver CP210x | Troque o cabo; instale o driver da Silicon Labs |
| Gravação travada em "Connecting…" | Placa não entrou em modo de gravação | Segure BOOT ao clicar em Gravar |
| ESP32 não conecta no Wi-Fi | Rede 5 GHz ou senha errada | Use 2,4 GHz; BOOT 10 s e configure de novo; veja o Monitor Serial |
| Serial mostra `Push: não conectou` | Firewall do Windows bloqueando a porta 10051, ou IP do PC mudou | Libere a entrada TCP 10051 no Firewall (rede privada) ou corrija o IP no portal (BOOT 10 s). O polling continua funcionando |
| Portas respondem vazio ("Empty reply") depois de o Docker Desktop reiniciar; o push para de chegar | O encaminhamento de portas do Docker ficou com defeito, com o container saudável | `docker compose up -d --force-recreate --no-deps zabbix-server` (troque pelo serviço afetado). Os dados ficam no banco |
| Serial mostra `Push: Zabbix recusou` | Nome do host no portal diferente do Zabbix | Use `esp32-sala` (nome técnico, não o nome de exibição) |
| Telegram não chega | Token/chat ID/ação | Rode `descobrir_chat_id.py`; Zabbix → Alertas → Tipos de mídia → Telegram → Testar |
