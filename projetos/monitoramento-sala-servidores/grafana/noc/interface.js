// =====================================================================
// interface.js — o HTML da central: topo, colunas, gaveta do servidor
// ---------------------------------------------------------------------
// Estilo: o de uma ferramenta de operação (pense Grafana/Zabbix), não de
// filme. Texto normal, números em fonte monoespaçada, cor só para estado.
// Barras e gráficos são SVG/HTML simples feitos aqui mesmo.
//
// Fluxo: noc.js busca os dados → ui.atualizar(retrato) → cada "render…"
// redesenha a sua parte (só se o conteúdo mudou).
// =====================================================================

// Mesmos limites dos gatilhos do Zabbix ({$TEMP.ATENCAO} e {$TEMP.ALTA}).
const LIM_ATENCAO = 28, LIM_ALTA = 32;
function nivelTemperatura(t) {
  if (t === null || t === undefined) return 'neutro';
  return t >= LIM_ALTA ? 'alerta' : t >= LIM_ATENCAO ? 'atencao' : 'ok';
}

const SEVERIDADES = [
  { nome: 'Não classificado', cor: '#8e8e8e' }, { nome: 'Informação', cor: '#5794f2' }, { nome: 'Atenção', cor: '#fade2a' },
  { nome: 'Média', cor: '#ff9830' }, { nome: 'Alta', cor: '#f2495c' }, { nome: 'Desastre', cor: '#c4162a' },
];
const COR = { ok: '#73bf69', atencao: '#ff9830', alerta: '#f2495c', neutro: '#6e7681', info: '#5794f2' };

// ---------------------------------------------------------------------
// Ícones de traço fino (no lugar dos emojis)
// ---------------------------------------------------------------------
// Emoji colorido muda de cara em cada sistema (Windows, Android...) e briga
// com o resto da tela. Estes são desenhos de linha, de uma cor só: pegam a
// cor do texto em volta (currentColor), então ficam cinza no normal e
// vermelhos quando o estado é de alerta, sem precisar de outra versão.
const ICONES = {
  termometro: '<path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0Z"/><path d="M12 11v6"/>',
  gota: '<path d="M12 3.5s6 6.4 6 10.5a6 6 0 0 1-12 0c0-4.1 6-10.5 6-10.5Z"/>',
  raio: '<path d="M13 3 5 13.5h6l-1 7.5 8-10.5h-6l1-7.5Z"/>',
  piso: '<path d="M3 20h18"/><path d="M12 4s4 4.3 4 7a4 4 0 0 1-8 0c0-2.7 4-7 4-7Z"/><path d="M5 16.5c1.2 0 1.2 1 2.4 1s1.2-1 2.4-1"/><path d="M14.2 16.5c1.2 0 1.2 1 2.4 1s1.2-1 2.4-1"/>',
  porta: '<path d="M4 21h16"/><path d="M6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17"/><path d="M14.5 12h.01"/>',
  sensor: '<rect x="6" y="6" width="12" height="12" rx="1.5"/><path d="M9 2.5V6M15 2.5V6M9 18v3.5M15 18v3.5M2.5 9H6M2.5 15H6M18 9h3.5M18 15h3.5"/>',
  servidor: '<rect x="3.5" y="3.5" width="17" height="7" rx="1.2"/><rect x="3.5" y="13.5" width="17" height="7" rx="1.2"/><path d="M7 7h.01M7 17h.01M11 7h6M11 17h6"/>',
  aviso: '<path d="M12 3.5 2.5 20h19L12 3.5Z"/><path d="M12 10v4.5M12 17.2h.01"/>',
  lista: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  grafico: '<path d="M3.5 20.5h17"/><path d="m5 16 4.5-5 3.5 3 6-7"/>',
  sala: '<path d="M3 21V8l9-5 9 5v13"/><path d="M8 21v-8h8v8"/><path d="M8 17h8"/>',
  banco: '<ellipse cx="12" cy="5.5" rx="7.5" ry="2.8"/><path d="M4.5 5.5v13c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8v-13"/><path d="M4.5 12c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8"/>',
  app: '<rect x="3.5" y="4.5" width="17" height="15" rx="1.5"/><path d="M3.5 8.5h17"/><path d="m9 12.5-2 2 2 2M15 12.5l2 2-2 2"/>',
  proxy: '<path d="M4 8h13l-3-3M20 16H7l3 3"/>',
  container: '<path d="M12 3 20.5 7.5v9L12 21l-8.5-4.5v-9L12 3Z"/><path d="M3.5 7.5 12 12l8.5-4.5M12 12v9"/>',
  // Monograma da Nertysoft (quem fez a central): um "N" num quadrado arredondado.
  nertysoft: '<rect x="2.5" y="2.5" width="19" height="19" rx="5"/><path d="M8.5 16.5v-9l7 9v-9"/>',
  // Ações da central: reconhecer (visto), comentar (balão), manutenção (chave).
  visto: '<path d="m4.5 12.5 4.5 4.5 10.5-10.5"/>',
  nota: '<path d="M4 5.5h16v10H10l-4.5 3.5v-3.5H4z"/><path d="M8 9.5h8M8 12.5h5"/>',
  chave: '<path d="M14.5 3.5a5 5 0 0 0-4.6 6.9L3.5 16.8l3.7 3.7 6.4-6.4a5 5 0 0 0 6.6-6.3l-3 3-2.8-.7-.7-2.8 3-3a5 5 0 0 0-2.2-.8Z"/>',
  reiniciar: '<path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 4v4.5h-4.5"/>',
  cortar: '<path d="M9 7.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM9 16.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"/><path d="m8.2 9.2 11.3 9.3M8.2 14.8l11.3-9.3"/>',
  alvo: '<circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="2.5"/><path d="M12 1.5v4M12 18.5v4M1.5 12h4M18.5 12h4"/>',
};
const icone = (nome, extra = '') => `<svg class="ico${extra ? ' ' + extra : ''}" viewBox="0 0 24 24" aria-hidden="true">${ICONES[nome]}</svg>`;

