const incidents = [
  {
    id: 'helpdesk-internet',
    area: 'Help Desk',
    title: 'Usuario sem internet',
    scenario: 'O computador mostra Wi-Fi conectado, mas nenhum site abre. Outros usuarios da mesma rede navegam normalmente.',
    commands: ['ipconfig /all', 'ping 127.0.0.1', 'ping no gateway', 'nslookup example.com', 'format C:', 'show ip ospf neighbor'],
    correctCommands: [0, 1, 2, 3],
    causes: ['Gateway incorreto ou DHCP incompleto', 'Falha de OSPF na internet', 'VLAN nativa divergente', 'Conta comprometida'],
    correctCause: 0,
    correction: 'Comece pela configuracao local: endereco, mascara, gateway e DNS. Teste a pilha TCP/IP, depois o gateway e por fim a resolucao de nomes.'
  },
  {
    id: 'noc-dns',
    area: 'NOC',
    title: 'DNS nao resolve',
    scenario: 'O ping para 1.1.1.1 funciona, mas ping para nomes e acesso por dominio falham em varios computadores.',
    commands: ['nslookup example.com', 'ipconfig /displaydns', 'ipconfig /flushdns', 'ping 1.1.1.1', 'show vlan brief', 'net user'],
    correctCommands: [0, 1, 2, 3],
    causes: ['Servidor DNS indisponivel ou configurado incorretamente', 'Cabo desconectado', 'Loop de camada 2', 'Senha expirada'],
    correctCause: 0,
    correction: 'Conectividade IP existe, entao isole a resolucao de nomes. Verifique qual DNS respondeu, teste outro servidor e limpe cache somente depois de registrar o estado.'
  },
  {
    id: 'noc-vlan',
    area: 'NOC',
    title: 'VLAN sem comunicacao',
    scenario: 'Hosts da VLAN 20 comunicam entre si, mas nao acessam a VLAN 10 depois de uma alteracao no switch.',
    commands: ['show vlan brief', 'show interfaces trunk', 'show ip interface brief', 'show running-config', 'nslookup example.com', 'whoami'],
    correctCommands: [0, 1, 2, 3],
    causes: ['Trunk ou roteamento inter-VLAN incorreto', 'Problema exclusivo de DNS', 'Conta bloqueada', 'Disco cheio'],
    correctCause: 0,
    correction: 'Como a comunicacao dentro da VLAN funciona, valide trunk, VLAN permitida, subinterfaces/SVIs e gateways antes de investigar aplicacao.'
  },
  {
    id: 'soc-logins',
    area: 'SOC',
    title: 'Tentativas suspeitas de login',
    scenario: 'O SIEM mostra dezenas de falhas de autenticacao para a mesma conta, vindas de varios enderecos em poucos minutos.',
    commands: ['Consultar IPs de origem no SIEM', 'Verificar sucesso apos as falhas', 'Revisar MFA e risco da conta', 'Preservar horario e evidencias', 'Reiniciar todos os switches', 'Desativar o firewall'],
    correctCommands: [0, 1, 2, 3],
    causes: ['Password spraying ou credencial comprometida', 'Falha de DHCP', 'Erro de VLAN', 'Problema no cabo'],
    correctCause: 0,
    correction: 'Correlacione origem, volume, janela de tempo e eventual login bem-sucedido. Preserve evidencias, contenha a conta conforme playbook e escale com contexto.'
  }
];

