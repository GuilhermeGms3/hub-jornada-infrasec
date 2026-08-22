const weeks = [
  {
    title: '1',
    summary: 'Conectividade basica: IP, mascara, gateway, DNS, DHCP e comandos de diagnostico.',
    today: 'Faca 20 questoes em modo estudo e rode comandos reais no seu Windows: ipconfig, ping, nslookup, tracert e arp.',
    deliverable: 'Checklist de troubleshooting “usuario sem internet” com comandos, prints e conclusao.',
    tools: ['Windows CMD/PowerShell', 'CCNA quiz', 'Template Ticket NOC'],
    tasks: [
      ['Revisar IP/DNS/DHCP', 'Explique com suas palavras o que acontece quando voce acessa um site.', [['Abrir quiz', 'projetos/CCNA-1-Study-Hub/quiz.html'], ['Modelo ticket', '#templates']]],
      ['Rodar diagnostico local', 'Execute ipconfig /all, ping gateway, nslookup e tracert. Anote o que cada comando provou.', [['Carregar ticket NOC', 'template:ticket']]],
      ['Escrever evidencia', 'Transforme a pratica em ticket curto, com problema, teste, resultado e proximo passo.', [['Templates', '#templates']]]
    ]
  },
  {
    title: '2',
    summary: 'Subnetting e primeira topologia Packet Tracer.',
    today: 'Resolva subnets simples e monte uma topologia com 2 redes se comunicando por roteador.',
    deliverable: 'README de lab com topologia, tabela IP, testes de ping e aprendizado.',
    tools: ['Packet Tracer', 'README de lab', 'CCNA notes'],
    tasks: [
      ['Subnetting sem pular etapa', 'Calcule rede, broadcast, primeiro host, ultimo host e gateway.', [['Jeremy notes', 'projetos/CCNA_Course_Notes/README.md']]],
      ['Montar topologia simples', 'Use hosts, switch e router. Configure IPs e teste ping.', [['Abrir Packet Tracer lab base', 'projetos/CCNA-Labs/labs/StaticRoute.pkt']]],
      ['Documentar', 'Preencha README com objetivo, desenho, comandos e validacao.', [['Modelo README', 'template:readme']]]
    ]
  },
  {
    title: '3',
    summary: 'Switching: VLAN, trunk, access port e erros comuns de camada 2.',
    today: 'Abra o lab VLAN com trunk, quebre algo de proposito e documente como descobriu.',
    deliverable: 'Tabela problema → causa → correcao para VLAN/trunk.',
    tools: ['Packet Tracer', 'VLAN lab', 'README de lab'],
    tasks: [
      ['Entender access vs trunk', 'Liste quais portas sao access e qual porta e trunk.', [['Abrir VLAN trunk', 'projetos/CCNA-Labs/labs/VLAN-2(With Trunk).pkt']]],
      ['Troubleshooting', 'Remova uma VLAN de uma porta, teste ping, corrija e documente.', [['Modelo README', 'template:readme']]],
      ['Quiz de fixacao', 'Faca 20 questoes sobre switching/rede.', [['Abrir quiz', 'projetos/CCNA-1-Study-Hub/quiz.html']]]
    ]
  },
  {
    title: '4',
    summary: 'Roteamento: rotas conectadas, estaticas, default route e OSPF.',
    today: 'Abra OSPF e descubra rotas com show ip route. Teste conectividade ponta a ponta.',
    deliverable: 'README com 3 comandos show e explicacao do que cada um prova.',
    tools: ['Packet Tracer', 'OSPF lab', 'README'],
    tasks: [
      ['Rotas e tabela', 'Entenda C, L, S e O na tabela de rotas.', [['Abrir OSPF', 'projetos/CCNA-Labs/labs/Routing(OSPF Protocol).pkt']]],
      ['Validar OSPF', 'Use show ip ospf neighbor e show ip route.', [['Modelo README', 'template:readme']]],
      ['Escrever resumo NOC', 'Explique impacto e acao como se fosse ticket.', [['Modelo ticket', 'template:ticket']]]
    ]
  },
  {
    title: '5',
    summary: 'ACL, NAT e pensamento de firewall.',
    today: 'Permita um trafego, bloqueie outro e prove com teste.',
    deliverable: 'Matriz origem/destino/porta/acao + prints de validacao.',
    tools: ['Packet Tracer', 'ACL/NAT labs', 'README'],
    tasks: [
      ['ACL standard', 'Veja ordem das regras e impacto do deny implicito.', [['Abrir ACL', 'projetos/CCNA-Labs/labs/AccessControlList(Standard).pkt']]],
      ['NAT overload', 'Identifique inside/outside e teste acesso externo.', [['Abrir NAT', 'projetos/CCNA-Labs/labs/Overload-NAT.pkt']]],
      ['Documentar matriz', 'Escreva origem, destino, porta, acao e evidencia.', [['Modelo README', 'template:readme']]]
    ]
  },
  {
    title: '6',
    summary: 'Rotina NOC: monitoramento, incidente, impacto, prioridade e escalonamento.',
    today: 'Pegue um lab anterior e escreva um ticket como se fosse incidente real.',
    deliverable: 'Runbook NOC de conectividade e modelo de ticket preenchido.',
    tools: ['Template Ticket NOC', 'Labs anteriores'],
    tasks: [
      ['Criar runbook', 'Liste diagnostico por ordem: fisico, IP, gateway, DNS, rota, firewall.', [['Modelo ticket', 'template:ticket']]],
      ['Simular incidente', 'Quebre DNS ou gateway em um lab e registre sintomas.', [['Abrir DHCP', 'projetos/CCNA-Labs/labs/Dynamic-Host-Configuration-Protocol(DHCP).pkt']]],
      ['Escrever escalonamento', 'Defina quando mandar para N2/rede/security.', [['Templates', '#templates']]]
    ]
  },
  {
    title: '7',
    summary: 'SOC junior: logs, eventos, IOC e triagem inicial.',
    today: 'Analise eventos de login falho e escreva linha do tempo.',
    deliverable: 'Mini investigacao SOC com evidencia, severidade e decisao.',
    tools: ['Event Viewer', 'Template SOC', 'VirusTotal'],
    tasks: [
      ['Coletar evento', 'No Windows, procure eventos 4625 e 4624.', [['Modelo SOC', 'template:soc']]],
      ['Classificar alerta', 'Defina se parece erro humano, servico quebrado ou tentativa suspeita.', [['SOC roadmap', 'projetos/soc-roadmap-2026/SOC-Analyst-Roadmap.md']]],
      ['Escrever decisao', 'Fechar, monitorar ou escalar? Justifique.', [['Modelo SOC', 'template:soc']]]
    ]
  },
  {
    title: '8',
    summary: 'SIEM e playbook: alerta, falso positivo, severidade e resposta inicial.',
    today: 'Escreva um playbook simples para brute force.',
    deliverable: 'Playbook “failed login / brute force” em Markdown.',
    tools: ['SOC roadmap', 'Template SOC'],
    tasks: [
      ['Definir campos', 'Fonte, destino, usuario, janela de tempo, quantidade, acao.', [['SOC roadmap', 'projetos/soc-roadmap-2026/SOC-Analyst-Roadmap.md']]],
      ['Criar playbook', 'Entrada, investigacao, contencao, escalonamento.', [['Modelo SOC', 'template:soc']]],
      ['Revisar clareza', 'Um analista junior conseguiria seguir seu playbook?', [['Templates', '#templates']]]
    ]
  },
  {
    title: '9',
    summary: 'AWS base: IAM, EC2, S3, VPC, subnet, security group e budget.',
    today: 'Antes de criar recurso, configure alerta de custo. Depois estude security group como ACL moderna.',
    deliverable: 'Relatorio AWS com VPC/SG/IAM/custo e prints.',
    tools: ['AWS console', 'Template Cloud'],
    tasks: [
      ['Budget primeiro', 'Crie alerta de custo antes de VM/EC2.', [['Modelo cloud', 'template:cloud']]],
      ['Security group', 'Permita SSH/RDP so do seu IP e explique a regra.', [['Cloud projects', 'projetos/Cloud-Security-Projects-For-Beginners/README.md']]],
      ['Documentar risco', 'O que daria errado com 0.0.0.0/0?', [['Modelo cloud', 'template:cloud']]]
    ]
  },
  {
    title: '10',
    summary: 'Azure base: Entra ID, VM, VNet, subnet, NSG, Monitor e custo.',
    today: 'Compare NSG com security group e documente regra inbound/outbound.',
    deliverable: 'Relatorio Azure com VM protegida por NSG.',
    tools: ['Azure portal', 'Template Cloud'],
    tasks: [
      ['Criar VNet mental', 'Entenda subnet, NSG e IP publico/privado.', [['Modelo cloud', 'template:cloud']]],
      ['Regra segura', 'Permita acesso administrativo so do seu IP.', [['Cloud projects', 'projetos/Cloud-Security-Projects-For-Beginners/README.md']]],
      ['Escrever comparacao', 'AWS SG vs Azure NSG em 8 linhas.', [['Modelo cloud', 'template:cloud']]]
    ]
  },
  {
    title: '11',
    summary: 'Automacao util: Python/PowerShell para logs, CSV, IPs e relatorio.',
    today: 'Crie script que le log, extrai IPs e gera CSV.',
    deliverable: 'Script pequeno + README + exemplo de entrada/saida.',
    tools: ['Python ou PowerShell', 'README'],
    tasks: [
      ['Definir entrada', 'Escolha access.log, security log exportado ou CSV fake.', [['Modelo README', 'template:readme']]],
      ['Gerar saida', 'CSV com IP, quantidade, primeiro evento e ultimo evento.', [['Modelo README', 'template:readme']]],
      ['Explicar uso', 'Inclua comando para rodar e exemplo de resultado.', [['Modelo README', 'template:readme']]]
    ]
  },
  {
    title: '12',
    summary: 'Portfolio e entrevista: organizar evidencias e contar historias tecnicas.',
    today: 'Escolha 3 projetos e escreva uma narrativa STAR para cada.',
    deliverable: 'GitHub com 3 projetos e 10 respostas de entrevista.',
    tools: ['GitHub', 'Templates', 'Roadmaps'],
    tasks: [
      ['Selecionar 3 evidencias', 'Uma rede, um NOC/SOC, uma cloud/automacao.', [['Templates', '#templates']]],
      ['Melhorar README', 'Objetivo, arquitetura, comandos, testes, aprendizado.', [['Modelo README', 'template:readme']]],
      ['Preparar entrevista', 'Conte problema, acao e resultado sem enrolar.', [['Cyber roadmap', 'projetos/cybersecurity-career-roadmap/README.md']]]
    ]
  }
];

