// =====================================================================
// main.cpp — firmware do ESP32 "sala-servidor"
// ---------------------------------------------------------------------
// O que esta placa faz, em uma frase: lê os sensores da sala o tempo todo
// e responde, para quem perguntar em http://IP/status, um JSON com tudo.
//
// Modelo HÍBRIDO de entrega:
//   • POLLING — o Zabbix pergunta (busca o /status) a cada 15 s. Serve para
//     temperatura/umidade, que mudam devagar, e como "sinal de vida".
//   • PUSH    — quando água, porta ou energia MUDAM, a própria placa entrega
//     o mesmo JSON ao Zabbix na hora (porta 10051). O alerta chega em menos
//     de 1 segundo, sem esperar a próxima pergunta.
//
// Dois modos de funcionamento:
//   1. MODO CONFIGURAÇÃO — sem Wi-Fi salvo. A placa cria a rede
//      "Sala-Servidor-XXXX" e uma página para você escolher o Wi-Fi.
//      LED pisca DEVAGAR.
//   2. MODO NORMAL — com Wi-Fi salvo. Conecta, responde /status e a
//      página de calibração. LED ACESO = tudo normal; pisca RÁPIDO = alerta.
//
// Atualização pela rede (OTA): depois de gravada pelo cabo uma vez, a placa
// recebe versões novas em /atualizar (navegador) ou pelo ArduinoOTA (PC).
//
// Segurar o botão BOOT por 10 segundos apaga tudo e volta ao modo 1.
//
// Regra de ouro do código: NADA de delay() longo no loop(). O loop roda
// milhares de vezes por segundo e cada tarefa confere "já deu o tempo
// dela?" usando millis() (relógio em milissegundos desde que ligou).
// Assim a placa lê sensores, atende o Wi-Fi e pisca o LED "ao mesmo tempo".
// =====================================================================

#include <Arduino.h>
#include <WiFi.h>          // conexão Wi-Fi
#include <WebServer.h>     // servidor HTTP na porta 80
#include <DNSServer.h>     // "engana" o celular para abrir o portal cativo
#include <ESPmDNS.h>       // nome sala-servidor.local na rede
#include <Preferences.h>   // memória que não apaga ao desligar (Wi-Fi e limites)
#include <ArduinoJson.h>   // monta o JSON do /status
#include <DHT.h>           // sensor de temperatura e umidade
#include <ArduinoOTA.h>    // atualização pela rede a partir do PC (PlatformIO)
#include <Update.h>        // grava o firmware novo recebido por /atualizar
#include <MD5Builder.h>    // "impressão digital" da senha do OTA
#include <esp_timer.h>     // relógio de 64 bits, que não volta a zero

#include "pagina_portal.h"
#include "pagina_status.h"
#include "pagina_atualizar.h"

// IP padrão do Zabbix para o push. O gravador (Docker) cria o arquivo
// config_build.h com o ZABBIX_HOST_IP do .env na hora de compilar; assim a
// placa já sai sabendo para onde avisar. Dá para trocar no portal.
#if __has_include("config_build.h")
#include "config_build.h"
#endif
#ifndef ZABBIX_SERVIDOR_PADRAO
#define ZABBIX_SERVIDOR_PADRAO ""
#endif

// ---------------------------------------------------------------------
// Versão do firmware. Aparece no /status, no Serial e na página.
// Mude quando alterar o código, para saber qual está gravado na placa.
// ---------------------------------------------------------------------
const char *VERSAO = "1.4.0";

// ---------------------------------------------------------------------
// PINOS (definidos pela montagem física — não mude sem mudar os fios)
// ---------------------------------------------------------------------
const int PINO_DHT     = 4;   // DATA do DHT11
const int PINO_AGUA    = 32;  // saída AO do sensor de chuva YL-83/FC-37 (analógico, ADC1)
const int PINO_PORTA   = 25;  // sensor de porta MC-38 (o outro fio vai no GND)
const int PINO_ENERGIA = 34;  // divisor 10k/20k do carregador (só entrada, ADC1)
const int PINO_LED     = 2;   // LED azul da placa
const int PINO_BOOT    = 0;   // botão BOOT (aperta = LOW)

// Por que ADC1 (pinos 32 e 34)? O ESP32 tem dois conversores analógicos.
// O ADC2 fica OCUPADO pelo Wi-Fi e devolve lixo quando o Wi-Fi está ligado.

// ---------------------------------------------------------------------
// TEMPOS (em milissegundos)
// ---------------------------------------------------------------------
const unsigned long INTERVALO_DHT        = 2000;   // DHT11 não aguenta ler mais rápido
const unsigned long INTERVALO_ANALOGICO  = 200;    // água e energia, 5x por segundo
const unsigned long INTERVALO_SERIAL     = 2000;   // uma linha no Monitor Serial
const unsigned long DEBOUNCE_PORTA       = 50;     // ignora "tremidas" do contato
const unsigned long TEMPO_RESET_BOOT     = 10000;  // segurar BOOT 10 s apaga tudo
const unsigned long INTERVALO_RECONEXAO  = 10000;  // tenta reconectar o Wi-Fi a cada 10 s
const unsigned long PUSH_INTERVALO_MIN   = 1000;   // no máximo 1 push por segundo (anti-enxurrada)
const unsigned long PUSH_TIMEOUT         = 1000;   // espera no máximo 1 s pelo Zabbix
const unsigned long PUSH_ESPERA_FALHA    = 15000;  // Zabbix fora? tenta de novo só daqui a 15 s

