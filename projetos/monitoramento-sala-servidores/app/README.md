# Aplicação Loja: o "sistema" que o monitoramento protege

Monitorar hardware diz se a máquina está viva. Mas a pergunta que importa numa empresa é:
**o sistema está atendendo bem os clientes?** A Loja faz o papel desse sistema: uma API que
recebe pedidos e grava no PostgreSQL. Ela roda no SRV-01 (o celular) e é usada pelo
**gerador de tráfego** (`gerador/`, página http://localhost:8092).

## As três camadas monitoradas

| Camada | O que é | Quem monitora | Exemplos de métrica |
|---|---|---|---|
| Infraestrutura | o aparelho e o sistema | template *Linux by Zabbix agent* | memória, carga, disco |
| Serviço | o banco de dados | template oficial *PostgreSQL by Zabbix agent 2* | conexões, tamanho, transações/s, cache |
| Aplicação | a experiência do cliente | template *App Loja por HTTP* (deste projeto) | req/s, latência p95, % de erros |

## O que a Loja expõe em `/metricas`

| Campo | Significado | Por que importa |
|---|---|---|
| `requisicoes_por_seg` | ritmo de uso (média do último minuto) | mostra pico e queda de acesso |
| `latencia_p95_ms` | 95% das respostas saem mais rápido que isso | é o que o cliente sente; a média esconde os lentos |
| `erros_pct` | % de respostas 5xx | erro = venda perdida |
| `banco_ok` | a aplicação consegue falar com o banco | o banco cair derruba tudo |
| `cpu_pct`, `memoria_mb` | consumo do próprio processo | vazamento de memória, código pesado |
| `conexoes_pool` | conexões com o banco em uso | perto do máximo = gargalo |

**Por que p95 e não média?** Se 95 requisições levam 50 ms e 5 levam 3 s, a média dá ~200 ms
("tudo bem"), mas 1 em cada 20 clientes esperou 3 segundos. O p95 mostra isso.

## Gatilhos (template *App Loja por HTTP*)

| Gatilho | Severidade | Quando |
|---|---|---|
| Loja fora do ar | Alta | `/metricas` sem resposta por 1 min |
| Loja sem acesso ao banco | Alta | `banco_ok = 0` |
| Loja com erros acima de 5% | Alta | média de 1 min |
| Loja lenta: p95 acima de 800 ms | Atenção | média de 1 min |

Para ver disparar: na página do gerador (http://localhost:8092) use **Lentidão** ou **Erros**.

## SRV-02: a mesma Loja em containers

Docker não roda no Android sem root, então o "servidor de containers" é o Docker deste PC.
A mesma aplicação vira uma arquitetura clássica de **3 camadas**:

```
cliente ──► loja2-proxy (nginx) ──► loja2-api (Python) ──► loja2-db (PostgreSQL)
                                    ▲
                 srv02-agente (Zabbix agent 2 + socket do Docker) vê todos
```

| Peça | Arquivo |
|---|---|
| Imagem da API | [Dockerfile](Dockerfile) (usuário sem root, `HEALTHCHECK`, versões fixas) |
| Proxy | [nginx-loja.conf](nginx-loja.conf) (repassa para a API e expõe `/nginx_status`) |
| Serviços | `docker-compose.yml`, bloco **SRV-02** |
| Loja no navegador | http://localhost:8093 |

O host **SRV-02** (`srv02-docker`) no Zabbix usa quatro templates:

| Template | O que mede |
|---|---|
| **Docker by Zabbix agent 2** | por container: estado, CPU, memória, rede, **reinícios**, saúde; total rodando/parados |
| **Linux by Zabbix agent** | a máquina que roda o Docker |
| **Nginx by HTTP** | conexões ativas, requisições/s, conexões descartadas |
| **App Loja por HTTP** | as mesmas métricas de aplicação do SRV-01 |

Só os containers `loja2-*` entram (macro `{$DOCKER.LLD.FILTER.CONTAINER.MATCHES}`): os do
Zabbix e do Grafana são a "sala de monitoramento", não o servidor vigiado.

**Por que o socket do Docker?** `/var/run/docker.sock` é a "porta de atendimento" do Docker.
Com ele montado, o agente pergunta "quais containers existem e quanto cada um consome?".
Cuidado: quem tem esse socket pode **controlar** o Docker, por isso só o agente o recebe.

**Gatilho extra: "Container X reiniciou (últimos 10 min)".** O template oficial do Docker só
alerta quando o container **para** com erro. Mas o problema mais comum é o container que cai e
o Docker religa sozinho (`restart: unless-stopped`): parece no ar, só que está falhando.
O `configurar.py` cria um gatilho por container que acende quando o contador de reinícios sobe
e fica aceso 10 minutos. Para testar: `docker compose exec loja2-api sh -c "kill 1"`.