const treeNodes = [
  ['IP/DNS/DHCP', 'Base da conectividade. Sem isso, todo resto fica artificial.', ['ipconfig', 'ping', 'nslookup', 'tracert'], 'VLAN, troubleshooting NOC, cloud networking'],
  ['VLAN', 'Segmentacao de rede e switching basico.', ['access', 'trunk', 'MAC table'], 'Inter-VLAN, ACL, port security'],
  ['Inter-VLAN', 'Roteamento entre redes locais.', ['subinterfaces', 'gateway', 'trunk'], 'OSPF e troubleshooting de rotas'],
  ['Roteamento/OSPF', 'Caminho entre redes e validacao por tabela de rotas.', ['show ip route', 'neighbor', 'area'], 'NOC, cloud VPC/VNet, incidentes de conectividade'],
  ['ACL/NAT', 'Primeiro contato real com firewall mental.', ['permit/deny', 'inside/outside', 'porta'], 'Firewall, security group, NSG, cloud security']
];

const templates = {
  readme: `# Nome do Lab

## Objetivo
Descreva o que este lab prova.

## Topologia / Arquitetura
- Dispositivos:
- Redes/subnets:
- Diagrama ou print:

## Configuracao
\`\`\`
Cole comandos relevantes aqui.
\`\`\`

## Testes
| Teste | Resultado esperado | Resultado obtido |
|---|---|---|
| ping origem -> destino | sucesso | |

## Problemas Encontrados
- Sintoma:
- Causa:
- Correcao:

## Aprendizado
O que voce entende agora que nao entendia antes?`,
  ticket: `# Ticket NOC

## Resumo
Usuario/servico afetado:
Impacto:
Prioridade:

## Sintomas
-

## Testes Executados
| Comando/Teste | Resultado | Interpretacao |
|---|---|---|
| ipconfig /all | | |
| ping gateway | | |
| nslookup dominio | | |
| tracert destino | | |

## Hipotese

## Acao Tomada

## Escalonamento
Escalar para:
Motivo:

## Status Final`,
  soc: `# Investigacao SOC

## Alerta
Nome:
Severidade:
Horario:
Fonte:

## Evidencias
| Evidencia | Valor | Observacao |
|---|---|---|
| Usuario | | |
| IP origem | | |
| Host destino | | |
| Event ID / Log | | |

## Linha do Tempo
- HH:MM -

## Analise
O alerta parece verdadeiro positivo, falso positivo ou inconclusivo?

## Decisao
Fechar, monitorar ou escalar?

## Proximos Passos`,
  cloud: `# Relatorio Cloud

## Objetivo

## Ambiente
Provedor:
Regiao:
Servicos usados:

## Rede
VPC/VNet:
Subnets:
IP publico/privado:

## Controle de Acesso
IAM/Entra ID:
Security Group/NSG:
Regra administrativa:

## Custo
Budget/alerta configurado:
Recursos desligados/removidos:

## Evidencias
Prints:
Testes:

## Riscos e Melhorias`
};