const labs = [
  {
    id: 'dhcp',
    title: 'DHCP: cliente recebe configuracao',
    image: 'projetos/CCNA-Labs/imgs/DHCP.png',
    file: 'projetos/CCNA-Labs/labs/Dynamic-Host-Configuration-Protocol(DHCP).pkt',
    objective: 'Configurar um pool DHCP e provar que o cliente recebeu IP, mascara, gateway e DNS corretos.',
    topology: '1 roteador ou servidor DHCP, 1 switch e pelo menos 2 clientes.',
    commands: 'show ip dhcp binding\nshow ip dhcp pool\nipconfig /all\nping <gateway>',
    checks: ['Pool DHCP criado com rede correta', 'Gateway e DNS distribuidos', 'Cliente recebeu endereco da faixa esperada', 'Ping para o gateway funciona'],
    deliverable: 'README com pool, exclusoes, configuracao recebida e testes de ping.'
  },
  {
    id: 'vlan',
    title: 'VLAN e trunk entre switches',
    image: 'projetos/CCNA-Labs/imgs/VLAN-2.png',
    file: 'projetos/CCNA-Labs/labs/VLAN-2(With Trunk).pkt',
    objective: 'Separar hosts em VLANs e transportar as VLANs por um enlace trunk.',
    topology: '2 switches, hosts nas VLANs 10 e 20 e um enlace trunk.',
    commands: 'show vlan brief\nshow interfaces trunk\nshow interfaces switchport\nping <host-da-mesma-vlan>',
    checks: ['VLANs 10 e 20 existem nos switches', 'Portas access estao na VLAN correta', 'Enlace entre switches esta em trunk', 'Hosts da mesma VLAN comunicam entre switches'],
    deliverable: 'Diagrama da topologia e tabela porta, modo, VLAN e resultado.'
  },
  {
    id: 'ospf',
    title: 'OSPF: vizinhanca e rotas',
    image: 'projetos/CCNA-Labs/imgs/OSPF-Protocol.png',
    file: 'projetos/CCNA-Labs/labs/Routing(OSPF Protocol).pkt',
    objective: 'Formar vizinhanca OSPF e anunciar redes para obter conectividade fim a fim.',
    topology: '3 roteadores com redes LAN nas extremidades.',
    commands: 'show ip ospf neighbor\nshow ip route ospf\nshow ip protocols\nping <rede-remota>',
    checks: ['Router IDs identificados', 'Vizinhos OSPF em estado FULL', 'Rotas OSPF aparecem na tabela', 'Ping entre redes remotas funciona'],
    deliverable: 'Relatorio com vizinhos, rotas aprendidas e teste fim a fim.'
  },
  {
    id: 'acl',
    title: 'ACL: permitir e bloquear trafego',
    image: 'projetos/CCNA-Labs/imgs/ACL(Standared).png',
    file: 'projetos/CCNA-Labs/labs/AccessControlList(Standard).pkt',
    objective: 'Aplicar uma ACL e demonstrar exatamente qual trafego foi permitido ou negado.',
    topology: '2 redes ligadas por roteador, com ACL aplicada na interface adequada.',
    commands: 'show access-lists\nshow ip interface\nshow running-config | section access-list\nping <destino>',
    checks: ['Regra possui origem e wildcard corretos', 'ACL esta aplicada na interface e direcao corretas', 'Trafego permitido passa', 'Trafego proibido falha e incrementa contador'],
    deliverable: 'Ticket de mudanca com regra, justificativa, testes antes/depois e rollback.'
  }
];

const examTopics = [
  ['IP, DNS e DHCP', 1],
  ['Subnetting', 2],
  ['Switching e VLAN', 3],
  ['Roteamento', 4],
  ['OSPF', 5],
  ['ACL e NAT', 6],
  ['NTP, SNMP e logs', 7],
  ['Seguranca', 8],
  ['Wireless', 9],
  ['Cloud', 10],
  ['Automacao', 11],
  ['Revisao geral', 12]
];

const readingStatuses = [
  ['quero-ler', 'Quero ler'],
  ['enviado', 'Enviado'],
  ['lendo', 'Lendo'],
  ['finalizado', 'Finalizado']
];

const deliverableTypes = ['README de lab', 'Ticket', 'Relatorio', 'Print', 'Diagrama'];

