export const commandLabels = {
  config: 'ipconfig /all',
  routes: 'route print',
  gateway: 'ping no gateway',
  remote: 'ping no IP remoto',
  dns: 'nslookup portal.example',
  tcp: 'Test-NetConnection · porta 443',
  https: 'Acessar HTTPS',
  trace: 'tracert no IP remoto',
} as const;
export type Command = keyof typeof commandLabels;
export interface Scenario {
  id: string;
  title: string;
  problem: string;
  ip: string;
  gateway: string;
  configured: boolean;
  lan: boolean;
  gatewayUp: boolean;
  dns: boolean;
  remoteUp: boolean;
  icmp: boolean;
  service: boolean;
  tls: boolean;
  diagnosis: string;
  explanation: string;
  required: Command[];
  hints: string[];
}
export const scenarios: Scenario[] = [
  {
    id: 'healthy',
    title: '01 · Uma referência de funcionamento',
    problem: 'Antes de investigar falhas, observe uma estação em que o acesso esperado funciona.',
    ip: '192.168.10.25',
    gateway: '192.168.10.1',
    configured: true,
    lan: true,
    gatewayUp: true,
    dns: true,
    remoteUp: true,
    icmp: true,
    service: true,
    tls: true,
    diagnosis: 'healthy',
    required: ['config', 'dns', 'https'],
    explanation:
      'A consulta resolveu e o HTTPS testado respondeu com validação TLS. Isso comprova o acesso modelado, não todos os serviços.',
    hints: [
      'Identifique a interface e os serviços testados.',
      'Uma resposta de DNS não basta para concluir sobre a página.',
      'Compare consulta de nome com acesso HTTPS.',
      'Neste cenário, DNS e HTTPS funcionam; a conclusão é limitada ao acesso testado.',
    ],
  },
  {
    id: 'no-gateway',
    title: '02 · Local funciona, remoto não',
    problem:
      'A impressora local funciona. O acesso externo não. Investigue a configuração sem mudar nada.',
    ip: '192.168.10.25',
    gateway: '',
    configured: true,
    lan: true,
    gatewayUp: true,
    dns: true,
    remoteUp: true,
    icmp: true,
    service: true,
    tls: true,
    diagnosis: 'route',
    required: ['config', 'routes', 'remote'],
    explanation:
      'Só existe rota conectada e não há default ou rota remota. Resolver o nome não fornece esse caminho. Conferir o plano correto antes de configurar.',
    hints: [
      'Compare destino da LAN com destino remoto.',
      'Leia a tabela de rotas; não olhe só o nome do portal.',
      'Procure a entrada 0.0.0.0/0 e uma rota específica para o destino.',
      'Falta uma rota aplicável ao destino remoto neste cliente.',
    ],
  },
  {
    id: 'bad-gateway',
    title: '03 · Próximo salto incorreto',
    problem:
      'O plano autorizado indica gateway 192.168.10.1. Esta estação não consegue sair da LAN.',
    ip: '192.168.10.25',
    gateway: '192.168.10.254',
    configured: true,
    lan: true,
    gatewayUp: false,
    dns: true,
    remoteUp: true,
    icmp: true,
    service: true,
    tls: true,
    diagnosis: 'gateway',
    required: ['config', 'routes', 'gateway'],
    explanation:
      'A default usa .254, que não corresponde ao plano, e o próximo salto não é alcançável no modelo. Comparação com o plano sustenta investigar essa configuração; timeout isolado não sustentaria a mesma certeza.',
    hints: [
      'Compare configuração observada com configuração esperada.',
      'O endereço de saída não é .1 por regra universal, mas aqui existe um plano explícito.',
      'Observe gateway e rota default.',
      'Neste cenário o próximo salto configurado está incorreto segundo o plano informado.',
    ],
  },
  {
    id: 'dns-failure',
    title: '04 · O nome não responde',
    problem:
      'A configuração esperada foi recebida. O portal não abre por nome. Colete evidências do caminho e da consulta.',
    ip: '192.168.10.25',
    gateway: '192.168.10.1',
    configured: true,
    lan: true,
    gatewayUp: true,
    dns: false,
    remoteUp: true,
    icmp: true,
    service: true,
    tls: true,
    diagnosis: 'dns',
    required: ['remote', 'dns'],
    explanation:
      'Há resposta IP do alvo e timeout da consulta ao resolvedor. Investigar serviço/caminho DNS é sustentado. O timeout sozinho não identifica o componente causador.',
    hints: [
      'Separe alcance IP de resolução.',
      'Teste um IP conhecido sem depender do nome.',
      'Compare ping remoto com nslookup.',
      'A consulta ao resolvedor não respondeu; a próxima investigação é o serviço/caminho DNS.',
    ],
  },
  {
    id: 'apipa',
    title: '05 · Configuração inesperada',
    problem: 'A estação deveria receber DHCP na rede 192.168.10.0/24. Ela não acessa o portal.',
    ip: '169.254.18.7',
    gateway: '',
    configured: false,
    lan: true,
    gatewayUp: true,
    dns: true,
    remoteUp: true,
    icmp: true,
    service: true,
    tls: true,
    diagnosis: 'config',
    required: ['config', 'routes'],
    explanation:
      'O IPv4 link-local não é a configuração planejada. É preciso investigar obtenção de configuração e caminho DHCP; não concluir automaticamente que o servidor DHCP está desligado.',
    hints: [
      'Leia primeiro a configuração da interface ativa.',
      'Compare a faixa com o plano DHCP esperado.',
      '169.254.x.x é link-local; falta a configuração do plano.',
      'Investigue a obtenção da configuração, preservando hipóteses sobre servidor e caminho.',
    ],
  },
  {
    id: 'lan-failure',
    title: '06 · Primeiro trecho indisponível',
    problem:
      'Os valores da estação estão corretos segundo o plano, mas as trocas no enlace local estão falhando.',
    ip: '192.168.10.25',
    gateway: '192.168.10.1',
    configured: true,
    lan: false,
    gatewayUp: true,
    dns: true,
    remoteUp: true,
    icmp: true,
    service: true,
    tls: true,
    diagnosis: 'lan',
    required: ['config', 'gateway', 'dns'],
    explanation:
      'A simulação apresenta falha de comunicação no primeiro enlace, incluindo ausência de resolução do vizinho, apesar dos valores configurados. Verificar ligação/VLAN/switch é mais direcionado que culpar apenas o serviço remoto.',
    hints: [
      'Valor configurado não comprova comunicação.',
      'Compare o alcance ao gateway e ao resolvedor local.',
      'O primeiro enlace não está completando a entrega ao vizinho.',
      'Investigue o domínio local antes de atribuir a falha ao portal remoto.',
    ],
  },
  {
    id: 'remote-failure',
    title: '07 · Um destino remoto indisponível',
    problem:
      'O DNS local responde. A estação alcança a saída, mas o destino remoto não responde aos testes modelados.',
    ip: '192.168.10.25',
    gateway: '192.168.10.1',
    configured: true,
    lan: true,
    gatewayUp: true,
    dns: true,
    remoteUp: false,
    icmp: true,
    service: true,
    tls: true,
    diagnosis: 'remote',
    required: ['gateway', 'dns', 'tcp'],
    explanation:
      'Existe saída local observada e resolução positiva, mas o destino/caminho remoto testado não respondeu. Isso não prova que o servidor está desligado nem que toda internet caiu.',
    hints: [
      'Compare o que funciona localmente com o destino específico.',
      'Uma resposta de nome não garante caminho remoto.',
      'Teste saída e porta do destino.',
      'As evidências direcionam ao caminho/destino remoto, sem provar a causa exata.',
    ],
  },
  {
    id: 'service-failure',
    title: '08 · Uma porta recusada',
    problem:
      'O portal resolveu. Verifique se responder ICMP também demonstra funcionamento do serviço web.',
    ip: '192.168.10.25',
    gateway: '192.168.10.1',
    configured: true,
    lan: true,
    gatewayUp: true,
    dns: true,
    remoteUp: true,
    icmp: true,
    service: false,
    tls: true,
    diagnosis: 'service',
    required: ['dns', 'remote', 'tcp'],
    explanation:
      'O host responde ICMP e recusa TCP 443. Investigar listener/política é adequado; não sabemos só por isso qual processo ou controle produziu a recusa.',
    hints: [
      'IP, porta e aplicação são observações diferentes.',
      'O ping não é uma requisição HTTPS.',
      'Compare ICMP com conexão à porta 443.',
      'A recusa da porta direciona a investigação ao endpoint/serviço ou política.',
    ],
  },
  {
    id: 'icmp-filter',
    title: '09 · Ping falha, HTTPS funciona',
    problem:
      'Um monitor ICMP mostra falha. Antes de concluir indisponibilidade, examine o serviço esperado.',
    ip: '192.168.10.25',
    gateway: '192.168.10.1',
    configured: true,
    lan: true,
    gatewayUp: true,
    dns: true,
    remoteUp: true,
    icmp: false,
    service: true,
    tls: true,
    diagnosis: 'icmp',
    required: ['remote', 'https'],
    explanation:
      'O HTTPS funciona enquanto ICMP não responde. A ausência de ICMP é compatível com filtragem e não prova queda da aplicação. A causa específica de ICMP não foi isolada.',
    hints: [
      'Pergunte qual protocolo cada teste usa.',
      'Uma política pode permitir HTTPS e não responder ICMP.',
      'Compare ping com acesso HTTPS.',
      'Registre sucesso de aplicação e ausência de resposta ICMP separadamente.',
    ],
  },
];
export const diagnoses = [
  ['healthy', 'Acesso testado funciona; não há falha comprovada nele.'],
  ['route', 'Falta rota aplicável ao destino remoto.'],
  ['gateway', 'Próximo salto diverge do plano e não é alcançado.'],
  ['dns', 'Investigar consulta/caminho DNS, sem causa exata comprovada.'],
  ['config', 'Investigar obtenção da configuração esperada.'],
  ['lan', 'Investigar a comunicação do primeiro enlace local.'],
  ['remote', 'Investigar caminho/destino remoto, sem afirmar causa exata.'],
  ['service', 'Investigar endpoint/serviço ou política da porta.'],
  ['icmp', 'O serviço funciona; ausência de ICMP não prova sua queda.'],
];
export const scenarioById = Object.fromEntries(scenarios.map((s) => [s.id, s]));

