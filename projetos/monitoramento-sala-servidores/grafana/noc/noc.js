// =====================================================================
// noc.js — ponto de entrada da central de monitoramento
// ---------------------------------------------------------------------
// O painel "Business Text" do dashboard faz só isto:
//     import('/public/noc/noc.js').then(m => m.iniciar(context))
// e este arquivo cuida do resto:
//   1. carrega o CSS e as fontes;
//   2. monta a interface (interface.js) e a sala 3D (cena3d.js);
//   3. busca os dados no Zabbix (dados.js) em ciclos:
//        • a cada 1 s  → últimos valores, servidores, alertas, eventos
//        • a cada 30 s → histórico de 30 min (gráficos)
//        • com um servidor aberto, a cada 15 s → histórico dele
//
// O próprio app faz a atualização; por isso o dashboard não precisa do
// "refresh" do Grafana, e nada pisca.
// =====================================================================

const BASE = new URL('.', import.meta.url).href;     // /public/noc/
// O Grafana manda o navegador guardar /public em cache por 1 hora. O painel
// importa este arquivo com "?v=<horário>"; repassamos o MESMO ?v= para os
// outros módulos, senão uma mudança neles demoraria até 1 h para aparecer.
const VERSAO = new URL(import.meta.url).search;
let modulos = null;
const carregarModulos = () => (modulos ||= Promise.all([
  import('./dados.js' + VERSAO), import('./interface.js' + VERSAO), import('./cena3d.js' + VERSAO),
  import('./acoes.js' + VERSAO),
]));

const apps = new WeakMap();

export async function iniciar(context) {
  const raiz = context.element;
  if (apps.get(raiz)) return;                         // já está rodando (ou subindo) neste painel
  apps.set(raiz, { vivo: true });
  const [dados, interfaceMod, cenaMod, acoesMod] = await carregarModulos();
  apps.set(raiz, montar(raiz, dados, interfaceMod, cenaMod, acoesMod));
}