const initialReadingQueue = [
  { id: 'cert-ccna-topics', title: 'CCNA 200-301 Exam Topics', kind: 'Certificacao', status: 'quero-ler', href: 'biblioteca/cisco-ccna-200-301-exam-topics-v1-0.pdf' },
  { id: 'cert-aws-clf', title: 'AWS CLF-C02 Exam Guide', kind: 'Certificacao', status: 'quero-ler', href: 'biblioteca/certificacoes/aws-cloud-practitioner-clf-c02-exam-guide.pdf' },
  { id: 'cert-sc900', title: 'SC-900 Exam Ref Sample', kind: 'Certificacao', status: 'quero-ler', href: 'biblioteca/certificacoes/sc-900-exam-ref-sample.pdf' }
];

const interviewQuestions = [
  { week: 1, topic: 'Redes basicas', question: 'Explique DNS para um usuario nao tecnico.', exercise: 'Use uma analogia, mas inclua o que acontece quando o DNS falha.', answer: 'DNS transforma nomes em enderecos IP. Eu explicaria como uma agenda de contatos: o usuario informa o nome do site, o computador consulta o DNS e recebe o endereco para iniciar a conexao. Se o DNS falhar, o acesso por IP pode funcionar enquanto o nome nao funciona.' },
  { week: 1, topic: 'Diagnostico', question: 'Qual a ordem basica para investigar um computador sem internet?', exercise: 'Responda em passos e diga o que cada teste prova.', answer: 'Verifico IP, mascara, gateway e DNS; testo loopback; testo o gateway; testo um IP externo; testo um nome. Essa ordem separa pilha local, rede local, roteamento externo e resolucao DNS.' },
  { week: 2, topic: 'Subnetting', question: 'Por que duas maquinas com IPs parecidos podem estar em redes diferentes?', exercise: 'Inclua o papel da mascara.', answer: 'A mascara determina quais bits representam rede e host. IPs visualmente parecidos podem produzir identificadores de rede diferentes quando a mascara e aplicada.' },
  { week: 3, topic: 'VLAN', question: 'O que uma VLAN resolve e o que ela nao resolve sozinha?', exercise: 'Diferencie segmentacao e roteamento.', answer: 'VLAN cria dominios de broadcast separados em camada 2. Ela segmenta, mas nao permite comunicacao entre VLANs sozinha; isso exige roteamento inter-VLAN.' },
  { week: 4, topic: 'Roteamento', question: 'Como um roteador decide para onde enviar um pacote?', exercise: 'Mencione tabela de rotas e melhor correspondencia.', answer: 'Ele consulta a tabela de roteamento e escolhe a rota com prefixo mais especifico. Depois encaminha ao proximo salto ou interface de saida.' },
  { week: 5, topic: 'OSPF', question: 'Quais sinais mostram que OSPF esta funcionando?', exercise: 'Cite comandos e estados.', answer: 'Vizinhos aparecem em estado FULL, redes OSPF aparecem na tabela de rotas e ha conectividade fim a fim. Eu verificaria show ip ospf neighbor, show ip route ospf e ping.' },
  { week: 6, topic: 'ACL e NAT', question: 'Qual a diferenca entre ACL e NAT?', exercise: 'Explique funcao, risco e um exemplo.', answer: 'ACL controla trafego permitido ou negado. NAT traduz enderecos. Uma ACL pode bloquear SSH de uma rede; NAT pode permitir que enderecos privados saiam usando um endereco publico.' },
  { week: 7, topic: 'Monitoramento', question: 'Por que horario correto importa em logs?', exercise: 'Relacione NTP e investigacao.', answer: 'Sem horario sincronizado, eventos de dispositivos diferentes nao podem ser correlacionados com confianca. NTP ajuda a construir uma linha do tempo coerente.' },
  { week: 8, topic: 'SOC', question: 'Como voce investigaria muitas falhas de login?', exercise: 'Fale de evidencia, correlacao e contencao.', answer: 'Eu verificaria origem, volume, horario, contas atingidas, sucesso depois das falhas e MFA. Preservaria evidencias e seguiria o playbook para conter e escalar.' },
  { week: 9, topic: 'Wireless', question: 'Quais causas comuns deixam um Wi-Fi lento?', exercise: 'Separe sinal, interferencia e capacidade.', answer: 'Sinal fraco, interferencia de canal, muitos clientes, largura de canal inadequada, obstaculos, uplink saturado e configuracao de seguranca podem reduzir desempenho.' },
  { week: 10, topic: 'Cloud', question: 'Security Group e firewall sao a mesma coisa?', exercise: 'Responda sem depender de um provedor especifico.', answer: 'Ambos aplicam regras de trafego, mas security groups normalmente sao controles virtuais ligados a recursos cloud e gerenciados pelo provedor. Firewalls podem oferecer inspecao e politicas mais amplas.' },
  { week: 11, topic: 'Automacao', question: 'Quando vale automatizar uma tarefa de rede?', exercise: 'Mencione repeticao, risco e validacao.', answer: 'Quando a tarefa e repetitiva, padronizavel e testavel. Automatizar reduz erro manual, mas exige validacao, controle de versao e plano de rollback.' },
  { week: 12, topic: 'Comunicacao', question: 'Conte sobre um incidente tecnico que voce resolveu.', exercise: 'Use situacao, acao, resultado e aprendizado.', answer: 'Estruture em contexto, impacto, hipoteses, testes, causa, correcao, resultado mensuravel e o que documentou para evitar recorrencia.' }
];

