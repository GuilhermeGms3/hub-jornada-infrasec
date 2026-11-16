// =====================================================================
// pagina_atualizar.h — página /atualizar do ESP32
// ---------------------------------------------------------------------
// Envia um firmware novo pela rede, sem cabo. O JavaScript confere o arquivo
// e a senha ANTES do envio, mostra a barra de progresso e, depois que a placa
// reinicia, pergunta ao /status qual versão entrou.
// =====================================================================
#pragma once
#include <Arduino.h>

const char PAGINA_ATUALIZAR[] PROGMEM = R"rawliteral(<!doctype html>
<html lang="pt-BR"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Sala do Servidor - Atualizar firmware</title>
<style>
  :root{--fundo:#0f172a;--cartao:#1e293b;--texto:#e2e8f0;--fraco:#94a3b8;--ok:#22c55e;--alerta:#ef4444}
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:var(--fundo);color:var(--texto);margin:0;padding:16px}
  main{max-width:560px;margin:0 auto}
  h1{font-size:22px;margin:0} .sub{color:var(--fraco);font-size:13px;margin:4px 0 16px}
  form{background:var(--cartao);border-radius:12px;padding:16px}
  label{display:block;font-size:13px;color:var(--fraco);margin-bottom:12px}
  input{width:100%;box-sizing:border-box;padding:10px;border-radius:8px;border:1px solid #334155;background:var(--fundo);color:var(--texto);font-size:16px;margin-top:4px}
  button{padding:10px 18px;border:0;border-radius:8px;background:#38bdf8;color:#0f172a;font-weight:700}
  button:disabled{opacity:.45}
  .dica{color:var(--fraco);font-size:12px;line-height:1.5;margin:0 0 12px}
  .barra{height:10px;background:var(--fundo);border-radius:99px;overflow:hidden;margin-top:14px}
  .barra>div{height:100%;width:0;background:#38bdf8}
  #msg{font-size:14px;margin-top:12px;line-height:1.5;overflow-wrap:anywhere}
  a{color:#38bdf8}
</style></head><body><main>
<h1>Atualizar firmware</h1>
<div class="sub" id="sub">Versão atual: —</div>

<form id="form">
  <p class="dica">Use o arquivo <b>sala-servidor-ota.bin</b>, baixado do gravador (porta 8090).
    Se a atualização falhar no meio, o ESP32 continua rodando a versão atual.</p>
  <label>Arquivo do firmware<input type="file" id="arquivo" accept=".bin" required></label>
  <label>Senha do OTA<input type="password" id="senha" autocomplete="current-password" required></label>
  <button type="submit" id="enviar">Enviar firmware</button>
  <div class="barra" id="barra" hidden><div id="progresso"></div></div>
  <div id="msg"></div>
</form>
<p class="dica" style="margin-top:16px"><a href="/">Voltar aos sensores</a></p>

<script>
var $ = function(id){ return document.getElementById(id); };
var ERA_VERSAO = null;

function mensagem(texto, cor){ $('msg').textContent = texto; $('msg').style.color = cor || ''; }
function bloquear(sim){ $('enviar').disabled = sim; }

fetch('/status', {cache:'no-store'}).then(function(r){ return r.json(); }).then(function(s){
  ERA_VERSAO = s.versao;
  $('sub').textContent = 'Versão atual: ' + s.versao;
  if(!s.ota_senha_definida){
    bloquear(true);
    mensagem('Defina primeiro a senha do OTA na página principal.', 'var(--alerta)');
  }
});

// Todo programa do ESP32 começa com o byte 0xE9. O binário do cabo começa com outro valor.
function conferirArquivo(arquivo){
  return arquivo.slice(0, 1).arrayBuffer().then(function(b){
    if(new Uint8Array(b)[0] !== 0xE9) throw new Error('Este é o arquivo para gravar pelo cabo. Aqui, use o sala-servidor-ota.bin.');
  });
}

function conferirSenha(senha){
  return fetch('/atualizar/senha', {method:'POST', headers:{'X-Senha':senha}}).then(function(r){
    if(!r.ok) throw new Error('Senha incorreta.');
  });
}

function enviar(arquivo, senha){
  return new Promise(function(aceita, recusa){
    var corpo = new FormData();
    corpo.append('firmware', arquivo);
    var pedido = new XMLHttpRequest();
    pedido.open('POST', '/atualizar');
    pedido.setRequestHeader('X-Senha', senha);
    pedido.upload.onprogress = function(e){
      if(!e.lengthComputable) return;
      var pct = Math.round(e.loaded / e.total * 100);
      $('progresso').style.width = pct + '%';
      mensagem(pct < 100 ? 'Enviando ' + pct + '%' : 'Conferindo o arquivo…');
    };
    pedido.onload = function(){
      if(pedido.status === 200) aceita();
      else recusa(new Error(pedido.responseText || 'A placa recusou o arquivo.'));
    };
    pedido.onerror = function(){ recusa(new Error('A conexão caiu durante o envio.')); };
    pedido.send(corpo);
  });
}

// A placa fica fora do ar enquanto reinicia. Pergunta a versão até ela voltar.
function esperarVolta(tentativas){
  setTimeout(function(){
    fetch('/status', {cache:'no-store'}).then(function(r){ return r.json(); }).then(function(s){
      if(s.versao === ERA_VERSAO){
        mensagem('✔ A placa voltou, ainda na versão ' + s.versao + '. O arquivo enviado tem essa mesma versão?', 'var(--ok)');
      } else {
        mensagem('✔ Atualizado! Versão anterior: ' + ERA_VERSAO + '. Agora: ' + s.versao + '.', 'var(--ok)');
      }
      $('sub').textContent = 'Versão atual: ' + s.versao;
      ERA_VERSAO = s.versao;
      bloquear(false);
    }).catch(function(){
      if(tentativas > 1) esperarVolta(tentativas - 1);
      else mensagem('A placa não voltou em 1 minuto. Confira o Wi-Fi e o Monitor Serial.', 'var(--alerta)');
    });
  }, 2000);
}

$('form').addEventListener('submit', function(e){
  e.preventDefault();
  var arquivo = $('arquivo').files[0], senha = $('senha').value;
  bloquear(true);
  $('progresso').style.width = '0';
  mensagem('Conferindo…');
  conferirArquivo(arquivo).then(function(){ return conferirSenha(senha); }).then(function(){
    $('barra').hidden = false;
    return enviar(arquivo, senha);
  }).then(function(){
    $('progresso').style.width = '100%';
    mensagem('Gravado. A placa está reiniciando…');
    esperarVolta(30);
  }).catch(function(erro){
    mensagem('✖ ' + erro.message + ' A versão atual continua rodando.', 'var(--alerta)');
    bloquear(false);
  });
});
</script>
</main></body></html>)rawliteral";
