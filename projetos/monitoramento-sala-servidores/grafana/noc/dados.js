// =====================================================================
// dados.js — busca tudo no Zabbix e entrega um "retrato" da sala
// ---------------------------------------------------------------------
// Como o navegador fala com o Zabbix SEM saber a senha dele:
//   navegador ──(sessão do Grafana)──> Grafana ──(senha do .env)──> Zabbix
// O plugin do Zabbix no Grafana tem um "atalho" que repassa chamadas de
// LEITURA à API do Zabbix (host.get, item.get, problem.get, history.get…).
// O plugin bloqueia qualquer método que altere algo.
//
// Este arquivo transforma as respostas cruas do Zabbix num objeto simples:
//   { ambiente: {...}, servidores: [...], problemas: [...], eventos: [...] }
// que a interface e a cena 3D só precisam DESENHAR.
// =====================================================================

const URL_API = '/api/datasources/uid/zabbix/resources/zabbix-api';

export const GRUPO = 'Sala do servidor';
export const HOST_ESP32 = 'esp32-sala';
const ESP32_OFFLINE_APOS_S = 60;    // sem leitura nova há mais que isso = placa sumiu

// Chama um método da API do Zabbix (via Grafana).
export async function api(metodo, params) {
  const resp = await fetch(URL_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ method: metodo, params }),
  });
  if (!resp.ok) throw new Error(`${metodo}: HTTP ${resp.status}`);
  const json = await resp.json();
  return json.result;
}

// ---------------------------------------------------------------------
// Chaves dos itens que nos interessam
// ---------------------------------------------------------------------
// Do ESP32 (template "ESP32 Sala do Servidor"):
const CHAVES_ESP32 = ['esp32.status', 'esp32.temperatura', 'esp32.umidade', 'esp32.agua', 'esp32.porta',
  'esp32.energia', 'esp32.agua_raw', 'esp32.energia_raw', 'esp32.energia_instalada', 'esp32.dht_ok', 'esp32.uptime',
  'esp32.rssi', 'esp32.versao'];

// Dos servidores (templates oficiais "Linux/Windows by Zabbix agent" e "ICMP Ping").
// "search" do Zabbix procura por TRECHO da chave; depois filtramos aqui.
const BUSCA_SERVIDOR = ['icmpping', 'system.cpu.util', 'vm.memory.util', 'system.uptime', 'system.sw.os',
  'system.hostname', 'agent.version', 'system.cpu.load[all,avg1]', 'system.cpu.queue', 'pused',
  'net.if.in', 'net.if.out', 'proc.num', 'system.cpu.num', 'vm.memory.size[total]', 'system.uname',
  // Componentes que o servidor RODA (vista explodida da sala 3D):
  'app.', 'pgsql.', 'docker.container_', 'nginx.'];

// ---------------------------------------------------------------------
// Estado guardado entre as atualizações
// ---------------------------------------------------------------------
const cache = { grupoId: null, historico: {}, ultimoHistorico: 0 };

async function idDoGrupo() {
  if (!cache.grupoId) {
    const g = await api('hostgroup.get', { filter: { name: [GRUPO] }, output: ['groupid'] });
    if (!g.length) throw new Error(`grupo "${GRUPO}" não existe no Zabbix (rode zabbix/configurar.py)`);
    cache.grupoId = g[0].groupid;
  }
  return cache.grupoId;
}

const num = (v) => (v === undefined || v === null || v === '' ? null : Number(v));
const agora = () => Date.now() / 1000;