// Limites padrão (0–4095). Podem ser mudados pela página, sem regravar.
const int LIMITE_AGUA_PADRAO    = 2000;
const int LIMITE_ENERGIA_PADRAO = 2500;

// Histerese do sensor de chuva: molha abaixo do limite, mas só volta a "seco"
// acima de limite + 200. Por quê: a placa seca aos poucos e a leitura fica
// oscilando perto do limite; sem essa folga, o alerta ficaria piscando.
const int HISTERESE_AGUA = 200;
// O limite precisa deixar espaço para a volta: acima de 3895, a soma passaria
// de 4095 (o máximo que o pino lê) e o alerta nunca mais apagaria.
const int LIMITE_AGUA_MAX = 4095 - HISTERESE_AGUA;

const uint16_t OTA_PORTA = 3232;     // porta padrão do ArduinoOTA
const size_t OTA_SENHA_MIN = 8;      // senha curta demais é fácil de adivinhar
const size_t OTA_SENHA_MAX = 64;

const char *HOSTNAME = "sala-servidor";
const uint16_t ZABBIX_PORTA = 10051;            // porta "trapper" do Zabbix server
const char *ZABBIX_HOST_PADRAO = "esp32-sala";  // nome TÉCNICO do host no Zabbix
const char *ZABBIX_CHAVE = "esp32.status";      // o mesmo item que o polling preenche

// ---------------------------------------------------------------------
// OBJETOS GLOBAIS
// ---------------------------------------------------------------------
DHT dht(PINO_DHT, DHT11);
WebServer servidor(80);
DNSServer dns;
Preferences prefs;

// ---------------------------------------------------------------------
// ESTADO (o que o ESP32 "sabe" agora)
// ---------------------------------------------------------------------
bool modoConfig = false;          // true = portal de configuração ativo
String ssidSalvo, senhaSalva;
int limiteAgua    = LIMITE_AGUA_PADRAO;
int limiteEnergia = LIMITE_ENERGIA_PADRAO;
String nomeRedeAP;                // "Sala-Servidor-XXXX"
String zabbixServidor, zabbixHost;  // para onde e em nome de quem fazer o push
String listaRedesHtml;            // redes encontradas, já em HTML
bool inverterPorta = false;       // troca "aberta" e "fechada" (MC-38 NA ou NF)
// Sensor de energia instalado? Sem o carregador ligado ao divisor, o pino 34
// fica solto e capta ruído (lê qualquer coisa de 0 a 4095) e geraria alerta
// falso. Por isso, enquanto o sensor não estiver instalado, o pino é lido mas
// não decide nada e a energia conta como presente. Marca-se na página da placa.
bool energiaInstalada = false;    // fica salvo na memória
String otaSenhaMd5;               // impressão digital da senha do OTA; vazio = OTA travado
bool arduinoOtaLigado = false;
String erroAtualizacao;           // motivo da falha em /atualizar; vazio = tudo certo

// Leituras. NAN = "ainda não tenho valor" (vira null no JSON).
float temperatura = NAN;
float umidade     = NAN;
bool  dhtOk       = false;
int   aguaRaw     = 4095;
int   energiaRaw  = 0;
bool  agua        = false;  // true = molhado
bool  energia     = true;   // true = tomada com energia
bool  portaAberta = false;
int   portaRaw    = LOW;    // valor cru do pino, depois do debounce (HIGH ou LOW)

// Controle do debounce da porta.
int  portaLeituraAnterior = LOW;
unsigned long portaMudouEm = 0;

// Relógios de cada tarefa.
unsigned long ultimoDht = 0, ultimoAnalogico = 0, ultimoSerial = 0, ultimaReconexao = 0;
unsigned long bootApertadoDesde = 0;
bool wifiEstavaConectado = false;
bool mdnsIniciado = false;

// Controle do push.
int  estadoEnviado = -1;          // último estado avisado (-1 = nenhum ainda)
bool pushPendente = false;        // há mudança esperando para ser enviada
unsigned long ultimaTentativaPush = 0;
unsigned long esperaPush = 0;     // quanto aguardar desde a última tentativa

// =====================================================================
// UTILITÁRIOS
// =====================================================================

// MAC da placa no formato AA:BB:CC:DD:EE:FF. É a "identidade" fixa da
// placa — você usa para reservar o IP no roteador.
String macTexto() {
  return WiFi.macAddress();
}

// Escapa caracteres especiais antes de colocar um texto dentro do HTML.
// Por quê: um vizinho poderia batizar a rede dele de "<script>..." e isso
// rodaria na página do portal. Escapando, vira só texto.
String escaparHtml(const String &s) {
  String r;
  r.reserve(s.length() + 8);
  for (size_t i = 0; i < s.length(); i++) {
    char c = s[i];
    if (c == '&') r += "&amp;";
    else if (c == '<') r += "&lt;";
    else if (c == '>') r += "&gt;";
    else if (c == '"') r += "&quot;";
    else if (c == '\'') r += "&#39;";
    else r += c;
  }
  return r;
}

// Faz 10 leituras analógicas seguidas e devolve a média.
// Por quê: a leitura analógica do ESP32 "treme" uns ±50 pontos. A média
// suaviza e evita alarme falso perto do limite.
int mediaAnalogica(int pino) {
  long soma = 0;
  for (int i = 0; i < 10; i++) {
    soma += analogRead(pino);
    delayMicroseconds(200);  // espera curtinha entre amostras (0,2 ms)
  }
  return soma / 10;
}

