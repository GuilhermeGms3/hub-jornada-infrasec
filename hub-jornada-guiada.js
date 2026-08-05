(function () {
  'use strict';

  const dayNames = ['Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta'];
  const phases = [
    { id: 'network-base', label: 'Base de rede', range: 'Semanas 1-2' },
    { id: 'network-core', label: 'Redes na pratica', range: 'Semanas 3-6' },
    { id: 'operations', label: 'Sistemas e NOC', range: 'Semanas 7-8' },
    { id: 'security', label: 'Seguranca e SOC', range: 'Semanas 9-10' },
    { id: 'cloud-career', label: 'Cloud e carreira', range: 'Semanas 11-12' }
  ];
  const mission = (title, objective, steps, evidence, action, target, duration = 90) => ({
    title, objective, steps, evidence, action, target, duration
  });

  const guidedWeeks = [
    {
      phase: 'network-base', title: 'Conectividade sem adivinhacao',
      outcome: 'Explicar como um site abre e isolar falhas entre computador, rede local, internet e DNS.',
      prerequisite: 'Nenhum. Esta e a porta de entrada.',
      exit: 'Executar ipconfig, ping, nslookup e tracert e explicar o que cada resultado comprova.',
      notYet: 'Subnetting, VLAN, OSPF, cloud e ferramentas de ataque.',
      tools: 'PowerShell/CMD, quiz CCNA e template de ticket.',
      days: [
        mission('Entender o caminho de uma requisicao', 'Construir o mapa mental navegador -> DNS -> gateway -> internet -> servidor.', ['Leia o resumo de OSI/TCP-IP sem decorar as sete camadas.', 'Desenhe o caminho de uma requisicao web em cinco blocos.', 'Explique em voz alta o papel de IP, gateway e DNS.'], 'Um desenho simples e dez linhas explicando como um site abre.', 'Abrir notas de rede', 'projetos/CCNA_Course_Notes/Course_Notes/OSI_Model_TCPSuite.md', 75),
        mission('Ler a configuracao do seu computador', 'Reconhecer IP, mascara, gateway, DHCP e DNS no output real.', ['Execute ipconfig /all.', 'Localize adaptador ativo, IPv4, mascara, gateway, DHCP e DNS.', 'Anote o que mudaria ao trocar de Wi-Fi.'], 'Tabela campo -> valor -> para que serve, usando seu computador.', 'Abrir missao aprofundada', 'practice:journey:w1'),
        mission('Testar por camadas', 'Usar uma ordem de diagnostico que separa rede local, internet e nomes.', ['Teste 127.0.0.1 e depois seu gateway.', 'Teste 1.1.1.1 para alcance externo.', 'Execute nslookup e tracert e interprete os resultados.'], 'Checklist com comando, resultado e interpretacao.', 'Abrir quiz', 'projetos/CCNA-1-Study-Hub/quiz.html'),
        mission('Investigar um cliente com APIPA', 'Reconhecer quando o computador nao conseguiu obter configuracao do DHCP.', ['Leia o chamado e colete apenas evidencias uteis.', 'Diferencie 169.254.0.0/16 de um problema de DNS.', 'Escolha causa, correcao e escalonamento.'], 'Ticket avaliado com pelo menos 80%.', 'Abrir incidente APIPA', 'practice:incidents:hd-dhcp'),
        mission('Fechar a primeira semana com um runbook', 'Transformar comandos soltos em um procedimento repetivel.', ['Ordene testes: local, gateway, IP externo, DNS e rota.', 'Registre teste antes, correcao, teste depois e rollback.', 'Explique o runbook sem consultar.'], 'Runbook “usuario sem internet” em Markdown.', 'Abrir template de ticket', 'template:ticket')
      ]
    },
    {
      phase: 'network-base', title: 'Enderecamento e subnetting',
      outcome: 'Calcular rede, broadcast e hosts e diagnosticar mascara incorreta.',
      prerequisite: 'Conseguir localizar IP, mascara e gateway.',
      exit: 'Resolver /24 a /28, criar uma tabela VLSM simples e provar duas redes diferentes.',
      notYet: 'IPv6 avancado, sumarizacao complexa e BGP.',
      tools: 'Papel, calculadora, Packet Tracer e README.',
      days: [
        mission('Entender rede e host na mascara', 'Visualizar o que a mascara separa sem depender de macete.', ['Revise binario apenas para 128, 64, 32, 16, 8, 4, 2, 1.', 'Compare /24, /25 e /26.', 'Marque rede, primeiro host, ultimo host e broadcast.'], 'Tres sub-redes resolvidas mostrando o raciocinio.', 'Abrir missao de subnetting', 'practice:journey:w2'),
        mission('Calcular blocos /24 a /28', 'Ganhar fluidez com tamanhos usados em labs e suporte.', ['Calcule tamanho do bloco e hosts utilizaveis.', 'Resolva cinco enderecos sem calculadora online.', 'Confira e corrija cada erro por escrito.'], 'Tabela CIDR -> mascara -> bloco -> hosts.', 'Abrir notas CCNA', 'projetos/CCNA_Course_Notes/README.md'),
        mission('Planejar enderecos com VLSM', 'Distribuir redes sem sobreposicao e sem desperdicio grosseiro.', ['Ordene setores do maior para o menor.', 'Aloque 100, 50, 20 e 10 hosts.', 'Confirme que nenhum intervalo se sobrepoe.'], 'Plano VLSM com quatro setores.', 'Abrir missao aprofundada', 'practice:journey:w2'),
        mission('Quebrar uma mascara no lab', 'Observar como uma mascara errada altera a decisao local/remota.', ['Configure dois hosts corretamente.', 'Aplique uma mascara errada em um deles.', 'Use ping e ARP para explicar o comportamento.'], 'Antes/depois da mascara com causa e validacao.', 'Abrir lab base', 'projetos/CCNA-Labs/labs/StaticRoute.pkt'),
        mission('Documentar o primeiro lab de rede', 'Produzir uma evidencia compreensivel por outra pessoa.', ['Desenhe a topologia.', 'Inclua tabela de IP e testes positivos/negativos.', 'Registre problema, correcao e aprendizado.'], 'README do lab com tabela IP e validacoes.', 'Abrir template README', 'template:readme')
      ]
    },
    {
      phase: 'network-core', title: 'Ethernet, switching e VLAN',
      outcome: 'Entender entrega local, tabela MAC, portas access e trunks.',
      prerequisite: 'Sub-redes e gateway compreendidos.',
      exit: 'Configurar duas VLANs e um trunk e localizar uma VLAN ausente no caminho.',
      notYet: 'Fabric, VXLAN, SD-WAN e automacao de switches.',
      tools: 'Packet Tracer, comandos show e diagrama.',
      days: [
        mission('Seguir um quadro na rede local', 'Relacionar ARP, MAC e switching ao ping entre hosts.', ['Diferencie endereco IP de MAC.', 'Observe arp -a no computador.', 'Explique como o switch aprende a porta de origem.'], 'Fluxo host -> ARP -> switch -> destino.', 'Abrir notas de switching', 'projetos/CCNA_Course_Notes/README.md'),
        mission('Criar VLANs e portas access', 'Separar dominios de broadcast de forma intencional.', ['Crie VLAN 10 USERS e VLAN 20 SUPPORT.', 'Associe portas access.', 'Valide com show vlan brief.'], 'Tabela porta -> modo -> VLAN.', 'Abrir lab VLAN', 'projetos/CCNA-Labs/labs/VLAN-2(With Trunk).pkt'),
        mission('Transportar VLANs em um trunk', 'Entender por que o enlace entre switches carrega varias VLANs.', ['Configure o trunk.', 'Valide VLANs permitidas e ativas.', 'Teste hosts da mesma VLAN em switches diferentes.'], 'Outputs de show interfaces trunk e pings.', 'Abrir missao aprofundada', 'practice:journey:w3'),
        mission('Investigar VLAN ausente', 'Isolar uma falha que afeta apenas um setor.', ['Colete estado das VLANs e do trunk.', 'Compare o que funciona com o que falha.', 'Corrija a allowed list com rollback.'], 'Incidente NOC avaliado com 80% ou mais.', 'Abrir incidente de VLAN', 'practice:incidents:noc-vlan'),
        mission('Consolidar switching', 'Explicar access, trunk, broadcast e inter-VLAN sem decorar frase pronta.', ['Revise o diagrama da semana.', 'Faca 20 questoes de switching.', 'Documente tres erros e suas explicacoes corretas.'], 'Diagrama e caderno de erros.', 'Abrir quiz', 'projetos/CCNA-1-Study-Hub/quiz.html')
      ]
    },
    {
      phase: 'network-core', title: 'Roteamento e caminho de ida e volta',
      outcome: 'Ler tabela de rotas, criar rotas estaticas e localizar falta de retorno.',
      prerequisite: 'VLAN e sub-redes dominadas.',
      exit: 'Construir tres redes com rota de ida/volta e explicar longest prefix match.',
      notYet: 'BGP, MPLS, redistribuicao e policy routing.',
      tools: 'Packet Tracer, show ip route, ping e traceroute.',
      days: [
        mission('Ler uma tabela de rotas', 'Reconhecer rotas conectadas, locais, estaticas e default.', ['Abra show ip route.', 'Identifique prefixo, next hop e interface.', 'Explique por que a rota mais especifica vence.'], 'Tabela de cinco rotas interpretadas.', 'Abrir missao de roteamento', 'practice:journey:w4'),
        mission('Criar rotas estaticas', 'Conectar redes sem protocolo dinamico.', ['Monte tres roteadores em linha.', 'Configure rotas de ida e retorno.', 'Teste a partir dos hosts, nao apenas dos roteadores.'], 'Configuracao e ping fim a fim.', 'Abrir lab de rota', 'projetos/CCNA-Labs/labs/StaticRoute.pkt'),
        mission('Usar rota default com criterio', 'Entender quando 0.0.0.0/0 e usada.', ['Adicione uma saida padrao.', 'Mantenha uma rota mais especifica.', 'Preveja qual rota sera escolhida antes do teste.'], 'Tres destinos com a rota escolhida e justificativa.', 'Abrir notas CCNA', 'projetos/CCNA_Course_Notes/README.md'),
        mission('Diagnosticar next hop incorreto', 'Usar traceroute e tabela para localizar onde o caminho para.', ['Introduza um next hop errado.', 'Colete traceroute e show ip route.', 'Corrija e valide ida e retorno.'], 'Ticket com causa, correcao e rollback.', 'Abrir missao aprofundada', 'practice:journey:w4'),
        mission('Escrever um runbook de rotas', 'Criar uma ordem de verificacao para NOC/N2.', ['Liste interface, IP, rota, next hop e retorno.', 'Inclua comandos e interpretacao.', 'Teste o runbook no lab.'], 'Runbook de perda de conectividade entre redes.', 'Abrir template ticket', 'template:ticket')
      ]
    },
    {
      phase: 'network-core', title: 'OSPF e convergencia',
      outcome: 'Formar vizinhanca, anunciar redes e diagnosticar adjacencia.',
      prerequisite: 'Tabela de rotas e caminho de retorno.',
      exit: 'Provar neighbor FULL, rotas O e conectividade fim a fim; corrigir area divergente.',
      notYet: 'OSPF multi-area complexo, tuning e outros protocolos dinamicos.',
      tools: 'Packet Tracer e comandos show de OSPF.',
      days: [
        mission('Entender por que usar OSPF', 'Relacionar vizinhos, estado de enlace, custo e convergencia.', ['Compare rota estatica com aprendizado dinamico.', 'Desenhe tres roteadores na area 0.', 'Explique o significado de neighbor FULL.'], 'Mapa OSPF com redes e vizinhos.', 'Abrir missao OSPF', 'practice:journey:w5'),
        mission('Configurar OSPF area 0', 'Substituir rotas estaticas por anuncios controlados.', ['Defina router IDs.', 'Anuncie as redes corretas.', 'Use passive-interface nas LANs.'], 'Configuracao reproduzivel dos tres roteadores.', 'Abrir lab OSPF', 'projetos/CCNA-Labs/labs/Routing(OSPF Protocol).pkt'),
        mission('Validar adjacencias e rotas', 'Distinguir vizinhanca saudavel de conectividade completa.', ['Execute show ip ospf neighbor.', 'Confira show ip route ospf.', 'Teste ping entre hosts das extremidades.'], 'Outputs FULL, rotas O e ping.', 'Abrir lab validado', '#central-carreira'),
        mission('Investigar area mismatch', 'Correlacionar mudanca, interface e perda de adjacencia.', ['Compare area dos dois lados.', 'Elimine falha fisica com interface e ping do enlace.', 'Restaure area e aguarde convergencia.'], 'Incidente OSPF com 80% ou mais.', 'Abrir incidente OSPF', 'practice:incidents:noc-ospf'),
        mission('Explicar OSPF como em entrevista', 'Consolidar sinais de saude e ordem de troubleshooting.', ['Responda a pergunta OSPF no modo entrevista.', 'Compare sua resposta com a rubrica.', 'Anote conceitos ausentes e revise.'], 'Resposta tecnica com nota registrada.', 'Abrir entrevista', 'career:interview')
      ]
    },
    {
      phase: 'network-core', title: 'ACL, NAT e mentalidade de firewall',
      outcome: 'Permitir somente o trafego necessario e provar permitidos e negados.',
      prerequisite: 'Roteamento funcionando e testes fim a fim.',
      exit: 'Aplicar ACL e PAT com testes positivos/negativos, counters e rollback.',
      notYet: 'UTM avancado, IDS/IPS tuning, VPN complexa e fabricantes especificos.',
      tools: 'Packet Tracer, ACL/NAT labs e ticket de mudanca.',
      days: [
        mission('Pensar em origem, destino, protocolo e porta', 'Transformar “liberar acesso” em uma regra verificavel.', ['Revise TCP, UDP e portas comuns.', 'Monte uma matriz de fluxo.', 'Diferencie ACL standard e estendida.'], 'Matriz origem/destino/porta/acao.', 'Abrir missao ACL/NAT', 'practice:journey:w6'),
        mission('Aplicar uma ACL', 'Entender ordem das regras e implicit deny.', ['Crie um permit especifico.', 'Adicione teste positivo e negativo.', 'Confira counters da ACL.'], 'Configuracao, counters e resultados.', 'Abrir lab ACL', 'projetos/CCNA-Labs/labs/AccessControlList(Standard).pkt'),
        mission('Configurar NAT overload', 'Relacionar enderecos privados, inside/outside e traducao.', ['Identifique interfaces inside/outside.', 'Configure PAT para a rede interna.', 'Valide show ip nat translations.'], 'Tabela origem privada -> traducao -> destino.', 'Abrir lab NAT', 'projetos/CCNA-Labs/labs/Overload-NAT.pkt'),
        mission('Investigar uma ACL fora de ordem', 'Provar por counters que um deny amplo bloqueia a regra especifica.', ['Colete show access-lists.', 'Associe a falha ao TCP/5432.', 'Reposicione a regra com change e rollback.'], 'Incidente ACL com 80% ou mais.', 'Abrir incidente ACL', 'practice:incidents:noc-acl'),
        mission('Fechar a base de redes', 'Revisar dependencias antes de entrar em sistemas e operacao.', ['Explique IP -> VLAN -> rota -> ACL/NAT.', 'Faca um simulado limpo de 30 questoes.', 'Registre os tres assuntos com mais erros.'], 'Mapa de dependencias e historico do simulado.', 'Abrir historico de simulados', 'career:exams')
      ]
    },
    {
      phase: 'operations', title: 'Linux para suporte e operacao',
      outcome: 'Navegar, ler logs, trabalhar com permissoes, processos, services e rede.',
      prerequisite: 'Base de rede concluida. WSL ou VM Linux recomendado.',
      exit: 'Executar os desafios de arquivos, permissoes, services, rede e logs e repetir em ambiente real.',
      notYet: 'Kernel, compilacao, Kubernetes, hardening avancado e administracao enterprise.',
      tools: 'WSL/VM, terminal simulado e Linux Essentials.',
      days: [
        mission('Navegar e encontrar arquivos', 'Usar shell, ajuda, caminhos, listagem e busca sem alterar o sistema.', ['Pratique pwd, ls -la e man.', 'Use find para localizar configuracoes.', 'Leia inicio/fim de arquivos com head e tail.'], 'Transcript real com comandos e explicacoes.', 'Abrir desafio de arquivos', 'practice:terminal:linux-files'),
        mission('Entender usuarios e permissoes', 'Ler rwx e aplicar o minimo necessario sem chmod 777.', ['Revise usuario, grupo e outros.', 'Pratique chmod numerico e simbolico.', 'Confira resultado com ls -l/stat.'], 'Tabela rwx -> octal e desafio aprovado.', 'Abrir desafio de permissoes', 'practice:terminal:linux-perms'),
        mission('Investigar processos e services', 'Coletar estado e logs antes de reiniciar.', ['Use ps/top para processos.', 'Consulte systemctl status.', 'Leia journalctl da unidade e valide configuracao.'], 'Runbook “servico nao inicia”.', 'Abrir desafio de service', 'practice:terminal:linux-service'),
        mission('Diagnosticar rede e SSH no Linux', 'Relacionar IP, rota, porta em escuta e servico.', ['Use ip a e ip route.', 'Confira portas com ss.', 'Valide ssh/sshd e teste conectividade.'], 'Checklist de SSH indisponivel.', 'Abrir desafio de rede', 'practice:terminal:linux-network'),
        mission('Extrair informacao de logs', 'Combinar grep, awk, sort, uniq e tail.', ['Filtre falhas de autenticacao.', 'Extraia IPs e conte recorrencias.', 'Repita em WSL/VM com um arquivo proprio.'], 'Top IPs de falha e comandos usados.', 'Abrir desafio de logs', 'practice:terminal:linux-logs')
      ]
    },
    {
      phase: 'operations', title: 'Operacao NOC e comunicacao de incidentes',
      outcome: 'Triar alertas, medir impacto, priorizar, escalar e manter uma linha do tempo.',
      prerequisite: 'Troubleshooting de rede e comandos Linux basicos.',
      exit: 'Resolver dois incidentes com 80% e escrever um runbook que outro analista consiga seguir.',
      notYet: 'Ferramentas caras de observabilidade, SRE avancado e capacity planning profundo.',
      tools: 'Simulador de chamados, NTP/SNMP/syslog e templates.',
      days: [
        mission('Entender sinal, sintoma e impacto', 'Evitar tratar todo alerta como causa raiz.', ['Defina servico, usuarios e horario afetados.', 'Separe sintoma de hipotese.', 'Classifique prioridade usando impacto e urgencia.'], 'Modelo de triagem com prioridade justificada.', 'Abrir chamados', 'career:tickets'),
        mission('Observar com horario confiavel', 'Relacionar NTP, logs, metricas, SNMP e baseline.', ['Explique por que timestamps importam.', 'Liste cinco metricas de rede/servico.', 'Defina baseline e limiar para um alerta.'], 'Tabela sinal -> fonte -> limiar -> acao.', 'Abrir trilha NOC', '#linux-git'),
        mission('Resolver um chamado de DNS', 'Coletar evidencia suficiente sem reiniciar tudo.', ['Teste IP externo e nome.', 'Valide porta 53 e servidor configurado.', 'Escalone com escopo, horario e evidencias.'], 'Incidente DNS com 80% ou mais.', 'Abrir incidente DNS', 'practice:incidents:hd-dns'),
        mission('Resolver uma falha de OSPF/VLAN', 'Atuar como NOC, considerando mudanca e dominio de impacto.', ['Escolha um caso NOC ainda nao aprovado.', 'Colete somente evidencias uteis.', 'Registre correcao, validacao e rollback.'], 'Segundo incidente NOC aprovado.', 'Abrir bancada NOC', 'practice:incidents:noc-ospf'),
        mission('Produzir um runbook operacional', 'Transformar a semana em procedimento e criterio de escalonamento.', ['Defina entrada, ordem dos testes e saidas.', 'Inclua quando parar e escalar.', 'Peça para uma pessoa ou voce no dia seguinte seguir sem improvisar.'], 'Runbook NOC versionado no Git.', 'Abrir template ticket', 'template:ticket')
      ]
    },
    {
      phase: 'security', title: 'Fundamentos de seguranca e identidade',
      outcome: 'Raciocinar sobre risco, autenticacao, autorizacao, menor privilegio e defesa em profundidade.',
      prerequisite: 'Rede, Linux e operacao basica.',
      exit: 'Explicar Zero Trust e aplicar menor privilegio em um fluxo de rede/cloud.',
      notYet: 'Pentest, exploit development, malware reversing e red team.',
      tools: 'Casos de arquitetura, SC-900 e labs ACL/IAM.',
      days: [
        mission('Separar ativo, ameaca, vulnerabilidade e risco', 'Usar vocabulario de seguranca sem transformar tudo em “ataque”.', ['Escolha um ativo do hub.', 'Liste ameaca, vulnerabilidade, impacto e controle.', 'Classifique risco com probabilidade e impacto.'], 'Registro de risco com controle proposto.', 'Abrir material SC-900', 'projetos/cert-antenas/SC-900-Study-Prep/index.html'),
        mission('Entender identidade e acesso', 'Diferenciar identidade, autenticacao, autorizacao, MFA e RBAC.', ['Mapeie usuario -> autenticacao -> token -> permissao.', 'Compare falha de login com acesso negado.', 'Explique por que MFA nao torna toda sessao legitima.'], 'Diagrama de identidade e cinco definicoes.', 'Abrir arquitetura Zero Trust', 'practice:architecture:security'),
        mission('Aplicar defesa em profundidade', 'Combinar identidade, endpoint, rede, workload e logs.', ['Escolha controles preventivo, detectivo e corretivo.', 'Relacione segmentacao ao movimento lateral.', 'Defina telemetria para cada camada.'], 'Matriz camada -> controle -> evidencia.', 'Abrir arquitetura de seguranca', 'practice:architecture:security'),
        mission('Praticar menor privilegio', 'Remover uma permissao ampla sem quebrar o uso legitimo.', ['Leia o requisito real do usuario/workload.', 'Defina recurso, acao e escopo minimo.', 'Planeje teste permitido e teste negado.'], 'Politica proposta e plano de validacao.', 'Abrir lab IAM', 'practice:cloud:aws-iam'),
        mission('Consolidar seguranca para operacao', 'Conectar ACL, IAM, logs, secrets e resposta.', ['Explique cada controle em linguagem de suporte.', 'Faca 20 questoes SC-900/Fortinet.', 'Registre erros por dominio.'], 'Resumo de seguranca e caderno de erros.', 'Abrir plano SC-900', 'practice:certs:sc900')
      ]
    },
    {
      phase: 'security', title: 'SOC: logs, triagem e resposta inicial',
      outcome: 'Construir timeline, extrair IOCs, classificar severidade e propor contencao proporcional.',
      prerequisite: 'Identidade, logs Linux e fundamentos de seguranca.',
      exit: 'Aprovar tres casos SOC distintos e produzir um playbook de login suspeito.',
      notYet: 'Threat hunting avancado, engenharia reversa e criacao complexa de regras SIEM.',
      tools: 'Logs sinteticos, Event IDs, MITRE ATT&CK e template SOC.',
      days: [
        mission('Ler eventos de autenticacao', 'Diferenciar falha 4625, sucesso 4624, conta e origem.', ['Identifique horario, usuario, host, IP e resultado.', 'Agrupe por origem e conta.', 'Procure sucesso depois de falhas.'], 'Tabela de eventos e linha do tempo.', 'Abrir caso password spray', 'practice:soc:spray'),
        mission('Extrair IOCs e contexto', 'Evitar chamar qualquer IP de IOC sem explicar relevancia.', ['Separe entidade de indicador.', 'Compare volume com baseline.', 'Registre fonte e confianca da evidencia.'], 'Lista comentada de IOCs e entidades.', 'Abrir caso SOC', 'practice:soc:spray'),
        mission('Investigar password spray', 'Reconhecer uma origem tentando poucas senhas em varias contas.', ['Classifique tecnica e severidade.', 'Monte timeline com contas afetadas.', 'Defina bloqueio, MFA, preservacao e escalonamento.'], 'Caso spray aprovado com 80% ou mais.', 'Abrir investigacao spray', 'practice:soc:spray'),
        mission('Investigar execucao suspeita', 'Correlacionar processo pai, PowerShell, rede, arquivo e alerta EDR.', ['Leia a cadeia WINWORD -> PowerShell.', 'Extraia host, IP e hash.', 'Proponha isolamento e preservacao.'], 'Caso PowerShell aprovado com 80% ou mais.', 'Abrir caso PowerShell', 'practice:soc:powershell'),
        mission('Escrever um playbook SOC', 'Criar procedimento que diferencia erro, servico quebrado, spray e comprometimento.', ['Defina entrada e campos obrigatorios.', 'Escreva investigacao, contencao e escalonamento.', 'Inclua criterios para fechar como falso positivo.'], 'Playbook failed login/brute force em Markdown.', 'Abrir template SOC', 'template:soc')
      ]
    },
    {
      phase: 'cloud-career', title: 'Cloud sem pular redes e identidade',
      outcome: 'Entender responsabilidade compartilhada, IAM/RBAC, VPC/VNet, compute, storage, monitoramento e custo.',
      prerequisite: 'Rede, ACL, identidade e Linux basicos.',
      exit: 'Aprovar um lab AWS e um Azure e comparar controles equivalentes.',
      notYet: 'Kubernetes, multi-cloud complexo, certificacao associate e arquitetura de escala global.',
      tools: 'Labs cloud simulados, AWS CLF-C02, AZ-900 e template cloud.',
      days: [
        mission('Entender o modelo cloud', 'Diferenciar IaaS, PaaS, SaaS e responsabilidade compartilhada.', ['Compare on-premises com cloud.', 'Mapeie quem protege infraestrutura, identidade, configuracao e dados.', 'Inclua regioes, zonas e consumo.'], 'Tabela modelo -> responsabilidade -> caso de uso.', 'Abrir plano AWS', 'practice:certs:clf02'),
        mission('Mapear uma arquitetura AWS', 'Relacionar VPC, subnet, SG, EC2, S3, IAM, CloudTrail e budget.', ['Desenhe recursos publicos e privados.', 'Restrinja SSH/RDP e defina identidade.', 'Liste auditoria e alerta de custo.'], 'Diagrama AWS com controles e custo.', 'Abrir lab AWS VPC', 'practice:cloud:aws-vpc'),
        mission('Mapear uma arquitetura Azure', 'Relacionar VNet, subnet, NSG, VM, Entra, RBAC, Monitor e Cost Management.', ['Desenhe o caminho da requisicao.', 'Remova RDP publico usando Bastion/VPN.', 'Defina logs de atividade e budget.'], 'Diagrama Azure com controles equivalentes.', 'Abrir lab Azure NSG', 'practice:cloud:azure-nsg'),
        mission('Praticar identidade cloud', 'Corrigir privilegio amplo e validar menor privilegio.', ['Escolha AWS IAM ou Azure RBAC.', 'Defina acao, recurso e escopo.', 'Registre testes positivos e negativos.'], 'Lab IAM/RBAC aprovado com 80% ou mais.', 'Abrir lab Azure RBAC', 'practice:cloud:azure-rbac'),
        mission('Comparar AWS e Azure sem decorar produtos', 'Reconhecer conceitos transferiveis entre provedores.', ['Compare VPC/VNet, SG/NSG, IAM/Entra-RBAC.', 'Compare auditoria, monitoramento e custo.', 'Responda quando escolheria cada servico basico.'], 'Relatorio comparativo AWS x Azure.', 'Abrir template cloud', 'template:cloud')
      ]
    },
    {
      phase: 'cloud-career', title: 'Arquitetura, automacao e entrada no mercado',
      outcome: 'Enxergar sistemas completos, versionar evidencias e apresentar competencia para uma vaga inicial.',
      prerequisite: 'Semanas 1-11 e pelo menos cinco entregaveis.',
      exit: 'Publicar tres evidencias fortes, explicar dois incidentes e escolher uma certificacao coerente.',
      notYet: 'Acumular novas certificacoes, Kubernetes e projetos enormes sem terminar os atuais.',
      tools: 'Arquitetura, Git, automacao, portfolio e entrevista.',
      days: [
        mission('Seguir uma requisicao ponta a ponta', 'Localizar DNS, edge, API, banco, identidade e telemetria.', ['Inspecione cada componente do mapa.', 'Resolva o incidente HTTP 500.', 'Gere o diagrama Mermaid no entregavel.'], 'Arquitetura cliente-servidor aprovada.', 'Abrir arquitetura cliente-servidor', 'practice:architecture:client-server'),
        mission('Entender distribuicao e resiliencia', 'Raciocinar sobre replicas, timeout, retry, cache e filas.', ['Compare monolito e microsservicos.', 'Investigue falha em apenas uma replica.', 'Defina health check, trace e rollback.'], 'Arquitetura distribuida aprovada.', 'Abrir sistemas distribuidos', 'practice:architecture:distributed'),
        mission('Versionar o portfolio com Git', 'Usar branch, diff, commit e reversao em uma mudanca real.', ['Crie branch para melhorar um README.', 'Revise o diff antes do commit.', 'Integre e pratique git revert.'], 'Historico Git limpo e dois desafios aprovados.', 'Abrir desafio Git branch', 'practice:terminal:git-branch'),
        mission('Automatizar uma tarefa pequena', 'Extrair IPs de um log e gerar um resumo reproduzivel.', ['Defina arquivo de entrada e formato de saida.', 'Use PowerShell, Python ou pipeline shell.', 'Documente comando, exemplo e limitacoes.'], 'Script curto, amostra de entrada/saida e README.', 'Abrir template README', 'template:readme'),
        mission('Montar candidatura baseada em evidencia', 'Escolher projetos que provam rede, operacao e cloud/security.', ['Conclua e revise tres entregaveis.', 'Gere o portfolio HTML.', 'Pratique duas perguntas e escolha a proxima certificacao.'], 'Portfolio publicavel e plano dos proximos 30 dias.', 'Abrir Central de Carreira', 'career:portfolio')
      ]
    }
  ];

  const progressKey = 'infrasec-guided-progress';
  const viewKey = 'infrasec-active-page';
  const dayKey = 'infrasec-guided-current-day';
  const read = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  };
  const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const progress = read(progressKey, {});
  const savedDays = read(dayKey, {});
  const guidedWeekSelect = document.getElementById('guidedWeekSelect');
  const guidedDaySelect = document.getElementById('guidedDaySelect');
  const hubPages = [
    { id: 'today', hash: 'hoje', group: 'Comecar', title: 'O que estudar hoje', section: 'inicio' },
    { id: 'journey', hash: 'jornada', group: 'Comecar', title: 'Plano de 12 semanas', section: 'plano-estudos' },
    { id: 'weekly-overview', hash: 'visao-semanal', group: 'Comecar', title: 'Visao semanal', section: 'jornada' },
    { id: 'weekly-tasks', hash: 'tarefas-jornada', group: 'Comecar', title: 'Tarefas da jornada', section: 'tarefas' },
    { id: 'week-one', hash: 'semana-1', group: 'Comecar', title: 'Semana 1 detalhada', section: 'semana1' },
    { id: 'dependencies', hash: 'dependencias', group: 'Redes', title: 'Mapa de dependencias', section: 'arvore' },
    { id: 'network-practice', hash: 'redes-pratica', group: 'Redes', title: 'Missoes praticas de redes', section: 'academia-pratica', depthTab: 'journey' },
    { id: 'packet-tracer', hash: 'packet-tracer', group: 'Redes', title: 'Labs Packet Tracer', section: 'laboratorio' },
    { id: 'helpdesk-noc', hash: 'helpdesk-noc', group: 'Operacao e seguranca', title: 'Help Desk e NOC', section: 'academia-pratica', depthTab: 'incidents' },
    { id: 'ticket-simulator', hash: 'simulador-chamados', group: 'Operacao e seguranca', title: 'Simulador introdutorio de chamados', section: 'central-carreira', careerTab: 'tickets' },
    { id: 'linux-guide', hash: 'linux-git', group: 'Operacao e seguranca', title: 'Guia Linux e Git', section: 'linux-git' },
    { id: 'terminal', hash: 'terminal', group: 'Operacao e seguranca', title: 'Terminal pratico', section: 'academia-pratica', depthTab: 'terminal' },
    { id: 'soc', hash: 'soc', group: 'Operacao e seguranca', title: 'SOC pratico', section: 'academia-pratica', depthTab: 'soc' },
    { id: 'cloud', hash: 'cloud', group: 'Cloud e arquitetura', title: 'AWS e Azure na pratica', section: 'academia-pratica', depthTab: 'cloud' },
    { id: 'architecture', hash: 'arquitetura', group: 'Cloud e arquitetura', title: 'Arquitetura de sistemas', section: 'academia-pratica', depthTab: 'architecture' },
    { id: 'certifications', hash: 'certificacoes', group: 'Carreira', title: 'Guia de certificacoes', section: 'certificacoes' },
    { id: 'cert-practice', hash: 'certificacoes-pratica', group: 'Carreira', title: 'Pratica de certificacoes', section: 'academia-pratica', depthTab: 'certs' },
    { id: 'portfolio', hash: 'portfolio', group: 'Carreira', title: 'Portfolio e entregaveis', section: 'central-carreira', careerTab: 'portfolio' },
    { id: 'validated-labs', hash: 'labs-validados', group: 'Carreira', title: 'Labs com validacao', section: 'central-carreira', careerTab: 'labs' },
    { id: 'readiness', hash: 'prontidao', group: 'Carreira', title: 'Pronto para vaga?', section: 'central-carreira', careerTab: 'readiness' },
    { id: 'simulations', hash: 'simulados', group: 'Carreira', title: 'Historico de simulados', section: 'central-carreira', careerTab: 'exams' },
    { id: 'interview', hash: 'entrevista', group: 'Carreira', title: 'Modo entrevista', section: 'central-carreira', careerTab: 'interview' },
    { id: 'english', hash: 'ingles', group: 'Carreira', title: 'Ingles tecnico', section: 'central-carreira', careerTab: 'english' },
    { id: 'templates', hash: 'templates', group: 'Recursos', title: 'Templates exportaveis', section: 'templates' },
    { id: 'reading-queue', hash: 'fila-leitura', group: 'Recursos', title: 'Fila de leitura', section: 'central-carreira', careerTab: 'reading' },
    { id: 'kindle', hash: 'estante', group: 'Recursos', title: 'Estante Kindle e Calibre', section: 'estante' },
    { id: 'library', hash: 'biblioteca', group: 'Recursos', title: 'Biblioteca', section: 'biblioteca' },
    { id: 'not-yet', hash: 'nao-estudar', group: 'Recursos', title: 'Nao estudar agora', section: 'nao-estudar' }
  ];
  const pageById = Object.fromEntries(hubPages.map((page) => [page.id, page]));
  const pageByHash = Object.fromEntries(hubPages.map((page) => [page.hash, page]));
  const legacyHashAliases = {
    inicio: 'today', 'plano-estudos': 'journey', tarefas: 'weekly-tasks', semana1: 'week-one',
    arvore: 'dependencies', 'academia-pratica': 'network-practice', laboratorio: 'packet-tracer',
    'central-carreira': 'portfolio', estante: 'kindle', biblioteca: 'library', templates: 'templates',
    certificacoes: 'certifications', 'linux-git': 'linux-guide', 'nao-estudar': 'not-yet'
  };
  let activePageId = 'today';

  function selectDepthTab(name) {
    document.querySelector(`[data-depth-tab="${name}"]`)?.click();
  }

  function selectCareerTab(name) {
    document.querySelector(`[data-career-tab="${name}"]`)?.click();
  }

  function activatePage(pageId, scroll = true) {
    const page = pageById[pageId] || pageById.today;
    activePageId = page.id;
    document.querySelectorAll('main > section').forEach((section) => { section.hidden = section.id !== page.section; });
    if (page.depthTab) selectDepthTab(page.depthTab);
    if (page.careerTab) selectCareerTab(page.careerTab);
    document.body.classList.toggle('route-focused', Boolean(page.depthTab || page.careerTab));
    document.querySelectorAll('[data-hub-page]').forEach((link) => {
      if (link.dataset.hubPage === page.id) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    const pageIndex = hubPages.indexOf(page);
    document.getElementById('hubPageGroup').textContent = page.group;
    document.getElementById('hubPageTitle').textContent = page.title;
    document.getElementById('hubPagePosition').textContent = `Modulo ${pageIndex + 1} de ${hubPages.length}`;
    document.getElementById('previousHubPage').disabled = pageIndex === 0;
    document.getElementById('nextHubPage').disabled = pageIndex === hubPages.length - 1;
    localStorage.setItem(viewKey, page.id);
    if (scroll) window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function navigateToPage(pageId, replace = false, scroll = true) {
    const page = pageById[pageId] || pageById.today;
    history[replace ? 'replaceState' : 'pushState'](null, '', `#${page.hash}`);
    activatePage(page.id, scroll);
  }

  function handleHash(scroll = true) {
    const hash = location.hash.slice(1);
    const page = pageByHash[hash] || pageById[legacyHashAliases[hash]] || pageById[localStorage.getItem(viewKey)] || pageById.today;
    activatePage(page.id, scroll);
  }

  function setPractice(tab, value) {
    const pageMap = {
      journey: 'network-practice', incidents: 'helpdesk-noc', soc: 'soc', cloud: 'cloud',
      terminal: 'terminal', certs: 'cert-practice', architecture: 'architecture'
    };
    navigateToPage(pageMap[tab] || 'network-practice');
    selectDepthTab(tab);
    const selectMap = {
      journey: 'deepJourneySelect', incidents: 'deepIncidentSelect', soc: 'deepSocSelect',
      cloud: 'deepCloudSelect', terminal: 'deepTerminalSelect', certs: 'deepCertSelect',
      architecture: 'architectureSelect'
    };
    const select = document.getElementById(selectMap[tab]);
    if (select && value) {
      select.value = value;
      select.dispatchEvent(new Event('change'));
    }
  }

  function openGuidedTarget(target) {
    if (target.startsWith('practice:')) {
      const [, tab, value] = target.split(':');
      setPractice(tab, value);
      return;
    }
    if (target.startsWith('career:')) {
      const tab = target.split(':')[1];
      const pageMap = {
        portfolio: 'portfolio', tickets: 'ticket-simulator', labs: 'validated-labs', readiness: 'readiness',
        exams: 'simulations', reading: 'reading-queue', interview: 'interview', english: 'english'
      };
      navigateToPage(pageMap[tab] || 'portfolio');
      selectCareerTab(tab);
      return;
    }
    if (target.startsWith('template:')) {
      navigateToPage('templates');
      document.querySelector(`[data-template="${target.split(':')[1]}"]`)?.click();
      return;
    }
    if (target.startsWith('#')) {
      location.hash = target;
      handleHash();
      return;
    }
    window.open(target, '_blank', 'noopener');
  }

  function missionState(weekIndex, dayIndex) {
    return progress[`${weekIndex}-${dayIndex}`] || 'not-started';
  }

  function firstOpenDay(weekIndex) {
    const saved = Number(savedDays[weekIndex]);
    if (Number.isInteger(saved) && saved >= 0 && saved < 5) return saved;
    const first = guidedWeeks[weekIndex].days.findIndex((_, index) => missionState(weekIndex, index) !== 'done');
    return first === -1 ? 4 : first;
  }

  function weekDoneCount(weekIndex) {
    return guidedWeeks[weekIndex].days.filter((_, index) => missionState(weekIndex, index) === 'done').length;
  }

  function renderToday() {
    const weekIndex = Number(guidedWeekSelect.value);
    const dayIndex = Number(guidedDaySelect.value);
    const week = guidedWeeks[weekIndex];
    const day = week.days[dayIndex];
    const state = missionState(weekIndex, dayIndex);
    const done = weekDoneCount(weekIndex);
    const phase = phases.find((item) => item.id === week.phase);
    document.getElementById('todayPhase').textContent = `${phase.label} · Semana ${weekIndex + 1}`;
    document.getElementById('todayMissionNumber').textContent = `Missao ${dayIndex + 1} de 5 · ${dayNames[dayIndex]}`;
    document.getElementById('todayMissionDuration').textContent = `${day.duration} minutos`;
    document.getElementById('todayMissionTitle').textContent = day.title;
    document.getElementById('todayMissionObjective').textContent = day.objective;
    document.getElementById('todayMissionSteps').innerHTML = day.steps.map((step) => `<li>${step}</li>`).join('');
    document.getElementById('todayMissionEvidence').textContent = day.evidence;
    const primary = document.getElementById('todayPrimaryAction');
    primary.textContent = state === 'doing' ? `Continuar: ${day.action}` : day.action;
    primary.dataset.guidedTarget = day.target;
    document.getElementById('guidedWeekTitle').textContent = `Semana ${weekIndex + 1}: ${week.title}`;
    document.getElementById('guidedWeekOutcome').textContent = week.outcome;
    document.getElementById('guidedExitCriteria').textContent = week.exit;
    document.getElementById('guidedNotYet').textContent = week.notYet;
    document.getElementById('guidedProgressText').textContent = `${done} de 5 missoes`;
    document.getElementById('guidedProgressPercent').textContent = `${done * 20}%`;
    document.getElementById('guidedProgress').value = done;
    document.getElementById('sidebarWeekStatus').textContent = `Semana ${weekIndex + 1} de 12`;
    document.getElementById('sidebarNextAction').textContent = state === 'done' ? 'Missao concluida. Avance quando estiver pronto.' : `Agora: ${day.title}.`;
    const feedback = document.getElementById('todayFeedback');
    feedback.className = 'guided-feedback';
    feedback.textContent = '';
    if (state === 'done') {
      feedback.className = 'guided-feedback done';
      feedback.textContent = 'Missao concluida. A evidencia deve estar salva na Central de Evidencias ou no seu repositorio.';
    } else if (state === 'blocked') {
      feedback.className = 'guided-feedback blocked';
      feedback.textContent = 'Pare aqui: volte ao primeiro passo, use o material indicado e registre exatamente onde travou. Nao avance a semana ainda.';
    } else if (state === 'doing') {
      feedback.textContent = 'Sessao iniciada. Conclua os tres passos e produza a evidencia antes de marcar como feita.';
    }
    document.getElementById('nextMission').disabled = state !== 'done' || (weekIndex === 11 && dayIndex === 4);
    savedDays[weekIndex] = dayIndex;
    save(dayKey, savedDays);
    renderRoadmap();
    renderSyllabus();
  }

  function chooseWeek(weekIndex, dayIndex = firstOpenDay(weekIndex), switchHome = false) {
    guidedWeekSelect.value = String(weekIndex);
    guidedDaySelect.innerHTML = guidedWeeks[weekIndex].days.map((day, index) => `<option value="${index}">${dayNames[index]} · ${day.title}</option>`).join('');
    guidedDaySelect.value = String(dayIndex);
    const legacyWeekSelect = document.getElementById('weekSelect');
    if (legacyWeekSelect && Number(legacyWeekSelect.value) !== weekIndex) {
      legacyWeekSelect.value = String(weekIndex);
      legacyWeekSelect.dispatchEvent(new Event('change'));
    }
    renderToday();
    if (switchHome) {
      navigateToPage('today', true);
    }
  }

  function renderRoadmap() {
    const currentWeek = Number(guidedWeekSelect.value);
    document.getElementById('guidedWeekRoadmap').innerHTML = guidedWeeks.map((week, index) => {
      const done = weekDoneCount(index);
      return `<button type="button" data-guided-week="${index}" ${index === currentWeek ? 'aria-current="step"' : ''}>
        <span class="week-number">${index + 1}</span><span class="week-name">${week.title}</span><span class="week-state">${done}/5</span>
      </button>`;
    }).join('');
  }

  function renderSyllabus() {
    const weekIndex = Number(guidedWeekSelect.value);
    const week = guidedWeeks[weekIndex];
    const phase = phases.find((item) => item.id === week.phase);
    document.getElementById('guidedWeekSyllabus').innerHTML = `
      <header><span class="guided-eyebrow">${phase.label} · Semana ${weekIndex + 1}</span><h3>${week.title}</h3><p>${week.outcome}</p></header>
      <div class="syllabus-meta">
        <div><strong>Antes de comecar</strong><span>${week.prerequisite}</span></div>
        <div><strong>Ferramentas</strong><span>${week.tools}</span></div>
        <div><strong>Saida da semana</strong><span>${week.exit}</span></div>
      </div>
      <div class="syllabus-days">${week.days.map((day, dayIndex) => {
        const state = missionState(weekIndex, dayIndex);
        const label = state === 'done' ? 'Concluida' : state === 'blocked' ? 'Revisar' : state === 'doing' ? 'Em andamento' : 'Abrir';
        return `<div class="syllabus-day"><span class="day-label">${dayNames[dayIndex]}</span><div><h4>${day.title}</h4><p>${day.objective} · ${day.duration} min</p></div><button type="button" data-open-mission="${weekIndex}-${dayIndex}">${label}</button></div>`;
      }).join('')}</div>`;
  }

  function renderPhases() {
    const currentPhase = guidedWeeks[Number(guidedWeekSelect.value)].phase;
    document.getElementById('phaseRail').innerHTML = phases.map((phase) => `<button type="button" data-guided-phase="${phase.id}" aria-pressed="${phase.id === currentPhase}"><strong>${phase.label}</strong><span>${phase.range}</span></button>`).join('');
  }

  guidedWeeks.forEach((week, index) => {
    const option = document.createElement('option');
    option.value = String(index);
    option.textContent = `Semana ${index + 1} · ${week.title}`;
    guidedWeekSelect.appendChild(option);
  });

  guidedWeekSelect.addEventListener('change', () => {
    chooseWeek(Number(guidedWeekSelect.value));
    renderPhases();
  });
  guidedDaySelect.addEventListener('change', renderToday);
  document.getElementById('todayPrimaryAction').addEventListener('click', (event) => {
    event.preventDefault();
    const weekIndex = Number(guidedWeekSelect.value);
    const dayIndex = Number(guidedDaySelect.value);
    if (missionState(weekIndex, dayIndex) !== 'done') progress[`${weekIndex}-${dayIndex}`] = 'doing';
    save(progressKey, progress);
    renderToday();
    openGuidedTarget(event.currentTarget.dataset.guidedTarget);
  });
  document.getElementById('completeToday').addEventListener('click', () => {
    const weekIndex = Number(guidedWeekSelect.value);
    const dayIndex = Number(guidedDaySelect.value);
    progress[`${weekIndex}-${dayIndex}`] = 'done';
    save(progressKey, progress);
    renderToday();
  });
  document.getElementById('blockedToday').addEventListener('click', () => {
    const weekIndex = Number(guidedWeekSelect.value);
    const dayIndex = Number(guidedDaySelect.value);
    progress[`${weekIndex}-${dayIndex}`] = 'blocked';
    save(progressKey, progress);
    renderToday();
  });
  document.getElementById('nextMission').addEventListener('click', () => {
    let weekIndex = Number(guidedWeekSelect.value);
    let dayIndex = Number(guidedDaySelect.value) + 1;
    if (dayIndex > 4) { weekIndex += 1; dayIndex = 0; }
    if (weekIndex < guidedWeeks.length) chooseWeek(weekIndex, dayIndex, true);
  });
  document.getElementById('guidedWeekRoadmap').addEventListener('click', (event) => {
    const button = event.target.closest('[data-guided-week]');
    if (!button) return;
    chooseWeek(Number(button.dataset.guidedWeek));
    renderPhases();
  });
  document.getElementById('guidedWeekSyllabus').addEventListener('click', (event) => {
    const button = event.target.closest('[data-open-mission]');
    if (!button) return;
    const [weekIndex, dayIndex] = button.dataset.openMission.split('-').map(Number);
    chooseWeek(weekIndex, dayIndex, true);
  });
  document.getElementById('phaseRail').addEventListener('click', (event) => {
    const button = event.target.closest('[data-guided-phase]');
    if (!button) return;
    const weekIndex = guidedWeeks.findIndex((week) => week.phase === button.dataset.guidedPhase);
    chooseWeek(weekIndex);
    renderPhases();
  });
  document.getElementById('toggleLegacyJourney').addEventListener('click', (event) => {
    event.currentTarget.setAttribute('aria-expanded', 'false');
    navigateToPage('weekly-overview');
  });
  document.querySelectorAll('[data-hub-page]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      navigateToPage(link.dataset.hubPage);
    });
  });
  document.getElementById('previousHubPage').addEventListener('click', () => {
    const index = hubPages.findIndex((page) => page.id === activePageId);
    if (index > 0) navigateToPage(hubPages[index - 1].id);
  });
  document.getElementById('nextHubPage').addEventListener('click', () => {
    const index = hubPages.findIndex((page) => page.id === activePageId);
    if (index < hubPages.length - 1) navigateToPage(hubPages[index + 1].id);
  });
  window.addEventListener('hashchange', () => handleHash());

  const oldWeekSelect = document.getElementById('weekSelect');
  oldWeekSelect?.addEventListener('change', () => {
    const weekIndex = Number(oldWeekSelect.value);
    if (Number(guidedWeekSelect.value) !== weekIndex) {
      guidedWeekSelect.value = String(weekIndex);
      chooseWeek(weekIndex);
      renderPhases();
    }
  });

  const initialWeek = Math.max(0, Math.min(11, Number(localStorage.getItem('infrasec-current-week') || 0)));
  guidedWeekSelect.value = String(initialWeek);
  chooseWeek(initialWeek);
  renderPhases();
  handleHash(false);
})();