const interviewRubrics = {
  'Redes basicas': { terms: ['nome', 'ip', 'consulta', 'dns', 'falha'], followUp: 'Como voce provaria que a falha e DNS e nao conectividade IP?' },
  'Diagnostico': { terms: ['ip', 'mascara', 'gateway', '1.1.1.1', 'dns'], followUp: 'Em qual resultado voce escalaria ao time de redes?' },
  'Subnetting': { terms: ['mascara', 'bits', 'rede', 'host'], followUp: 'Demonstre com dois enderecos e uma mascara /26.' },
  'VLAN': { terms: ['broadcast', 'camada 2', 'segment', 'roteamento'], followUp: 'Quais comandos provariam uma VLAN ausente no trunk?' },
  'Roteamento': { terms: ['tabela', 'prefixo', 'especific', 'next hop'], followUp: 'O que muda se faltar rota de retorno?' },
  'OSPF': { terms: ['full', 'neighbor', 'route', 'ping'], followUp: 'Que incompatibilidades impedem a adjacencia?' },
  'ACL e NAT': { terms: ['permit', 'deny', 'traduz', 'endereco'], followUp: 'Como faria testes positivo e negativo sem derrubar o servico?' },
  'Monitoramento': { terms: ['ntp', 'correl', 'linha do tempo', 'timestamp'], followUp: 'Como horario errado afeta a causa raiz?' },
  'SOC': { terms: ['origem', 'contas', 'sucesso', 'evidencia', 'conten'], followUp: 'O que diferencia brute force de password spray?' },
  'Wireless': { terms: ['sinal', 'interferencia', 'canal', 'clientes', 'uplink'], followUp: 'Que medicao separa interferencia de saturacao?' },
  'Cloud': { terms: ['responsabilidade', 'provedor', 'cliente', 'configur'], followUp: 'Quem responde por IAM mal configurado em IaaS?' },
  'Automacao': { terms: ['repet', 'valid', 'versao', 'rollback'], followUp: 'Qual seria seu teste antes de aplicar em massa?' },
  'Comunicacao': { terms: ['impacto', 'evidencia', 'causa', 'resultado', 'aprend'], followUp: 'Qual foi o resultado mensuravel e como evitou recorrencia?' }
};