// ---------------------------------------------------------------------
// Formatação
// ---------------------------------------------------------------------
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (n, casas = 0) => (n === null || n === undefined || Number.isNaN(n) ? '–'
  : Number(n).toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas }));

function duracao(seg) {
  if (seg === null || seg === undefined) return '–';
  seg = Math.max(0, Math.floor(seg));
  const d = Math.floor(seg / 86400), h = Math.floor((seg % 86400) / 3600), m = Math.floor((seg % 3600) / 60);
  if (d) return `${d}d ${h}h`;
  if (h) return `${h}h ${m}m`;
  if (m) return `${m}m`;
  return `${seg}s`;
}
const ha = (clockSeg) => duracao(Date.now() / 1000 - clockSeg);
const hora = (clockSeg) => new Date(clockSeg * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
const horaSeg = (clockSeg) => new Date(clockSeg * 1000).toLocaleTimeString('pt-BR');

function bits(v) {
  if (v === null || v === undefined) return '–';
  const u = ['bps', 'Kbps', 'Mbps', 'Gbps'];
  let i = 0;
  while (v >= 1000 && i < u.length - 1) { v /= 1000; i++; }
  return `${fmt(v, v < 10 && i ? 1 : 0)} ${u[i]}`;
}
const corPercentual = (p) => (p === null ? COR.neutro : p >= 90 ? COR.alerta : p >= 75 ? COR.atencao : COR.ok);

// ---------------------------------------------------------------------
// Desenhos
// ---------------------------------------------------------------------

// Linha fina (sparkline). Sem preenchimento chamativo: só a linha.
export function sparkline(pontos, { cor = COR.info, min = null, max = null, altura = 32, largura = 240 } = {}) {
  if (!pontos || pontos.length < 2) {
    return `<svg class="spark" viewBox="0 0 ${largura} ${altura}" preserveAspectRatio="none"></svg>`;
  }
  const xs = pontos.map((p) => p[0]), ys = pontos.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs);
  let y0 = min ?? Math.min(...ys), y1 = max ?? Math.max(...ys);
  const folga = Math.max((y1 - y0) * 0.15, (Math.abs(y1) || 1) * 0.04);
  if (min === null) y0 -= folga;
  if (max === null) y1 += folga;
  const px = (x) => ((x - x0) / (x1 - x0 || 1)) * largura;
  const py = (y) => altura - 2 - ((y - y0) / (y1 - y0)) * (altura - 4);
  const d = pontos.map((p, i) => `${i ? 'L' : 'M'}${px(p[0]).toFixed(1)},${py(p[1]).toFixed(1)}`).join('');
  return `<svg class="spark" viewBox="0 0 ${largura} ${altura}" preserveAspectRatio="none">
    <path d="${d}L${largura},${altura}L0,${altura}Z" fill="${cor}" fill-opacity=".08"/>
    <path d="${d}" fill="none" stroke="${cor}" stroke-width="1.3" vector-effect="non-scaling-stroke"/>
  </svg>`;
}

// Régua de temperatura: faixa 15–40 °C com as zonas de atenção e alta marcadas.
function reguaTemperatura(t) {
  const pos = (v) => ((Math.max(15, Math.min(40, v)) - 15) / 25) * 100;
  const marcador = t === null ? '' : `<i class="marcador" style="left:${pos(t)}%"></i>`;
  return `<div class="regua">
    <span class="zona" style="left:${pos(LIM_ATENCAO)}%;width:${pos(LIM_ALTA) - pos(LIM_ATENCAO)}%;background:${COR.atencao}"></span>
    <span class="zona" style="left:${pos(LIM_ALTA)}%;width:${100 - pos(LIM_ALTA)}%;background:${COR.alerta}"></span>
    ${marcador}
  </div>
  <div class="regua-rotulos"><span>15</span><span style="left:${pos(LIM_ATENCAO)}%">${LIM_ATENCAO}</span><span style="left:${pos(LIM_ALTA)}%">${LIM_ALTA}</span><span>40 °C</span></div>`;
}

function barra(rotulo, p, extra = '') {
  const cor = corPercentual(p);
  return `<div class="barra-linha"><span>${esc(rotulo)}</span><b style="color:${p === null ? COR.neutro : 'inherit'}">${p === null ? '–' : fmt(p, 0) + ' %'}</b>
    <div class="trilho"><i style="width:${p === null ? 0 : Math.min(100, p)}%;background:${cor}"></i></div>${extra ? `<small>${esc(extra)}</small>` : ''}</div>`;
}

// Gráfico da sala: temperatura (eixo da esquerda) e umidade (direita), 30 min.
function graficoAmbiente(temp, umid, largura, altura) {
  const pl = 30, pr = 32, pt = 6, pb = 16;
  const w = Math.max(100, largura - pl - pr), h = Math.max(40, altura - pt - pb);
  const agora = Date.now() / 1000, x0 = agora - 30 * 60;
  const px = (x) => pl + ((x - x0) / (agora - x0)) * w;
  const pyT = (v) => pt + h - ((Math.max(15, Math.min(40, v)) - 15) / 25) * h;
  const pyU = (v) => pt + h - (Math.max(0, Math.min(100, v)) / 100) * h;
  const caminho = (pts, py) => pts.filter((p) => p[0] >= x0).map((p, i) => `${i ? 'L' : 'M'}${px(p[0]).toFixed(1)},${py(p[1]).toFixed(1)}`).join('');
  const txt = (x, y, s, anc = 'end', cor = '#7d8590') => `<text x="${x}" y="${y}" text-anchor="${anc}" fill="${cor}" font-size="10">${s}</text>`;
  let g = '';
  for (let v = 15; v <= 40; v += 5) g += `<line x1="${pl}" y1="${pyT(v)}" x2="${pl + w}" y2="${pyT(v)}" stroke="#2a2e35"/>${txt(pl - 5, pyT(v) + 3, v + '°')}`;
  for (let v = 0; v <= 100; v += 50) g += txt(pl + w + 5, pyU(v) + 3, v + '%', 'start', '#5b7aa3');
  for (let m = 0; m <= 30; m += 10) g += txt(px(x0 + m * 60), altura - 3, m === 30 ? 'agora' : `−${30 - m} min`, 'middle');
  g += `<line x1="${pl}" y1="${pyT(LIM_ATENCAO)}" x2="${pl + w}" y2="${pyT(LIM_ATENCAO)}" stroke="${COR.atencao}" stroke-opacity=".55" stroke-dasharray="3 3"/>
        <line x1="${pl}" y1="${pyT(LIM_ALTA)}" x2="${pl + w}" y2="${pyT(LIM_ALTA)}" stroke="${COR.alerta}" stroke-opacity=".6" stroke-dasharray="3 3"/>`;
  const dT = caminho(temp || [], pyT), dU = caminho(umid || [], pyU);
  return `<svg viewBox="0 0 ${largura} ${altura}" preserveAspectRatio="none" font-family="Inter, Segoe UI, sans-serif">
    ${g}
    ${dU ? `<path d="${dU}" fill="none" stroke="#5794f2" stroke-width="1.2" stroke-opacity=".7"/>` : ''}
    ${dT ? `<path d="${dT}" fill="none" stroke="#ff9830" stroke-width="1.6"/>` : txt(pl + w / 2, pt + h / 2, 'Sem histórico ainda', 'middle')}
  </svg>`;
}