// Tempo ligado em segundos. Usa o relógio de 64 bits porque o millis() volta
// a zero depois de 49,7 dias, e o sensor fica ligado por muito mais tempo.
unsigned long uptimeSegundos() {
  return (unsigned long)(esp_timer_get_time() / 1000000ULL);
}

// Devolve a "impressão digital" MD5 de um texto. É nesse formato que o
// ArduinoOTA usa a senha, e assim a senha em si não fica guardada na placa.
String md5Texto(const String &texto) {
  MD5Builder md5;
  md5.begin();
  md5.add(texto);
  md5.calculate();
  return md5.toString();
}

bool senhaOtaConfere(const String &senha) {
  return otaSenhaMd5.length() > 0 && md5Texto(senha) == otaSenhaMd5;
}

// Só aceita letras, números e símbolos comuns, sem espaço nem acento: a senha
// viaja num cabeçalho HTTP e na linha de comando do PlatformIO, que se
// atrapalham com outros caracteres.
bool senhaOtaValida(const String &senha) {
  if (senha.length() < OTA_SENHA_MIN || senha.length() > OTA_SENHA_MAX) return false;
  for (size_t i = 0; i < senha.length(); i++) {
    if (senha[i] < 33 || senha[i] > 126) return false;
  }
  return true;
}

// =====================================================================
// SENSORES
// =====================================================================

// DHT11: temperatura e umidade. Se falhar, MANTÉM o último valor bom
// e marca dhtOk = false (assim um fio mal encostado não zera o gráfico).
void lerDht() {
  float t = dht.readTemperature();
  float h = dht.readHumidity();
  if (isnan(t) || isnan(h)) {
    dhtOk = false;
    return;
  }
  temperatura = t;
  umidade = h;
  dhtOk = true;
}

// Sensor de chuva e energia (analógicos).
void lerAnalogicos() {
  aguaRaw = mediaAnalogica(PINO_AGUA);
  energiaRaw = mediaAnalogica(PINO_ENERGIA);

  // Sensor de chuva: a saída AO do módulo fica alta com a placa seca (perto
  // de 4095) e cai quando a água liga as trilhas da placa.
  // Molha abaixo do limite; só seca acima de limite + HISTERESE_AGUA. Entre
  // os dois valores, mantém o estado que já estava.
  if (agua) {
    if (aguaRaw > limiteAgua + HISTERESE_AGUA) agua = false;
  } else if (aguaRaw < limiteAgua) {
    agua = true;
  }

  // Energia: com a tomada ligada o carregador dá 5 V, o divisor 10k/20k
  // reduz para ~3,3 V (leitura alta). Sem tomada, 0 V (leitura ~0).
  // Sem o sensor instalado, o pino continua sendo lido, mas não decide nada.
  energia = energiaInstalada ? energiaRaw > limiteEnergia : true;
}

// Traduz o pino em "aberta" ou "fechada".
// INPUT_PULLUP: com o contato aberto, o pino lê HIGH; com o contato fechado,
// ele fica ligado ao GND e lê LOW. O normal é o ímã perto fechar o contato,
// então HIGH = porta aberta. Se o seu MC-38 fizer o contrário, a caixinha
// "inverter porta" da página troca o resultado, sem regravar.
void aplicarPorta() {
  portaAberta = (portaRaw == HIGH) != inverterPorta;
}

// Porta: sensor MC-38 com debounce.
// "Debounce": quando um contato fecha, ele "quica" e liga/desliga várias
// vezes em poucos milissegundos. Só aceitamos a mudança se a leitura
// ficar IGUAL por 50 ms seguidos.
void lerPorta() {
  int leitura = digitalRead(PINO_PORTA);
  if (leitura != portaLeituraAnterior) {
    portaMudouEm = millis();
    portaLeituraAnterior = leitura;
  }
  if (millis() - portaMudouEm >= DEBOUNCE_PORTA) {
    portaRaw = leitura;
    aplicarPorta();
  }
}

bool emAlerta() {
  return agua || !energia || portaAberta;
}

// Junta água, porta e energia num número só (1 bit para cada). Se o número
// muda, algo urgente mudou e vale um push.
int estadoUrgente() {
  return (agua ? 1 : 0) | (portaAberta ? 2 : 0) | (energia ? 4 : 0);
}

// =====================================================================
// LED — o "painel" mais simples do mundo
// =====================================================================
void atualizarLed() {
  unsigned long agora = millis();
  if (modoConfig) {
    digitalWrite(PINO_LED, (agora / 500) % 2);   // pisca devagar (1 s por ciclo)
  } else if (emAlerta()) {
    digitalWrite(PINO_LED, (agora / 100) % 2);   // pisca rápido (5 vezes/s)
  } else {
    digitalWrite(PINO_LED, HIGH);                // aceso fixo: tudo normal
  }
}

