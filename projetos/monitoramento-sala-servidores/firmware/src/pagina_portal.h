// =====================================================================
// pagina_portal.h — páginas do MODO CONFIGURAÇÃO (portal cativo)
// ---------------------------------------------------------------------
// Quando o ESP32 não tem Wi-Fi salvo, ele cria a própria rede
// "Sala-Servidor-XXXX". Você conecta o celular nela e esta página abre
// sozinha (é o "portal cativo", igual Wi-Fi de hotel/aeroporto).
//
// Por que o HTML está num .h separado: para o main.cpp ficar só com a
// lógica. "PROGMEM" guarda o texto na memória flash (que é grande) em vez
// da RAM (que é pequena no ESP32).
//
// Partes com %MARCADOR% são trocadas pelo main.cpp antes de enviar.
// =====================================================================
#pragma once
#include <Arduino.h>

// Página principal do portal: lista de redes + campo de senha.
const char PAGINA_PORTAL[] PROGMEM = R"rawliteral(<!doctype html>
<html lang="pt-BR"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Configurar Wi-Fi - Sala do Servidor</title>
<style>
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#0f172a;color:#e2e8f0;margin:0;padding:16px}
  .caixa{max-width:420px;margin:0 auto;background:#1e293b;border-radius:12px;padding:20px}
  h1{font-size:20px;margin:0 0 4px} p{color:#94a3b8;font-size:14px;line-height:1.4}
  .aviso{background:#422006;color:#fcd34d;border-radius:8px;padding:10px;font-size:13px}
  label{display:block;font-size:14px;margin:14px 0 6px}
  .rede{display:flex;align-items:center;gap:8px;padding:10px;border:1px solid #334155;border-radius:8px;margin-bottom:6px;cursor:pointer}
  .rede span.sinal{margin-left:auto;color:#64748b;font-size:12px}
  input[type=text],input[type=password]{width:100%;box-sizing:border-box;padding:12px;border-radius:8px;border:1px solid #334155;background:#0f172a;color:#e2e8f0;font-size:16px}
  button{width:100%;padding:14px;margin-top:16px;border:0;border-radius:8px;background:#38bdf8;color:#0f172a;font-weight:700;font-size:16px}
  a{color:#38bdf8;font-size:13px}
</style></head><body><div class="caixa">
<h1>Sala do Servidor</h1>
<p>Escolha a rede Wi-Fi da casa e digite a senha. O ESP32 vai salvar e reiniciar.</p>
<div class="aviso">⚠ Só redes de <b>2,4 GHz</b> funcionam. O ESP32 não enxerga redes 5 GHz
(se o roteador mostra duas redes, use a que NÃO tem "5G" no nome).</div>
<form method="POST" action="/salvar">
  <label>Redes encontradas:</label>
  %REDES%
  <a href="/?atualizar=1">↻ Procurar redes de novo</a>
  <label for="ssid">Nome da rede (pode digitar se ela não apareceu):</label>
  <input type="text" id="ssid" name="ssid" maxlength="32" required>
  <label for="senha">Senha do Wi-Fi:</label>
  <input type="password" id="senha" name="senha" maxlength="64">
  <details>
    <summary style="margin-top:14px;cursor:pointer;color:#94a3b8;font-size:14px">Avisos imediatos ao Zabbix (opcional)</summary>
    <p>Quando água, porta ou energia mudam, a placa avisa o Zabbix na hora (push), sem
    esperar a próxima leitura. Já vem preenchido com o IP do PC do Zabbix; só mude se ele trocou.
    Deixe em branco para desligar o push (o Zabbix continua lendo a placa normalmente).</p>
    <label for="zbx_srv">IP do PC com o Zabbix:</label>
    <input type="text" id="zbx_srv" name="zbx_srv" maxlength="64" value="%ZBX_SRV%">
    <label for="zbx_host">Nome do host no Zabbix:</label>
    <input type="text" id="zbx_host" name="zbx_host" maxlength="64" value="%ZBX_HOST%">
  </details>
  <button type="submit">Salvar e reiniciar</button>
</form>
<p>Esta placa: <b>%MAC%</b></p>
</div>
<script>
  // Clicar numa rede da lista preenche o campo "Nome da rede".
  document.querySelectorAll('input[name=escolha]').forEach(function(r){
    r.addEventListener('change',function(){document.getElementById('ssid').value=r.value;
      document.getElementById('senha').focus();});
  });
</script>
</body></html>)rawliteral";

// Página mostrada depois de salvar, antes de reiniciar.
const char PAGINA_SALVO[] PROGMEM = R"rawliteral(<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Salvo</title>
<style>body{font-family:system-ui,sans-serif;background:#0f172a;color:#e2e8f0;padding:24px;text-align:center}
b{color:#38bdf8}</style></head><body>
<h2>✔ Salvo!</h2>
<p>O ESP32 vai reiniciar e entrar na rede <b>%SSID%</b>.</p>
<p>Esta rede "Sala-Servidor" vai sumir. Volte o celular para o Wi-Fi normal da casa.</p>
<p>Se o LED voltar a piscar devagar, a senha estava errada: segure o botão BOOT por 10 s e tente de novo.</p>
</body></html>)rawliteral";
