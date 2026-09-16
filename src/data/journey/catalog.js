import { enrichMissionSteps } from './step-guidance.js';

const dayNames = ['Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado', 'Domingo'];

const phases = [
  { id: 'network-base', label: 'Base de rede', range: 'Semanas 1-2' },
  { id: 'network-core', label: 'Redes na pratica', range: 'Semanas 3-6' },
  { id: 'operations', label: 'Sistemas e NOC', range: 'Semanas 7-8' },
  { id: 'security', label: 'Seguranca e SOC', range: 'Semanas 9-10' },
  { id: 'cloud-career', label: 'Cloud e carreira', range: 'Semanas 11-12' }
];

const mission = (title, objective, steps, evidence, action, target, duration = 90) => {
  const details = { title, objective, evidence, action, target, duration };
  return { ...details, steps: enrichMissionSteps(steps, details) };
};

const step = (title, kind, instruction, action, target, options = {}) => ({
  title, kind, instruction, action, target, ...options
});

const weekdayWeeks = [
  {
    phase: 'network-base', title: 'Conectividade sem adivinhacao',
    outcome: 'Explicar como um site abre e isolar falhas entre computador, rede local, internet e DNS.',
    prerequisite: 'Nenhum. Esta e a porta de entrada.',
    exit: 'Executar ipconfig, ping, nslookup e tracert e explicar o que cada resultado comprova.',
    notYet: 'Subnetting, VLAN, OSPF, cloud e ferramentas de ataque.',
    tools: 'PowerShell/CMD, quiz CCNA e template de ticket.',
    days: [
      mission('Entender o caminho de uma requisicao', 'Construir o mapa mental navegador -> DNS -> gateway -> internet -> servidor.', [
        step('Ler o caminho sem decorar camadas', 'Leitura dirigida', 'Abra as notas e procure somente cinco ideias: aplicacao, transporte, IP, enlace e meio fisico. Ao terminar, escreva uma frase para cada uma.', 'Abrir trecho de OSI/TCP-IP', 'projetos/CCNA_Course_Notes/Course_Notes/OSI_Model_TCPSuite.md', { checks: ['Consigo dizer onde entram HTTP e DNS.', 'Consigo diferenciar endereco IP de endereco MAC.'] }),
        step('Desenhar a requisicao em cinco blocos', 'Exercicio no papel', 'Desenhe navegador -> DNS -> gateway -> internet -> servidor. Em cada seta, anote o que o computador precisa descobrir antes de continuar.', 'Abrir bancada da Semana 1', 'practice:journey:w1', { checks: ['O desenho tem exatamente cinco blocos.', 'DNS resolve o nome; gateway leva o trafego para fora da rede local.'] }),
        step('Explicar IP, gateway e DNS', 'Teste de explicacao', 'Sem consultar as notas, grave ou fale uma explicacao de ate dois minutos. Depois use o checkpoint da Semana 1 para conferir se os tres papeis ficaram corretos.', 'Fazer checkpoint da Semana 1', 'practice:journey:w1', { checks: ['IP identifica a interface na rede.', 'Gateway e a saida para outras redes.', 'DNS traduz nomes em enderecos.'] })
      ], 'Um desenho simples e dez linhas explicando como um site abre.', 'Abrir notas de rede', 'projetos/CCNA_Course_Notes/Course_Notes/OSI_Model_TCPSuite.md', 75),
      mission('Ler a configuracao do seu computador', 'Reconhecer IP, mascara, gateway, DHCP e DNS no output real.', [
        step('Executar ipconfig /all', 'Pratica no Windows', 'Copie o comando, abra PowerShell ou CMD no seu computador e execute. Nao altere nenhuma configuracao; nesta etapa voce apenas coleta evidencia.', 'Abrir bancada para registrar o resultado', 'practice:journey:w1', { commands: ['ipconfig /all'], checks: ['O comando foi executado no Windows real.', 'O output foi guardado para o proximo passo.'] }),
        step('Encontrar os seis campos importantes', 'Leitura de output', 'No adaptador que esta conectado, marque: DHCP habilitado, IPv4, mascara, gateway padrao, servidor DHCP e servidores DNS. Ignore adaptadores desconectados.', 'Abrir bancada para preencher a evidencia', 'practice:journey:w1', { commands: ['ipconfig /all'], checks: ['Escolhi o adaptador ativo.', 'Encontrei IPv4, mascara, gateway, DHCP e DNS.'] }),
        step('Comparar com outra rede Wi-Fi', 'Exercicio de hipotese', 'Antes de trocar de rede, preveja quais campos podem mudar. Depois compare com outro Wi-Fi apenas se tiver acesso seguro a ele; nao e obrigatorio trocar de rede.', 'Conferir modelo mental', 'practice:journey:w1', { checks: ['IP e gateway normalmente mudam.', 'Mascara, DHCP e DNS podem mudar conforme a rede.', 'O endereco MAC da interface normalmente permanece.'] })
      ], 'Tabela campo -> valor -> para que serve, usando seu computador.', 'Abrir missao aprofundada', 'practice:journey:w1'),
      mission('Testar por camadas', 'Usar uma ordem de diagnostico que separa rede local, internet e nomes.', [
        step('Testar pilha local e gateway', 'Pratica no Windows', 'Execute primeiro o loopback. Depois substitua <gateway> pelo endereco encontrado no ipconfig. Se o loopback falhar, o problema e local; se o gateway falhar, ainda nao ha prova de falha na internet.', 'Abrir bancada para interpretar', 'practice:journey:w1', { commands: ['ping 127.0.0.1', 'ping <gateway>'], checks: ['Nao digitei literalmente <gateway>.', 'Registrei sucesso, perda ou timeout de cada teste.'] }),
        step('Testar alcance externo por IP', 'Pratica no Windows', 'Execute o ping para 1.1.1.1. Se responder e um nome nao abrir depois, a conectividade IP externa existe e DNS vira a hipotese principal.', 'Abrir bancada para interpretar', 'practice:journey:w1', { commands: ['ping 1.1.1.1'], checks: ['Comparei este resultado com o ping no gateway.', 'Nao conclui que toda a internet funciona por causa de um unico ping.'] }),
        step('Testar DNS e caminho', 'Pratica no Windows', 'Use nslookup para testar resolucao de nomes e tracert para observar saltos. Registre o que cada comando prova e tambem o que ele nao prova.', 'Abrir quiz de conectividade', 'projetos/CCNA-1-Study-Hub/quiz.html', { commands: ['nslookup example.com', 'tracert 1.1.1.1'], checks: ['Separei falha de nome de falha de alcance IP.', 'Nao tratei asteriscos isolados no tracert como prova definitiva de queda.'] })
      ], 'Checklist com comando, resultado e interpretacao.', 'Abrir quiz', 'projetos/CCNA-1-Study-Hub/quiz.html'),
      mission('Investigar um cliente com APIPA', 'Reconhecer quando o computador nao conseguiu obter configuracao do DHCP.', [
        step('Abrir o chamado e coletar evidencias', 'Incidente interativo', 'Entre no caso Notebook recebe APIPA. Leia o impacto e escolha somente evidencias que ajudam a confirmar configuracao local, DHCP e escopo do problema.', 'Abrir incidente APIPA', 'practice:incidents:hd-dhcp', { checks: ['Li o chamado antes de escolher comandos.', 'Comparei o notebook com outro usuario da mesma rede.'] }),
        step('Separar APIPA de falha de DNS', 'Diagnostico guiado', 'No incidente, prove por que um endereco 169.254.x.x com gateway vazio aponta primeiro para DHCP, antes de investigar DNS.', 'Continuar incidente APIPA', 'practice:incidents:hd-dhcp', { commands: ['ipconfig /all', 'ipconfig /renew'], checks: ['Reconheci a faixa 169.254.0.0/16.', 'Usei a renovacao como evidencia, nao como correcao garantida.'] }),
        step('Decidir causa, correcao e escalonamento', 'Tomada de decisao', 'Conclua o caso escolhendo a causa mais sustentada pelas evidencias, uma correcao proporcional e quando o N1 deve escalar para redes.', 'Concluir incidente APIPA', 'practice:incidents:hd-dhcp', { checks: ['A causa explica todas as evidencias relevantes.', 'A validacao repete os testes depois da correcao.', 'O escalonamento considera se outros clientes tambem falham.'] })
      ], 'Ticket avaliado com pelo menos 80%.', 'Abrir incidente APIPA', 'practice:incidents:hd-dhcp'),
      mission('Fechar a primeira semana com um runbook', 'Transformar comandos soltos em um procedimento repetivel.', [
        step('Ordenar os testes de conectividade', 'Construcao de runbook', 'Crie a sequencia: configuracao local -> loopback -> gateway -> IP externo -> DNS -> rota. Para cada teste, escreva qual hipotese ele elimina.', 'Abrir modelo de ticket', 'template:ticket', { commands: ['ipconfig /all', 'ping 127.0.0.1', 'ping <gateway>', 'ping 1.1.1.1', 'nslookup example.com', 'tracert 1.1.1.1'], checks: ['A ordem vai do mais local ao mais externo.', 'Cada comando tem uma interpretacao.'] }),
        step('Registrar antes, depois e rollback', 'Evidencia operacional', 'No template, registre sintoma, impacto, teste antes, acao tomada, teste depois e como desfazer uma alteracao. Nao invente uma correcao que voce nao executou.', 'Preencher template de ticket', 'template:ticket', { checks: ['Separei evidencia de hipotese.', 'A validacao repete o teste que falhou.', 'Existe criterio para escalar.'] }),
        step('Validar a Semana 1', 'Checkpoint final', 'Explique o runbook sem consultar e conclua o checkpoint tecnico. A missao aprofundada gera a evidencia que pode entrar no portfolio quando atingir a rubrica.', 'Fazer avaliacao da Semana 1', 'practice:journey:w1', { checks: ['Consigo explicar a ordem dos testes.', 'Registrei comandos e interpretacoes.', 'Atingi 80% ou anotei exatamente o que revisar.'] })
      ], 'Runbook “usuario sem internet” em Markdown.', 'Abrir template de ticket', 'template:ticket')
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

const weekendMissions = [
  [
    mission('Montar a primeira LAN no Packet Tracer', 'Consolidar IP, mascara, gateway e testes em uma topologia visual.', ['Abra o lab e identifique PCs, switch e cabos.', 'Configure dois PCs na mesma sub-rede e teste ping.', 'Quebre um endereco, registre o sintoma e restaure a configuracao.'], 'Print da topologia, tabela IP e comparacao antes/depois.', 'Abrir lab introdutorio', 'projetos/CCNA-Labs/labs/SwitchCommands.pkt', 120),
    mission('Revisar conectividade e planejar a Semana 2', 'Fechar lacunas de IP, gateway, DNS e DHCP antes de subnetting.', ['Refaca somente os testes que ainda nao consegue explicar.', 'Conclua o checkpoint da Semana 1 e registre os erros.', 'Escreva tres metas objetivas para a proxima semana.'], 'Revisao com nota, erros explicados e plano da Semana 2.', 'Abrir checkpoint da Semana 1', 'practice:journey:w1', 60)
  ],
  [
    mission('Consolidar subnetting em uma topologia', 'Aplicar rede, broadcast, hosts e gateway em dois segmentos.', ['Planeje duas sub-redes sem sobreposicao.', 'Configure enderecos e gateways no lab.', 'Teste comunicacao e corrija uma mascara propositalmente errada.'], 'Plano de enderecamento, outputs e arquivo .pkt corrigido.', 'Abrir lab de rotas', 'projetos/CCNA-Labs/labs/StaticRoute.pkt', 120),
    mission('Revisar subnetting e preparar switching', 'Usar os erros da semana para decidir o que revisar antes de VLAN.', ['Refaca tres calculos que errou durante a semana.', 'Conclua a avaliacao da Semana 2.', 'Planeje a revisao curta de Ethernet, MAC e ARP.'], 'Caderno de erros e plano de entrada na Semana 3.', 'Abrir avaliacao de subnetting', 'practice:journey:w2', 60)
  ],
  [
    mission('Consolidar VLAN, access e trunk', 'Construir e validar segmentacao entre dois switches.', ['Crie VLANs 10 e 20 e associe portas access.', 'Configure o trunk e confira VLANs permitidas.', 'Teste comunicacao correta e simule uma VLAN ausente.'], 'Arquivo .pkt, show vlan brief, show interfaces trunk e pings.', 'Abrir lab VLAN completo', 'projetos/CCNA-Labs/labs/VLAN-2(With Trunk).pkt', 120),
    mission('Revisar switching pelos erros', 'Transformar erros de switching em explicacoes operacionais.', ['Revise o diagrama e identifique onde ARP e tabela MAC aparecem.', 'Faca uma rodada de questoes de switching.', 'Registre tres erros, a resposta correta e o motivo.'], 'Caderno de erros de switching e meta da Semana 4.', 'Abrir quiz CCNA', 'projetos/CCNA-1-Study-Hub/quiz.html', 75)
  ],
  [
    mission('Consolidar rotas estaticas e default', 'Validar ida, retorno e escolha da rota mais especifica.', ['Monte tres roteadores e registre a tabela inicial.', 'Configure rotas estaticas e uma default.', 'Introduza um next hop incorreto, localize e reverta.'], 'Arquivo .pkt, tabelas de rota, traceroute e rollback.', 'Abrir lab de rotas estaticas', 'projetos/CCNA-Labs/labs/StaticRoute.pkt', 120),
    mission('Revisar roteamento e preparar OSPF', 'Fechar duvidas de next hop e retorno antes do protocolo dinamico.', ['Explique cinco entradas de show ip route.', 'Conclua o checkpoint da Semana 4.', 'Planeje o lab OSPF da proxima semana.'], 'Revisao de rotas e plano do lab OSPF.', 'Abrir checkpoint de roteamento', 'practice:journey:w4', 60)
  ],
  [
    mission('Consolidar OSPF e troubleshooting', 'Configurar vizinhanca, anunciar redes e recuperar uma adjacencia.', ['Configure tres roteadores na area 0.', 'Valide vizinhos FULL, rotas O e ping fim a fim.', 'Crie um area mismatch e documente a recuperacao.'], 'Arquivo .pkt, outputs OSPF, causa e validacao.', 'Abrir lab OSPF', 'projetos/CCNA-Labs/labs/Routing(OSPF Protocol).pkt', 120),
    mission('Revisar OSPF por um incidente', 'Fechar a semana com uma investigacao baseada em evidencias.', ['Leia o impacto antes de coletar comandos.', 'Resolva o caso sem trocar varias configuracoes ao mesmo tempo.', 'Registre lacunas e o plano de ACL/NAT.'], 'Incidente OSPF aprovado e lista de revisao.', 'Abrir incidente OSPF', 'practice:incidents:noc-ospf', 75)
  ],
  [
    mission('Consolidar ACL com testes positivos e negativos', 'Provar que a politica permite apenas o fluxo solicitado.', ['Implemente um permit especifico e preserve o implicit deny.', 'Execute um teste permitido e outro negado.', 'Use counters para provar qual regra foi acionada.'], 'Arquivo .pkt, ACL, counters, testes e rollback.', 'Abrir lab ACL', 'projetos/CCNA-Labs/labs/AccessControlList(Standard).pkt', 120),
    mission('Revisar a base completa de redes', 'Conectar IP, VLAN, rota, OSPF, ACL e NAT antes de Linux.', ['Desenhe o mapa de dependencias da rede.', 'Conclua a avaliacao acumulada da Semana 6.', 'Registre os tres assuntos fracos e um plano de revisao.'], 'Mapa da rede, nota e plano de entrada em Linux.', 'Abrir avaliacao de redes', 'practice:journey:w6', 75)
  ],
  [
    mission('Consolidar Linux em um incidente de SSH', 'Usar arquivos, services, logs e rede numa unica investigacao.', ['Inspecione enderecos, rotas e porta 22.', 'Consulte o service antes de reiniciar.', 'Valide acesso e registre os outputs em ordem.'], 'Transcript do terminal e runbook de SSH indisponivel.', 'Abrir terminal Linux de rede', 'practice:terminal:linux-network', 100),
    mission('Revisar Linux e preparar operacao NOC', 'Transformar comandos da semana em uma rotina operacional.', ['Liste os comandos que consegue explicar sem consultar.', 'Documente dois erros e como os corrigiu.', 'Monte o plano de triagem, SLA e monitoramento da Semana 8.'], 'Runbook Linux revisado e plano da Semana 8.', 'Abrir template de ticket', 'template:ticket', 60)
  ],
  [
    mission('Consolidar triagem em um chamado DNS', 'Aplicar impacto, horario, evidencia, causa e escalonamento.', ['Defina escopo e prioridade do chamado.', 'Colete testes de IP, DNS e porta 53.', 'Feche ou escale com evidencia suficiente.'], 'Incidente DNS aprovado e ticket operacional.', 'Abrir incidente DNS', 'practice:incidents:hd-dns', 90),
    mission('Revisar comunicacao operacional', 'Explicar uma investigacao de forma clara para usuario e equipe tecnica.', ['Resuma o incidente em linguagem nao tecnica.', 'Responda uma pergunta de troubleshooting em entrevista.', 'Planeje a entrada em seguranca e identidade.'], 'Resumo executivo, resposta tecnica e plano da Semana 9.', 'Abrir modo entrevista', 'career:interview', 60)
  ],
  [
    mission('Consolidar arquitetura de seguranca', 'Aplicar identidade, segmentacao, menor privilegio e telemetria.', ['Siga uma requisicao protegida pelo mapa Zero Trust.', 'Escolha controles preventivo, detectivo e corretivo.', 'Resolva o incidente e defenda a evidencia usada.'], 'Arquitetura de seguranca aprovada e diagrama.', 'Abrir arquitetura de seguranca', 'practice:architecture:security', 100),
    mission('Revisar seguranca com SC-900', 'Organizar os conceitos fundamentais antes da pratica SOC.', ['Revise os dominios em que ainda nao consegue ensinar.', 'Registre uma nota de pratica limpa.', 'Planeje os casos de autenticacao da Semana 10.'], 'Plano SC-900 atualizado e lacunas priorizadas.', 'Abrir pratica SC-900', 'practice:certs:sc900', 60)
  ],
  [
    mission('Consolidar investigacao de password spray', 'Executar triagem, timeline, contencao e escalonamento.', ['Classifique o alerta e identifique entidades.', 'Monte a timeline com contas, origem e resultados.', 'Defina contencao e evidencias que devem ser preservadas.'], 'Caso SOC aprovado e relatorio de investigacao.', 'Abrir caso password spray', 'practice:soc:spray', 100),
    mission('Revisar SOC com um segundo caso', 'Comparar autenticacao suspeita com execucao maliciosa.', ['Resolva o caso PowerShell sem pular a coleta.', 'Compare IOCs, entidades e pontos de contencao dos dois casos.', 'Planeje o estudo de cloud com foco em identidade e logs.'], 'Segundo caso aprovado e comparacao das investigacoes.', 'Abrir caso PowerShell', 'practice:soc:powershell', 90)
  ],
  [
    mission('Consolidar uma arquitetura AWS segura', 'Combinar VPC, subnets, security groups, IAM, auditoria e custo.', ['Separe recursos publicos e privados.', 'Aplique menor privilegio e elimine administracao exposta.', 'Defina logs, validacao, rollback e budget.'], 'Lab AWS aprovado e diagrama com controles.', 'Abrir lab AWS VPC', 'practice:cloud:aws-vpc', 100),
    mission('Revisar cloud comparando Azure', 'Transferir conceitos entre AWS e Azure sem decorar nomes.', ['Mapeie VPC/VNet, SG/NSG e IAM/Entra-RBAC.', 'Resolva o lab Azure NSG.', 'Registre lacunas e o plano de integracao final.'], 'Lab Azure aprovado e tabela comparativa.', 'Abrir lab Azure NSG', 'practice:cloud:azure-nsg', 90)
  ],
  [
    mission('Consolidar arquitetura e resiliencia', 'Investigar falha distribuida com logs, metricas e rollback.', ['Siga uma requisicao entre gateway, servicos, cache e banco.', 'Localize a replica defeituosa usando evidencias.', 'Defina health check, retry seguro e rollback.'], 'Arquitetura distribuida aprovada e runbook.', 'Abrir sistemas distribuidos', 'practice:architecture:distributed', 100),
    mission('Fechar a jornada e planejar os proximos 30 dias', 'Reunir evidencias, lacunas e candidatura num plano executavel.', ['Revise e conclua tres entregaveis fortes.', 'Gere o portfolio HTML e confira os links.', 'Escolha uma vaga-alvo, certificacao e rotina de revisao.'], 'Portfolio publicavel e plano profissional de 30 dias.', 'Abrir Central de Portfolio', 'career:portfolio', 90)
  ]
];

const guidedWeeks = weekdayWeeks.map((week, index) => ({
  ...week,
  days: [...week.days, ...weekendMissions[index]]
}));

const hubPages = [
  { id: 'today', hash: 'hoje', group: 'Comecar', title: 'O que estudar hoje', section: 'inicio' },
  { id: 'level', hash: 'meu-nivel', group: 'Comecar', title: 'Meu nivel', section: 'nivel' },
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

const legacyHashAliases = {
  inicio: 'today', 'plano-estudos': 'journey', tarefas: 'weekly-tasks', semana1: 'week-one',
  arvore: 'dependencies', 'academia-pratica': 'network-practice', laboratorio: 'packet-tracer',
  'central-carreira': 'portfolio', estante: 'kindle', biblioteca: 'library', templates: 'templates',
  certificacoes: 'certifications', 'linux-git': 'linux-guide', 'nao-estudar': 'not-yet'
};

export const journeyCatalog = Object.freeze({ dayNames, phases, guidedWeeks, hubPages, legacyHashAliases });
