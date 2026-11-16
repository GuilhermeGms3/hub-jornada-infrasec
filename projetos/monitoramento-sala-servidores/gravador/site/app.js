// =====================================================================
// app.js — lógica do gravador e do Monitor Serial
// ---------------------------------------------------------------------
// Três funções:
//   0. OTA: oferece o arquivo de atualização pela rede para download.
//   1. GRAVAR: baixa o sala-servidor.bin deste servidor e grava no ESP32
//      no endereço 0x0 usando a biblioteca esptool-js (a versão em
//      JavaScript do esptool oficial da Espressif).
//   2. MONITOR SERIAL: abre a porta a 115200 e mostra o que a placa
//      escreve, destacando o IP e o MAC.
//
// A esptool-js vem de um CDN (jsDelivr), em versão FIXA (0.6.1, a mesma
// do M7 Access). Fixar evita que uma versão nova mude a API e quebre a página.
// =====================================================================

import { ESPLoader, Transport } from 'https://cdn.jsdelivr.net/npm/esptool-js@0.6.1/bundle.js';

// Atalho para pegar elementos da página pelo id.
const $ = (id) => document.getElementById(id);

const temWebSerial = 'serial' in navigator;

// O firmware baixado fica guardado aqui (bytes crus).
let firmware = null;

// ---------------------------------------------------------------------
// Registro (log) da gravação
// ---------------------------------------------------------------------
function logGravacao(texto) {
  const caixa = $('log-gravacao');
  caixa.hidden = false;
  caixa.textContent += texto + '\n';
  caixa.scrollTop = caixa.scrollHeight;
}

// ---------------------------------------------------------------------
// 1. Buscar o firmware neste servidor
// ---------------------------------------------------------------------
async function carregarFirmware() {
  const status = $('status-firmware');
  try {
    // A "ficha" (firmware.json) é gerada pelo Dockerfile na compilação.
    const ficha = await (await fetch('firmware/firmware.json', { cache: 'no-store' })).json();
    const resposta = await fetch('firmware/' + ficha.arquivo, { cache: 'no-store' });
    if (!resposta.ok) throw new Error('HTTP ' + resposta.status);
    firmware = new Uint8Array(await resposta.arrayBuffer());

    const kb = (firmware.length / 1024).toFixed(0);
    const quando = new Date(ficha.compilado_em).toLocaleString('pt-BR');
    status.innerHTML = '';
    const ok = document.createElement('span');
    ok.style.color = 'var(--ok)';
    ok.textContent = `✔ Firmware pronto neste servidor: versão ${ficha.versao}, ${kb} KB (compilado em ${quando}). Nada a baixar.`;
    status.appendChild(ok);

    if (firmware.length !== ficha.tamanho) {
      status.appendChild(document.createTextNode(' ⚠ O tamanho não bate com a ficha; recarregue a página.'));
      firmware = null;
    }

    // Arquivo da atualização pela rede: o botão só libera se a ficha trouxer ele.
    if (ficha.ota) {
      $('botao-ota').setAttribute('aria-disabled', 'false');
      $('status-ota').textContent = `Versão ${ficha.versao}, ${(ficha.ota.tamanho / 1024).toFixed(0)} KB.`;
    }
  } catch (e) {
    status.textContent = '✖ Não achei o firmware neste servidor (' + e.message +
      '). Rode: docker compose up -d --build gravador';
    status.style.color = 'var(--erro)';
  }
  $('botao-gravar').disabled = !(firmware && temWebSerial);
}

