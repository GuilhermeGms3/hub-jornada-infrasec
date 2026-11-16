# Servidor de bolso: celular Android como SRV-01

O "notebook velho" quebrou, então o servidor monitorado virou um **Samsung Galaxy S22 Ultra**
parado (tela com linhas, resto perfeito). Ele roda Linux **dentro** do Android, sem root, e o
Zabbix o enxerga como mais um servidor no rack da central: o **SRV-01**.

## Por que não "instalar Linux no lugar do Android"

Trocar o sistema exigiria desbloquear o bootloader: **apaga tudo**, **queima o Knox para sempre**
(fusível físico) e não existe Linux estável para esse modelo. Em vez disso:

```
Android
└── Termux            (app: terminal Linux de verdade, sem root)
    ├── sshd          (porta 8022, só com chave)
    └── proot-distro
        └── Debian    ("sistema dentro do sistema")
            └── Zabbix agent 2 7.0  (porta 10050)
```

- **Termux**: terminal Linux como aplicativo. Use a versão do **GitHub/F-Droid** (a da Play Store
  é antiga). Junto, o **Termux:Boot** liga tudo quando o celular reinicia.
- **proot**: "engana" os programas, fingindo que estão num Linux normal com root. Funciona sem
  permissão de administrador, um pouco mais lento que o nativo.

## Como foi instalado (passo a passo)

Tudo feito a partir do PC, sem digitar nada no celular além do pareamento.

1. **Celular**: modo desenvolvedor (7 toques em *Número de compilação*) → *Depuração sem fio* →
   *Parear dispositivo com código QR*. O PC gera o QR e conclui o pareamento sozinho (mDNS).
2. **Ponte do ADB** (dispensa liberar o Firewall do Windows):
   - `adb reverse tcp:8099 tcp:8099` → o celular busca os scripts num mini servidor do PC;
   - `adb forward tcp:8022 tcp:8022` → o PC entra no celular por SSH em `localhost:8022`.
3. **`1-termux-ssh.sh`** (digitado no Termux via ADB, recebe a chave pública do PC):
   atualiza o Termux, instala o SSH, autoriza **só** a chave do PC e desliga login por senha.
4. **`2-debian-zabbix.sh`** (via SSH): instala o Debian e o Zabbix agent 2 do repositório
   oficial da Zabbix (7.0 LTS, arm64).
5. **`3-agente.sh <IP do PC>`** (via SSH): configura o agente (`Server`, `ServerActive`,
   `Hostname=notebook-velho`), cria o comando `srv01-agente` e o início automático
   `~/.termux/boot/srv01.sh`.
6. **`4-banco-app.sh`** (via SSH, depois de o PC copiar `~/srv01.env` com as senhas e a pasta
   `~/loja/`): instala o **PostgreSQL nativo do Termux** (mais rápido que dentro do proot), cria
   o banco `loja`, o usuário da aplicação e o usuário **`zbx_monitor`** (papel `pg_monitor`, só
   lê estatísticas), sobe a **aplicação Loja** (Flask + gunicorn, porta 8080) no Debian e cria os
   comandos `srv01-banco` e `srv01-app`.
7. **`5-plugin-postgresql.sh`** (via SSH): o repositório da Zabbix não tem os **plugins** do
   agente para arm64, então o plugin PostgreSQL é **compilado do código-fonte oficial** (Go),
   com o arquivo conferido pelo SHA-256 publicado pela Zabbix.
8. **`6-vigia-e-limites.sh`** (via SSH): limita o PostgreSQL a **40 conexões** e liga o
   **vigia geral** (`srv01-vigia-geral`), que a cada 2 min religa SSH, banco, aplicação ou
   agente se algum cair (registro em `~/srv01-vigia.log`). A aplicação ainda tem o próprio vigia
   (`srv01-vigia-app`), que a religa 90 s depois de cair.
9. **PC**: no `.env`, `NOTEBOOK_VELHO_IP=<IP do celular>` e `NOTEBOOK_VELHO_SO=android`;
   depois `python zabbix/configurar.py`. Com `PG_MONITOR_SENHA` no `.env`, o host ganha também
   os templates **PostgreSQL by Zabbix agent 2** e **App Loja por HTTP**.
10. **`7-acoes.sh`** (via SSH): instala as receitas dos botões da central em `/opt/acoes`, cria o
   usuário **`zbx_acoes`** no banco (só encerra conexões e usa as vagas reservadas) e libera no
   agente **só** essas duas receitas. Antes, ponha `ACOES_PG_SENHA` no `~/srv01.env` e copie os
   arquivos: `scp -P 8022 -i ~/.ssh/celular_srv01 acoes/agente/srv01/*.sh acoes/agente/acoes.conf localhost:acoes/`.
11. **`8-agendamento.sh`** (via SSH): entrega a vigilância ao agendador do próprio Android, que confere
   os serviços a cada 15 min, mesmo depois de a Samsung encerrar o Termux. Antes, instale o app
   **Termux:API** da **mesma origem do Termux** (aqui, F-Droid: `com.termux.api_1002.apk`) e o pacote
   `termux-api`. Com assinatura diferente, o Android recusa a instalação.