// =====================================================================
// JSON DO /status — é ISTO que o Zabbix lê
// =====================================================================
String montarJsonStatus() {
  JsonDocument doc;

  // Temperatura com 1 casa decimal. NAN vira null no JSON (o ArduinoJson
  // faz isso sozinho), indicando "ainda sem leitura válida".
  if (isnan(temperatura)) doc["temperatura"] = nullptr;
  else doc["temperatura"] = roundf(temperatura * 10) / 10.0;

  if (isnan(umidade)) doc["umidade"] = nullptr;
  else doc["umidade"] = (int)roundf(umidade);

  doc["dht_ok"]       = dhtOk;
  doc["agua"]         = agua ? 1 : 0;        // 0/1: o Zabbix usa mapas de valor
  doc["agua_raw"]     = aguaRaw;
  doc["porta_aberta"] = portaAberta ? 1 : 0;
  doc["porta_raw"]    = portaRaw == HIGH ? 1 : 0;  // pino cru: 1 = HIGH, 0 = LOW
  doc["energia"]      = energia ? 1 : 0;
  doc["energia_raw"]  = energiaRaw;
  doc["energia_instalada"] = energiaInstalada ? 1 : 0;  // 0 = sem sensor, pino ignorado
  doc["uptime_s"]    = uptimeSegundos();
  doc["wifi_rssi"]    = WiFi.isConnected() ? WiFi.RSSI() : 0;
  doc["versao"]       = VERSAO;
  // Extras úteis para a página de calibração:
  doc["limite_agua"]    = limiteAgua;
  doc["limite_energia"] = limiteEnergia;
  doc["mac"]            = macTexto();
  doc["porta_invertida"]    = inverterPorta;
  // Diz só SE existe senha, nunca qual é: o /status é aberto a toda a rede.
  doc["ota_senha_definida"] = otaSenhaMd5.length() > 0;

  String saida;
  serializeJson(doc, saida);
  return saida;
}

// =====================================================================
// PUSH — entrega o JSON ao Zabbix sem esperar ele perguntar
// =====================================================================
// Usa o protocolo do "zabbix_sender":
//   "ZBXD" + 1 (versão) + tamanho do corpo em 8 bytes + corpo JSON
// e o corpo diz: "host esp32-sala, item esp32.status, valor = <o JSON>".
// Devolve true se o Zabbix aceitou ("failed: 0").
bool enviarParaZabbix(const String &valor) {
  JsonDocument doc;
  doc["request"] = "sender data";
  JsonObject d = doc["data"].add<JsonObject>();
  d["host"]  = zabbixHost;
  d["key"]   = ZABBIX_CHAVE;
  d["value"] = valor;
  String corpo;
  serializeJson(doc, corpo);

  WiFiClient cliente;
  // Tempo limite curto: se o Zabbix não atender, a placa NÃO pode ficar
  // parada esperando (deixaria de ler os sensores).
  if (!cliente.connect(zabbixServidor.c_str(), ZABBIX_PORTA, PUSH_TIMEOUT)) {
    Serial.printf("Push: não conectou em %s:%u (o polling segue funcionando)\n", zabbixServidor.c_str(), ZABBIX_PORTA);
    return false;
  }
  uint8_t cabecalho[13] = {'Z', 'B', 'X', 'D', 1};
  uint64_t tamanho = corpo.length();
  for (int i = 0; i < 8; i++) cabecalho[5 + i] = (tamanho >> (8 * i)) & 0xFF;  // little-endian
  cliente.write(cabecalho, sizeof(cabecalho));
  cliente.write((const uint8_t *)corpo.c_str(), corpo.length());

  // Espera a resposta (no máximo PUSH_TIMEOUT).
  unsigned long inicio = millis();
  while (cliente.connected() && !cliente.available() && millis() - inicio < PUSH_TIMEOUT) delay(2);
  String resposta;
  while (cliente.available()) resposta += (char)cliente.read();
  cliente.stop();

  bool ok = resposta.indexOf("\"success\"") >= 0 && resposta.indexOf("failed: 0") >= 0;
  Serial.printf("Push: %s\n", ok ? "Zabbix recebeu" :
                "Zabbix recusou (confira o nome do host no portal e se o item aceita push)");
  return ok;
}

// Chamado no loop: percebe mudança e envia respeitando os limites.
void vigiarPush() {
  int atual = estadoUrgente();
  if (atual != estadoEnviado) pushPendente = true;
  if (!pushPendente || modoConfig || !WiFi.isConnected() || zabbixServidor.length() == 0) return;
  // Compara o tempo PASSADO, e não um horário futuro: essa conta continua
  // certa quando o millis() volta a zero, depois de 49,7 dias ligado.
  if (millis() - ultimaTentativaPush < esperaPush) return;

  bool enviado = enviarParaZabbix(montarJsonStatus());
  ultimaTentativaPush = millis();
  if (enviado) {
    estadoEnviado = atual;
    pushPendente = false;
    esperaPush = PUSH_INTERVALO_MIN;
  } else {
    // Falhou: tenta de novo mais tarde. Enquanto isso o Zabbix ainda vê a
    // mudança pelo polling, só que até 15 s depois.
    esperaPush = PUSH_ESPERA_FALHA;
  }
}

// =====================================================================
// MONITOR SERIAL — uma linha legível a cada 2 s
// =====================================================================
void imprimirSerial() {
  String ip = modoConfig ? WiFi.softAPIP().toString()
                         : (WiFi.isConnected() ? WiFi.localIP().toString() : String("sem Wi-Fi"));
  Serial.printf(
    "[%s] T=%s U=%s DHT=%s | sensor de chuva=%s (bruto %d, lim %d) | porta=%s (pino %s%s) | energia=%d%s (bruto %d, lim %d) | IP %s | MAC %s | up %lus\n",
    modoConfig ? "CONFIG" : "NORMAL",
    isnan(temperatura) ? "--" : String(temperatura, 1).c_str(),
    isnan(umidade) ? "--" : String((int)roundf(umidade)).c_str(),
    dhtOk ? "ok" : "FALHA",
    agua ? "MOLHADO" : "seco", aguaRaw, limiteAgua,
    portaAberta ? "ABERTA" : "fechada",
    portaRaw == HIGH ? "HIGH" : "LOW", inverterPorta ? ", invertida" : "",
    energia ? 1 : 0, energiaInstalada ? "" : " sem sensor", energiaRaw, limiteEnergia,
    ip.c_str(), macTexto().c_str(), uptimeSegundos());

  if (modoConfig) {
    Serial.printf("         -> Conecte o celular na rede \"%s\" e abra http://192.168.4.1\n",
                  nomeRedeAP.c_str());
  }
}