export function simulate(s: Scenario, command: Command): string {
  const local = s.configured && s.lan;
  const routed = local && Boolean(s.gateway) && s.gatewayUp;
  const remote = routed && s.remoteUp;
  const resolved = local && s.dns;
  switch (command) {
    case 'config':
      return `Ethernet: conectado\nDHCP esperado: Sim\nIPv4: ${s.ip}\nMáscara: ${s.configured ? '255.255.255.0' : '255.255.0.0'}\nGateway: ${s.gateway || '(ausente)'}\nDNS: 192.168.10.10`;
    case 'routes':
      return `Destino          Próximo salto\n${s.configured ? '192.168.10.0/24' : '169.254.0.0/16'}  diretamente conectado\n${s.gateway ? `0.0.0.0/0        ${s.gateway}` : '(sem rota default ou específica ao destino remoto)'}`;
    case 'gateway':
      return !s.gateway
        ? 'Sem gateway configurado neste cenário.'
        : !local
          ? 'Destino local não alcançado; resolução do vizinho/entrega não completou.'
          : s.gatewayUp
            ? `Resposta de ${s.gateway}: bytes=32 tempo<1ms`
            : `Solicitação a ${s.gateway} expirou; vizinho não resolvido no cenário.`;
    case 'remote':
      return !routed
        ? 'Não há entrega pelo próximo salto aplicável neste cenário.'
        : remote && s.icmp
          ? 'Resposta de 203.0.113.40: bytes=32 tempo=18ms'
          : 'Solicitação ICMP a 203.0.113.40 expirou.';
    case 'dns':
      return resolved
        ? 'Servidor: 192.168.10.10\nNome: portal.example\nAddress: 203.0.113.40'
        : 'Consulta a 192.168.10.10: DNS request timed out.\nNenhuma resposta recebida no prazo.';
    case 'tcp':
      return !remote
        ? 'RemoteAddress: 203.0.113.40\nRemotePort: 443\nTcpTestSucceeded: False (conexão não estabelecida)'
        : s.service
          ? 'RemoteAddress: 203.0.113.40\nRemotePort: 443\nTcpTestSucceeded: True'
          : 'RemoteAddress: 203.0.113.40\nRemotePort: 443\nTcpTestSucceeded: False (conexão recusada no cenário)';
    case 'https':
      return !resolved
        ? 'Não foi possível resolver portal.example nesta tentativa.'
        : !remote
          ? 'Nome resolvido. A conexão ao destino não foi estabelecida.'
          : !s.service
            ? 'Nome resolvido. Conexão TCP 443 recusada; TLS/HTTP não concluídos.'
            : !s.tls
              ? 'TCP conectado; validação TLS falhou.'
              : 'Nome resolvido → TCP conectado → TLS validado → HTTP 200\nRecurso solicitado recebido no cenário.';
    case 'trace':
      return !routed
        ? 'Caminho remoto não iniciado: verifique rota e próximo salto.'
        : !s.remoteUp
          ? `1  ${s.gateway}\n2  * * *\n3  * * *\nDestino não respondeu às sondagens.`
          : `1  ${s.gateway}\n2  * * *\n3  ${s.icmp ? '203.0.113.40 (destino respondeu)' : '* * * (sem resposta ICMP do destino)'}`;
  }
}

export function gradeDiagnosis(s: Scenario, commands: string[], answer: string) {
  const missing = s.required.filter((c) => !commands.includes(c));
  return {
    correct: !missing.length && answer === s.diagnosis,
    missing,
    explanation: s.explanation,
  };
}