// Cartão de um componente na gaveta (o que o servidor roda).
const ESTADO_COMP = { ok: ['Normal', 'ok'], atencao: ['Atenção', 'atencao'], alerta: ['Alerta', 'alerta'], parado: ['Parado', 'neutro'] };
// O que dá para CORRIGIR em cada tipo de componente (botões da fase 2).
// O mesmo botão vale para qualquer servidor: o Zabbix roda a "receita" do
// próprio servidor (Docker no SRV-02, gunicorn/vigia no SRV-01).
export const CORRECAO = {
  app: { acao: 'reiniciar-app', rotulo: 'Reiniciar aplicação', icone: 'reiniciar' },
  banco: { acao: 'encerrar-ociosas', rotulo: 'Encerrar conexões ociosas', icone: 'cortar' },
};

function cartaoComponente(c, hist, botoes = '') {
  const [rotulo, classe] = ESTADO_COMP[c.estado] || ESTADO_COMP.ok;
  const linhas = [];
  const add = (nome, valor) => { if (valor !== null && valor !== undefined && valor !== '') linhas.push(`<dt>${nome}</dt><dd>${valor}</dd>`); };
  let grafico = '';
  if (c.tipo === 'app' && c.rps !== undefined) {
    add('Requisições', `${fmt(c.rps, 1)}/s`);
    add('Latência p95', `${fmt(c.p95, 0)} ms`);
    add('Erros', `${fmt(c.erros, 1)} %`);
    add('Pedidos (total)', fmt(c.pedidos));
    add('CPU do processo', `${fmt(c.cpuApp, 1)} %`);
    add('Memória do processo', `${fmt(c.memoriaApp, 0)} MB`);
    add('Acesso ao banco', c.bancoOk === 0 ? '<span style="color:var(--alerta)">sem acesso</span>' : 'ok');
    if (c.falha && c.falha !== 'nenhuma') add('Cenário ligado', `<span style="color:var(--atencao)">${esc(c.falha)}</span>`);
    grafico = `<div class="graf"><div class="t"><span>Requisições/s, 30 min</span><span>${fmt(c.rps, 1)}</span></div>${sparkline(hist(c.ids?.rps), { cor: COR.info, min: 0, altura: 38 })}</div>
      <div class="graf"><div class="t"><span>Latência p95, 30 min</span><span>${fmt(c.p95, 0)} ms</span></div>${sparkline(hist(c.ids?.p95), { cor: COR.atencao, min: 0, altura: 38 })}</div>`;
  }
  if (c.tipo === 'banco' && c.conexoes !== undefined) {
    add('Versão', esc(c.versao));
    add('Conexões', `${fmt(c.conexoes)} (${fmt(c.conexoesPct, 0)} % do máximo)`);
    add('Ativas / ociosas', `${fmt(c.ativas)} / ${fmt(c.ociosas)}`);
    add('Tamanho do banco', c.tamanhoMb !== null ? `${fmt(c.tamanhoMb, 1)} MB` : null);
    add('Commits', c.commits !== null ? `${fmt(c.commits, 1)}/s` : null);
    add('Acerto de cache', c.cache !== null ? `${fmt(c.cache, 1)} %` : null);
    add('Bloqueios (locks)', fmt(c.locks));
    grafico = `<div class="graf"><div class="t"><span>Conexões, 30 min</span><span>${fmt(c.conexoes)}</span></div>${sparkline(hist(c.ids?.conexoes), { cor: '#b877d9', min: 0, altura: 38 })}</div>`;
  }
  if (c.tipo === 'proxy' && c.reqSeg !== undefined) {
    add('Requisições', `${fmt(c.reqSeg, 1)}/s`);
    add('Conexões ativas', fmt(c.conexoesAtivas));
  }
  if (c.container) {
    add('Container', esc(c.status || '–'));
    add('CPU do container', `${fmt(c.cpu, 1)} %`);
    add('Memória do container', `${fmt(c.memoriaMb, 0)} MB`);
    add('Reinícios', c.reinicios ? `<span style="color:var(--atencao)">${fmt(c.reinicios)}</span>` : fmt(c.reinicios));
    if (!grafico) grafico = `<div class="graf"><div class="t"><span>CPU do container, 30 min</span><span>${fmt(c.cpu, 1)} %</span></div>${sparkline(hist(c.ids?.cpu), { cor: COR.info, min: 0, altura: 38 })}</div>`;
  }
  const icone_ = { banco: 'banco', proxy: 'proxy', app: 'app' }[c.tipo];
  return `<div class="comp" data-comp="${esc(c.id)}">
    <div class="comp-cab">${icone(icone_)}<b>${esc(c.nome)}</b>${c.container ? `<span class="selo">${icone('container')}container</span>` : ''}
      <span class="comp-estado ${classe}"><i></i>${rotulo}</span></div>
    <dl class="ficha">${linhas.join('')}</dl>
    ${grafico}
    ${(c.problemas || []).map((n) => `<div class="comp-prob">${icone('aviso')}${esc(n)}</div>`).join('')}
    ${botoes}
  </div>`;
}