// =====================================================================
// MODO CONFIGURAÇÃO (portal cativo)
// =====================================================================

// Procura redes Wi-Fi e monta a lista em HTML (sem repetir nomes).
void procurarRedes() {
  Serial.println("Procurando redes Wi-Fi...");
  int n = WiFi.scanNetworks();
  listaRedesHtml = "";
  for (int i = 0; i < n; i++) {
    String nome = WiFi.SSID(i);
    if (nome.length() == 0) continue;  // rede oculta: dá para digitar o nome

    // Roteadores com vários pontos de acesso aparecem repetidos;
    // ficamos só com o de sinal mais forte.
    bool repetida = false;
    for (int j = 0; j < n; j++) {
      if (j != i && WiFi.SSID(j) == nome &&
          (WiFi.RSSI(j) > WiFi.RSSI(i) || (WiFi.RSSI(j) == WiFi.RSSI(i) && j < i))) {
        repetida = true;
        break;
      }
    }
    if (repetida) continue;

    String seguro = escaparHtml(nome);
    bool aberta = WiFi.encryptionType(i) == WIFI_AUTH_OPEN;
    listaRedesHtml += "<label class=\"rede\"><input type=\"radio\" name=\"escolha\" value=\"" + seguro +
                      "\">" + seguro + (aberta ? " (aberta)" : " 🔒") +
                      "<span class=\"sinal\">" + String(WiFi.RSSI(i)) + " dBm</span></label>";
  }
  if (listaRedesHtml.length() == 0) {
    listaRedesHtml = "<p>Nenhuma rede encontrada. Toque em \"Procurar de novo\" ou digite o nome.</p>";
  }
  WiFi.scanDelete();  // libera a memória do resultado
  Serial.printf("%d redes encontradas.\n", n < 0 ? 0 : n);
}

void paginaPortal() {
  if (servidor.hasArg("atualizar")) procurarRedes();
  String html = FPSTR(PAGINA_PORTAL);
  html.replace("%REDES%", listaRedesHtml);
  html.replace("%MAC%", macTexto());
  html.replace("%ZBX_SRV%", escaparHtml(zabbixServidor));
  html.replace("%ZBX_HOST%", escaparHtml(zabbixHost));
  servidor.send(200, "text/html; charset=utf-8", html);
}

void salvarWifi() {
  String ssid = servidor.arg("ssid");
  String senha = servidor.arg("senha");
  ssid.trim();
  if (ssid.length() == 0 || ssid.length() > 32 || senha.length() > 64) {
    servidor.send(400, "text/plain; charset=utf-8", "Nome da rede ou senha inválidos. Volte e tente de novo.");
    return;
  }
  prefs.putString("ssid", ssid);
  prefs.putString("senha", senha);
  // Push (opcional): em branco = desligado.
  String zbxSrv = servidor.arg("zbx_srv");
  String zbxHost = servidor.arg("zbx_host");
  zbxSrv.trim();
  zbxHost.trim();
  if (zbxSrv.length() <= 64 && zbxHost.length() <= 64) {
    prefs.putString("zbx_srv", zbxSrv);
    prefs.putString("zbx_host", zbxHost.length() ? zbxHost : String(ZABBIX_HOST_PADRAO));
  }
  Serial.printf("Wi-Fi salvo: \"%s\". Reiniciando...\n", ssid.c_str());

  String html = FPSTR(PAGINA_SALVO);
  html.replace("%SSID%", escaparHtml(ssid));
  servidor.send(200, "text/html; charset=utf-8", html);
  delay(1500);  // dá tempo da página chegar no celular antes de reiniciar
  ESP.restart();
}

// Qualquer endereço desconhecido redireciona para o portal.
// É isso que faz o celular mostrar "Fazer login na rede": ele tenta abrir
// uma página de teste (ex.: /generate_204 no Android), recebe um
// redirecionamento em vez da resposta esperada e entende que há um portal.
void redirecionarPortal() {
  servidor.sendHeader("Location", "http://192.168.4.1/", true);
  servidor.send(302, "text/plain", "");
}

void iniciarPortal() {
  modoConfig = true;

  // AP+STA: precisa do "lado cliente" (STA) ligado para conseguir procurar redes.
  WiFi.mode(WIFI_AP_STA);
  procurarRedes();

  // Nome da rede com o final do MAC, para diferenciar se houver duas placas.
  uint8_t mac[6];
  WiFi.macAddress(mac);
  char sufixo[5];
  snprintf(sufixo, sizeof(sufixo), "%02X%02X", mac[4], mac[5]);
  nomeRedeAP = String("Sala-Servidor-") + sufixo;

  IPAddress ip(192, 168, 4, 1);
  WiFi.softAPConfig(ip, ip, IPAddress(255, 255, 255, 0));
  WiFi.softAP(nomeRedeAP.c_str());  // rede aberta: só serve para configurar

  // Servidor DNS que responde "192.168.4.1" para QUALQUER nome de site.
  dns.start(53, "*", ip);

  servidor.on("/", HTTP_GET, paginaPortal);
  servidor.on("/salvar", HTTP_POST, salvarWifi);
  servidor.onNotFound(redirecionarPortal);
  servidor.begin();

  Serial.printf("\n=== MODO CONFIGURAÇÃO ===\nRede: %s  |  Página: http://192.168.4.1\n"
                "Lembre: só redes Wi-Fi 2,4 GHz funcionam.\n\n", nomeRedeAP.c_str());
}