const certRecommendations = {
  noc: ['Fortinet NSE 1-3 primeiro', 'Depois CCNA. Se aparecer vaga Microsoft/Azure, coloque AZ-900 como apoio.'],
  soc: ['SC-900 ou Fortinet fundamentals primeiro', 'Depois da base pratica, escolha SC-200 para SOC Microsoft ou Security+ para fundamentos mais amplos.'],
  cloud: ['AZ-900 ou AWS Cloud Practitioner', 'Escolha pelo mercado das vagas. Se identidade Microsoft aparecer muito, avance para SC-300 somente depois da base.'],
  devsecops: ['Linux + Git + uma cloud fundamental', 'Depois aprofunde identidade com SC-300 ou seguranca operacional com SC-200; KCNA continua para mais tarde.']
};

const weekShelf = [
  [['OSI e TCP/IP', 'OSI_Model_TCPSuite.md'], ['IPv4', 'IPv4_Addressing_Part1.md']],
  [['Subnetting', 'Subnetting_Part1.md'], ['VLSM', 'Subnetting_VLSM_Part3.md']],
  [['Switching', 'Ethernet_LAN_Switching_Part1.md'], ['VLAN', 'VLAN_Part1.md']],
  [['Roteamento', 'Routing_Fundamentals_Part1.md'], ['Rotas estaticas', 'Static_Routing_Part2.md']],
  [['OSPF parte 1', 'OSPF_Part1.md'], ['OSPF parte 2', 'OSPF_Part2.md']],
  [['ACL', 'Standard_Access_Control_Lists.md'], ['NAT', 'NAT_Static_Part1.md']],
  [['NTP e tempo', 'NTP.md'], ['SNMP e monitoramento', 'SNMP.md']],
  [['Fundamentos security', 'Security_Fundamentals.md'], ['Port security', 'Port_Security.md']],
  [['Wireless', 'Wireless_Fundamentals.md'], ['Configuracao Wi-Fi', 'Wireless_Configuration.md']],
  [['Cloud', 'Virtualizations_and_Cloud_Part1.md'], ['Containers', 'Virtualization_Containers.md']],
  [['Automacao de rede', 'Introduction_to_Network_Automation.md'], ['REST APIs', 'REST_APIs.md']],
  [['Revisao de devices', 'Network_Devices.md'], ['WAN', 'WAN_Architectures.md']]
];

export const legacyCatalog = Object.freeze({ weeks, treeNodes, templates, certRecommendations, weekShelf });
