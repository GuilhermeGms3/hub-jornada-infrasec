(function () {
  'use strict';

  const keys = {
    journey: 'infrasec-deep-journey',
    incidents: 'infrasec-deep-incidents',
    soc: 'infrasec-deep-soc',
    cloud: 'infrasec-deep-cloud',
    terminal: 'infrasec-deep-terminal',
    certs: 'infrasec-deep-certs',
    deliverables: 'infrasec-deliverables'
  };
  const read = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  };
  const save = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('infrasec:competency-changed'));
  };
  const esc = (value) => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
  const normalize = (value) => String(value || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const hasTerms = (text, terms) => terms.filter((term) => normalize(text).includes(normalize(term)));
  const options = (items) => items.map((item, index) => `<option value="${index}">${esc(item)}</option>`).join('');
  const average = (items) => items.length ? Math.round(items.reduce((sum, value) => sum + value, 0) / items.length) : 0;
  const latestScores = (items, id) => items.filter((item) => item.id === id).map((item) => item.score);
  const scoreBadge = (score, passed) => score == null
    ? '<strong>Nao avaliado</strong><span>Meta: 80%</span>'
    : `<strong>${score}%</strong><span>${passed ? 'Competencia demonstrada' : 'Refaca com as lacunas indicadas'}</span>`;

  function addDeliverable(sourceId, title, type, body, week) {
    const list = read(keys.deliverables, []);
    if (!list.some((item) => item.sourceId === sourceId)) {
      list.unshift({
        id: `deep-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        sourceId, type, week, title, body, evidence: 'Academia Pratica: avaliacao >= 80%',
        status: 'concluido', createdAt: new Date().toISOString()
      });
      localStorage.setItem(keys.deliverables, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('infrasec:deliverables-changed'));
    }
  }

  const journey = [
    {
      id: 'w1', week: 1, title: 'Diagnostico de conectividade por camadas',
      outcome: 'Isolar falhas entre host, LAN, roteamento e DNS sem trocar configuracoes no escuro.',
      prereq: 'Nenhum. Instale Packet Tracer e tenha PowerShell ou terminal disponivel.',
      theory: ['Diferencie IP, mascara, gateway, DNS, DHCP e MAC.', 'Leia um ipconfig /all e reconheca APIPA 169.254.0.0/16.', 'Entenda o caminho: cache DNS, consulta, ARP do gateway, roteamento e TCP/TLS.'],
      build: ['Registre ipconfig /all, ping 127.0.0.1, gateway, 1.1.1.1 e um dominio.', 'Execute nslookup e tracert; escreva o que cada resultado prova.', 'Monte dois PCs e um switch no Packet Tracer; configure uma mesma sub-rede e valide.'],
      breakFix: ['Remova o gateway de um PC e preveja quais testes ainda funcionam.', 'Troque somente o DNS por um endereco inexistente.', 'Compare “IP externo funciona, nome falha” com “nem gateway responde”.'],
      checks: ['O ticket separa sintoma de causa.', 'Ha teste antes e depois.', 'Cada comando possui interpretacao, nao apenas output.', 'Existe rollback da alteracao.'],
      questions: [
        ['Um host recebeu 169.254.18.7/16. Qual hipotese vem primeiro?', ['DNS indisponivel', 'DHCP indisponivel ou inacessivel', 'Rota default duplicada'], 1],
        ['Ping em 1.1.1.1 funciona, mas nslookup expira. Qual camada investigar?', ['Resolucao de nomes', 'Cabo local', 'Tabela ARP do switch'], 0],
        ['O que o ping no gateway comprova?', ['Internet completa', 'Alcance IP ate a saida da LAN', 'DNS correto'], 1]
      ],
      evidenceTerms: ['ipconfig', 'gateway', '1.1.1.1', 'nslookup', 'causa', 'validacao', 'rollback']
    },
    {
      id: 'w2', week: 2, title: 'Subnetting aplicado a um chamado',
      outcome: 'Calcular rede, broadcast, hosts e diagnosticar mascara incorreta.',
      prereq: 'Semana 1 aprovada ou dominio de IP, mascara e gateway.',
      theory: ['Converta /24, /25, /26, /27 e /28 em blocos.', 'Use AND binario para provar a rede.', 'Diferencie endereco de rede, host e broadcast.'],
      build: ['Planeje quatro setores com VLSM para 100, 50, 20 e 10 hosts.', 'Documente rede, CIDR, primeiro host, ultimo host e broadcast.', 'Configure dois pares de hosts e valide quem deveria conversar diretamente.'],
      breakFix: ['Aplique /24 em um host que deveria usar /26.', 'Mostre por que ele tenta ARP para um destino que deveria ir ao gateway.', 'Corrija a mascara e repita os testes.'],
      checks: ['Nenhuma sub-rede se sobrepoe.', 'Todos os setores possuem capacidade suficiente.', 'O diagnostico explica o efeito da mascara.', 'A tabela VLSM vira artefato.'],
      questions: [
        ['Quantos hosts utilizaveis existem em /27?', ['14', '30', '62'], 1],
        ['Qual broadcast de 192.168.10.64/26?', ['192.168.10.95', '192.168.10.127', '192.168.10.255'], 1],
        ['Uma mascara incorreta pode fazer o host...', ['Tratar rede remota como local', 'Alterar o MAC do gateway', 'Desligar o DHCP'], 0]
      ],
      evidenceTerms: ['vlsm', '/26', 'rede', 'broadcast', 'primeiro host', 'ultimo host', 'validacao']
    },
    {
      id: 'w3', week: 3, title: 'VLAN, trunk e inter-VLAN',
      outcome: 'Segmentar usuarios e localizar falhas de acesso, trunk e roteamento inter-VLAN.',
      prereq: 'Subnetting aprovado e operacao basica do Packet Tracer.',
      theory: ['VLAN separa dominios de broadcast em camada 2.', 'Access carrega uma VLAN; trunk 802.1Q carrega varias.', 'Inter-VLAN exige SVI ou router-on-a-stick.'],
      build: ['Crie VLAN 10 USERS e VLAN 20 SUPPORT.', 'Configure portas access, trunk e subinterfaces/SVIs.', 'Valide MAC table, VLANs, trunk e ping intra/inter-VLAN.'],
      breakFix: ['Remova VLAN 20 da allowed list do trunk.', 'Colete show vlan brief e show interfaces trunk.', 'Restaure, valide e registre por que somente uma VLAN falhou.'],
      checks: ['Topologia e plano de portas documentados.', 'Outputs mostram estado antes/depois.', 'Falha e dominio de impacto identificados.', 'Configuracao final pode ser reproduzida.'],
      questions: [
        ['Uma porta para PC normalmente deve estar em modo...', ['trunk', 'access', 'routed'], 1],
        ['VLAN 20 funciona localmente, mas nao cruza o trunk. Primeiro comando?', ['show interfaces trunk', 'show ip ospf neighbor', 'show clock'], 0],
        ['Quem permite comunicacao entre VLANs?', ['STP sozinho', 'Roteamento camada 3', 'Tabela MAC'], 1]
      ],
      evidenceTerms: ['vlan 10', 'vlan 20', 'trunk', 'allowed', 'show vlan', 'ping', 'rollback']
    },
    {
      id: 'w4', week: 4, title: 'Roteamento estatico e selecao de rotas',
      outcome: 'Construir conectividade entre redes e justificar a rota escolhida.',
      prereq: 'Semana 3 e leitura de tabela de roteamento.',
      theory: ['Longest prefix match vence antes da metrica.', 'Rota estatica precisa de rede, mascara e next hop/interface.', 'Rota default atende destinos sem rota mais especifica.'],
      build: ['Monte tres roteadores em linha e tres LANs.', 'Configure rotas estaticas de ida e volta.', 'Valide show ip route, ping e traceroute fim a fim.'],
      breakFix: ['Aponte uma rota para next hop incorreto.', 'Localize onde o traceroute para e confira a tabela.', 'Corrija e documente risco e rollback.'],
      checks: ['Ha caminho de ida e retorno.', 'A rota escolhida e explicada por prefixo.', 'O teste parte de host, nao apenas roteador.', 'Configuracoes estao no README.'],
      questions: [
        ['Entre /16 e /24 para o mesmo destino, qual vence?', ['/16', '/24', 'A menor metrica sempre'], 1],
        ['Ping chega ao destino, mas resposta nao volta. Hipotese forte?', ['Falta rota de retorno', 'DNS', 'VLAN nativa'], 0],
        ['0.0.0.0/0 representa...', ['Loopback', 'Rota default', 'Broadcast'], 1]
      ],
      evidenceTerms: ['show ip route', 'next hop', 'rota de retorno', 'traceroute', 'longest', 'validacao', 'rollback']
    },
    {
      id: 'w5', week: 5, title: 'OSPF: adjacencia, rotas e falhas',
      outcome: 'Formar vizinhanca OSPF, anunciar redes e diagnosticar adjacencia.',
      prereq: 'Roteamento estatico aprovado.',
      theory: ['OSPF troca estado de enlace e calcula custo.', 'Vizinhos exigem parametros compativeis no enlace.', 'FULL nao garante que todas as redes corretas foram anunciadas.'],
      build: ['Substitua as rotas estaticas do lab anterior por OSPF area 0.', 'Valide neighbor FULL, rotas O e conectividade.', 'Registre router-id, redes anunciadas e interfaces passivas.'],
      breakFix: ['Altere a area de um lado do enlace.', 'Compare show ip ospf neighbor e show ip protocols.', 'Restaure a area e confirme convergencia.'],
      checks: ['Adjacencias FULL registradas.', 'Rotas O aparecem nos roteadores corretos.', 'Falha de area foi provada por output.', 'Ha teste fim a fim apos convergencia.'],
      questions: [
        ['Estado desejado de vizinho OSPF ponto a ponto?', ['DOWN', 'FULL', 'EXSTART permanente'], 1],
        ['Area diferente no mesmo enlace causa...', ['Falha de adjacencia', 'NAT dinamico', 'Loop STP'], 0],
        ['Qual comando mostra rotas aprendidas por OSPF?', ['show ip route ospf', 'show vlan brief', 'show access-lists'], 0]
      ],
      evidenceTerms: ['show ip ospf neighbor', 'full', 'area 0', 'show ip route ospf', 'convergencia', 'ping', 'rollback']
    },
    {
      id: 'w6', week: 6, title: 'ACL, NAT e mudanca controlada',
      outcome: 'Aplicar menor acesso necessario sem interromper trafego legitimo.',
      prereq: 'Roteamento e testes fim a fim aprovados.',
      theory: ['ACL e processada em ordem e termina em implicit deny.', 'ACL estendida filtra protocolo, origem, destino e porta.', 'NAT traduz enderecos; ACL decide permissao.'],
      build: ['Permita USERS acessar HTTP do servidor e negue SSH.', 'Configure PAT para a rede interna.', 'Valide permitidos, negados, hits da ACL e traducoes NAT.'],
      breakFix: ['Coloque uma regra ampla de deny antes do permit.', 'Use counters e testes por protocolo para provar a causa.', 'Corrija com plano de rollback e janela de mudanca.'],
      checks: ['Regras seguem menor privilegio.', 'Testes positivos e negativos registrados.', 'Counters sustentam a conclusao.', 'Mudanca inclui impacto e rollback.'],
      questions: [
        ['Uma ACL sem correspondencia explicita termina em...', ['permit any', 'implicit deny', 'NAT overload'], 1],
        ['Para filtrar TCP/22 por origem e destino, use preferencialmente...', ['ACL estendida', 'ACL standard', 'STP'], 0],
        ['Qual comando ajuda a validar PAT ativo?', ['show ip nat translations', 'show spanning-tree', 'show cdp neighbors'], 0]
      ],
      evidenceTerms: ['implicit deny', 'permit', 'tcp', 'show access-lists', 'show ip nat translations', 'teste negativo', 'rollback']
    }
  ];

  const incidents = [
    {
      id: 'hd-dhcp', area: 'Help Desk', title: 'Notebook recebe APIPA', priority: 'P3 - um usuario, SLA 4h',
      brief: 'Usuario voltou do almoco e nao acessa intranet nem internet. Wi-Fi aparece conectado.',
      evidence: [
        ['ipconfig /all', 'IPv4 169.254.44.18/16 | Gateway: vazio | DHCP Enabled: Yes', true],
        ['ping 127.0.0.1', 'Reply from 127.0.0.1: time<1ms', false],
        ['ipconfig /renew', 'Unable to contact your DHCP server. Request timed out.', true],
        ['nslookup intranet.local', 'Server: Unknown | DNS request timed out.', false],
        ['Wi-Fi de outro usuario', '10.10.20.54/24, gateway 10.10.20.1, operando normalmente.', true]
      ],
      causes: ['Falha de DNS', 'Cliente nao alcanca DHCP', 'Gateway da filial sem rota'],
      resolutions: ['Trocar DNS para 8.8.8.8', 'Reconectar ao SSID correto e renovar concessao', 'Criar rota default'],
      escalations: ['Escalar P1 para SOC', 'Resolver no N1; escalar rede se outros clientes falharem', 'Escalar cloud'],
      correct: [1, 1, 1], terms: ['impacto', '169.254', 'dhcp', 'renew', 'ssid', 'validacao', 'rollback']
    },
    {
      id: 'hd-dns', area: 'Help Desk', title: 'IP funciona, nomes nao resolvem', priority: 'P3 - tres usuarios, SLA 4h',
      brief: 'Aplicativos por IP abrem; portal por nome retorna erro de DNS.',
      evidence: [
        ['ping 10.20.0.1', 'Reply: 2ms', false], ['ping 1.1.1.1', 'Reply: 18ms', true],
        ['nslookup portal.empresa.local', 'DNS request timed out. Server 10.20.0.53', true],
        ['Test-NetConnection 10.20.0.53 -Port 53', 'TcpTestSucceeded: False', true],
        ['arp -a', 'Gateway 10.20.0.1 possui entrada dinamica.', false]
      ],
      causes: ['Servidor/servico DNS interno inacessivel', 'DHCP sem enderecos', 'Cabo desconectado'],
      resolutions: ['Reiniciar todos os PCs', 'Acionar dono do DNS e aplicar DNS secundario aprovado', 'Alterar mascara para /8'],
      escalations: ['Escalar ao time DNS com testes, escopo e horario', 'Escalar ao financeiro', 'Nao escalar e encerrar'],
      correct: [0, 1, 0], terms: ['impacto', '1.1.1.1', 'nslookup', 'porta 53', 'dns', 'validacao', 'rollback']
    },
    {
      id: 'hd-gateway', area: 'Help Desk', title: 'Gateway configurado incorretamente', priority: 'P3 - um desktop, SLA 4h',
      brief: 'PC novo acessa impressora da mesma rede, mas nenhum destino remoto.',
      evidence: [
        ['ipconfig', 'IPv4 192.168.40.27/24 | Gateway 192.168.4.1', true],
        ['ping 192.168.40.50', 'Reply: 1ms', true], ['ping 192.168.4.1', 'Destination host unreachable.', true],
        ['route print', '0.0.0.0/0 via 192.168.4.1', true], ['nslookup example.com', 'DNS request timed out.', false]
      ],
      causes: ['Gateway fora da sub-rede local', 'VLAN trunk ausente', 'Senha expirada'],
      resolutions: ['Configurar gateway 192.168.40.1 conforme IPAM/DHCP', 'Liberar qualquer trafego na ACL', 'Limpar navegador'],
      escalations: ['Corrigir conforme padrao; escalar se DHCP entregar valor errado', 'SOC P1', 'Desativar antivirus'],
      correct: [0, 0, 0], terms: ['impacto', '192.168.4.1', 'sub-rede', 'gateway', 'rota default', 'validacao', 'rollback']
    },
    {
      id: 'noc-vlan', area: 'NOC', title: 'VLAN 30 ausente no trunk', priority: 'P2 - setor inteiro, SLA 1h',
      brief: 'Usuarios da VLAN 30 no segundo switch perderam acesso; VLANs 10 e 20 seguem normais.',
      evidence: [
        ['show vlan brief', 'VLAN 30 USERS active nas portas Gi0/5-12.', false],
        ['show interfaces trunk', 'Gi0/1 allowed: 10,20 | active: 10,20', true],
        ['show spanning-tree vlan 30', 'No spanning tree instance exists.', true],
        ['show interfaces status', 'Gi0/1 connected trunk full 1G', false],
        ['ping gateway VLAN 20', 'Success rate 100 percent', false]
      ],
      causes: ['VLAN 30 nao permitida/criada no caminho trunk', 'OSPF area mismatch', 'DNS externo'],
      resolutions: ['Adicionar VLAN 30 de forma controlada nos trunks do caminho', 'Reiniciar core', 'Desabilitar STP'],
      escalations: ['Executar mudanca autorizada; escalar se core fora do escopo', 'Escalar ao RH', 'Encerrar como DNS'],
      correct: [0, 0, 0], terms: ['impacto', 'vlan 30', 'trunk', 'allowed', 'show interfaces trunk', 'validacao', 'rollback']
    },
    {
      id: 'noc-ospf', area: 'NOC', title: 'Adjacencia OSPF caiu apos mudanca', priority: 'P2 - filial isolada, SLA 1h',
      brief: 'Alerta de vizinho OSPF down logo apos alteracao no enlace R1-R2.',
      evidence: [
        ['show ip ospf neighbor', 'Nenhum vizinho na Gi0/0.', true],
        ['show ip ospf interface Gi0/0 R1', 'Area 0, Hello 10, Dead 40', true],
        ['show ip ospf interface Gi0/0 R2', 'Area 1, Hello 10, Dead 40', true],
        ['show interfaces Gi0/0', 'up/up, errors 0', false],
        ['ping IP do enlace', 'Success rate 100 percent', false]
      ],
      causes: ['Area OSPF divergente no enlace', 'Falha fisica', 'NAT overload'],
      resolutions: ['Restaurar area planejada e validar vizinho FULL/rotas', 'Trocar cabo imediatamente', 'Limpar DNS'],
      escalations: ['Rollback autorizado e escalar ao owner se persistir', 'Abrir incidente SOC', 'Nao registrar mudanca'],
      correct: [0, 0, 0], terms: ['impacto', 'area 0', 'area 1', 'ospf', 'full', 'rotas', 'rollback']
    },
    {
      id: 'noc-acl', area: 'NOC', title: 'ACL bloqueia aplicacao nova', priority: 'P2 - servico de negocio, SLA 1h',
      brief: 'Aplicacao 10.50.20.10 nao conecta ao banco 10.60.10.20:5432 apos implantacao.',
      evidence: [
        ['show access-lists APP-OUT', '10 deny ip any any (184 matches) | 20 permit tcp 10.50.20.0/24 host 10.60.10.20 eq 5432', true],
        ['Test-NetConnection banco -Port 5432', 'TcpTestSucceeded: False', true],
        ['ping banco', 'Reply: 3ms', false], ['show ip route 10.60.10.20', 'Known via OSPF, metric 20', false],
        ['show ip nat translations', 'No translations', false]
      ],
      causes: ['Implicit/ordered ACL: deny amplo antes do permit', 'OSPF sem rota', 'Banco sem DNS'],
      resolutions: ['Reposicionar regra especifica antes do deny, com change e rollback', 'Permitir ip any any', 'Reiniciar roteadores'],
      escalations: ['Change de rede com owner da aplicacao e teste', 'Sem escalonamento e sem registro', 'Escalar para facilities'],
      correct: [0, 0, 0], terms: ['impacto', 'deny', 'permit', 'ordem', '5432', 'teste negativo', 'rollback']
    }
  ];

  const socCases = [
    {
      id: 'spray', title: 'Password spray contra varias contas', brief: 'Correlacione falhas distribuídas e decida contencao.',
      logs: `10:02:11 EventID=4625 src=203.0.113.77 user=ana status=0xC000006A\n10:02:14 EventID=4625 src=203.0.113.77 user=bruno status=0xC000006A\n10:02:18 EventID=4625 src=203.0.113.77 user=carla status=0xC000006A\n10:02:22 EventID=4625 src=203.0.113.77 user=diego status=0xC000006A\n10:02:59 EventID=4625 src=203.0.113.77 user=financeiro status=0xC000006A`,
      classification: 'Password spraying', severity: 'Media', iocs: ['203.0.113.77', 'ana', 'bruno', 'carla'], timeline: ['10:02', '4625', 'varias contas'],
      action: ['bloquear', 'mfa', 'preservar', 'escalar'], mitre: 'MITRE ATT&CK T1110.003'
    },
    {
      id: 'bruteforce', title: 'Brute force seguido de sucesso', brief: 'Determine se houve comprometimento e priorize resposta.',
      logs: `22:41:01 EventID=4625 src=198.51.100.24 user=jsilva\n22:41:03 EventID=4625 src=198.51.100.24 user=jsilva\n22:41:06 EventID=4625 src=198.51.100.24 user=jsilva\n22:41:09 EventID=4624 src=198.51.100.24 user=jsilva LogonType=10\n22:43:12 process=powershell.exe host=WS-044 user=jsilva`,
      classification: 'Brute force com possivel comprometimento', severity: 'Alta', iocs: ['198.51.100.24', 'jsilva', 'WS-044'], timeline: ['22:41', '4625', '4624', 'powershell'],
      action: ['conter', 'sessao', 'senha', 'preservar'], mitre: 'MITRE ATT&CK T1110'
    },
    {
      id: 'service', title: 'Falhas de conta de servico apos troca de senha', brief: 'Evite transformar comportamento operacional conhecido em incidente de seguranca.',
      logs: `08:00:00 change=CHG004812 account=svc_backup password_rotated=true\n08:01:05 EventID=4625 src=10.0.8.15 user=svc_backup LogonType=5\n08:02:05 EventID=4625 src=10.0.8.15 user=svc_backup LogonType=5\n08:03:10 host=BKPSRV01 service=BackupAgent status=stopped`,
      classification: 'Falso positivo operacional', severity: 'Baixa', iocs: ['10.0.8.15', 'svc_backup', 'BKPSRV01'], timeline: ['08:00', 'troca', '08:01', 'servico'],
      action: ['validar', 'change', 'credencial', 'monitorar'], mitre: 'Contexto operacional; nao atribuir ATT&CK sem evidencia'
    },
    {
      id: 'powershell', title: 'PowerShell codificado em endpoint', brief: 'Analise processo, cadeia de execucao e preservacao de evidencia.',
      logs: `14:14:31 host=FIN-22 user=maria parent=WINWORD.EXE process=powershell.exe\n14:14:31 cmd="powershell -enc SQBFAFgAIAAo..." network=203.0.113.90:443\n14:14:45 file=C:\\Users\\maria\\AppData\\Local\\Temp\\update.ps1 sha256=9f3c...a81\n14:15:02 defender=Behavior:Win32/SuspScript alert=high`,
      classification: 'Execucao suspeita de PowerShell', severity: 'Alta', iocs: ['FIN-22', '203.0.113.90', '9f3c...a81'], timeline: ['14:14', 'winword', 'powershell', 'rede'],
      action: ['isolar', 'hash', 'memoria', 'escalar'], mitre: 'MITRE ATT&CK T1059.001'
    }
  ];

  const cloudLabs = [
    {
      id: 'aws-iam', title: 'AWS IAM: remover privilegio excessivo', provider: 'AWS',
      brief: 'Um usuario de suporte precisa ler logs do bucket app-logs, mas recebeu AdministratorAccess.',
      artifact: `Current: User support-jr -> AdministratorAccess\nRequired: list bucket app-logs; read objects under /prod/\nConstraint: no write, delete, IAM, billing or other buckets`,
      questions: [
        ['Qual acao respeita menor privilegio?', ['Manter AdministratorAccess', 'Criar politica limitada a s3:ListBucket e s3:GetObject no recurso correto', 'Usar root'], 1],
        ['Como validar sem afetar producao?', ['Policy Simulator e testes permitidos/negados', 'Esperar um incidente', 'Desativar CloudTrail'], 0],
        ['Qual evidencia deve ficar no relatorio?', ['Somente screenshot', 'Politica, testes positivos/negativos e CloudTrail', 'Senha do usuario'], 1]
      ],
      terms: ['menor privilegio', 's3:getobject', 'recurso', 'teste positivo', 'teste negativo', 'cloudtrail'],
      sources: [['Guia IAM de menor privilegio', 'https://docs.aws.amazon.com/IAM/latest/UserGuide/getting-started-reduce-permissions.html']]
    },
    {
      id: 'aws-vpc', title: 'AWS VPC: servidor exposto e sem rastreabilidade', provider: 'AWS',
      brief: 'EC2 web possui SSH 0.0.0.0/0, CloudTrail nao foi conferido e nao ha budget.',
      artifact: `VPC 10.20.0.0/16\nPublic subnet 10.20.1.0/24: web-01\nSG inbound: tcp/22 0.0.0.0/0; tcp/443 0.0.0.0/0\nLogging: unknown | Budget alert: none`,
      questions: [
        ['Melhor correcao para SSH?', ['Remover acesso publico e usar SSM/VPN ou origem administrativa restrita', 'Abrir todas as portas', 'Mover para outra regiao'], 0],
        ['Security Group e...', ['Stateless', 'Stateful', 'Um DNS'], 1],
        ['Controle para auditoria de API?', ['CloudTrail', 'Route 53', 'Auto Scaling'], 0]
      ],
      terms: ['security group', 'ssh', 'origem', 'cloudtrail', 'budget', 'validacao'],
      sources: [['AWS VPC Security Groups', 'https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html']]
    },
    {
      id: 'azure-rbac', title: 'Azure Entra e RBAC: acesso amplo no subscription', provider: 'Azure',
      brief: 'Estagiario recebeu Owner na assinatura para reiniciar uma VM de laboratorio.',
      artifact: `Principal: estagiario@contoso.example\nScope: /subscriptions/0000...\nRole: Owner\nNeed: start/restart VM LAB-01 only\nMFA status: not registered`,
      questions: [
        ['Qual escopo e funcao sao mais adequados?', ['Owner na assinatura', 'VM Contributor no resource group/VM de lab', 'Global Administrator'], 1],
        ['Qual controle de identidade e prioritario?', ['Desabilitar logs', 'MFA/Conditional Access conforme politica', 'Conta compartilhada'], 1],
        ['Onde revisar atribuicoes?', ['Azure RBAC/IAM do recurso', 'DNS Zone apenas', 'NSG flow log'], 0]
      ],
      terms: ['menor privilegio', 'rbac', 'escopo', 'mfa', 'audit log', 'validacao'],
      sources: [['Azure RBAC', 'https://learn.microsoft.com/en-us/azure/role-based-access-control/overview']]
    },
    {
      id: 'azure-nsg', title: 'Azure VNet: NSG amplo e ausencia de monitoramento', provider: 'Azure',
      brief: 'VM administrativa aceita RDP da internet e o time nao sabe quem alterou a regra.',
      artifact: `VNet 10.30.0.0/16 | subnet-admin 10.30.5.0/24\nNSG rule priority 100: Allow TCP/3389 source Internet destination Any\nActivity Log retention/export: not configured\nCost alert: not configured`,
      questions: [
        ['Como reduzir exposicao?', ['Azure Bastion/VPN e remover RDP publico', 'Mudar porta para 3390', 'Adicionar Allow Any'], 0],
        ['Onde buscar quem alterou regra?', ['Azure Activity Log', 'Arquivo hosts', 'DHCP lease'], 0],
        ['O que alerta sobre gastos?', ['Azure Budgets/Cost Management', 'NSG', 'Entra group'], 0]
      ],
      terms: ['nsg', 'rdp', 'bastion', 'activity log', 'budget', 'rollback'],
      sources: [['Azure NSG', 'https://learn.microsoft.com/en-us/azure/virtual-network/network-security-groups-overview']]
    }
  ];

  const terminalLabs = [
    {
      id: 'linux-files', title: 'Linux: localizar e inspecionar arquivos',
      brief: 'Voce entrou em /home/analyst e precisa encontrar configuracoes sem alterar nada.',
      steps: [
        ['Confirme o diretorio atual', /^pwd$/, '/home/analyst'],
        ['Liste tambem arquivos ocultos com detalhes', /^ls\s+-(?:la|al)$/, 'drwxr-xr-x .config\n-rw-r--r-- notes.txt'],
        ['Encontre arquivos .conf abaixo de /etc', /^find\s+\/etc\s+-name\s+['"]?\*\.conf['"]?$/, '/etc/ssh/sshd_config.conf\n/etc/app/app.conf'],
        ['Leia as ultimas 20 linhas do log', /^tail\s+-n\s+20\s+\/var\/log\/app\.log$/, '... service ready\n... healthcheck ok']
      ]
    },
    {
      id: 'linux-perms', title: 'Linux: permissoes sem chmod 777',
      brief: 'O script deploy.sh deve ser executavel pelo dono, legivel pelo grupo e fechado para outros.',
      steps: [
        ['Inspecione permissoes', /^ls\s+-l\s+deploy\.sh$/, '-rw-rw-r-- 1 dev ops deploy.sh'],
        ['Aplique rwx para dono, r para grupo, nada para outros', /^chmod\s+740\s+deploy\.sh$/, 'permissions updated'],
        ['Confirme o resultado', /^stat\s+(?:-c\s+['"]?%A['"]?\s+)?deploy\.sh$/, '-rwxr----- deploy.sh'],
        ['Explique o octal em um comentario de shell', /^echo\s+.+7.+4.+0.+$/, '7=rwx, 4=r--, 0=---']
      ]
    },
    {
      id: 'linux-service', title: 'Linux: servico falhou ao iniciar',
      brief: 'nginx esta indisponivel. Colete estado e logs antes de reiniciar.',
      steps: [
        ['Consulte o estado', /^systemctl\s+status\s+nginx$/, 'nginx.service failed (Result: exit-code)'],
        ['Leia logs da unidade', /^journalctl\s+-u\s+nginx(?:\s+--since.+)?$/, 'nginx: [emerg] unexpected end of file in /etc/nginx/nginx.conf:42'],
        ['Valide configuracao', /^nginx\s+-t$/, 'syntax is invalid at line 42'],
        ['Depois da correcao simulada, reinicie', /^(?:sudo\s+)?systemctl\s+restart\s+nginx$/, 'nginx.service active (running)']
      ]
    },
    {
      id: 'linux-network', title: 'Linux: rede e SSH',
      brief: 'Servidor responde localmente, mas SSH nao aceita conexao.',
      steps: [
        ['Mostre enderecos e interfaces', /^ip\s+(?:a|addr)$/, 'eth0 UP 10.40.2.15/24'],
        ['Mostre rotas', /^ip\s+r(?:oute)?$/, 'default via 10.40.2.1 dev eth0'],
        ['Verifique porta 22 em escuta', /^(?:ss|netstat)\s+-(?:tulpn|lntp)$/, 'no listener on :22'],
        ['Consulte e inicie ssh', /^systemctl\s+(?:status|start)\s+(?:ssh|sshd)$/, 'sshd.service active (running)']
      ]
    },
    {
      id: 'linux-logs', title: 'Linux: investigar falhas SSH em log',
      brief: 'Extraia fontes de falhas de login e conte recorrencias.',
      steps: [
        ['Filtre falhas SSH', /^grep\s+['"]?Failed password['"]?\s+\/var\/log\/auth\.log$/, 'Failed password for ana from 203.0.113.8\nFailed password for root from 203.0.113.8'],
        ['Extraia IPs com awk', /^awk\s+.+\/var\/log\/auth\.log$/, '203.0.113.8\n203.0.113.8\n198.51.100.9'],
        ['Ordene e conte valores unicos', /^sort(?:\s+\S+)?\s*\|\s*uniq\s+-c$/, '2 203.0.113.8\n1 198.51.100.9'],
        ['Mostre as 10 ultimas falhas', /^grep\s+.+\|\s*tail\s+-n\s+10$/, 'last 10 failed authentications']
      ]
    },
    {
      id: 'git-base', title: 'Git: repositorio e commit rastreavel',
      brief: 'Crie historico para um runbook novo sem enviar segredos.',
      steps: [
        ['Inicialize o repositorio', /^git\s+init$/, 'Initialized empty Git repository'],
        ['Confira alteracoes', /^git\s+status$/, 'Untracked files: runbook.md'],
        ['Adicione o runbook', /^git\s+add\s+runbook\.md$/, 'staged runbook.md'],
        ['Crie commit descritivo', /^git\s+commit\s+-m\s+['"].{8,}['"]$/, '[main a12bc34] Add DNS incident runbook']
      ]
    },
    {
      id: 'git-branch', title: 'Git: branch, diff e merge',
      brief: 'Altere um runbook em branch e revise o diff antes de integrar.',
      steps: [
        ['Crie e mude para branch', /^git\s+(?:switch\s+-c|checkout\s+-b)\s+fix\/dns-runbook$/, 'Switched to a new branch fix/dns-runbook'],
        ['Revise o diff', /^git\s+diff$/, '+ Add rollback and validation'],
        ['Registre a alteracao', /^git\s+commit\s+(?:-am|-m)\s+.+$/, '[fix/dns-runbook b31da22] Document rollback'],
        ['Integre na main', /^git\s+(?:switch|checkout)\s+main\s*&&\s*git\s+merge\s+fix\/dns-runbook$/, 'Fast-forward; runbook.md updated']
      ]
    },
    {
      id: 'git-recovery', title: 'Git: investigar e reverter mudanca ruim',
      brief: 'Um commit quebrou o runbook publicado. Preserve historico e reverta.',
      steps: [
        ['Veja historico resumido', /^git\s+log\s+--oneline$/, 'e91ab20 Remove validation\nb31da22 Document rollback'],
        ['Inspecione o commit suspeito', /^git\s+show\s+e91ab20$/, '- Validation steps'],
        ['Reverta preservando historico', /^git\s+revert\s+e91ab20$/, '[main c88aa10] Revert "Remove validation"'],
        ['Confirme arvore limpa', /^git\s+status$/, 'nothing to commit, working tree clean']
      ]
    }
  ];

  const certs = [
    {
      id: 'ccna', title: 'Cisco CCNA 200-301 v1.1', target: 'NOC, N2 e redes', cadence: '16-24 semanas; teoria + Packet Tracer + simulados limpos.',
      link: 'https://www.cisco.com/site/us/en/learn/training-certifications/exams/ccna.html',
      domains: [
        ['Network Fundamentals - 20%', 'Semanas 1-2', 'Explique OSI, IPv4/IPv6, wireless e virtualizacao.'],
        ['Network Access - 20%', 'Semana 3', 'Configure VLAN, trunks, EtherChannel e STP.'],
        ['IP Connectivity - 25%', 'Semanas 4-5', 'Leia tabela, rotas estaticas e OSPF.'],
        ['IP Services - 10%', 'Semanas 1 e 6', 'DHCP, DNS, NAT, NTP, SNMP e QoS.'],
        ['Security Fundamentals - 15%', 'Semana 6 + SOC', 'ACL, L2 security, AAA, VPN e wireless security.'],
        ['Automation - 10%', 'Trilha Git', 'JSON, APIs, controller-based networking e Ansible/Terraform conceitual.']
      ]
    },
    {
      id: 'clf02', title: 'AWS Certified Cloud Practitioner CLF-C02', target: 'Cloud junior e DevOps inicial', cadence: '6-8 semanas; use Skill Builder e labs sem custo.',
      link: 'https://docs.aws.amazon.com/aws-certification/latest/cloud-practitioner-02/cloud-practitioner-02.html',
      domains: [
        ['Cloud Concepts - 24%', 'Lab AWS VPC', 'Valor da nuvem, Well-Architected e migracao.'],
        ['Security and Compliance - 30%', 'Lab AWS IAM', 'Responsabilidade compartilhada, IAM e conformidade.'],
        ['Cloud Technology and Services - 34%', 'Labs AWS', 'Compute, rede, storage, banco, analytics e suporte.'],
        ['Billing, Pricing and Support - 12%', 'Lab AWS VPC', 'Pricing, budgets, Organizations e support plans.']
      ]
    },
    {
      id: 'az900', title: 'Microsoft Azure Fundamentals AZ-900', target: 'Cloud junior e suporte Microsoft', cadence: '4-6 semanas; Microsoft Learn + labs Azure.',
      link: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-900',
      domains: [
        ['Cloud concepts - 25-30%', 'Fundamentos cloud', 'Modelos, consumo, responsabilidade compartilhada.'],
        ['Azure architecture and services - 35-40%', 'Labs Azure', 'Regioes, compute, rede, storage e identidade.'],
        ['Management and governance - 30-35%', 'Lab Azure NSG', 'Cost Management, Policy, Monitor e ARM.']
      ]
    },
    {
      id: 'sc900', title: 'Microsoft Security, Compliance, and Identity SC-900', target: 'SOC inicial e cloud security', cadence: '5-7 semanas; Microsoft Learn + casos SOC.',
      link: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-900',
      domains: [
        ['Security, compliance, identity - 10-15%', 'Casos SOC', 'Zero Trust, responsabilidade compartilhada e conceitos.'],
        ['Microsoft Entra - 25-30%', 'Lab Azure RBAC', 'Identidade, autenticacao, acesso e governanca.'],
        ['Microsoft security solutions - 35-40%', 'Casos SOC', 'Defender, Sentinel e recursos Azure.'],
        ['Microsoft compliance solutions - 20-25%', 'Documentacao oficial', 'Purview, risco, auditoria e ciclo de dados.']
      ]
    },
    {
      id: 'fortinet', title: 'Fortinet NSE 1, NSE 2 e NSE 3', target: 'NOC, SOC e suporte de firewall', cadence: '6-10 semanas; cursos self-paced + FortiGate Operator.',
      link: 'https://www.fortinet.com/training-certification',
      domains: [
        ['NSE 1 Cybersecurity Fundamentals', 'Semana 6 + SOC', 'Ameacas, seguranca e fundamentos de rede.'],
        ['NSE 2 FortiGate Fundamentals', 'Labs ACL/NAT', 'NGFW, politicas, objetos, NAT e logs.'],
        ['NSE 3 FortiGate Operator', 'Simulador NOC', 'Operacao, monitoramento e troubleshooting FortiGate.']
      ]
    },
    {
      id: 'linux', title: 'LPI Linux Essentials 010-160', target: 'N2, NOC, SOC, Cloud e DevOps', cadence: '8-10 semanas; terminal real todo dia.',
      link: 'https://www.lpi.org/our-certifications/linux-essentials-overview/',
      domains: [
        ['Linux community and career', 'Leitura oficial', 'Open source, distribuicoes e aplicacoes.'],
        ['Finding your way on Linux', 'Desafios files/logs', 'Shell, ajuda, arquivos, redirecionamento e scripts.'],
        ['Power of the command line', 'Desafios terminal', 'Arquivamento, busca, regex e scripts simples.'],
        ['Linux operating system', 'Desafio services', 'Hardware, processos, rede e logs.'],
        ['Security and permissions', 'Desafio permissions', 'Usuarios, grupos, ownership e permissoes.']
      ]
    }
  ];

  const depthTabs = [...document.querySelectorAll('[data-depth-tab]')];
  depthTabs.forEach((tab, index) => {
    const activate = () => {
      depthTabs.forEach((item) => {
        const active = item === tab;
        item.setAttribute('aria-selected', String(active));
        item.tabIndex = active ? 0 : -1;
        document.getElementById(`depth-${item.dataset.depthTab}`).hidden = !active;
      });
    };
    tab.addEventListener('click', activate);
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      const next = depthTabs[(index + (event.key === 'ArrowRight' ? 1 : -1) + depthTabs.length) % depthTabs.length];
      next.click(); next.focus();
    });
  });

  const journeySelect = document.getElementById('deepJourneySelect');
  journeySelect.innerHTML = journey.map((item) => `<option value="${item.id}">Semana ${item.week}: ${esc(item.title)}</option>`).join('');
  function renderJourney() {
    const item = journey.find((entry) => entry.id === journeySelect.value);
    const state = read(keys.journey, {})[item.id];
    document.getElementById('deepJourneyScore').innerHTML = scoreBadge(state?.score, state?.passed);
    document.getElementById('deepJourneyContent').innerHTML = `
      <div class="mission-header"><div><h4>Semana ${item.week}: ${esc(item.title)}</h4><p>${esc(item.outcome)}</p></div><span class="tag">Saida: 80% + artefato</span></div>
      <div class="mission-grid">
        <div class="mission-phase"><h4>Antes de comecar</h4><p>${esc(item.prereq)}</p><h5>Modelo mental</h5><ul>${item.theory.map((line) => `<li>${esc(line)}</li>`).join('')}</ul></div>
        <div class="mission-phase"><h4>Construa</h4><ol>${item.build.map((line) => `<li>${esc(line)}</li>`).join('')}</ol><h5>Quebre e corrija</h5><ol>${item.breakFix.map((line) => `<li>${esc(line)}</li>`).join('')}</ol></div>
        <form class="mission-phase depth-form" id="journeyAssessment"><h4>Checkpoint tecnico</h4>
          ${item.questions.map((question, qIndex) => `<div class="question-block"><strong>${qIndex + 1}. ${esc(question[0])}</strong><div class="question-options">${question[1].map((choice, cIndex) => `<label><input type="radio" name="jq${qIndex}" value="${cIndex}" required> ${esc(choice)}</label>`).join('')}</div></div>`).join('')}
          <label for="journeyEvidence">Evidencia e raciocinio<textarea id="journeyEvidence" required placeholder="Cole comandos essenciais e explique causa, teste antes/depois e rollback.">${esc(state?.evidence || '')}</textarea></label>
          <button class="primary" type="submit">Avaliar missao</button><div class="depth-feedback" id="journeyFeedback" aria-live="polite"></div>
        </form>
        <div class="mission-phase"><h4>Rubrica e saida</h4><table class="mission-rubric"><tbody>
          <tr><th>Quiz</th><td>45 pontos; conceitos e diagnostico.</td></tr><tr><th>Evidencia</th><td>45 pontos; termos tecnicos interpretados.</td></tr>
          <tr><th>Estrutura</th><td>10 pontos; evidencia com contexto suficiente.</td></tr></tbody></table>
          <h5>Checklist do artefato</h5><ul>${item.checks.map((line) => `<li>${esc(line)}</li>`).join('')}</ul></div>
      </div>`;
    document.getElementById('journeyAssessment').addEventListener('submit', (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const correct = item.questions.filter((question, index) => Number(form.get(`jq${index}`)) === question[2]).length;
      const evidence = document.getElementById('journeyEvidence').value.trim();
      const hits = hasTerms(evidence, item.evidenceTerms);
      const score = Math.min(100, Math.round((correct / item.questions.length) * 45 + (hits.length / item.evidenceTerms.length) * 45 + (evidence.length >= 220 ? 10 : evidence.length >= 120 ? 5 : 0)));
      const passed = score >= 80;
      const all = read(keys.journey, {});
      all[item.id] = { score, passed, evidence, updatedAt: new Date().toISOString() };
      save(keys.journey, all);
      if (passed) addDeliverable(`deep-journey-${item.id}`, item.title, 'README de lab', `# ${item.title}\n\n## Objetivo\n${item.outcome}\n\n## Evidencias\n${evidence}\n\n## Validacao\nNota da rubrica: ${score}%`, item.week);
      const missing = item.evidenceTerms.filter((term) => !hits.includes(term));
      const feedback = document.getElementById('journeyFeedback');
      feedback.className = `depth-feedback ${passed ? 'pass' : 'fail'}`;
      feedback.innerHTML = `<strong>${score}% - ${passed ? 'aprovado' : 'ainda nao aprovado'}</strong><p>Quiz: ${correct}/${item.questions.length}. Conceitos ausentes na evidencia: ${missing.length ? missing.map(esc).join(', ') : 'nenhum'}.</p>`;
      document.getElementById('deepJourneyScore').innerHTML = scoreBadge(score, passed);
    });
  }
  journeySelect.addEventListener('change', renderJourney);
  renderJourney();

  let selectedEvidence = [];
  const incidentSelect = document.getElementById('deepIncidentSelect');
  incidentSelect.innerHTML = incidents.map((item) => `<option value="${item.id}">${item.area}: ${esc(item.title)}</option>`).join('');
  function renderIncident() {
    const item = incidents.find((entry) => entry.id === incidentSelect.value);
    selectedEvidence = [];
    const scores = latestScores(read(keys.incidents, []), item.id);
    document.getElementById('deepIncidentScore').innerHTML = scoreBadge(scores[0], scores[0] >= 80);
    document.getElementById('deepIncidentBrief').innerHTML = `<h4>${esc(item.title)}</h4><p>${esc(item.brief)}</p><span class="tag">${esc(item.priority)}</span>`;
    document.getElementById('deepEvidenceActions').innerHTML = item.evidence.map((entry, index) => `<button type="button" data-evidence="${index}">${esc(entry[0])}</button>`).join('');
    document.getElementById('deepEvidenceDesk').innerHTML = '<p>Selecione somente as evidencias que ajudam a confirmar ou eliminar hipoteses.</p>';
    document.getElementById('deepEvidenceCount').textContent = '0 coletadas';
    document.getElementById('deepIncidentCause').innerHTML = options(item.causes);
    document.getElementById('deepIncidentResolution').innerHTML = options(item.resolutions);
    document.getElementById('deepIncidentEscalation').innerHTML = options(item.escalations);
    document.getElementById('deepIncidentReport').value = '';
    document.getElementById('deepIncidentFeedback').className = 'depth-feedback';
    document.getElementById('deepIncidentFeedback').innerHTML = '';
  }
  document.getElementById('deepEvidenceActions').addEventListener('click', (event) => {
    const button = event.target.closest('[data-evidence]');
    if (!button) return;
    const index = Number(button.dataset.evidence);
    if (selectedEvidence.includes(index)) return;
    selectedEvidence.push(index); button.disabled = true;
    const item = incidents.find((entry) => entry.id === incidentSelect.value);
    document.getElementById('deepEvidenceDesk').innerHTML = selectedEvidence.map((chosen) => `<div class="evidence-item"><code>$ ${esc(item.evidence[chosen][0])}</code><span>${esc(item.evidence[chosen][1])}</span></div>`).join('');
    document.getElementById('deepEvidenceCount').textContent = `${selectedEvidence.length} coletada(s)`;
  });
  document.getElementById('deepIncidentForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const item = incidents.find((entry) => entry.id === incidentSelect.value);
    const report = document.getElementById('deepIncidentReport').value.trim();
    const selections = [document.getElementById('deepIncidentCause'), document.getElementById('deepIncidentResolution'), document.getElementById('deepIncidentEscalation')];
    const decisionScore = selections.filter((field, index) => Number(field.value) === item.correct[index]).length * 15;
    const useful = selectedEvidence.filter((index) => item.evidence[index][2]).length;
    const noise = selectedEvidence.length - useful;
    const evidenceScore = Math.max(0, Math.min(25, useful * 7 - noise * 3));
    const hits = hasTerms(report, item.terms);
    const reportScore = Math.min(30, Math.round(hits.length / item.terms.length * 25) + (report.length >= 240 ? 5 : 0));
    const score = Math.min(100, decisionScore + evidenceScore + reportScore);
    const passed = score >= 80;
    const attempts = read(keys.incidents, []);
    attempts.unshift({ id: item.id, area: item.area, score, passed, selectedEvidence, createdAt: new Date().toISOString() });
    save(keys.incidents, attempts.slice(0, 100));
    if (passed) addDeliverable(`deep-incident-${item.id}`, `Ticket: ${item.title}`, 'Ticket', report, item.area === 'Help Desk' ? 1 : 5);
    const feedback = document.getElementById('deepIncidentFeedback');
    feedback.className = `depth-feedback ${passed ? 'pass' : 'fail'}`;
    feedback.innerHTML = `<strong>${score}% - ${passed ? 'incidente encerrado com evidencia' : 'investigacao incompleta'}</strong><p>Decisoes: ${decisionScore}/45. Evidencias: ${evidenceScore}/25. Ticket: ${reportScore}/30. Reveja coleta util, causa, validacao e rollback.</p>`;
    document.getElementById('deepIncidentScore').innerHTML = scoreBadge(score, passed);
  });
  incidentSelect.addEventListener('change', renderIncident);
  renderIncident();

  const socSelect = document.getElementById('deepSocSelect');
  socSelect.innerHTML = socCases.map((item) => `<option value="${item.id}">${esc(item.title)}</option>`).join('');
  const socClassifications = [...new Set(socCases.map((item) => item.classification).concat(['Atividade normal', 'Malware confirmado']))];
  const severities = ['Baixa', 'Media', 'Alta', 'Critica'];
  function renderSoc() {
    const item = socCases.find((entry) => entry.id === socSelect.value);
    const scores = latestScores(read(keys.soc, []), item.id);
    document.getElementById('deepSocScore').innerHTML = scoreBadge(scores[0], scores[0] >= 80);
    document.getElementById('deepSocBrief').innerHTML = `<h4>${esc(item.title)}</h4><p>${esc(item.brief)}</p><span class="tag">${esc(item.mitre)}</span>`;
    document.getElementById('deepSocLogs').textContent = item.logs;
    document.getElementById('deepSocClassification').innerHTML = options(socClassifications);
    document.getElementById('deepSocSeverity').innerHTML = options(severities);
    ['deepSocIocs', 'deepSocTimeline', 'deepSocAction'].forEach((id) => { document.getElementById(id).value = ''; });
    document.getElementById('deepSocFeedback').className = 'depth-feedback';
    document.getElementById('deepSocFeedback').innerHTML = '';
  }
  document.getElementById('deepSocForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const item = socCases.find((entry) => entry.id === socSelect.value);
    const iocs = document.getElementById('deepSocIocs').value;
    const timeline = document.getElementById('deepSocTimeline').value;
    const action = document.getElementById('deepSocAction').value;
    const classOk = socClassifications[Number(document.getElementById('deepSocClassification').value)] === item.classification;
    const severityOk = severities[Number(document.getElementById('deepSocSeverity').value)] === item.severity;
    const iocHits = hasTerms(iocs, item.iocs);
    const timeHits = hasTerms(timeline, item.timeline);
    const actionHits = hasTerms(action, item.action);
    const score = Math.round((classOk ? 20 : 0) + (severityOk ? 15 : 0) + iocHits.length / item.iocs.length * 20 + timeHits.length / item.timeline.length * 20 + actionHits.length / item.action.length * 25);
    const passed = score >= 80;
    const attempts = read(keys.soc, []);
    attempts.unshift({ id: item.id, score, passed, createdAt: new Date().toISOString() });
    save(keys.soc, attempts.slice(0, 100));
    if (passed) addDeliverable(`deep-soc-${item.id}`, `Investigacao SOC: ${item.title}`, 'Investigacao SOC', `# ${item.title}\n\n## IOCs\n${iocs}\n\n## Linha do tempo\n${timeline}\n\n## Contencao\n${action}\n\n${item.mitre}`, 8);
    const missing = [...item.iocs.filter((term) => !iocHits.includes(term)), ...item.action.filter((term) => !actionHits.includes(term))];
    const feedback = document.getElementById('deepSocFeedback');
    feedback.className = `depth-feedback ${passed ? 'pass' : 'fail'}`;
    feedback.innerHTML = `<strong>${score}% - ${passed ? 'analise sustentada' : 'faltam elementos'}</strong><p>Classificacao: ${classOk ? 'correta' : item.classification}. Severidade: ${severityOk ? 'correta' : item.severity}. Revise: ${missing.length ? missing.map(esc).join(', ') : 'linha do tempo'}.</p>`;
    document.getElementById('deepSocScore').innerHTML = scoreBadge(score, passed);
  });
  socSelect.addEventListener('change', renderSoc);
  renderSoc();

  const cloudSelect = document.getElementById('deepCloudSelect');
  cloudSelect.innerHTML = cloudLabs.map((item) => `<option value="${item.id}">${item.provider}: ${esc(item.title)}</option>`).join('');
  function renderCloud() {
    const item = cloudLabs.find((entry) => entry.id === cloudSelect.value);
    const scores = latestScores(read(keys.cloud, []), item.id);
    document.getElementById('deepCloudScore').innerHTML = scoreBadge(scores[0], scores[0] >= 80);
    document.getElementById('deepCloudBrief').innerHTML = `<h4>${esc(item.title)}</h4><p>${esc(item.brief)}</p>`;
    document.getElementById('deepCloudArtifact').textContent = item.artifact;
    document.getElementById('deepCloudSources').innerHTML = item.sources.map(([label, href]) => `<a class="button" href="${href}" target="_blank" rel="noopener">${esc(label)}</a>`).join('');
    document.getElementById('deepCloudQuestions').innerHTML = item.questions.map((question, qIndex) => `<div class="question-block"><strong>${qIndex + 1}. ${esc(question[0])}</strong><div class="question-options">${question[1].map((choice, cIndex) => `<label><input type="radio" name="cq${qIndex}" value="${cIndex}" required> ${esc(choice)}</label>`).join('')}</div></div>`).join('');
    document.getElementById('deepCloudRationale').value = '';
    document.getElementById('deepCloudFeedback').className = 'depth-feedback';
    document.getElementById('deepCloudFeedback').innerHTML = '';
  }
  document.getElementById('deepCloudForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const item = cloudLabs.find((entry) => entry.id === cloudSelect.value);
    const form = new FormData(event.currentTarget);
    const correct = item.questions.filter((question, index) => Number(form.get(`cq${index}`)) === question[2]).length;
    const rationale = document.getElementById('deepCloudRationale').value.trim();
    const hits = hasTerms(rationale, item.terms);
    const score = Math.min(100, Math.round(correct / item.questions.length * 60 + hits.length / item.terms.length * 35 + (rationale.length >= 200 ? 5 : 0)));
    const passed = score >= 80;
    const attempts = read(keys.cloud, []);
    attempts.unshift({ id: item.id, provider: item.provider, score, passed, createdAt: new Date().toISOString() });
    save(keys.cloud, attempts.slice(0, 100));
    if (passed) addDeliverable(`deep-cloud-${item.id}`, `Relatorio cloud: ${item.title}`, 'Relatorio cloud', `${item.artifact}\n\n## Analise\n${rationale}\n\nNota: ${score}%`, 10);
    const missing = item.terms.filter((term) => !hits.includes(term));
    const feedback = document.getElementById('deepCloudFeedback');
    feedback.className = `depth-feedback ${passed ? 'pass' : 'fail'}`;
    feedback.innerHTML = `<strong>${score}% - ${passed ? 'arquitetura defendida' : 'revise a decisao'}</strong><p>Questoes: ${correct}/${item.questions.length}. Conceitos ausentes: ${missing.length ? missing.map(esc).join(', ') : 'nenhum'}.</p>`;
    document.getElementById('deepCloudScore').innerHTML = scoreBadge(score, passed);
  });
  cloudSelect.addEventListener('change', renderCloud);
  renderCloud();

  let terminalStep = 0;
  const terminalSelect = document.getElementById('deepTerminalSelect');
  terminalSelect.innerHTML = terminalLabs.map((item) => `<option value="${item.id}">${esc(item.title)}</option>`).join('');
  function renderTerminal() {
    const item = terminalLabs.find((entry) => entry.id === terminalSelect.value);
    const state = read(keys.terminal, {})[item.id];
    terminalStep = state?.passed ? item.steps.length : 0;
    document.getElementById('deepTerminalScore').innerHTML = scoreBadge(state?.score, state?.passed);
    document.getElementById('deepTerminalBrief').innerHTML = `<h4>${esc(item.title)}</h4><p>${esc(item.brief)}</p>`;
    document.getElementById('deepTerminalObjectives').innerHTML = item.steps.map((step, index) => `<li class="${index < terminalStep ? 'done' : ''}">${esc(step[0])}</li>`).join('');
    document.getElementById('deepTerminalConsole').textContent = `$ lab start ${item.id}\n${item.brief}\n`;
    document.getElementById('deepTerminalFeedback').className = 'depth-feedback';
    document.getElementById('deepTerminalFeedback').textContent = state?.passed ? 'Aprovado. Agora repita em WSL/VM e guarde output real.' : 'Digite o comando da primeira etapa.';
    document.getElementById('deepTerminalCommand').disabled = Boolean(state?.passed);
  }
  document.getElementById('deepTerminalForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const item = terminalLabs.find((entry) => entry.id === terminalSelect.value);
    const field = document.getElementById('deepTerminalCommand');
    const command = field.value.trim();
    if (!command || terminalStep >= item.steps.length) return;
    const consoleEl = document.getElementById('deepTerminalConsole');
    consoleEl.textContent += `\n$ ${command}\n`;
    if (item.steps[terminalStep][1].test(command)) {
      consoleEl.textContent += `${item.steps[terminalStep][2]}\n`;
      terminalStep += 1;
      field.value = '';
      if (terminalStep === item.steps.length) {
        const all = read(keys.terminal, {});
        all[item.id] = { score: 100, passed: true, updatedAt: new Date().toISOString() };
        save(keys.terminal, all);
        addDeliverable(`deep-terminal-${item.id}`, item.title, 'Runbook', `# ${item.title}\n\nDesafio simulado concluido. Reproduzir no WSL/VM e substituir esta nota por outputs reais.`, item.id.startsWith('git') ? 11 : 7);
        field.disabled = true;
        document.getElementById('deepTerminalFeedback').textContent = '100% - sequencia correta. Falta reproduzir no ambiente real para portfolio.';
        document.getElementById('deepTerminalScore').innerHTML = scoreBadge(100, true);
      }
    } else {
      consoleEl.textContent += `comando nao atende ao objetivo atual: ${item.steps[terminalStep][0]}\n`;
      document.getElementById('deepTerminalFeedback').textContent = 'Leia o objetivo e use o comando especifico; nenhuma etapa foi pulada.';
    }
    document.getElementById('deepTerminalObjectives').innerHTML = item.steps.map((step, index) => `<li class="${index < terminalStep ? 'done' : ''}">${esc(step[0])}</li>`).join('');
    consoleEl.scrollTop = consoleEl.scrollHeight;
  });
  terminalSelect.addEventListener('change', renderTerminal);
  renderTerminal();

  const certSelect = document.getElementById('deepCertSelect');
  certSelect.innerHTML = certs.map((item) => `<option value="${item.id}">${esc(item.title)}</option>`).join('');
  function renderCert() {
    const item = certs.find((entry) => entry.id === certSelect.value);
    const all = read(keys.certs, {});
    const state = all[item.id] || { domains: {}, practice: 0 };
    const domainChecks = item.domains.length * 3;
    const checked = Object.values(state.domains || {}).filter(Boolean).length;
    const score = Math.round((checked / domainChecks) * 60 + Math.min(40, Number(state.practice || 0) * .4));
    const passed = checked === domainChecks && Number(state.practice) >= 80;
    document.getElementById('deepCertScore').innerHTML = scoreBadge(score, passed);
    document.getElementById('deepCertOverview').innerHTML = `<div class="mission-header"><div><h4>${esc(item.title)}</h4><p><strong>Serve para:</strong> ${esc(item.target)}. ${esc(item.cadence)}</p></div><a class="button" href="${item.link}" target="_blank" rel="noopener">Guia oficial</a></div>`;
    document.getElementById('deepCertDomains').innerHTML = item.domains.map((domain, index) => `
      <div class="cert-domain-row"><div><h4>${esc(domain[0])}</h4><p><strong>Pratica no hub:</strong> ${esc(domain[1])}</p><p>${esc(domain[2])}</p></div>
      <div class="cert-checks">${[['theory', 'Consigo explicar sem consultar'], ['lab', 'Fiz lab/caso e guardei evidencia'], ['teach', 'Acertei questoes e expliquei os erros']].map(([kind, label]) => `<label><input type="checkbox" data-cert-check="${index}-${kind}" ${state.domains?.[`${index}-${kind}`] ? 'checked' : ''}> ${label}</label>`).join('')}</div></div>`).join('');
    document.getElementById('deepCertPracticeScore').value = state.practice || '';
    document.getElementById('deepCertFeedback').className = 'depth-feedback';
    document.getElementById('deepCertFeedback').innerHTML = `<p>${checked}/${domainChecks} provas de dominio. A certificacao so fica pronta com todas e simulado limpo >= 80%.</p>`;
  }
  document.getElementById('saveDeepCert').addEventListener('click', () => {
    const item = certs.find((entry) => entry.id === certSelect.value);
    const all = read(keys.certs, {});
    const domains = {};
    document.querySelectorAll('[data-cert-check]').forEach((field) => { domains[field.dataset.certCheck] = field.checked; });
    const practice = Math.max(0, Math.min(100, Number(document.getElementById('deepCertPracticeScore').value || 0)));
    const checked = Object.values(domains).filter(Boolean).length;
    const total = item.domains.length * 3;
    const score = Math.round(checked / total * 60 + practice * .4);
    const passed = checked === total && practice >= 80;
    all[item.id] = { domains, practice, score, passed, updatedAt: new Date().toISOString() };
    save(keys.certs, all);
    const feedback = document.getElementById('deepCertFeedback');
    feedback.className = `depth-feedback ${passed ? 'pass' : 'fail'}`;
    feedback.innerHTML = `<strong>${score}% - ${passed ? 'pronto para agendar' : 'plano em andamento'}</strong><p>${checked}/${total} provas de dominio e simulado ${practice}%. Nao use dumps: registre por que cada alternativa errada esta errada.</p>`;
    document.getElementById('deepCertScore').innerHTML = scoreBadge(score, passed);
  });
  certSelect.addEventListener('change', renderCert);
  renderCert();
})();