// =====================================================================
// MODO NORMAL
// =====================================================================

void paginaStatus() {
  servidor.send_P(200, "text/html; charset=utf-8", PAGINA_STATUS);
}

void rotaStatus() {
  // "no-store": nunca usar resposta antiga guardada em cache.
  servidor.sendHeader("Cache-Control", "no-store");
  servidor.send(200, "application/json", montarJsonStatus());
}

// Resposta curta em JSON, usada pelos formulários da página.
void responderJson(int codigo, const char *erro = nullptr) {
  JsonDocument resp;
  resp["ok"] = erro == nullptr;
  if (erro) resp["erro"] = erro;
  String saida;
  serializeJson(resp, saida);
  servidor.send(codigo, "application/json", saida);
}

// Recebe da página os limites e a opção de inverter a porta, e salva na memória.
void rotaLimites() {
  if (!servidor.hasArg("agua") || !servidor.hasArg("energia")) {
    responderJson(400, "faltam os campos agua e energia");
    return;
  }
  long a = servidor.arg("agua").toInt();
  long e = servidor.arg("energia").toInt();
  if (a < 0 || a > LIMITE_AGUA_MAX || e < 0 || e > 4095) {
    responderJson(400, "use de 0 a 3895 para a chuva e de 0 a 4095 para a energia");
    return;
  }
  limiteAgua = a;
  limiteEnergia = e;
  prefs.putInt("lim_agua", limiteAgua);
  prefs.putInt("lim_energia", limiteEnergia);
  if (servidor.hasArg("inverter_porta")) {
    inverterPorta = servidor.arg("inverter_porta") == "1";
    prefs.putBool("inv_porta", inverterPorta);
    aplicarPorta();  // a página mostra o resultado na próxima atualização
  }
  Serial.printf("Salvo: limite chuva=%d, limite energia=%d, inverter porta=%s\n",
                limiteAgua, limiteEnergia, inverterPorta ? "sim" : "não");
  lerAnalogicos();  // aplica na hora
  responderJson(200);
}

// Página da placa: marca se o sensor de energia (divisor no pino 34) está
// instalado (campo "instalada"). Vale na hora e fica salvo na memória.
void rotaEnergia() {
  if (!servidor.hasArg("instalada")) {
    responderJson(400, "falta o campo instalada");
    return;
  }
  energiaInstalada = servidor.arg("instalada") == "1";
  prefs.putBool("ener_inst", energiaInstalada);
  lerAnalogicos();  // muda na hora; o vigiarPush() percebe e avisa o Zabbix
  responderJson(200);
}

// =====================================================================
// ATUALIZAÇÃO PELA REDE (OTA)
// ---------------------------------------------------------------------
// A memória tem duas áreas de programa: uma em uso e uma de reserva. O arquivo
// novo é escrito na reserva e a placa só troca de área depois de conferir que
// ele chegou inteiro. Se algo falhar no meio, a versão atual continua rodando.
// =====================================================================

// Liga o ArduinoOTA (a porta usada pelo PlatformIO). Sem senha definida ele
// fica desligado: um OTA aberto deixaria qualquer um na rede trocar o firmware.
void ligarArduinoOta() {
  if (otaSenhaMd5.length() == 0 || !WiFi.isConnected()) return;
  ArduinoOTA.setPasswordHash(otaSenhaMd5.c_str());
  if (arduinoOtaLigado) return;

  ArduinoOTA.setHostname(HOSTNAME);
  ArduinoOTA.setPort(OTA_PORTA);
  ArduinoOTA.setMdnsEnabled(false);  // o nome .local já foi anunciado em vigiarWifi()
  ArduinoOTA.onStart([]() { Serial.println("OTA: recebendo o firmware novo..."); });
  ArduinoOTA.onEnd([]() { Serial.println("OTA: concluído. Reiniciando..."); });
  ArduinoOTA.onError([](ota_error_t erro) {
    Serial.printf("OTA: falhou (erro %u). A versão atual continua rodando.\n", erro);
  });
  ArduinoOTA.begin();
  MDNS.enableArduino(OTA_PORTA, true);
  arduinoOtaLigado = true;
  Serial.printf("ArduinoOTA ligado na porta %u.\n", OTA_PORTA);
}

// Define ou troca a senha do OTA. Para trocar, é preciso saber a atual. Quem
// esqueceu a senha segura o BOOT por 10 s: exige estar perto da placa.
void rotaSenhaOta() {
  if (otaSenhaMd5.length() > 0 && !senhaOtaConfere(servidor.arg("atual"))) {
    responderJson(403, "senha atual incorreta");
    return;
  }
  String nova = servidor.arg("nova");
  if (!senhaOtaValida(nova)) {
    responderJson(400, "use de 8 a 64 caracteres, sem espaços nem acentos");
    return;
  }
  otaSenhaMd5 = md5Texto(nova);
  prefs.putString("ota_md5", otaSenhaMd5);
  ligarArduinoOta();
  Serial.println("Senha do OTA salva.");  // a senha nunca aparece no Serial
  responderJson(200);
}