> Senhas: ficam no `.env` do PC e num `~/srv01.env` do celular (permissão 600). Elas viajam
> pelo SSH e entram no `psql` por `\getenv`, sem aparecer em nenhuma linha de comando.

A chave SSH do PC fica em `C:\Users\Nery\.ssh\celular_srv01` (a privada **nunca** sai do PC).

## Operação do dia a dia

| O quê | Como |
|---|---|
| Entrar no celular pelo PC | `adb forward tcp:8022 tcp:8022` e `ssh -i ~/.ssh/celular_srv01 -p 8022 localhost` |
| Religar o banco | no Termux: `srv01-banco` |
| Religar a aplicação Loja | no Termux: `srv01-app` (ou `srv01-app parar`) |
| Ver a Loja no navegador | `http://<IP do celular>:8080` |
| Religar o agente | no Termux: `srv01-agente` |
| Parar o agente | no Termux: `srv01-agente parar` |
| Ver o log do agente | `proot-distro login debian -- tail /var/log/zabbix/zabbix_agent2.log` |
| Celular reiniciou | o Termux:Boot liga SSH e agente sozinho (abra o Termux:Boot **uma vez** depois de instalar) |

Cuidados: deixe o celular **na tomada**, reserve o **IP dele no roteador** (como o ESP32) e
mantenha o Termux **fora da economia de bateria** (já está). Na Samsung, adicione Termux e
Termux:Boot em *Bateria → Limites de uso em segundo plano → Apps que nunca suspendem*.
Não é preciso deixar o Termux aberto na tela: a notificação fixa dele mantém tudo vivo.

### O "Phantom Process Killer" (Android 12+)

O Android mata processos filhos de aplicativos quando passam de **32 no total**. Cada conexão
do PostgreSQL é um processo: no teste "banco lotado" (~92 conexões), o Android derrubou banco,
aplicação, agente e SSH de uma vez. Duas defesas:

1. **Desligar a proteção** (feito pelo dono do aparelho, uma vez; sobrevive a reinícios):
   ```
   adb shell settings put global settings_enable_monitor_phantom_procs false
   ```
   Alguns Android mostram isso como *Opções do desenvolvedor → Desativar restrições de
   processos filhos*; a Samsung costuma esconder. Para desfazer, troque `false` por `true`.
2. **Teto de 40 conexões** no PostgreSQL (passo 6): o cenário enche o banco sem estourar o Android.

Se mesmo assim o banco não subir depois de uma queda, sobram processos órfãos segurando a
memória compartilhada: `pkill -9 -f "[p]ostgres: loja"` e `srv01-banco`.
(O `[p]` evita que o `pkill` mate o próprio comando — ele também contém a palavra "postgres".)

## O que o Android libera (e o que não)

Aplicativos sem root não podem ler algumas informações do sistema. O `configurar.py`
(`NOTEBOOK_VELHO_SO=android`) já desliga esses itens só neste host:

| Informação | Funciona? | Por quê |
|---|---|---|
| Ping, agente disponível | ✅ | |
| Memória (total, disponível, %) | ✅ | |
| Carga média (load 1/5/15) e nº de núcleos | ✅ | |
| Disco principal `/` (462 GB) | ✅ | |
| Processos | ✅ | |
| **Uso de CPU em %** | ❌ | Android bloqueia `/proc/stat` desde a versão 8; o proot mostra uma cópia congelada |
| Tráfego de rede | ❌ | `/proc/net/dev` bloqueado |
| Discos físicos (I/O) | ❌ | `/proc/diskstats` bloqueado |
| Partições do sistema (`/system`, `/vendor`, `/apex/...`) | filtradas | são somente leitura e vivem 100% cheias: gerariam alerta falso |
| Tempo ligado | ⚠ | o proot mostra o tempo da sessão dele, não do celular |

No painel, a CPU do SRV-01 aparece como "–" e a **carga média** fica na gaveta do servidor.

## Problemas comuns

| Sintoma | Causa | Solução |
|---|---|---|
| `adb: device offline` | a depuração sem fio trocou de porta | `adb mdns services` mostra a nova porta → `adb connect IP:porta` |
| SSH não conecta | Termux fechado ou celular reiniciou sem Termux:Boot | abra o Termux e rode `sshd` |
| Tudo fora, com o celular ligado | A Samsung encerrou o Termux para poupar bateria, e o vigia morre junto (confira com `adb shell dumpsys activity exit-info com.termux`) | o agendamento do passo 11 religa em até cerca de 15 min (ou no Termux, na hora: `~/.termux/boot/srv01.sh`); ponha Termux, Termux:Boot e Termux:API em *Apps que nunca suspendem* |
| Agente ligado, mas o Zabbix diz `Received empty response` | O IP do PC mudou, e o agente recusa quem não está na lista (o log mostra `connection ... rejected`) | reserve o IP do PC no roteador, ou inclua o novo em `Server=` no `/etc/zabbix/zabbix_agent2.conf` do Debian e rode `srv01-agente parar` e `srv01-agente` |
| SRV-01 "agente indisponível" | agente parado | no Termux: `srv01-agente` |
| Muitos alertas "FS ... critically low" | host sem os filtros de Android | confira `NOTEBOOK_VELHO_SO=android` e rode `python zabbix/configurar.py` |