// =====================================================================
// MONTAGEM DO HTML (uma vez)
// =====================================================================
export function criarInterface(raiz, eventos) {
  raiz.innerHTML = `
  <div class="noc">
    <header class="noc-topo">
      <div class="marca" title="Central feita pela Nertysoft">${icone('nertysoft', 'logo')}<b>Nertysoft</b></div>
      <h1>Central de monitoramento<span>Sala de servidores</span></h1>
      <div class="status-geral neutro" data-id="status"></div>
      <div class="contadores" data-id="contadores"></div>
      <div class="relogio"><b data-id="hora">--:--:--</b><span data-id="data"></span></div>
    </header>

    <aside class="noc-esq">
      <section class="cartao" data-sensor="temperatura">
        <h2>${icone('termometro')}Temperatura <span class="extra" data-id="dht"></span></h2>
        <div class="leitura"><b data-id="t-valor">–</b><span>°C</span></div>
        <div data-id="regua"></div>
        <div class="mini-dados"><span>mín. 30 min <b data-id="t-min">–</b></span><span>máx. 30 min <b data-id="t-max">–</b></span></div>
        <div data-id="t-spark"></div>
      </section>

      <section class="cartao" data-sensor="umidade">
        <h2>${icone('gota')}Umidade relativa</h2>
        <div class="leitura"><b data-id="u-valor">–</b><span>%</span></div>
        <div class="trilho largo"><i data-id="u-barra" style="width:0"></i></div>
        <div data-id="u-spark"></div>
      </section>

      <section class="cartao">
        <h2>${icone('sala')}Estado da sala</h2>
        <div class="estados">
          <div class="estado" data-sensor="energia">${icone('raio')}<span>Energia elétrica</span><b data-id="e-estado">–</b><small data-id="e-bruto"></small></div>
          <div class="estado" data-sensor="agua">${icone('piso')}<span>Vazamento no piso</span><b data-id="a-estado">–</b><small data-id="a-bruto"></small></div>
          <div class="estado" data-sensor="porta">${icone('porta')}<span>Porta</span><b data-id="p-estado">–</b><small data-id="p-bruto"></small></div>
        </div>
      </section>

      <section class="cartao preenche">
        <h2>${icone('sensor')}Sensor ambiental</h2>
        <dl class="ficha" data-id="esp"></dl>
      </section>
    </aside>

    <main class="noc-centro">
      <div class="palco">
        <div class="noc3d" data-id="cena"></div>
        <div class="hud cd" data-id="hud-leitura"></div>
        <div class="hud rd">Arraste para girar · botão direito move · roda aproxima · duplo clique volta</div>
      </div>
      <section class="cartao grafico">
        <h2>${icone('grafico')}Temperatura e umidade — últimos 30 min
          <span class="extra legenda"><span><i style="background:#ff9830"></i>Temperatura</span><span><i style="background:#5794f2"></i>Umidade</span></span>
        </h2>
        <div data-id="grafico" class="area-grafico"></div>
      </section>
    </main>

    <aside class="noc-dir">
      <section class="cartao">
        <h2>${icone('servidor')}Servidores <span class="extra" data-id="srv-resumo"></span></h2>
        <div class="lista-srv" data-id="servidores"></div>
      </section>
      <section class="cartao lista-problemas">
        <h2>${icone('aviso')}Problemas <span class="extra" data-id="al-resumo"></span></h2>
        <div class="alertas" data-id="alertas"></div>
      </section>
      <section class="cartao preenche">
        <h2>${icone('lista')}Eventos <span class="extra" data-id="ev-resumo">últimas 6 h</span></h2>
        <div class="tempo" data-id="eventos"></div>
      </section>
    </aside>

    <div class="gaveta" data-id="gaveta"></div>
    <div class="aviso-erro" data-id="erro"></div>
    <div class="dialogo" data-id="dialogo" hidden></div>
    <div class="recado" data-id="recado"></div>
  </div>`;

  const $ = (id) => raiz.querySelector(`[data-id="${id}"]`);
  const noc = raiz.querySelector('.noc');
  // Só troca o HTML se ele mudou. Trocar à toa a cada 5 s apaga o elemento
  // que está sob o mouse, e um clique feito bem nessa hora se perde.
  const html = (el, conteudo) => { if (el.__html !== conteudo) { el.__html = conteudo; el.innerHTML = conteudo; } };
  let ultimo = null, historico = {}, historicoSrv = {}, selecionado = null;
  // Ações: só aparecem se o serviço "acoes" respondeu que você é Editor/Admin.
  // "aberto" = o problema clicado por último (mostra os botões dele).
  let podeAgir = false, aberto = null, manut = {};

  // "pointerdown" reage ao apertar o botão (não espera soltar).
  $('servidores').addEventListener('pointerdown', (ev) => {
    const item = ev.target.closest('[data-srv]');
    if (item) eventos.aoSelecionar(item.dataset.srv === selecionado ? null : item.dataset.srv);
  });
  $('gaveta').addEventListener('pointerdown', (ev) => { if (ev.target.closest('.fechar')) eventos.aoSelecionar(null); });
  // Clicar num alerta (Problemas, Eventos ou na gaveta) leva ao LUGAR dele na
  // sala 3D. data-alerta = "p:<id>" (problema ativo) ou "e:<id>" (evento).
  for (const area of ['alertas', 'eventos', 'gaveta']) {
    $(area).addEventListener('pointerdown', (ev) => {
      const item = ev.target.closest('[data-alerta]');
      if (!item || !ultimo || ev.target.closest('[data-acao]')) return;
      const [tipo, id] = item.dataset.alerta.split(':');
      const alerta = (tipo === 'p' ? ultimo.problemas : ultimo.eventos).find((x) => x.id === id);
      if (!alerta) return;
      if (tipo === 'p') { aberto = aberto === id ? null : id; renderAlertas(ultimo.problemas); if (selecionado) renderGaveta(); }
      eventos.aoClicarAlerta?.(alerta);
    });
  }
  // Botões de ação (em qualquer lugar da central): data-acao + data-alvo.
  noc.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-acao]');
    if (b && !b.disabled) eventos.aoAgir?.(b.dataset.acao, b.dataset.alvo);
  });

  function relogio() {
    const d = new Date();
    $('hora').textContent = d.toLocaleTimeString('pt-BR');
    $('data').textContent = d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  }
  relogio();

  function atualizar(r) {
    ultimo = r;
    $('erro').classList.remove('on');
    renderTopo(r);
    renderAmbiente(r.ambiente);
    renderServidores(r.servidores);
    renderAlertas(r.problemas);
    renderEventos(r.eventos);
    if (selecionado) renderGaveta();
  }

  function renderTopo(r) {
    // Alerta de servidor em manutenção não conta: foi silenciado de propósito.
    const ativos = r.problemas.filter((p) => !p.suprimido);
    const silenciados = r.problemas.length - ativos.length;
    const pior = ativos.reduce((m, p) => Math.max(m, p.severidade), -1);
    const amb = r.ambiente;
    let classe = 'ok', texto = 'Sem problemas';
    if (pior >= 0) { classe = pior >= 4 ? 'alerta' : 'atencao'; texto = `${ativos.length} problema${ativos.length > 1 ? 's' : ''} · ${SEVERIDADES[pior].nome.toLowerCase()}`; }
    else if (!amb.online) { classe = 'neutro'; texto = 'Sensor sem resposta'; }
    const st = $('status');
    st.className = 'status-geral ' + classe;
    // Os silenciados só aparecem na dica (o topo não tem espaço sobrando).
    st.title = silenciados ? `Mais ${silenciados} em servidor em manutenção (silenciado)` : '';
    html(st, `<i></i>${esc(texto)}`);

    html($('contadores'), [5, 4, 3, 2, 1].map((s) => {
      const n = ativos.filter((p) => p.severidade === s).length;
      return `<span class="${n ? 'ativo' : ''}" style="--cor:${SEVERIDADES[s].cor}" title="${SEVERIDADES[s].nome}"><b>${n}</b>${SEVERIDADES[s].nome}</span>`;
    }).join(''));
    $('hud-leitura').textContent = amb.idade === null ? 'Aguardando leitura do sensor'
      : `Última leitura do sensor: ${horaSeg(Date.now() / 1000 - amb.idade)}${amb.online ? '' : ' (sem resposta)'}`;
  }

  function renderAmbiente(a) {
    const on = a.online;
    const t = on ? a.temperatura : null;
    const tv = $('t-valor');
    tv.textContent = fmt(t, 1);
    tv.style.color = t === null ? COR.neutro : nivelTemperatura(t) === 'ok' ? '' : COR[nivelTemperatura(t)];
    html($('regua'), reguaTemperatura(t));
    html($('dht'), !on ? 'sem leitura' : a.dhtOk === 0 ? '<span style="color:var(--atencao)">falha no DHT11</span>' : 'DHT11');

    const u = on ? a.umidade : null;
    $('u-valor').textContent = fmt(u, 0);
    $('u-barra').style.width = u === null ? '0' : Math.min(100, u) + '%';

    estado('energia', 'e', on, a.energia, (v) => v === 1, ['Normal', 'Sem energia'],
      // Sem sensor instalado o número do pino é só ruído, então a tela diz isso.
      !on ? '' : a.energiaInstalada === 0 ? 'Sem sensor' : a.energiaRaw !== null ? `ADC ${a.energiaRaw}` : '');
    estado('agua', 'a', on, a.agua, (v) => v === 0, ['Seco', 'Água detectada'], a.aguaRaw !== null && on ? `ADC ${a.aguaRaw}` : '');
    estado('porta', 'p', on, a.porta, (v) => v === 0, ['Fechada', 'Aberta'], '');

    html($('esp'), `
      <dt>Estado</dt><dd style="color:${on ? COR.ok : a.configurado ? COR.alerta : COR.neutro}">${on ? 'Online' : a.configurado ? 'Sem resposta' : 'Não configurado'}</dd>
      <dt>Última leitura</dt><dd>${a.idade === null ? '–' : 'há ' + duracao(a.idade)}</dd>
      <dt>Sinal Wi-Fi</dt><dd>${a.rssi === null ? '–' : fmt(a.rssi) + ' dBm'}</dd>
      <dt>Ligado há</dt><dd>${duracao(a.uptime)}</dd>
      <dt>Firmware</dt><dd>${esc(a.versao || '–')}</dd>
      ${a.erro ? `<dt>Erro</dt><dd style="color:var(--alerta);white-space:normal">${esc(a.erro).slice(0, 80)}</dd>` : ''}`);
    renderHistoricoAmbiente();
  }

  function estado(sensor, p, online, valor, ehBom, textos, detalhe) {
    const el = raiz.querySelector(`[data-sensor="${sensor}"]`);
    const sem = !online || valor === null || valor === undefined;
    const bom = !sem && ehBom(valor);
    el.className = 'estado ' + (sem ? 'neutro' : bom ? 'ok' : 'alerta');
    $(`${p}-estado`).textContent = sem ? 'sem leitura' : bom ? textos[0] : textos[1];
    $(`${p}-bruto`).textContent = detalhe;
  }

  function renderHistoricoAmbiente() {
    const ids = ultimo?.idsAmbiente || {};
    const temp = historico[ids.temperatura], umid = historico[ids.umidade];
    if (temp?.length) {
      const vs = temp.map((p) => p[1]);
      $('t-min').textContent = fmt(Math.min(...vs), 1);
      $('t-max').textContent = fmt(Math.max(...vs), 1);
    }
    html($('t-spark'), sparkline(temp, { cor: '#ff9830' }));
    html($('u-spark'), sparkline(umid, { cor: '#5794f2', min: 0, max: 100 }));
    const caixa = $('grafico');
    caixa.innerHTML = graficoAmbiente(temp, umid, caixa.clientWidth || 800, caixa.clientHeight || 110);
  }

  function renderServidores(lista) {
    const ok = lista.filter((s) => s.estado === 'ok').length;
    $('srv-resumo').textContent = lista.length ? `${ok} de ${lista.length} ok` : '';
    if (!lista.length) { html($('servidores'), '<div class="vazio">Nenhum servidor com agente neste grupo.</div>'); return; }
    html($('servidores'), lista.map((s) => {
      const cor = { ok: COR.ok, atencao: COR.atencao, critico: COR.alerta }[s.estado] || COR.neutro;
      const ping = s.ping === 0 ? '<span style="color:var(--alerta)">sem ping</span>'
        : s.latenciaMs !== null ? `${fmt(s.latenciaMs, s.latenciaMs < 10 ? 1 : 0)} ms` : '–';
      return `<div class="srv ${s.id === selecionado ? 'sel' : ''}" data-srv="${esc(s.id)}">
        <i style="background:${cor}"></i>
        <span class="nome">${esc(s.nome)}${s.manutencao ? `<span class="selo" title="Em manutenção: alertas suprimidos">${icone('chave', 'mini')}manutenção</span>` : ''}</span><span class="dir">${ping}</span>
        <span class="sub">${esc(s.endereco)} · ${esc(s.sistema)}</span><span class="dir sub">up ${duracao(s.uptime)}</span>
        <div class="barras">${barra('CPU', s.cpu)}${barra('Memória', s.memoria)}</div>
      </div>`;
    }).join(''));
  }

  // Um problema na lista. Clicado ("aberto"), mostra a última anotação e os
  // botões Reconhecer/Comentar (se você pode agir).
  function itemProblema(p, { comHost = true } = {}) {
    const s = SEVERIDADES[p.severidade];
    const estado = [
      p.reconhecido ? `${icone('visto', 'mini')}${esc(p.reconhecidoPor || 'reconhecido')}` : '',
      p.suprimido ? `${icone('chave', 'mini')}em manutenção` : '',
    ].filter(Boolean).join(' · ');
    const abertoAqui = aberto === p.id;
    const nota = p.ultimaNota;
    // Alerta da aplicação ou do banco: oferece a correção ali mesmo.
    const comp = ultimo?.servidores.find((x) => x.id === p.servidorId)?.componentes.find((c) => c.id === p.componente);
    const corr = comp && CORRECAO[comp.tipo];
    return `<div class="alerta-item clicavel${p.severidade >= 4 && !p.reconhecido ? ' grave' : ''}${p.reconhecido ? ' visto' : ''}${abertoAqui ? ' aberto' : ''}" style="--cor:${s.cor}" data-alerta="p:${p.id}" title="Mostrar na sala">
        <span class="titulo">${esc(p.nome)}</span><span class="sev">${s.nome}${icone('alvo', 'localizar')}</span>
        <span class="sub">${comHost ? esc(p.host) + ' · ' : ''}desde ${hora(p.inicio)} (${ha(p.inicio)})${estado ? ` · <span class="estado-ack">${estado}</span>` : ''}</span>
        ${abertoAqui && nota ? `<span class="nota">${icone('nota', 'mini')}<b>${esc(nota.quem)}</b>, ${hora(nota.quando)}: ${esc(nota.texto)}</span>` : ''}
        ${abertoAqui && podeAgir ? `<span class="botoes-item">
          ${p.reconhecido ? '' : `<button class="botao" data-acao="reconhecer" data-alvo="${esc(p.id)}">${icone('visto')}Reconhecer</button>`}
          <button class="botao" data-acao="comentar" data-alvo="${esc(p.id)}">${icone('nota')}Comentar</button>
          ${corr ? `<button class="botao corrige" data-acao="${corr.acao}" data-alvo="${esc(p.servidorId)}:${esc(p.id)}">${icone(corr.icone)}${corr.rotulo}</button>` : ''}</span>` : ''}
      </div>`;
  }

  function renderAlertas(problemas) {
    $('al-resumo').textContent = problemas.length ? String(problemas.length) : '';
    if (!problemas.length) { aberto = null; html($('alertas'), '<div class="vazio">Nenhum problema ativo.</div>'); return; }
    if (aberto && !problemas.some((p) => p.id === aberto)) aberto = null;   // resolveu: fecha
    // Reconhecidos descem: o que ainda não tem dono fica no topo.
    html($('alertas'), [...problemas].sort((a, b) => a.reconhecido - b.reconhecido || b.severidade - a.severidade || b.inicio - a.inicio)
      .map((p) => itemProblema(p)).join(''));
  }

  function renderEventos(lista) {
    totalEventos = lista.length;
    if (!lista.length) { html($('eventos'), '<div class="vazio">Sem eventos nas últimas 6 horas.</div>'); caberEventos(); return; }
    html($('eventos'), lista.slice(0, 25).map((e) => {
      const cor = e.resolvido ? COR.ok : SEVERIDADES[e.severidade].cor;
      return `<div class="evento clicavel" data-alerta="e:${e.id}" title="Mostrar na sala"><time>${hora(e.quando)}</time><i style="background:${cor}"></i>
        <span>${e.resolvido ? 'Resolvido: ' : ''}${esc(e.nome)}<small>${esc(e.host)}</small></span>${icone('alvo', 'localizar')}</div>`;
    }).join(''));
    caberEventos();
  }

  // Eventos: mostra só os que cabem INTEIROS no espaço da coluna — sem
  // rolagem e sem item cortado no meio. Os mais recentes vêm primeiro; o
  // título diz quantos estão aparecendo (o histórico completo fica no Zabbix).
  let totalEventos = 0;
  function caberEventos() {
    const caixa = $('eventos');
    const itens = [...caixa.querySelectorAll('.evento')];
    itens.forEach((e) => { e.hidden = false; });
    const limite = caixa.getBoundingClientRect().bottom;
    let mostrados = 0, cheio = false;
    for (const e of itens) {
      cheio ||= e.getBoundingClientRect().bottom > limite + 1;
      e.hidden = cheio;
      if (!cheio) mostrados++;
    }
    $('ev-resumo').textContent = totalEventos > mostrados && mostrados
      ? `${mostrados} de ${totalEventos} · últimas 6 h` : 'últimas 6 h';
  }
  new ResizeObserver(() => caberEventos()).observe($('eventos'));

  // ------------------------------------------------------------------
  // Gaveta do servidor
  // ------------------------------------------------------------------
  function selecionar(id) {
    selecionado = id;
    $('gaveta').classList.toggle('aberta', !!id);
    if (ultimo) renderServidores(ultimo.servidores);
    if (id) renderGaveta();
  }

  function renderGaveta() {
    const s = ultimo?.servidores.find((x) => x.id === selecionado);
    if (!s) { html($('gaveta'), ''); return; }
    const estado = { ok: ['Disponível', 'ok'], atencao: ['Agente indisponível', 'alerta'], critico: ['Sem resposta ao ping', 'alerta'], desconhecido: ['Desconhecido', ''] }[s.estado];
    const probs = (ultimo.problemas || []).filter((p) => p.host === s.nome);
    const h = (k) => historicoSrv[s.ids[k]?.itemid];
    // Mantém a rolagem só se for o MESMO servidor (outro servidor abre no topo).
    const rolagem = $('gaveta').dataset.srv === s.id ? ($('gaveta').querySelector('.corpo')?.scrollTop || 0) : 0;
    $('gaveta').dataset.srv = s.id;
    queueMicrotask(() => { const c = $('gaveta').querySelector('.corpo'); if (c) c.scrollTop = rolagem; });
    html($('gaveta'), `
      <div class="cab">
        <button class="fechar" title="Fechar" aria-label="Fechar">&times;</button>
        <h3>${icone('servidor')}${esc(s.nome)}</h3>
        <div class="linha-estado ${estado[1]}"><i></i>${estado[0]}</div>
        <dl class="ficha">
          <dt>Endereço</dt><dd>${esc(s.endereco)}</dd>
          <dt>Sistema</dt><dd>${esc(s.os || s.sistema)}</dd>
          ${s.versaoAgente ? `<dt>Agente</dt><dd>Zabbix agent ${esc(s.versaoAgente)}</dd>` : ''}
        </dl>
        ${blocoManutencao(s)}
      </div>
      <div class="corpo">
        ${probs.length ? `<div>
          <h2>${icone('aviso')}Problemas deste servidor</h2>
          <div class="alertas">${probs.map((p) => itemProblema(p, { comHost: false })).join('')}</div>
        </div>` : ''}
        ${(s.componentes || []).length ? `<div class="componentes"><h2>${icone('container')}O que roda neste servidor</h2>
          ${s.componentes.map((c) => cartaoComponente(c, (item) => historicoSrv[item?.itemid],
            podeAgir && CORRECAO[c.tipo] ? `<div class="comp-acoes"><button class="botao corrige" data-acao="${CORRECAO[c.tipo].acao}" data-alvo="${esc(s.id)}">${icone(CORRECAO[c.tipo].icone)}${CORRECAO[c.tipo].rotulo}</button></div>` : '')).join('')}</div>` : ''}
        <div class="bloco-barras">
          ${barra('CPU', s.cpu, s.nucleos ? `${s.nucleos} núcleos · carga ${fmt(s.carga, 2)}` : '')}
          ${barra('Memória', s.memoria, s.memoriaTotal ? `${fmt(s.memoriaTotal / 1024 ** 3, 1)} GB no total` : '')}
          ${barra('Disco ' + (s.discoNome || ''), s.disco)}
        </div>
        <dl class="ficha colunas">
          <dt>Latência</dt><dd>${s.ping === 0 ? '<span style="color:var(--alerta)">sem resposta</span>' : fmt(s.latenciaMs, 2) + ' ms'}</dd>
          <dt>Perda</dt><dd>${fmt(s.perda, 0)} %</dd>
          <dt>Ligado há</dt><dd>${duracao(s.uptime)}</dd>
          <dt>Processos</dt><dd>${fmt(s.processos)}</dd>
          <dt>Rede entrada</dt><dd>${bits(s.redeEntrada)}</dd>
          <dt>Rede saída</dt><dd>${bits(s.redeSaida)}</dd>
        </dl>
        <div class="graf"><div class="t"><span>CPU, 30 min</span><span>${fmt(s.cpu, 1)} %</span></div>${sparkline(h('cpu'), { cor: COR.info, min: 0, max: 100, altura: 46 })}</div>
        <div class="graf"><div class="t"><span>Memória, 30 min</span><span>${fmt(s.memoria, 1)} %</span></div>${sparkline(h('memoria'), { cor: '#b877d9', min: 0, max: 100, altura: 46 })}</div>
        <div class="graf"><div class="t"><span>Latência, 30 min</span><span>${fmt(s.latenciaMs, 2)} ms</span></div>${sparkline((h('latencia') || []).map((p) => [p[0], p[1] * 1000]), { cor: COR.ok, min: 0, altura: 46 })}</div>
        <div class="graf"><div class="t"><span>Rede entrada, 30 min</span><span>${bits(s.redeEntrada)}</span></div>${sparkline(h('redeEntrada'), { cor: '#8ab8ff', min: 0, altura: 46 })}</div>
        ${!s.agenteOk && s.agenteErro ? `<div class="vazio" style="color:var(--alerta)">Agente: ${esc(s.agenteErro)}</div>` : ''}
      </div>`);
  }

  // Manutenção: "vou mexer neste servidor, não me alarmem". O Zabbix segue
  // coletando, mas suprime os alertas (e o Telegram) até o horário acabar.
  function blocoManutencao(s) {
    const m = manut[s.id];
    if (s.manutencao || m) {
      return `<div class="manutencao on">${icone('chave')}<span>Em manutenção${m ? ` até <b>${hora(m.ate)}</b>` : ''}
        ${m?.motivo ? `<small>${esc(m.motivo.replace(/^\[Grafana: ([^\]]+)\]\s*/, '$1: '))}</small>`
          : '<small>Aberta direto no Zabbix, ou terminando agora (o Zabbix aplica em até 1 min).</small>'}</span>
        ${podeAgir && m ? `<button class="botao" data-acao="encerrar-manutencao" data-alvo="${esc(s.id)}">Encerrar</button>` : ''}</div>`;
    }
    return podeAgir ? `<div class="manutencao"><button class="botao" data-acao="manutencao" data-alvo="${esc(s.id)}">${icone('chave')}Pôr em manutenção</button>
      <small>Silencia os alertas deste servidor enquanto você mexe nele.</small></div>` : '';
  }

  // ------------------------------------------------------------------
  // Caixa de confirmação: TODA ação pede um motivo (vai para o registro).
  // Devolve uma Promise com { motivo, minutos } ou null (cancelou).
  // ------------------------------------------------------------------
  function dialogo({ titulo, explica, alvo, rotulo = 'Motivo', confirmar = 'Confirmar', minutos = null }) {
    const caixa = $('dialogo');
    caixa.innerHTML = `<form class="caixa" novalidate>
        <h3>${esc(titulo)}</h3>
        ${alvo ? `<p class="alvo">${esc(alvo)}</p>` : ''}
        <p class="explica">${esc(explica)}</p>
        ${minutos ? `<div class="duracoes" role="radiogroup" aria-label="Duração">${minutos.map((m, i) =>
          `<label><input type="radio" name="minutos" value="${m}"${i === 1 ? ' checked' : ''}><span>${m < 60 ? m + ' min' : m / 60 + ' h'}</span></label>`).join('')}</div>` : ''}
        <label class="campo">${esc(rotulo)}<textarea name="motivo" rows="3" maxlength="300" placeholder="Ex.: verificando o cabo de energia"></textarea></label>
        <p class="erro-campo"></p>
        <div class="botoes"><button type="button" class="botao" data-sair>Cancelar</button><button type="submit" class="botao pri">${esc(confirmar)}</button></div>
      </form>`;
    caixa.hidden = false;
    const form = caixa.querySelector('form');
    const texto = form.querySelector('textarea');
    setTimeout(() => texto.focus(), 30);
    return new Promise((fim) => {
      const fechar = (valor) => { caixa.hidden = true; caixa.innerHTML = ''; fim(valor); };
      form.addEventListener('submit', (ev) => {
        ev.preventDefault();
        const motivo = texto.value.trim();
        if (motivo.length < 3) { form.querySelector('.erro-campo').textContent = 'Escreva o motivo (fica no registro do alerta).'; texto.focus(); return; }
        fechar({ motivo, minutos: minutos ? Number(form.querySelector('input[name="minutos"]:checked').value) : null });
      });
      form.querySelector('[data-sair]').addEventListener('click', () => fechar(null));
      caixa.onpointerdown = (ev) => { if (ev.target === caixa) fechar(null); };
      // As teclas não "vazam" para o Grafana (Esc sairia do modo quiosque).
      form.addEventListener('keydown', (ev) => {
        ev.stopPropagation();
        if (ev.key === 'Escape') fechar(null);
        if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)) form.requestSubmit();
      });
    });
  }

  // Recado rápido no rodapé ("Reconhecido: ...", ou o erro).
  let tempoRecado = 0;
  function avisar(msg, tipo = 'ok') {
    const r = $('recado');
    r.className = 'recado on ' + tipo;
    r.textContent = msg;
    clearTimeout(tempoRecado);
    tempoRecado = setTimeout(() => r.classList.remove('on'), tipo === 'erro' ? 7000 : 4000);
  }

  // Clique num alerta de servidor: a gaveta abre já com ele aberto, à vista
  // (os botões Reconhecer/Comentar ficam ali).
  function abrirAlerta(id) {
    if (aberto !== id) return;                       // foi um clique para FECHAR
    const corpo = $('gaveta').querySelector('.corpo');
    if (corpo) queueMicrotask(() => { corpo.scrollTop = 0; });   // depois da restauração da rolagem
  }

  // Clique num componente da vista explodida: rola a gaveta até ele.
  function destacarComponente(id) {
    const el = $('gaveta').querySelector(`[data-comp="${CSS.escape(id)}"]`);
    if (!el) return;
    // Rolagem direta (não "smooth"): a gaveta se redesenha a cada 3 s e
    // interromperia uma rolagem animada no meio do caminho.
    const corpo = el.closest('.corpo');
    if (corpo) corpo.scrollTop += el.getBoundingClientRect().top - corpo.getBoundingClientRect().top - 8;
    el.classList.add('destaque');
    setTimeout(() => el.classList.remove('destaque'), 1800);
  }

  function destacarSensor(nome) {
    const el = raiz.querySelector(`[data-sensor="${nome}"]`);
    if (!el) return;
    el.classList.add('destaque');
    setTimeout(() => el.classList.remove('destaque'), 1800);
  }

  function mostrarErro(msg) {
    const e = $('erro');
    e.textContent = msg;
    e.classList.add('on');
  }

  return {
    noc, palco: $('cena'), icone, relogio, atualizar, selecionar, destacarSensor, destacarComponente, mostrarErro,
    dialogo, avisar, abrirAlerta,
    definirPermissao(pode) { podeAgir = pode; if (ultimo) atualizar(ultimo); },
    definirManutencoes(m) { manut = m || {}; if (selecionado) renderGaveta(); },
    definirHistorico(h) { historico = h; renderHistoricoAmbiente(); },
    definirHistoricoServidor(h) { historicoSrv = h; if (selecionado) renderGaveta(); },
    get selecionado() { return selecionado; },
  };
}