function montar(raiz, { buscarRetrato, buscarHistorico, idsDoServidor }, { criarInterface }, { criarCena },
  { quemSou, manutencoes, agir }) {
  carregarEstilos();
  esconderRodapeDoGrafana();
  travarRolagemDaPagina(true);
  // O Business Text põe margem em volta; a central ocupa o painel inteiro.
  raiz.style.padding = '0';
  raiz.style.height = '100%';
  ajustarAltura(raiz);

  const app = { vivo: true };
  let retrato = null;

  const ui = criarInterface(raiz, {
    aoSelecionar: (id) => selecionar(id),
    aoClicarAlerta: (alerta) => mostrarNaSala(alerta),
    aoAgir: (acao, alvo) => agirNaCentral(acao, alvo),
  });
  const cena = criarCena(ui.palco, {
    aoClicarServidor: (id) => selecionar(ui.selecionado === id ? null : id),
    aoClicarSensor: (nome) => ui.destacarSensor(nome),
    aoClicarComponente: (id) => ui.destacarComponente(id),   // vista explodida → gaveta
    aoClicarVazio: () => { if (ui.selecionado) selecionar(null); },
    icone: ui.icone,              // mesmos ícones dos painéis nas etiquetas 3D
  });

  function selecionar(id) {
    ui.selecionar(id);
    cena.selecionar(id);
    if (id) cicloServidor();
  }

  // Clique num alerta (lista de Problemas, Eventos ou gaveta): leva ao LUGAR
  // do problema na sala 3D. Qual lugar vem de dados.js (localDoAlerta).
  const CARTAO_DO_EFEITO = { agua: 'agua', energia: 'energia', porta: 'porta',
    temperatura: 'temperatura', sensor: 'temperatura', dht: 'temperatura' };
  function mostrarNaSala(alerta) {
    if (alerta.servidorId) {
      // Servidor: abre a vista explodida e aponta o componente (ou o servidor).
      if (ui.selecionado !== alerta.servidorId) selecionar(alerta.servidorId);
      cena.marcarNoServidor(alerta.servidorId, alerta.componente, alerta.severidade);
      // Problema ativo: a gaveta mostra ele no topo, com os botões de ação.
      // Evento antigo: rola até o componente afetado.
      if (alerta.inicio) ui.abrirAlerta(alerta.id);
      else if (alerta.componente) setTimeout(() => ui.destacarComponente(alerta.componente), 350);
      return;
    }
    // Sala: voa até a poça, a tomada, a porta ou o sensor.
    if (ui.selecionado) ui.selecionar(null);
    if (cena.focar(alerta.efeito, alerta.severidade) && CARTAO_DO_EFEITO[alerta.efeito]) {
      ui.destacarSensor(CARTAO_DO_EFEITO[alerta.efeito]);
    }
  }

  // ---------- Ciclos de atualização ----------
  // ------------------------------------------------------------------
  // AÇÕES: cada botão abre uma caixa que pede o motivo; só então o pedido
  // vai ao serviço de ações (acoes.js → acoes/acoes.py → Zabbix).
  // ------------------------------------------------------------------
  let podeAgir = false;
  async function conferirPermissao() {
    const eu = await quemSou();
    podeAgir = !!eu?.pode_agir;
    ui.definirPermissao(podeAgir);
    if (podeAgir) cicloManutencao();
  }

  async function cicloManutencao() {
    if (!podeAgir) return;
    try { ui.definirManutencoes(await manutencoes()); } catch (e) { console.warn('[noc] manutenções', e.message); }
  }

  const MINUTOS = [15, 30, 60, 120, 240];
  async function agirNaCentral(acao, alvo) {
    const p = retrato?.problemas.find((x) => x.id === alvo);
    // Correções: alvo = "servidor" ou "servidor:alerta" (feita a partir de um alerta).
    const [hostid, eventid] = String(alvo).split(':');
    const s = retrato?.servidores.find((x) => x.id === hostid);
    const doAlerta = eventid && retrato?.problemas.find((x) => x.id === eventid);
    const caixas = {
      reconhecer: p && { titulo: 'Reconhecer alerta', alvo: `${p.nome} · ${p.host}`, rotulo: 'O que você vai fazer?',
        explica: 'Avisa a equipe que alguém já está cuidando. O alerta continua aberto até o problema acabar de verdade.',
        confirmar: 'Reconhecer', dados: (r) => ({ eventid: alvo, motivo: r.motivo }) },
      comentar: p && { titulo: 'Comentar no alerta', alvo: `${p.nome} · ${p.host}`, rotulo: 'Comentário',
        explica: 'A anotação fica gravada no histórico do alerta, no Zabbix, com o seu nome.',
        confirmar: 'Anotar', dados: (r) => ({ eventid: alvo, motivo: r.motivo }) },
      manutencao: s && { titulo: `Pôr ${s.nome} em manutenção`, rotulo: 'O que vai ser feito?', minutos: MINUTOS,
        explica: 'O Zabbix continua coletando (os gráficos seguem), mas os alertas deste servidor ficam silenciados, sem Telegram, até o fim do prazo.',
        confirmar: 'Iniciar manutenção', dados: (r) => ({ hostid: alvo, minutos: r.minutos, motivo: r.motivo }) },
      'encerrar-manutencao': s && { titulo: `Encerrar a manutenção de ${s.nome}`, rotulo: 'Como terminou?',
        explica: 'Os alertas voltam a valer. Se algo ainda estiver errado, o alerta reaparece em seguida.',
        confirmar: 'Encerrar', dados: (r) => ({ hostid: alvo, motivo: r.motivo }) },
      'reiniciar-app': s && { titulo: `Reiniciar a aplicação do ${s.nome}`, alvo: doAlerta ? doAlerta.nome : 'Loja',
        rotulo: 'Por que reiniciar?', confirmar: 'Reiniciar',
        explica: 'O Zabbix pede ao agente do servidor para reiniciar a Loja. Quem estiver comprando pode ver um erro por alguns segundos. Reiniciar alivia o sintoma; a causa continua a ser investigada.',
        dados: (r) => ({ hostid, eventid, motivo: r.motivo }) },
      'encerrar-ociosas': s && { titulo: `Encerrar conexões ociosas no ${s.nome}`, alvo: doAlerta ? doAlerta.nome : 'PostgreSQL',
        rotulo: 'Por que encerrar?', confirmar: 'Encerrar conexões',
        explica: 'Fecha as conexões da Loja paradas há mais de 1 minuto (esquecidas pelo código) e libera vagas no banco. Conexões em uso não são tocadas.',
        dados: (r) => ({ hostid, eventid, motivo: r.motivo }) },
    };
    const caixa = caixas[acao];
    if (!caixa) return;
    const resposta = await ui.dialogo(caixa);
    if (!resposta) return;
    if (acao === 'reiniciar-app' || acao === 'encerrar-ociosas') ui.avisar('Executando no servidor…', 'espera');
    try {
      ui.avisar((await agir(acao, caixa.dados(resposta))).mensagem);
    } catch (e) {
      ui.avisar(e.message, 'erro');
    }
    cicloRapido();
    cicloManutencao();
  }

  // Só uma busca por vez: se o Zabbix demorar, as buscas não se acumulam. Quem
  // pede durante uma busca (depois de uma ação) ganha outra logo em seguida,
  // para a tela não mostrar um retrato anterior à ação.
  let buscando = false;
  let buscarDeNovo = false;

  async function cicloRapido() {
    if (buscando) { buscarDeNovo = true; return; }
    buscando = true;
    try {
      retrato = await buscarRetrato();
      retrato.idsAmbiente = {
        temperatura: retrato.itensEsp.find((i) => i.key_ === 'esp32.temperatura')?.itemid,
        umidade: retrato.itensEsp.find((i) => i.key_ === 'esp32.umidade')?.itemid,
      };
      ui.atualizar(retrato);
      cena.atualizar(retrato);
    } catch (e) {
      console.error('[noc]', e);
      ui.mostrarErro(`Sem dados do Zabbix: ${e.message}`);
    } finally {
      buscando = false;
      if (buscarDeNovo) { buscarDeNovo = false; cicloRapido(); }
    }
  }

  async function cicloHistorico() {
    if (!retrato) return;
    try {
      const itens = retrato.itensEsp.filter((i) => ['esp32.temperatura', 'esp32.umidade'].includes(i.key_));
      ui.definirHistorico(await buscarHistorico(itens, 30));
    } catch (e) { console.error('[noc] histórico', e); }
  }

  async function cicloServidor() {
    const s = retrato?.servidores.find((x) => x.id === ui.selecionado);
    if (!s) return;
    try {
      ui.definirHistoricoServidor(await buscarHistorico(Object.values(idsDoServidor(s)), 30));
    } catch (e) { console.error('[noc] histórico do servidor', e); }
  }

  const timers = [
    setInterval(() => ui.relogio(), 1000),
    // O push entrega chuva, porta e energia ao Zabbix em menos de 1 s; este
    // ciclo é o que falta para aparecer na tela. Busca ocupada ou aba
    // escondida pula a vez, para não gastar o Zabbix à toa.
    setInterval(() => { if (!buscando && !document.hidden) cicloRapido(); }, 1000),
    setInterval(cicloHistorico, 30000),
    setInterval(() => ui.selecionado && cicloServidor(), 15000),
    setInterval(() => (podeAgir ? cicloManutencao() : conferirPermissao()), 15000),
    // Se o painel sair da tela (troca de dashboard), para tudo.
    setInterval(() => { if (!raiz.isConnected) parar(); }, 2000),
  ];
  function parar() {
    app.vivo = false;
    timers.forEach(clearInterval);
    apps.delete(raiz);
    travarRolagemDaPagina(false);     // voltou para outra tela do Grafana: rolagem normal
  }

  cicloRapido().then(cicloHistorico);
  conferirPermissao();
  return app;
}