// =====================================================================
// RETRATO RÁPIDO (a cada 1 s): últimos valores, servidores, problemas
// =====================================================================
export async function buscarRetrato() {
  const grupo = await idDoGrupo();

  const hosts = await api('host.get', {
    groupids: [grupo], output: ['hostid', 'host', 'name', 'status', 'maintenance_status'],
    selectInterfaces: ['type', 'ip', 'dns', 'useip', 'available', 'error'],
    selectParentTemplates: ['name'],
  });
  const esp32 = hosts.find((h) => h.host === HOST_ESP32);
  // Servidor = qualquer host do grupo que tenha interface de agente (tipo 1).
  const hostsServidores = hosts.filter((h) => h.host !== HOST_ESP32 && h.interfaces.some((i) => i.type === '1'));

  const [itensEsp, itensSrv, problemas, eventos] = await Promise.all([
    esp32 ? api('item.get', { hostids: [esp32.hostid], filter: { key_: CHAVES_ESP32 },
      output: ['itemid', 'key_', 'lastvalue', 'lastclock', 'units', 'value_type', 'state', 'error'] }) : [],
    hostsServidores.length ? api('item.get', { hostids: hostsServidores.map((h) => h.hostid),
      search: { key_: BUSCA_SERVIDOR }, searchByAny: true,
      output: ['itemid', 'hostid', 'key_', 'name', 'lastvalue', 'lastclock', 'units', 'value_type', 'state'] }) : [],
    api('problem.get', { groupids: [grupo], recent: false, output: ['eventid', 'objectid', 'name', 'severity', 'clock', 'acknowledged', 'suppressed'],
      selectTags: ['tag', 'value'], selectAcknowledges: ['clock', 'message', 'action'], sortfield: ['eventid'], sortorder: 'DESC' }),
    api('event.get', { groupids: [grupo], source: 0, object: 0, time_from: Math.floor(agora() - 6 * 3600),
      output: ['eventid', 'name', 'severity', 'clock', 'value', 'r_eventid'], selectHosts: ['name'],
      selectTags: ['tag', 'value'],
      sortfield: ['clock', 'eventid'], sortorder: 'DESC', limit: 40 }),
  ]);

  // Problemas não trazem o host; pegamos dos eventos (mesmo eventid).
  const hostDoEvento = {};
  for (const e of eventos) hostDoEvento[e.eventid] = e.hosts?.[0]?.name;
  const faltando = problemas.filter((p) => !hostDoEvento[p.eventid]).map((p) => p.eventid);
  if (faltando.length) {
    for (const e of await api('event.get', { eventids: faltando, output: ['eventid'], selectHosts: ['name'] })) {
      hostDoEvento[e.eventid] = e.hosts?.[0]?.name;
    }
  }

  const servidores = hostsServidores.map((h) => montarServidor(h, itensSrv.filter((i) => i.hostid === h.hostid)))
    .sort((a, b) => a.nome.localeCompare(b.nome));

  // ONDE fica um alerta (problema ou evento), para a sala 3D reagir e para
  // o clique na lista levar ao lugar certo:
  //   efeito     — tag "efeito" do gatilho (agua, porta, temperatura, app...);
  //                problema de servidor sem a tag vira "servidor";
  //   servidorId — qual servidor do rack; componente — banco, app, container...
  const localDoAlerta = (p, host) => {
    const servidor = servidores.find((s) => s.nome === host);
    return {
      efeito: p.tags?.find((t) => t.tag === 'efeito')?.value || (servidor ? 'servidor' : null),
      servidorId: servidor?.id ?? null,
      componente: servidor ? componenteDoProblema(p, servidor) : null,
    };
  };

  const listaProblemas = problemas.map((p) => {
    const host = hostDoEvento[p.eventid] || '—';
    return {
      id: p.eventid, nome: p.name, severidade: Number(p.severity), inicio: Number(p.clock),
      host, reconhecido: p.acknowledged === '1', suprimido: p.suppressed === '1',
      ...anotacoes(p.acknowledges), ...localDoAlerta(p, host),
    };
  });

  // Estado de cada componente: o pior alerta ligado a ele; container que
  // não está "running" fica "parado".
  for (const s of servidores) {
    for (const c of s.componentes) {
      const sev = listaProblemas.filter((p) => p.servidorId === s.id && p.componente === c.id)
        .reduce((m, p) => Math.max(m, p.severidade), -1);
      c.problemas = listaProblemas.filter((p) => p.servidorId === s.id && p.componente === c.id).map((p) => p.nome);
      c.estado = c.container && c.status && c.status !== 'running' ? 'parado'
        : sev >= 4 ? 'alerta' : sev >= 2 ? 'atencao' : 'ok';
    }
  }

  return {
    quando: Date.now(),
    ambiente: montarAmbiente(itensEsp),
    servidores,
    problemas: listaProblemas,
    eventos: eventos.map((e) => ({
      id: e.eventid, nome: e.name, severidade: Number(e.severity), quando: Number(e.clock),
      resolvido: e.value === '0', host: e.hosts?.[0]?.name || '—', ...localDoAlerta(e, e.hosts?.[0]?.name),
    })),
    itensEsp,     // ids para buscar o histórico
    itensSrv,
  };
}