// ---------------------------------------------------------------------
// 2. Gravar
// ---------------------------------------------------------------------
async function gravar() {
  if (!firmware) return;

  // A porta serial só pode ter UM dono. Se o monitor estiver aberto, fecha.
  await fecharMonitor();

  $('caixa-pronto').hidden = true;
  $('caixa-erro').hidden = true;
  $('log-gravacao').textContent = '';
  $('barra').hidden = true;
  $('barra-progresso').style.width = '0%';

  const botao = $('botao-gravar');
  botao.disabled = true;
  botao.textContent = 'Escolha a porta…';

  let transport = null;
  try {
    // Abre a janelinha do navegador para escolher a porta. Só funciona
    // dentro de um clique do usuário — é a proteção do WebSerial.
    const porta = await navigator.serial.requestPort();

    botao.textContent = 'Conectando…';
    transport = new Transport(porta, false);

    const loader = new ESPLoader({
      transport,
      baudrate: 921600,          // velocidade alta só durante a gravação
      terminal: {                // para onde a biblioteca manda as mensagens
        clean: () => { $('log-gravacao').textContent = ''; },
        writeLine: (d) => logGravacao(d),
        write: (d) => logGravacao(d),
      },
    });

    // main(): reinicia a placa em modo de gravação e identifica o chip.
    const chip = await loader.main();
    logGravacao(`Placa detectada: ${chip}`);
    $('chip-detectado').textContent = chip ? `(${chip})` : '';

    botao.textContent = 'Gravando 0%';
    $('barra').hidden = false;
    logGravacao(`Gravando ${(firmware.length / 1024).toFixed(0)} KB no endereço 0x0…`);

    await loader.writeFlash({
      // Um arquivo só, no endereço zero: o binário já vem mesclado
      // (bootloader + partições + boot_app0 + aplicação).
      fileArray: [{ data: firmware, address: 0x0 }],
      // "keep" = não mexer no cabeçalho. O binário já foi gerado com
      // dio / 40m / 4MB; forçar outros valores aqui é como se grava uma
      // placa que depois não liga.
      flashSize: 'keep',
      flashMode: 'keep',
      flashFreq: 'keep',
      eraseAll: false,
      compress: true,            // manda comprimido: grava bem mais rápido
      reportProgress: (_indice, escrito, total) => {
        const pct = Math.round((escrito / total) * 100);
        $('barra-progresso').style.width = pct + '%';
        botao.textContent = `Gravando ${pct}%`;
      },
    });

    logGravacao('Gravação concluída. Reiniciando a placa…');
    await loader.after();        // "hard reset": a placa liga o firmware novo
    $('caixa-pronto').hidden = false;
  } catch (e) {
    const msg = String(e?.message || e);
    // Fechar a janela de porta sem escolher NÃO é erro: é alguém desistindo.
    if (e?.name === 'NotFoundError' || msg.includes('No port selected')) {
      logGravacao('Nenhuma porta escolhida. Nada foi feito.');
    } else {
      logGravacao('ERRO: ' + msg);
      $('caixa-erro').hidden = false;
    }
  } finally {
    try { await transport?.disconnect(); } catch { /* já estava desconectado */ }
    botao.textContent = 'Gravar no ESP32';
    botao.disabled = !firmware;
  }
}

// ---------------------------------------------------------------------
// 3. Monitor Serial (WebSerial "puro", sem a esptool-js)
// ---------------------------------------------------------------------
let portaMonitor = null;
let leitor = null;
let monitorAberto = false;
let pedaco = '';            // texto que chegou sem a quebra de linha ainda

function logMonitor(texto) {
  const caixa = $('log-monitor');
  caixa.hidden = false;
  caixa.textContent += texto;
  // Guarda só o final (~40 mil caracteres) para a página não ficar pesada.
  if (caixa.textContent.length > 40000) caixa.textContent = caixa.textContent.slice(-30000);
  caixa.scrollTop = caixa.scrollHeight;
}

// Procura "IP x.x.x.x" e "MAC AA:BB:..." nas linhas que a placa escreve.
function procurarIpMac(linha) {
  const ip = linha.match(/IP:? (\d{1,3}(?:\.\d{1,3}){3})/);
  const mac = linha.match(/MAC:? ([0-9A-F]{2}(?::[0-9A-F]{2}){5})/i);
  if (ip || mac) $('descoberta').hidden = false;
  if (ip) $('ip-visto').textContent = ip[1];
  if (mac) $('mac-visto').textContent = mac[1].toUpperCase();
}

