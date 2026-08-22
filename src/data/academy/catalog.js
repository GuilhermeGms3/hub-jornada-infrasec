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
    id: 'sc200', title: 'Microsoft Security Operations Analyst SC-200', target: 'SOC Microsoft depois da base de redes, logs e seguranca', cadence: '10-14 semanas; Microsoft Learn + Sentinel, Defender XDR e KQL. Faca depois de SC-900 ou base equivalente.',
    link: 'https://learn.microsoft.com/pt-br/credentials/certifications/resources/study-guides/sc-200',
    domains: [
      ['Manage a security operations environment - 40-45%', 'Casos SOC + arquitetura Zero Trust', 'Configure ingestao, retencao, automacao, deteccoes e operacao no Microsoft Sentinel e Defender XDR.'],
      ['Respond to security incidents - 35-40%', 'Casos spray, brute force e PowerShell', 'Investigue alertas, entidades, timelines e acoes de resposta em Defender XDR, Endpoint, Purview e Sentinel.'],
      ['Perform threat hunting - 20-25%', 'Logs SOC + pratica KQL', 'Escolha tabelas, escreva consultas KQL, crie hunting queries e interprete relacoes entre entidades.']
    ]
  },
  {
    id: 'sc300', title: 'Microsoft Identity and Access Administrator SC-300', target: 'IAM, identidade cloud, Zero Trust e DevSecOps Microsoft', cadence: '10-14 semanas; Microsoft Learn + tenant de laboratorio. Faca depois de AZ-900/SC-900 ou base equivalente.',
    link: 'https://learn.microsoft.com/pt-br/credentials/certifications/resources/study-guides/sc-300',
    domains: [
      ['Implement and manage user identities - 20-25%', 'Lab Azure RBAC + identidade', 'Gerencie tenant, usuarios, grupos, identidades externas, dispositivos e identidade hibrida.'],
      ['Implement authentication and access management - 25-30%', 'Arquitetura Zero Trust', 'Implemente MFA, Conditional Access, Identity Protection, SSPR e Global Secure Access com contas de emergencia.'],
      ['Plan and implement workload identities - 20-25%', 'Lab Azure RBAC + cloud', 'Diferencie managed identities, service principals e app registrations; limite consentimento e permissoes.'],
      ['Plan and automate identity governance - 20-25%', 'Relatorio de menor privilegio', 'Use PIM, access reviews, entitlement management, logs e KQL para governar o ciclo de acesso.']
    ]
  },
  {
    id: 'securityplus', title: 'CompTIA Security+ SY0-701', target: 'SOC junior e fundamentos amplos de seguranca', cadence: '10-14 semanas; objetivos oficiais + casos SOC + simulador local autoral.',
    link: 'https://www.comptia.org/en-us/certifications/security/',
    domains: [
      ['General Security Concepts - 12%', 'Arquitetura Zero Trust', 'Explique controles, CIA, Zero Trust, criptografia e gestao de mudancas.'],
      ['Threats, Vulnerabilities, and Mitigations - 22%', 'Casos SOC', 'Reconheca atores, vetores, vulnerabilidades e mitigacoes por cenario.'],
      ['Security Architecture - 18%', 'Arquitetura cloud e seguranca', 'Compare modelos, segmentacao, resiliencia, dados e infraestrutura segura.'],
      ['Security Operations - 28%', 'Casos SOC + Linux logs', 'Aplique hardening, monitoramento, resposta, identidade e gestao de vulnerabilidades.'],
      ['Security Program Management and Oversight - 20%', 'Relatorio de risco', 'Relacione governanca, risco, terceiros, compliance, auditoria e conscientizacao.']
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

export const academyCatalog = Object.freeze({ journey, incidents, socCases, cloudLabs, terminalLabs, certs });