// O que as pessoas fizeram no alerta (botões Reconhecer/Comentar da central,
// ou a tela do Zabbix). O serviço de ações assina cada texto com
// "[Grafana: Nome] ..."; daqui tiramos QUEM reconheceu e a última anotação.
const AC_RECONHECER = 2, AC_MENSAGEM = 4;
const QUEM = /^\[Grafana: ([^\]]+)\]\s*/;
function anotacoes(lista = []) {
  const ordem = [...lista].sort((a, b) => Number(b.clock) - Number(a.clock));
  const rec = ordem.find((a) => Number(a.action) & AC_RECONHECER);
  const nota = ordem.find((a) => Number(a.action) & AC_MENSAGEM && a.message);
  return {
    reconhecidoPor: rec ? (rec.message.match(QUEM)?.[1] || 'Zabbix') : null,
    ultimaNota: nota ? { quando: Number(nota.clock), quem: nota.message.match(QUEM)?.[1] || 'Zabbix',
      texto: nota.message.replace(QUEM, '') } : null,
  };
}

// Liga um problema ao componente do servidor que ele afeta (banco, app,
// proxy ou um container), pelo nome do gatilho ou pela tag "efeito".
function componenteDoProblema(p, servidor) {
  const tag = (t) => p.tags?.find((x) => x.tag === t)?.value;
  const comps = servidor.componentes;
  const porTipo = (tipo) => comps.find((c) => c.tipo === tipo)?.id || null;
  const container = p.name.match(/\/sala-servidor-(.+?)-\d+(?:[\]:\s"]|$)/)?.[1] || (tag('efeito') === 'container' ? tag('container') : null);
  if (container && comps.some((c) => c.id === container)) return container;
  if (tag('efeito') === 'app') return porTipo('app');
  if (/^PostgreSQL/i.test(p.name)) return porTipo('banco');
  if (/^Nginx/i.test(p.name)) return porTipo('proxy');
  return null;
}

// Componentes que um servidor roda, a partir dos itens que ele tem:
//   • containers do Docker (template Docker) — cada um vira um componente;
//   • aplicação Loja (template App Loja), banco (PostgreSQL), proxy (Nginx) —
//     num servidor com Docker, as métricas vão para o container de mesmo papel.
// Tipos: 'proxy' → 'app' → 'banco' (a ordem do caminho de uma requisição).
function montarComponentes(itens) {
  const k = (key) => itens.find((i) => i.key_ === key && i.lastclock !== '0');
  const v = (key) => (k(key) ? num(k(key).lastvalue) : null);
  const porNome = (re) => itens.find((i) => re.test(i.name) && i.lastclock !== '0');
  const comps = [];

  // Containers
  for (const it of itens.filter((i) => i.key_.startsWith('docker.container_info.state.status['))) {
    const longo = it.key_.match(/\["\/(.+)"\]/)?.[1];
    if (!longo) continue;
    const curto = longo.replace(/^sala-servidor-/, '').replace(/-\d+$/, '');
    const chave = (m) => `docker.container_${m}["/${longo}"]`;
    comps.push({
      id: curto, nome: curto, container: true,
      tipo: /proxy|nginx/.test(curto) ? 'proxy' : /db|banco|postgres/.test(curto) ? 'banco' : 'app',
      status: it.lastvalue,
      cpu: v(chave('stats.cpu_pct_usage')),
      memoriaMb: v(chave('stats.memory.usage_total')) !== null ? v(chave('stats.memory.usage_total')) / 1024 ** 2 : null,
      reinicios: v(chave('info.restart_count')),
      ids: { cpu: k(chave('stats.cpu_pct_usage')) },
    });
  }
  const doTipo = (tipo, criar) => comps.find((c) => c.tipo === tipo) || (criar && comps.push(criar) && criar);

  // Aplicação (template App Loja)
  if (k('app.metricas') || k('app.disponivel')) {
    const c = doTipo('app', { id: 'app', nome: 'Loja', tipo: 'app', container: false, ids: {} });
    Object.assign(c, {
      rps: v('app.rps'), p95: v('app.latencia_p95'), media: v('app.latencia_media'), erros: v('app.erros_pct'),
      cpuApp: v('app.cpu_pct'), memoriaApp: v('app.memoria_mb'), pool: v('app.conexoes_pool'),
      pedidos: v('app.pedidos_total'), bancoOk: v('app.banco_ok'), falha: k('app.falha_injetada')?.lastvalue || 'nenhuma',
    });
    Object.assign(c.ids, { rps: k('app.rps'), p95: k('app.latencia_p95') });
  }
  // Banco (template PostgreSQL)
  if (itens.some((i) => i.key_.startsWith('pgsql.ping') && i.lastclock !== '0')) {
    const c = doTipo('banco', { id: 'banco', nome: 'PostgreSQL', tipo: 'banco', container: false, ids: {} });
    const tamanho = porNome(/\[loja\].*size/i);
    Object.assign(c, {
      ping: num(itens.find((i) => i.key_.startsWith('pgsql.ping'))?.lastvalue),
      conexoes: v('pgsql.connections.sum.total'), conexoesPct: v('pgsql.connections.sum.total_pct'),
      ativas: v('pgsql.connections.sum.active'), ociosas: v('pgsql.connections.sum.idle'),
      tamanhoMb: tamanho ? num(tamanho.lastvalue) / 1024 ** 2 : null,
      commits: num(porNome(/\[loja\].*commits? per second/i)?.lastvalue),
      cache: num(porNome(/cache hit/i)?.lastvalue),
      locks: num(porNome(/\[loja\]: Num of locks total/i)?.lastvalue),
      versao: (itens.find((i) => i.key_.startsWith('pgsql.version'))?.lastvalue || '').match(/PostgreSQL [\d.]+/)?.[0] || '',
    });
    Object.assign(c.ids, { conexoes: k('pgsql.connections.sum.total') });
  }
  // Proxy (template Nginx)
  if (k('nginx.connections.active')) {
    const c = doTipo('proxy', { id: 'proxy', nome: 'nginx', tipo: 'proxy', container: false, ids: {} });
    Object.assign(c, { conexoesAtivas: v('nginx.connections.active'), reqSeg: v('nginx.requests.total.rate') });
  }
  const ordem = { proxy: 0, app: 1, banco: 2 };
  return comps.sort((a, b) => ordem[a.tipo] - ordem[b.tipo]);
}

function montarAmbiente(itens) {
  const pega = (k) => itens.find((i) => i.key_ === k);
  const status = pega('esp32.status');
  const ultimaLeitura = status ? Number(status.lastclock) : 0;
  const idade = ultimaLeitura ? agora() - ultimaLeitura : null;
  const online = idade !== null && idade < ESP32_OFFLINE_APOS_S && status?.state !== '1';
  const v = (k) => (online ? num(pega(k)?.lastvalue) : null);
  return {
    online,
    idade,                                   // segundos desde a última leitura
    configurado: itens.length > 0,
    temperatura: v('esp32.temperatura'),
    umidade: v('esp32.umidade'),
    agua: v('esp32.agua'),
    porta: v('esp32.porta'),
    energia: v('esp32.energia'),
    aguaRaw: v('esp32.agua_raw'),
    energiaRaw: v('esp32.energia_raw'),
    energiaInstalada: v('esp32.energia_instalada'),
    dhtOk: v('esp32.dht_ok'),
    rssi: v('esp32.rssi'),
    uptime: v('esp32.uptime'),
    versao: online ? pega('esp32.versao')?.lastvalue : null,
    erro: status?.state === '1' ? status.error : null,
  };
}

function montarServidor(host, itens) {
  const porChave = (k) => itens.find((i) => i.key_ === k);
  const primeiro = (...ks) => ks.map(porChave).find((i) => i && i.lastclock !== '0');
  const val = (i) => (i ? num(i.lastvalue) : null);

  // Disco: a partição do sistema ("/" no Linux, "C:" no Windows); se não
  // existir, o maior % usado entre os sistemas de arquivos descobertos.
  const discos = itens.filter((i) => /^vfs\.fs\.(dependent\.)?size\[.*,pused\]$/.test(i.key_) && i.lastclock !== '0');
  const disco = discos.find((i) => /\[(\/|C:),pused\]$/.test(i.key_))
    || discos.reduce((m, i) => (num(i.lastvalue) > (m ? num(m.lastvalue) : -1) ? i : m), null);
  // Rede: a interface com mais tráfego de entrada.
  const placa = (dir) => itens.filter((i) => new RegExp(`^net\\.if\\.${dir}\\[[^,\\]]+\\]$`).test(i.key_));
  const entradas = placa('in');
  const principal = entradas.reduce((m, i) => (num(i.lastvalue) > (m ? num(m.lastvalue) : -1) ? i : m), null);
  const nomePlaca = principal?.key_.match(/\[(.*)\]/)?.[1];
  const saida = nomePlaca ? porChave(`net.if.out[${nomePlaca}]`) : null;

  const agente = host.interfaces.find((i) => i.type === '1');
  const ping = val(porChave('icmpping'));
  const agenteOk = agente?.available === '1';
  const os = porChave('system.sw.os')?.lastvalue || porChave('system.uname')?.lastvalue || '';
  const linux = host.parentTemplates.some((t) => /Linux/i.test(t.name));

  let estado = 'ok';
  if (ping === 0) estado = 'critico';
  else if (agente?.available === '2') estado = 'atencao';
  else if (ping === null && !agenteOk) estado = 'desconhecido';

  return {
    id: host.hostid,
    nome: host.name,
    tecnico: host.host,
    endereco: agente ? (agente.useip === '1' ? agente.ip : agente.dns) : '',
    sistema: linux ? 'Linux' : 'Windows',
    os: os.replace(/\s*\(.*$/, '').slice(0, 80),
    estado,
    manutencao: host.maintenance_status === '1',   // alertas suprimidos (botão Manutenção)
    agenteOk,
    agenteErro: agente?.error || '',
    ping,
    latenciaMs: val(porChave('icmppingsec')) !== null ? val(porChave('icmppingsec')) * 1000 : null,
    perda: val(porChave('icmppingloss')),
    cpu: val(primeiro('system.cpu.util', 'system.cpu.util[,,avg1]')),
    memoria: val(primeiro('vm.memory.utilization', 'vm.memory.util')),
    memoriaTotal: val(porChave('vm.memory.size[total]')),
    disco: val(disco),
    discoNome: disco?.key_.match(/\[([^,]*)/)?.[1] || '',
    carga: val(primeiro('system.cpu.load[all,avg1]', 'system.cpu.queue')),
    nucleos: val(porChave('system.cpu.num')),
    uptime: val(porChave('system.uptime')),
    redeEntrada: val(principal),
    redeSaida: val(saida),
    placaRede: nomePlaca ? nomePlaca.replace(/"/g, '') : '',
    processos: val(primeiro('proc.num[]', 'proc.num')),
    versaoAgente: porChave('agent.version')?.lastvalue || '',
    componentes: montarComponentes(itens),
    // ids para o histórico (sparklines)
    ids: {
      cpu: primeiro('system.cpu.util', 'system.cpu.util[,,avg1]'),
      memoria: primeiro('vm.memory.utilization', 'vm.memory.util'),
      latencia: porChave('icmppingsec'),
      redeEntrada: principal,
      redeSaida: saida,
    },
  };
}

// Junta os ids de histórico dos componentes ("app.rps", "banco.conexoes"...)
// aos do servidor, para a gaveta desenhar os gráficos deles também.
export function idsDoServidor(s) {
  const ids = { ...s.ids };
  for (const c of s.componentes || []) for (const [m, item] of Object.entries(c.ids || {})) ids[`${c.id}.${m}`] = item;
  return ids;
}

// =====================================================================
// HISTÓRICO (sparklines e gráfico de temperatura) — mais espaçado
// =====================================================================
// itens: lista de objetos de item (com itemid e value_type).
// Devolve { itemid: [[segundos, valor], ...] } dos últimos "minutos".
export async function buscarHistorico(itens, minutos = 30) {
  const validos = itens.filter(Boolean);
  const porTipo = {};
  for (const i of validos) (porTipo[i.value_type] ||= []).push(i.itemid);
  const resultado = {};
  await Promise.all(Object.entries(porTipo).map(async ([tipo, ids]) => {
    if (!['0', '3'].includes(tipo)) return;   // só números (0 = fracionário, 3 = inteiro)
    const linhas = await api('history.get', { history: Number(tipo), itemids: ids,
      time_from: Math.floor(agora() - minutos * 60), output: ['itemid', 'clock', 'value'],
      sortfield: 'clock', sortorder: 'ASC', limit: 5000 });
    for (const l of linhas) (resultado[l.itemid] ||= []).push([Number(l.clock), Number(l.value)]);
  }));
  return resultado;
}