// ---------------------------------------------------------------------
// Utilidades de página
// ---------------------------------------------------------------------
function carregarEstilos() {
  if (!document.getElementById('noc-css')) {
    const css = document.createElement('link');
    css.id = 'noc-css';
    css.rel = 'stylesheet';
    css.href = BASE + 'estilo.css?v=' + Date.now();
    document.head.appendChild(css);
  }
  // Sem fontes externas: usa as do sistema (as mesmas do Grafana), e a
  // central funciona igual sem internet.
}

// O modo kiosk do Grafana mostra uma faixa "Powered by Grafana" grudada na
// base da janela, que fica POR CIMA do painel. Escondemos só ela.
function esconderRodapeDoGrafana() {
  if (document.getElementById('noc-sem-rodape')) return;
  const s = document.createElement('style');
  s.id = 'noc-sem-rodape';
  s.textContent = '[data-testid="public-dashboard-footer"]{display:none!important}';
  document.head.appendChild(s);
}

// A central já cabe inteira na janela (ajustarAltura). Fora do modo
// "viewPanel", o quadro do painel do Grafana é maior que a tela e deixaria
// rolar a página só para ver área vazia; enquanto a central estiver aberta, a
// rolagem da página fica travada. Ao sair dela, volta ao normal.
function travarRolagemDaPagina(travar) {
  const id = 'noc-sem-rolagem';
  document.getElementById(id)?.remove();
  if (!travar) return;
  const s = document.createElement('style');
  s.id = id;
  s.textContent = 'html,body{overflow:hidden!important}';
  document.head.appendChild(s);
  window.scrollTo(0, 0);
}

// Garante que a central tenha a altura do painel (o Business Text não dá
// altura ao seu conteúdo por conta própria).
function ajustarAltura(raiz) {
  let pai = raiz.parentElement;
  while (pai && pai.clientHeight < 200 && pai !== document.body) pai = pai.parentElement;
  if (!pai) return;
  // Nunca mais alta que a JANELA: fora do modo "viewPanel" o painel do
  // Grafana tem altura fixa e pode passar da tela — a central então ficaria
  // comprida e obrigaria a rolar a página para ver o resto.
  const aplicar = () => {
    const topo = Math.max(0, raiz.getBoundingClientRect().top + window.scrollY);
    const cabeNaJanela = window.innerHeight - topo - 8;
    raiz.style.height = Math.max(420, Math.min(pai.clientHeight, cabeNaJanela)) + 'px';
  };
  new ResizeObserver(aplicar).observe(pai);
  window.addEventListener('resize', aplicar);
  aplicar();
}
