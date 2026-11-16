// =====================================================================
// pagina_status.h — página principal do ESP32 (http://IP/ ou
// http://sala-servidor.local/) no MODO NORMAL
// ---------------------------------------------------------------------
// É a "tela de calibração" que aparece no vídeo. Ela não recebe os
// valores prontos: a cada 2 segundos o JavaScript da própria página pede
// o /status (o mesmo JSON que o Zabbix lê) e pinta cada sensor de verde
// ou vermelho. Assim a página e o Zabbix enxergam exatamente a mesma coisa.
//
// No fim há formulários para mudar, sem regravar a placa, os LIMITES do sensor
// de chuva e da energia, a opção de INVERTER A PORTA e a SENHA DO OTA (tudo fica
// salvo na memória "Preferences"), além de marcar se o SENSOR DE ENERGIA está instalado.
// =====================================================================
#pragma once
#include <Arduino.h>

const char PAGINA_STATUS[] PROGMEM = R"rawliteral(<!doctype html>
<html lang="pt-BR"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Sala do Servidor - Sensores</title>
<style>
  :root{--fundo:#0f172a;--cartao:#1e293b;--texto:#e2e8f0;--fraco:#94a3b8;--ok:#22c55e;--alerta:#ef4444;--aviso:#f59e0b}
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:var(--fundo);color:var(--texto);margin:0;padding:16px}
  h1{font-size:22px;margin:0} .sub{color:var(--fraco);font-size:13px;margin:4px 0 16px}
  .grade{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px}
  .cartao{background:var(--cartao);border-radius:12px;padding:16px;border-left:6px solid var(--fraco)}
  .cartao.ok{border-color:var(--ok)} .cartao.alerta{border-color:var(--alerta);background:#3b1219}
  .cartao.aviso{border-color:var(--aviso)}
  .nome{color:var(--fraco);font-size:13px;text-transform:uppercase;letter-spacing:.05em}
  .valor{font-size:24px;font-weight:700;margin:6px 0;overflow-wrap:anywhere}
  .bruto{color:var(--fraco);font-size:12px;font-family:ui-monospace,Consolas,monospace}
  form{background:var(--cartao);border-radius:12px;padding:16px;margin-top:16px}
  form h2{font-size:16px;margin:0 0 8px}
  .linha{display:flex;gap:12px;flex-wrap:wrap}
  .linha label{flex:1;min-width:140px;font-size:13px;color:var(--fraco)}
  input{width:100%;box-sizing:border-box;padding:10px;border-radius:8px;border:1px solid #334155;background:var(--fundo);color:var(--texto);font-size:16px;margin-top:4px}
  input[type=checkbox]{width:auto;margin:0 8px 0 0}
  .marcar{display:flex;align-items:center;font-size:14px;margin-top:12px}
  a{color:#38bdf8}
  button{margin-top:12px;padding:10px 18px;border:0;border-radius:8px;background:#38bdf8;color:#0f172a;font-weight:700}
  .dica{color:var(--fraco);font-size:12px;line-height:1.5}
  #msg,#msg-ota{margin-left:10px;font-size:13px}
  .rodape{color:var(--fraco);font-size:12px;margin-top:16px}
</style></head><body>
<h1>🖥️ Sala do Servidor</h1>
<div class="sub" id="sub">Conectando ao ESP32…</div>

<div class="grade">
  <div class="cartao" id="c-energia"><div class="nome">⚡ Energia</div><div class="valor" id="v-energia">—</div><div class="bruto" id="b-energia"></div></div>
  <div class="cartao" id="c-agua"><div class="nome">💧 Sensor de chuva</div><div class="valor" id="v-agua">—</div><div class="bruto" id="b-agua"></div></div>
  <div class="cartao" id="c-porta"><div class="nome">🚪 Porta</div><div class="valor" id="v-porta">—</div><div class="bruto" id="b-porta"></div></div>
  <div class="cartao" id="c-temp"><div class="nome">🌡️ Temperatura</div><div class="valor" id="v-temp">—</div><div class="bruto" id="b-temp"></div></div>
  <div class="cartao" id="c-umid"><div class="nome">💨 Umidade</div><div class="valor" id="v-umid">—</div><div class="bruto" id="b-umid"></div></div>
</div>

<form id="form-energia">
  <h2>Sensor de energia</h2>
  <div class="dica">Marque depois de ligar o carregador ao divisor 10k/20k no pino 34. Sem o sensor, o pino fica solto e lê ruído, então a placa ignora a leitura para não gerar alerta falso.</div>
  <label class="marcar"><input type="checkbox" id="energia_instalada">Sensor de energia instalado (pino 34)</label><span id="msg-energia"></span>
</form>

<form id="form-limites">
  <h2>Calibração dos limites</h2>
  <div class="dica">
    O ESP32 lê o sensor de chuva e a energia como números de 0 a 4095 (o "valor bruto" de cada cartão).<br>
    <b>Sensor de chuva:</b> seco fica alto (perto de 4095), molhado cai. Alerta quando o bruto fica <b>abaixo</b> do limite, e só volta a "seco" <b>acima do limite + 200</b>, para o alerta não ficar piscando enquanto a placa seca.<br>
    <b>Energia:</b> com tomada ligada fica alto, sem energia vai perto de 0. Com energia quando o bruto fica <b>acima</b> do limite.<br>
    Dica: anote o bruto nas duas situações (seco/molhado, ligado/desligado) e escolha um número no meio.
  </div>
  <div class="linha">
    <label>Limite do sensor de chuva (0–3895)<input type="number" id="limite_agua" name="agua" min="0" max="3895" required></label>
    <label>Limite da energia (0–4095)<input type="number" id="limite_energia" name="energia" min="0" max="4095" required></label>
  </div>
  <label class="marcar"><input type="checkbox" id="inverter_porta">Inverter porta</label>
  <div class="dica">Marque se "aberta" e "fechada" vierem trocados. Isso muda conforme o modelo do MC-38 (NA ou NF).</div>
  <button type="submit">Salvar</button><span id="msg"></span>
</form>

<form id="form-ota">
  <h2>Atualização pela rede (OTA)</h2>
  <div class="dica" id="dica-ota">
    Defina uma senha para liberar a atualização sem cabo. Enquanto não houver senha, o OTA fica travado.
  </div>
  <div class="linha">
    <label id="campo-atual" hidden>Senha atual<input type="password" name="atual" autocomplete="current-password"></label>
    <label>Senha nova (8 a 64 caracteres, sem espaços nem acentos)<input type="password" name="nova" minlength="8" maxlength="64" autocomplete="new-password" required></label>
  </div>
  <button type="submit">Salvar senha</button><span id="msg-ota"></span>
  <div class="dica" style="margin-top:12px"><a href="/atualizar">Enviar um firmware novo</a></div>
</form>

<div class="rodape" id="rodape"></div>

<script>
// Liga/desliga a cor de um cartão: "ok" (verde), "alerta" (vermelho) ou "aviso" (amarelo).
function pinta(id, estado){ document.getElementById('c-'+id).className = 'cartao ' + estado; }
function texto(id, v){ document.getElementById(id).textContent = v; }

var limitesCarregados = false;

// Pede o JSON ao ESP32 e atualiza a tela. Chamado a cada 2 segundos.
function atualizar(){
  fetch('/status', {cache:'no-store'}).then(function(r){ return r.json(); }).then(function(s){
    texto('sub', 'Atualizado às ' + new Date().toLocaleTimeString('pt-BR') + ' · firmware ' + s.versao);

    texto('v-energia', s.energia ? 'Com energia' : 'SEM ENERGIA');
    texto('b-energia', s.energia_instalada ? 'bruto ' + s.energia_raw + ' · limite ' + s.limite_energia : 'sensor não instalado · pino ignorado');
    pinta('energia', s.energia ? 'ok' : 'alerta');
    document.getElementById('energia_instalada').checked = !!s.energia_instalada;

    texto('v-agua', s.agua ? 'MOLHADO' : 'Seco');
    texto('b-agua', 'bruto ' + s.agua_raw + ' · limite ' + s.limite_agua + ' · seca acima de ' + (s.limite_agua + 200));
    pinta('agua', s.agua ? 'alerta' : 'ok');

    texto('v-porta', s.porta_aberta ? 'ABERTA' : 'Fechada');
    texto('b-porta', 'pino ' + (s.porta_raw ? 'HIGH' : 'LOW') + (s.porta_invertida ? ' · invertida' : ''));
    pinta('porta', s.porta_aberta ? 'alerta' : 'ok');

    // Temperatura: amarelo a partir de 28 °C, vermelho a partir de 32 °C
    // (os mesmos números dos gatilhos do Zabbix).
    var t = s.temperatura;
    texto('v-temp', t === null ? '—' : t.toFixed(1) + ' °C');
    texto('b-temp', s.dht_ok ? 'DHT11 ok' : 'DHT11 sem resposta (mostrando último valor)');
    pinta('temp', !s.dht_ok || t === null ? 'aviso' : (t >= 32 ? 'alerta' : (t >= 28 ? 'aviso' : 'ok')));

    texto('v-umid', s.umidade === null ? '—' : s.umidade + ' %');
    texto('b-umid', s.dht_ok ? 'DHT11 ok' : 'DHT11 sem resposta');
    pinta('umid', s.dht_ok ? 'ok' : 'aviso');

    texto('rodape', 'IP ' + location.hostname + ' · MAC ' + s.mac + ' · Wi-Fi ' + s.wifi_rssi +
          ' dBm · ligado há ' + s.uptime_s + ' s');

    // Preenche o formulário só na primeira vez, para não apagar o que você está digitando.
    if(!limitesCarregados){
      document.getElementById('limite_agua').value = s.limite_agua;
      document.getElementById('limite_energia').value = s.limite_energia;
      document.getElementById('inverter_porta').checked = s.porta_invertida;
      limitesCarregados = true;
    }

    // Com senha já definida, trocar exige informar a atual.
    document.getElementById('campo-atual').hidden = !s.ota_senha_definida;
    if(s.ota_senha_definida){
      texto('dica-ota', 'Senha definida: a atualização sem cabo está liberada. Esqueceu a senha? Segurar o BOOT por 10 s apaga toda a configuração da placa, inclusive o Wi-Fi.');
    }
  }).catch(function(){ texto('sub', 'Sem resposta do ESP32… tentando de novo'); });
}

// Envia os limites e a opção da porta. O ESP32 valida, salva na memória e responde.
document.getElementById('form-limites').addEventListener('submit', function(e){
  e.preventDefault();
  var corpo = new URLSearchParams(new FormData(e.target));
  // Caixinha desmarcada não entra no formulário; por isso vai sempre 1 ou 0.
  corpo.set('inverter_porta', document.getElementById('inverter_porta').checked ? '1' : '0');
  fetch('/limites', {method:'POST', body:corpo}).then(function(r){ return r.json(); }).then(function(j){
    texto('msg', j.ok ? '✔ Salvo' : '✖ ' + j.erro);
    setTimeout(function(){ texto('msg',''); }, 3000);
  }).catch(function(){ texto('msg', '✖ Falha ao salvar'); });
});

// Sensor de energia: o clique vale na hora, sem botão de salvar.
function mudarEnergia(campos){
  fetch('/energia', {method:'POST', body:new URLSearchParams(campos)}).then(function(r){ return r.json(); }).then(function(j){
    texto('msg-energia', j.ok ? '' : '✖ ' + j.erro);
    atualizar();
  }).catch(function(){ texto('msg-energia', '✖ Falha ao enviar'); });
}
document.getElementById('energia_instalada').addEventListener('change', function(e){
  mudarEnergia({instalada: e.target.checked ? '1' : '0'});
});

// Envia a senha do OTA. Os campos são limpos para ela não ficar na tela.
document.getElementById('form-ota').addEventListener('submit', function(e){
  e.preventDefault();
  var corpo = new URLSearchParams(new FormData(e.target));
  fetch('/senha-ota', {method:'POST', body:corpo}).then(function(r){ return r.json(); }).then(function(j){
    texto('msg-ota', j.ok ? '✔ Senha salva' : '✖ ' + j.erro);
    if(j.ok) e.target.reset();
    setTimeout(function(){ texto('msg-ota',''); }, 4000);
  }).catch(function(){ texto('msg-ota', '✖ Falha ao salvar'); });
});

atualizar();
setInterval(atualizar, 2000);
</script>
</body></html>)rawliteral";