void paginaAtualizar() {
  servidor.send_P(200, "text/html; charset=utf-8", PAGINA_ATUALIZAR);
}

// Confere a senha ANTES do envio, para o erro não aparecer só depois de o
// arquivo inteiro ter viajado pela rede.
void rotaConferirSenhaOta() {
  if (senhaOtaConfere(servidor.header("X-Senha"))) responderJson(200);
  else responderJson(403, "senha incorreta ou ainda não definida");
}

// Chamada várias vezes durante o envio, a cada pedaço do arquivo que chega.
// A senha vem num cabeçalho porque os cabeçalhos chegam antes do arquivo; os
// campos do formulário só ficariam disponíveis depois do envio terminar.
void receberFirmware() {
  HTTPUpload &envio = servidor.upload();

  if (envio.status == UPLOAD_FILE_START) {
    erroAtualizacao = "";
    if (!senhaOtaConfere(servidor.header("X-Senha"))) {
      erroAtualizacao = "Senha incorreta ou ainda não definida.";
    } else if (!Update.begin(UPDATE_SIZE_UNKNOWN, U_FLASH)) {
      erroAtualizacao = String("Não deu para começar: ") + Update.errorString();
    } else {
      Serial.printf("Atualização: recebendo %s\n", envio.filename.c_str());
    }
  } else if (envio.status == UPLOAD_FILE_WRITE) {
    if (erroAtualizacao.length() > 0) return;
    // Todo programa do ESP32 começa com o byte 0xE9. O binário do cabo começa
    // com outro, porque o bootloader dele só vem depois do endereço 0x1000.
    if (envio.totalSize == 0 && envio.buf[0] != 0xE9) {
      erroAtualizacao = "Este não é o arquivo certo: use o sala-servidor-ota.bin.";
      Update.abort();
    } else if (Update.write(envio.buf, envio.currentSize) != envio.currentSize) {
      erroAtualizacao = String("Falha ao gravar: ") + Update.errorString();
      Update.abort();
    }
  } else if (envio.status == UPLOAD_FILE_END) {
    // end(true) confere a soma de verificação do arquivo e só então marca a
    // área nova para o próximo início.
    if (erroAtualizacao.length() == 0 && !Update.end(true)) {
      erroAtualizacao = String("Arquivo rejeitado: ") + Update.errorString();
    }
  } else if (envio.status == UPLOAD_FILE_ABORTED) {
    erroAtualizacao = "O envio foi interrompido.";
    Update.abort();
  }
}

// Chamada uma vez, depois que o arquivo inteiro chegou.
void fimAtualizacao() {
  if (erroAtualizacao.length() > 0) {
    Serial.printf("Atualização falhou: %s A versão atual continua rodando.\n", erroAtualizacao.c_str());
    servidor.send(400, "text/plain; charset=utf-8", erroAtualizacao);
    return;
  }
  Serial.println("Atualização concluída. Reiniciando...");
  servidor.send(200, "text/plain; charset=utf-8", "ok");
  delay(1000);  // dá tempo da resposta chegar ao navegador
  ESP.restart();
}

void iniciarModoNormal() {
  modoConfig = false;

  // O hostname precisa ser definido ANTES de ligar o Wi-Fi; é o nome que
  // aparece na lista de aparelhos do roteador.
  WiFi.setHostname(HOSTNAME);
  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);   // o próprio ESP32 tenta voltar se cair
  WiFi.begin(ssidSalvo.c_str(), senhaSalva.c_str());
  ultimaReconexao = millis();

  servidor.on("/", HTTP_GET, paginaStatus);
  servidor.on("/status", HTTP_GET, rotaStatus);
  servidor.on("/limites", HTTP_POST, rotaLimites);
  servidor.on("/energia", HTTP_POST, rotaEnergia);
  servidor.on("/senha-ota", HTTP_POST, rotaSenhaOta);
  servidor.on("/atualizar", HTTP_GET, paginaAtualizar);
  servidor.on("/atualizar/senha", HTTP_POST, rotaConferirSenhaOta);
  servidor.on("/atualizar", HTTP_POST, fimAtualizacao, receberFirmware);
  servidor.onNotFound([]() { servidor.send(404, "text/plain; charset=utf-8", "Não encontrado. Use /, /status ou /atualizar"); });
  // O servidor descarta os cabeçalhos que não foram pedidos com antecedência.
  static const char *CABECALHOS[] = {"X-Senha"};
  servidor.collectHeaders(CABECALHOS, 1);
  servidor.begin();

  Serial.printf("\n=== MODO NORMAL ===\nConectando em \"%s\"...\n"
                "(Para trocar de rede: segure o BOOT por 10 s.)\n\n", ssidSalvo.c_str());
}

// Vigia o Wi-Fi: avisa quando conecta e insiste quando cai.
void vigiarWifi() {
  bool conectado = WiFi.isConnected();

  if (conectado && !wifiEstavaConectado) {
    Serial.printf("Wi-Fi conectado! IP: %s  |  MAC: %s  |  http://%s.local\n",
                  WiFi.localIP().toString().c_str(), macTexto().c_str(), HOSTNAME);
    if (zabbixServidor.length()) {
      Serial.printf("Push ligado: avisos imediatos para %s:%u como \"%s\"\n",
                    zabbixServidor.c_str(), ZABBIX_PORTA, zabbixHost.c_str());
    } else {
      Serial.println("Push desligado (sem IP do Zabbix). Só o polling vai funcionar.");
    }
    // mDNS: permite abrir http://sala-servidor.local sem saber o IP.
    if (!mdnsIniciado && MDNS.begin(HOSTNAME)) {
      MDNS.addService("http", "tcp", 80);
      mdnsIniciado = true;
    }
    ligarArduinoOta();
  }
  if (!conectado && wifiEstavaConectado) {
    Serial.println("Wi-Fi caiu. Tentando reconectar...");
  }
  // Reforço: além do autoReconnect, pede reconexão a cada 10 s se seguir fora.
  if (!conectado && millis() - ultimaReconexao >= INTERVALO_RECONEXAO) {
    ultimaReconexao = millis();
    WiFi.reconnect();
  }
  wifiEstavaConectado = conectado;
}