const englishWeeks = [
  { terms: [['address', 'endereco'], ['gateway', 'porta de saida'], ['resolve', 'resolver'], ['request', 'requisicao'], ['reachable', 'alcancavel']], doc: 'The client received an IP address from DHCP, but the configured DNS server is not reachable. Test the gateway before changing the DNS settings.', translation: 'O cliente recebeu um endereco IP via DHCP, mas o servidor DNS configurado nao esta alcancavel. Teste o gateway antes de alterar o DNS.', prompt: 'Explain how you would troubleshoot a user with no internet access.', sample: 'First, I would check the IP address, subnet mask, default gateway, and DNS settings. Then I would test the local stack, the gateway, an external IP, and finally name resolution.' },
  { terms: [['subnet', 'sub-rede'], ['mask', 'mascara'], ['range', 'faixa'], ['network', 'rede'], ['broadcast', 'broadcast']], doc: 'The subnet mask defines which part of an address identifies the network. A wrong mask can make a remote host appear local.', translation: 'A mascara de sub-rede define qual parte do endereco identifica a rede. Uma mascara incorreta pode fazer um host remoto parecer local.', prompt: 'Explain why subnetting is useful.', sample: 'Subnetting divides a network into smaller segments. It improves address planning, limits broadcasts, and supports security and routing decisions.' },
  { terms: [['switch', 'switch'], ['access port', 'porta de acesso'], ['trunk', 'tronco'], ['frame', 'quadro'], ['broadcast domain', 'dominio de broadcast']], doc: 'An access port carries traffic for one VLAN. A trunk carries traffic for multiple VLANs and identifies frames with tags.', translation: 'Uma porta de acesso transporta trafego de uma VLAN. Um trunk transporta varias VLANs e identifica quadros com tags.', prompt: 'Describe the difference between an access port and a trunk.', sample: 'An access port connects an endpoint to one VLAN. A trunk connects network devices and carries multiple VLANs using tags.' },
  { terms: [['route', 'rota'], ['next hop', 'proximo salto'], ['interface', 'interface'], ['forward', 'encaminhar'], ['routing table', 'tabela de rotas']], doc: 'The router checks the destination address and selects the most specific route in its routing table.', translation: 'O roteador verifica o endereco de destino e seleciona a rota mais especifica em sua tabela de roteamento.', prompt: 'Explain how a router forwards a packet.', sample: 'The router reads the destination IP, searches its routing table, selects the longest prefix match, and sends the packet to the next hop or exit interface.' },
  { terms: [['neighbor', 'vizinho'], ['adjacency', 'adjacencia'], ['cost', 'custo'], ['link state', 'estado de enlace'], ['converge', 'convergir']], doc: 'OSPF routers exchange link-state information and calculate the best path based on cost. Healthy neighbors normally reach the FULL state.', translation: 'Roteadores OSPF trocam informacoes de estado de enlace e calculam o melhor caminho por custo. Vizinhos saudaveis normalmente chegam ao estado FULL.', prompt: 'How do you verify that OSPF is working?', sample: 'I check neighbor states, OSPF routes, protocol settings, and end-to-end connectivity with show and ping commands.' },
  { terms: [['permit', 'permitir'], ['deny', 'negar'], ['source', 'origem'], ['destination', 'destino'], ['translate', 'traduzir']], doc: 'An ACL filters traffic according to ordered rules. NAT changes address information, usually when private hosts communicate with external networks.', translation: 'Uma ACL filtra trafego conforme regras ordenadas. NAT altera informacoes de endereco, geralmente quando hosts privados acessam redes externas.', prompt: 'What is the difference between an ACL and NAT?', sample: 'An ACL decides which traffic is allowed or denied. NAT translates addresses between network domains.' },
  { terms: [['timestamp', 'marca de tempo'], ['alert', 'alerta'], ['baseline', 'linha de base'], ['polling', 'consulta periodica'], ['availability', 'disponibilidade']], doc: 'Monitoring data is useful only when timestamps are reliable. NTP helps analysts correlate alerts, logs, and outages across devices.', translation: 'Dados de monitoramento so sao uteis quando os horarios sao confiaveis. NTP ajuda analistas a correlacionar alertas, logs e indisponibilidades.', prompt: 'Why is time synchronization important?', sample: 'Accurate timestamps allow teams to correlate events from different systems and build a reliable incident timeline.' },
  { terms: [['threat', 'ameaca'], ['evidence', 'evidencia'], ['containment', 'contencao'], ['authentication', 'autenticacao'], ['suspicious', 'suspeito']], doc: 'Multiple failed logins from different addresses may indicate password spraying. Preserve evidence and check whether any attempt succeeded.', translation: 'Varias falhas de login vindas de enderecos diferentes podem indicar password spraying. Preserve evidencias e verifique se alguma tentativa teve sucesso.', prompt: 'How would you investigate suspicious login attempts?', sample: 'I would review source addresses, timing, affected accounts, successful logins, MFA events, and then follow the containment playbook.' },
  { terms: [['signal', 'sinal'], ['channel', 'canal'], ['interference', 'interferencia'], ['bandwidth', 'largura de banda'], ['client', 'cliente']], doc: 'Poor wireless performance can come from weak signal, channel interference, too many clients, or a saturated uplink.', translation: 'Desempenho Wi-Fi ruim pode vir de sinal fraco, interferencia de canal, clientes demais ou uplink saturado.', prompt: 'What would you check when Wi-Fi is slow?', sample: 'I would check signal strength, channel usage, interference, client count, access point load, and uplink utilization.' },
  { terms: [['instance', 'instancia'], ['region', 'regiao'], ['availability zone', 'zona de disponibilidade'], ['security group', 'grupo de seguranca'], ['shared responsibility', 'responsabilidade compartilhada']], doc: 'Cloud security follows a shared responsibility model. The provider protects the cloud infrastructure while the customer configures identities, data, and workloads.', translation: 'Seguranca em nuvem segue um modelo de responsabilidade compartilhada. O provedor protege a infraestrutura, enquanto o cliente configura identidades, dados e cargas.', prompt: 'Explain shared responsibility in cloud security.', sample: 'The provider secures the underlying cloud, while the customer secures configurations, identities, applications, and data according to the service used.' },
  { terms: [['automation', 'automacao'], ['configuration', 'configuracao'], ['payload', 'carga de dados'], ['endpoint', 'endpoint'], ['rollback', 'reversao']], doc: 'Network automation should be repeatable, versioned, validated, and reversible. A rollback plan is required before a large change.', translation: 'Automacao de rede deve ser repetivel, versionada, validada e reversivel. Um plano de rollback e necessario antes de uma grande mudanca.', prompt: 'When should a network task be automated?', sample: 'A task is a good automation candidate when it is repetitive, standardized, testable, and has a clear rollback procedure.' },
  { terms: [['incident', 'incidente'], ['impact', 'impacto'], ['root cause', 'causa raiz'], ['resolution', 'resolucao'], ['follow-up', 'acompanhamento']], doc: 'A strong incident summary describes impact, evidence, actions, root cause, resolution, and follow-up work without unnecessary detail.', translation: 'Um bom resumo de incidente descreve impacto, evidencias, acoes, causa raiz, resolucao e acompanhamento sem detalhes desnecessarios.', prompt: 'Tell me about a technical incident you resolved.', sample: 'I would describe the situation and impact, the tests I performed, the root cause, the resolution, the result, and what I documented afterward.' }
];

export const careerCatalog = Object.freeze({
  incidents,
  labs,
  examTopics,
  readingStatuses,
  deliverableTypes,
  initialReadingQueue,
  interviewQuestions,
  interviewRubrics,
  englishWeeks
});