async function abrirMonitor() {
  try {
    portaMonitor = await navigator.serial.requestPort();
    await portaMonitor.open({ baudRate: 115200 });

    // Na placa, os sinais DTR e RTS da porta estão ligados nos pinos de
    // BOOT e RESET (é assim que o gravador reinicia a placa sozinho).
    // Deixamos os dois "soltos" para a placa rodar normalmente.
    await portaMonitor.setSignals({ dataTerminalReady: false, requestToSend: false });

    monitorAberto = true;
    $('botao-monitor').textContent = 'Fechar Monitor Serial';
    $('botao-reiniciar').disabled = false;
    logMonitor('--- Monitor aberto (115200). Aperte "Reiniciar a placa" para ver desde o início. ---\n');
    lerMonitor();
  } catch (e) {
    if (e?.name === 'NotFoundError') return;   // janela cancelada: tudo bem
    logMonitor('ERRO ao abrir a porta: ' + (e?.message || e) +
      '\n(Se estiver em uso, feche o outro programa ou termine a gravação.)\n');
    portaMonitor = null;
  }
}

async function lerMonitor() {
  const decodificador = new TextDecoder();
  while (monitorAberto && portaMonitor?.readable) {
    leitor = portaMonitor.readable.getReader();
    try {
      for (;;) {
        const { value, done } = await leitor.read();
        if (done) break;
        const texto = decodificador.decode(value, { stream: true });
        logMonitor(texto);
        // Junta os pedaços até formar linhas completas, para achar IP/MAC.
        pedaco += texto;
        const linhas = pedaco.split('\n');
        pedaco = linhas.pop();
        linhas.forEach(procurarIpMac);
      }
    } catch (e) {
      // Erros de leitura acontecem quando a placa reinicia ou o cabo sai.
      if (monitorAberto) logMonitor('\n[leitura interrompida: ' + (e?.message || e) + ']\n');
    } finally {
      leitor.releaseLock();
      leitor = null;
    }
  }
}

async function fecharMonitor() {
  if (!portaMonitor) return;
  monitorAberto = false;
  try { await leitor?.cancel(); } catch { /* ok */ }
  try { await portaMonitor.close(); } catch { /* ok */ }
  portaMonitor = null;
  $('botao-monitor').textContent = 'Abrir Monitor Serial';
  $('botao-reiniciar').disabled = true;
  logMonitor('\n--- Monitor fechado ---\n');
}

// "Aperta" o RESET da placa pelo cabo: liga o RTS (que puxa o pino EN
// para baixo) por 100 ms e solta. O DTR fica solto para NÃO entrar no
// modo de gravação.
async function reiniciarPlaca() {
  if (!portaMonitor) return;
  await portaMonitor.setSignals({ dataTerminalReady: false, requestToSend: true });
  await new Promise((r) => setTimeout(r, 100));
  await portaMonitor.setSignals({ dataTerminalReady: false, requestToSend: false });
  logMonitor('\n--- Placa reiniciada ---\n');
}

// ---------------------------------------------------------------------
// Início
// ---------------------------------------------------------------------
if (!temWebSerial) {
  $('sem-webserial').hidden = false;
  $('botao-monitor').disabled = true;
}

$('botao-gravar').addEventListener('click', gravar);
$('botao-monitor').addEventListener('click', () => (monitorAberto ? fecharMonitor() : abrirMonitor()));
$('botao-reiniciar').addEventListener('click', reiniciarPlaca);
$('botao-limpar').addEventListener('click', () => { $('log-monitor').textContent = ''; });

// Se o cabo for arrancado com o monitor aberto, fecha direitinho.
if (temWebSerial) {
  navigator.serial.addEventListener('disconnect', (ev) => {
    if (ev.target === portaMonitor) fecharMonitor();
  });
}

carregarFirmware();