// =====================================================================
// BOTÃO BOOT: segurar 10 s apaga tudo (Wi-Fi, limites, opção da porta e
// senha do OTA) e reinicia
// =====================================================================
void vigiarBotaoBoot() {
  if (digitalRead(PINO_BOOT) == LOW) {
    if (bootApertadoDesde == 0) {
      bootApertadoDesde = millis();
      Serial.println("BOOT apertado: continue segurando 10 s para apagar a configuração...");
    }
    if (millis() - bootApertadoDesde >= TEMPO_RESET_BOOT) {
      Serial.println("APAGANDO configuração e reiniciando em modo de configuração!");
      prefs.clear();
      // Pisca rápido 10 vezes para confirmar visualmente.
      for (int i = 0; i < 20; i++) {
        digitalWrite(PINO_LED, i % 2);
        delay(50);
      }
      ESP.restart();
    }
  } else if (bootApertadoDesde != 0) {
    Serial.println("BOOT solto antes de 10 s: nada foi apagado.");
    bootApertadoDesde = 0;
  }
}

// =====================================================================
// SETUP — roda UMA vez quando a placa liga
// =====================================================================
void setup() {
  Serial.begin(115200);
  delay(200);
  Serial.printf("\n\nSala do Servidor - firmware %s\n", VERSAO);

  pinMode(PINO_LED, OUTPUT);
  pinMode(PINO_BOOT, INPUT_PULLUP);
  pinMode(PINO_PORTA, INPUT_PULLUP);  // resistor interno puxa para HIGH
  // Sensor de chuva: só leitura analógica, sem resistor interno. O módulo
  // já entrega a tensão pronta; um pull-up ou pull-down distorceria a leitura.
  // ANALOG desliga os dois. O PINO_ENERGIA (34) nem tem resistor interno.
  pinMode(PINO_AGUA, ANALOG);

  // Leitura analógica de 12 bits (0–4095) e atenuação de 11 dB: sem ela o
  // pino só mede até ~1,1 V; com ela mede até ~3,3 V, que é o nosso caso.
  analogReadResolution(12);
  analogSetPinAttenuation(PINO_AGUA, ADC_11db);
  analogSetPinAttenuation(PINO_ENERGIA, ADC_11db);

  dht.begin();

  // Lê a "memória permanente". O nome "sala" é a gaveta onde guardamos tudo.
  prefs.begin("sala", false);
  ssidSalvo     = prefs.getString("ssid", "");
  senhaSalva    = prefs.getString("senha", "");
  limiteAgua    = constrain(prefs.getInt("lim_agua", LIMITE_AGUA_PADRAO), 0, LIMITE_AGUA_MAX);
  limiteEnergia = prefs.getInt("lim_energia", LIMITE_ENERGIA_PADRAO);
  zabbixServidor = prefs.getString("zbx_srv", ZABBIX_SERVIDOR_PADRAO);
  zabbixHost     = prefs.getString("zbx_host", ZABBIX_HOST_PADRAO);
  inverterPorta  = prefs.getBool("inv_porta", false);
  energiaInstalada = prefs.getBool("ener_inst", false);
  // isKey evita uma mensagem de erro no Serial enquanto não há senha salva.
  if (prefs.isKey("ota_md5")) otaSenhaMd5 = prefs.getString("ota_md5", "");

  // Primeira leitura já no início, para o /status não começar vazio.
  portaLeituraAnterior = digitalRead(PINO_PORTA);
  portaRaw = portaLeituraAnterior;
  aplicarPorta();
  lerAnalogicos();

  if (ssidSalvo.length() == 0) iniciarPortal();
  else iniciarModoNormal();
}

// =====================================================================
// LOOP — roda sem parar; cada tarefa só age quando chega a hora dela
// =====================================================================
void loop() {
  unsigned long agora = millis();

  if (modoConfig) dns.processNextRequest();  // responde o "DNS falso" do portal
  servidor.handleClient();                    // atende quem pediu uma página
  if (!modoConfig) vigiarWifi();
  if (arduinoOtaLigado) ArduinoOTA.handle();  // alguém está enviando firmware pelo PC?

  lerPorta();  // a porta é lida em todo loop (o debounce precisa disso)

  if (agora - ultimoAnalogico >= INTERVALO_ANALOGICO) {
    ultimoAnalogico = agora;
    lerAnalogicos();
  }
  if (agora - ultimoDht >= INTERVALO_DHT) {
    ultimoDht = agora;
    lerDht();
  }
  if (agora - ultimoSerial >= INTERVALO_SERIAL) {
    ultimoSerial = agora;
    imprimirSerial();
  }

  vigiarPush();  // chuva/porta/energia mudou? avisa o Zabbix na hora

  vigiarBotaoBoot();
  atualizarLed();
}
