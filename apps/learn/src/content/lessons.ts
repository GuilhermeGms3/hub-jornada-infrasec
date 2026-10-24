import type { Lesson } from '../domain/types';

export const lessons: Lesson[] = [
  {
    id: 'redes',
    title: 'Redes e comunicação',
    heading: 'Uma rede começa com uma conversa',
    objective: 'O01',
    questionId: 'c-redes',
    diagram: 'network',
    lead: 'Seu computador pode conversar com uma impressora mesmo quando um site não abre. Entender essa diferença é o primeiro passo para investigar uma falha.',
    sections: [
      {
        title: 'Dispositivos, ligações e regras',
        paragraphs: [
          'Uma rede de computadores é um conjunto de dispositivos que conseguem trocar dados por algum meio de comunicação. Um notebook, um celular, uma impressora e um servidor são dispositivos. O meio pode ser um cabo, uma ligação de rádio como Wi-Fi ou uma conexão de fibra. Estar ligado ao meio é necessário, mas não basta: os participantes também precisam seguir regras de comunicação.',
          'Essas regras são chamadas de protocolos. Um protocolo define como uma mensagem é organizada e como os participantes devem reagir a ela. Pense em uma conversa: além de ouvir o outro, precisamos reconhecer a língua e a intenção da mensagem. A analogia ajuda a perceber a necessidade de regras; os equipamentos, porém, interpretam estruturas de dados, não frases humanas.',
        ],
      },
      {
        title: 'Rede local não é sinônimo de internet',
        paragraphs: [
          'Uma rede local, ou LAN (Local Area Network), permite a comunicação num contexto local, como os equipamentos de uma casa ou de um escritório. Um switch conecta interfaces Ethernet, normalmente por cabos. Um ponto de acesso permite a participação por Wi-Fi. Esses equipamentos podem estar reunidos no aparelho doméstico que você chama de roteador, mas suas funções são diferentes.',
          'A internet é uma interconexão de redes. Para alcançar uma rede remota, seu equipamento geralmente precisa de encaminhamento por um roteador. Se a saída do escritório falhar, dois dispositivos locais ainda podem trocar dados. Se apenas a impressora estiver desligada, o site pode continuar abrindo. Por isso, “a rede caiu” precisa ser transformado numa pergunta mais precisa: quem não consegue alcançar qual serviço?',
        ],
      },
      {
        title: 'Do sintoma para uma pergunta testável',
        paragraphs: [
          'O ícone de Wi-Fi indica uma ligação de acesso; não comprova que o DNS responde, que existe saída externa ou que o site está saudável. Até uma ligação local funcional pode transportar uma configuração IP incorreta. Nos próximos capítulos, vamos construir esse caminho por partes: identificar o destino, decidir como alcançá-lo e verificar o serviço.',
          'Antes de alterar configurações, delimite o alcance do problema. Só um equipamento falha? Todos os sites falham ou apenas um? Um recurso local funciona? Comparar situações ajuda a formular hipóteses sem escolher uma causa por adivinhação. Uma hipótese é uma explicação candidata; evidência é aquilo que um teste realmente observou.',
        ],
      },
    ],
    example: {
      title: 'A impressora funciona, o portal não',
      data: 'Notebook → impressora local: documento impresso\nNotebook → portal externo: página não carrega\nOutro notebook → mesma impressora: documento impresso',
      reasoning: [
        'A impressão concluída demonstra comunicação com aquele serviço local.',
        'A falha do portal pode estar no caminho remoto, na resolução de nome ou no próprio serviço.',
        'Um teste específico será necessário para separar essas hipóteses; ainda não sabemos a causa.',
      ],
      conclusion:
        'Existe comunicação local observada. O acesso ao portal precisa de investigação separada.',
      limit:
        'Isso não prova que todos os equipamentos da LAN ou todos os caminhos da internet funcionam.',
    },
    misconception: '“Wi-Fi conectado” e “todos os serviços acessíveis” são afirmações diferentes.',
    takeaway:
      'Comece definindo origem, destino e serviço. Um sintoma amplo não identifica a causa.',
  },
  {
    id: 'cliente-servidor',
    title: 'Cliente e servidor',
    heading: 'Quem pede, quem responde e qual serviço?',
    objective: 'O01',
    questionId: 'c-cliente',
    diagram: 'network',
    lead: 'Cliente e servidor são papéis numa interação. A comunicação depende de um serviço específico, não apenas de um computador ligado.',
    sections: [
      {
        title: 'Uma solicitação tem um objetivo',
        paragraphs: [
          'Quando o navegador solicita uma página, ele atua como cliente. O software que recebe e atende essa solicitação atua como servidor. Uma requisição é a mensagem de pedido; uma resposta devolve um resultado. Um servidor pode enviar a página, recusar o pedido, informar um erro ou deixar de responder. Cada resultado conta uma história diferente.',
          'Servidor não significa necessariamente uma máquina enorme num datacenter. Um notebook pode compartilhar um arquivo e oferecer um serviço a outro computador. O mesmo notebook pode ser cliente de um site enquanto atende pedidos de arquivos. O papel depende da interação analisada, e não da aparência do equipamento.',
        ],
      },
      {
        title: 'Equipamento alcançável não significa serviço disponível',
        paragraphs: [
          'Um equipamento pode executar vários programas de rede ao mesmo tempo: site, acesso remoto, banco de dados. O endereço IP ajuda a chegar à interface; no transporte, uma porta ajuda a identificar o endpoint usado pela aplicação. Porta 443 é uma associação comum com HTTPS. Porta de rede nesse contexto é um número lógico, não o conector físico do cabo.',
          'Se o equipamento responde a um teste de conectividade, isso não garante que seu programa web esteja atendendo. O processo pode estar parado, escutando outra porta ou rejeitando acesso. Um firewall também pode permitir um protocolo e bloquear outro. Investigar o serviço desejado evita concluir “tudo funciona” a partir de um único sinal.',
        ],
      },
      {
        title: 'O caminho também participa da conversa',
        paragraphs: [
          'Entre cliente e servidor podem existir switches, roteadores, controles de acesso e redes de provedores. Uma falha em qualquer parte relevante pode impedir a conversa. Ainda assim, não precisamos culpar todos os componentes: testes devem reduzir as hipóteses. Um pedido que chegou e recebeu erro da aplicação é diferente de um pedido que nem conseguiu estabelecer conexão.',
          'Nesta unidade usaremos exemplos simples com um cliente e um serviço web. Proxies, balanceadores e múltiplos servidores são comuns em sistemas reais, mas não são pré-requisitos ocultos para os primeiros exercícios. Quando uma simplificação importar para a conclusão, ela estará declarada no cenário.',
        ],
      },
    ],
    example: {
      title: 'O computador respondeu, mas o site não',
      data: 'Servidor de arquivos: responde\nServiço web do mesmo host: conexão recusada na porta 443',
      reasoning: [
        'O host participa de uma comunicação, mas os serviços são processos/fluxos distintos.',
        'Uma recusa TCP direciona a investigação para a porta, política ou serviço, sem revelar sozinha qual componente respondeu.',
        'Verificar o listener e os logs do serviço é mais direcionado que reinstalar toda a rede.',
      ],
      conclusion: 'Precisamos investigar o endpoint web, sem assumir falha geral do host.',
      limit:
        'Uma recusa não identifica por si só se foi o processo, o sistema ou um filtro que respondeu.',
    },
    misconception:
      '“Servidor” é um papel de software naquela conversa, não uma categoria física obrigatória.',
    takeaway: 'Sempre associe o sintoma a um serviço, protocolo e destino.',
  },
  {
    id: 'ipv4',
    title: 'Endereços IPv4',
    heading: 'Um endereço para encontrar a interface',
    objective: 'O02',
    questionId: 'c-ip',
    lead: 'Nome, endereço e configuração não são a mesma coisa. Vamos aprender a ler um IPv4 antes de decidir se ele é adequado.',
    sections: [
      {
        title: 'Quatro números representam 32 bits',
        paragraphs: [
          'IPv4 é uma versão do protocolo IP. Um bit é um dígito que pode valer 0 ou 1. O endereço IPv4 possui 32 bits, escritos normalmente como quatro números separados por pontos. Cada grupo representa 8 bits, um octeto, e pode ir de 0 a 255. Em um octeto, as posições valem 128, 64, 32, 16, 8, 4, 2 e 1: 00011001 soma 16 + 8 + 1 = 25. Por isso 192.168.10.25 tem formato possível e 192.168.10.999 não. Ter formato possível ainda não prova que a configuração pertence à rede correta.',
          'O endereço é atribuído a uma interface de rede, como Ethernet ou Wi-Fi. Um computador pode ter mais de uma interface e, portanto, mais de um endereço. Ao ler uma configuração, identifique a interface ativa. Um adaptador virtual ou desconectado pode exibir valores que não descrevem o caminho usado para acessar o site.',
        ],
      },
      {
        title: 'Endereço privado, nome e configuração automática',
        paragraphs: [
          'Faixas como 192.168.0.0/16, 10.0.0.0/8 e 172.16.0.0/12 são usadas para endereçamento privado. O número depois da barra indica o tamanho do prefixo em bits, que vamos desenvolver na próxima lição. Essas faixas podem ser reutilizadas em redes independentes e não são destinos globais únicos na internet pública. Em uma mesma rede, dois dispositivos com o mesmo endereço podem causar conflito. Nomes como portal.example são identificações da aplicação; a resolução de nomes pode fornecer os endereços associados a eles.',
          'DHCP (Dynamic Host Configuration Protocol) pode fornecer automaticamente endereço, máscara, gateway e servidores DNS. Também existe configuração manual. Se você esperava DHCP e o Windows usa um endereço 169.254.x.x de autoconfiguração link-local, investigue por que a configuração esperada não foi obtida. Esse indício não prova sozinho que o servidor DHCP está desligado: o caminho até ele também pode falhar.',
        ],
      },
      {
        title: 'Validade depende do contexto',
        paragraphs: [
          'Um IPv4 precisa ser interpretado junto da máscara e das rotas. 192.168.20.25 pode ser uma configuração legítima em uma rede e inadequada em outra. Não “corrija” um endereço só por ele parecer diferente do seu. Colete a configuração esperada e compare. Loopback, como 127.0.0.1, refere-se ao próprio host: resposta ali não comprova cabo, Wi-Fi ou gateway saudáveis.',
          'Os exemplos deste curso usam redes privadas na LAN e endereços de documentação em redes remotas, como 198.51.100.0/24 e 203.0.113.0/24. Os nomes terminados em .example são sintéticos. Outputs dessas situações são simulações de ensino, não instruções para procurar servidores públicos nesses endereços.',
        ],
      },
    ],
    example: {
      title: 'Uma estação que não recebeu o esperado',
      data: 'Rede esperada: 192.168.10.0/24, DHCP\nInterface Ethernet: ativa\nIPv4: 169.254.18.7\nMáscara: 255.255.0.0\nGateway: ausente',
      reasoning: [
        'O endereço tem formato IPv4, mas não corresponde ao plano esperado.',
        'A configuração link-local é compatível com falta de concessão DHCP no contexto descrito.',
        'Verificar ligação, VLAN e disponibilidade/caminho DHCP é mais útil que começar pelo DNS do portal.',
      ],
      conclusion: 'Investigar primeiro a obtenção de configuração da estação.',
      limit:
        'Não sabemos ainda se a causa está no servidor DHCP, no acesso local ou em outra parte do caminho.',
    },
    misconception:
      'Um endereço bem escrito pode estar errado para aquela rede. APIPA é um indício contextual, não uma causa raiz.',
    takeaway: 'Leia a interface ativa, o endereço e o contexto esperado antes de alterar algo.',
  },
  {
    id: 'mascara',
    title: 'Máscaras e rede local',
    heading: 'O que faz um destino ser local?',
    objective: 'O03',
    questionId: 'c-mascara',
    diagram: 'mask',
    lead: 'A máscara participa da decisão de rede. Comparar apenas a aparência dos números não basta.',
    sections: [
      {
        title: 'A parte de rede e a parte de host',
        paragraphs: [
          'Uma máscara IPv4 marca os bits usados como prefixo de rede. Em /24, os primeiros 24 dos 32 bits pertencem ao prefixo. A máscara decimal correspondente é 255.255.255.0. Os bits restantes identificam posições dentro dessa rede. A notação /24 é chamada de prefixo CIDR; aqui ela indica quantos bits estão reservados ao prefixo.',
          'Para obter o endereço de rede, aplicamos AND bit a bit entre endereço e máscara. AND conserva 1 somente quando os dois bits são 1. O octeto 255 é 11111111: ele mantém o octeto do endereço. O octeto 0 é 00000000: ele zera aquele octeto. Assim 192.168.10.25 com máscara 255.255.255.0 resulta em rede 192.168.10.0.',
        ],
      },
      {
        title: 'Aplicar a mesma regra aos dois destinos',
        paragraphs: [
          'O host 192.168.10.25/24 calcula 192.168.10.0 para si e para 192.168.10.80. Nesse modelo, o segundo destino está na rede diretamente conectada. Para 192.168.20.80, o resultado é 192.168.20.0, outra rede. O computador então precisa encontrar uma rota apropriada, em vez de simplesmente procurar esse host no enlace local.',
          'A regra “os três primeiros números precisam ser iguais” só funciona nesse exemplo /24. Em /26, a máscara é 255.255.255.192, e o último octeto também tem bits de rede. 192.168.10.25 e 192.168.10.80 ficam em redes diferentes com /26. Não precisa dominar todo subnetting agora; precisa entender por que a máscara muda a decisão. Experimente isso na demonstração abaixo.',
        ],
      },
      {
        title: 'Por que uma máscara errada atrapalha',
        paragraphs: [
          'Se um host usa máscara larga demais, pode tratar como vizinho um destino que deveria alcançar por roteador. Ele tentará descoberta local e poderá não receber resposta. Se a máscara é restrita demais, pode enviar ao gateway uma comunicação que deveria ser direta. Isso explica por que endereço e gateway aparentemente corretos não encerram a investigação.',
          'Sistemas reais decidem pela tabela de rotas e podem ter rotas mais específicas, interfaces adicionais ou VPNs. A máscara da interface normalmente cria a rota diretamente conectada. Na primeira unidade usamos uma interface e mostramos quando não há outras rotas; isso deixa a decisão compreensível sem ensinar uma regra falsa para qualquer sistema.',
        ],
      },
    ],
    example: {
      title: 'Decidir antes de enviar',
      data: 'Origem: 192.168.10.25/24\nDestino A: 192.168.10.80 → rede 192.168.10.0\nDestino B: 192.168.20.80 → rede 192.168.20.0',
      reasoning: [
        'A origem pertence a 192.168.10.0/24.',
        'O AND do destino A coincide com a rede da origem: comunicação diretamente conectada.',
        'O AND do destino B é diferente: procurar rota remota, usando default somente se for a rota aplicável.',
      ],
      conclusion: 'A é local; B exige encaminhamento no cenário informado.',
      limit:
        'A classificação não garante que o host responde: enlace, configuração e políticas ainda importam.',
    },
    misconception:
      'Máscara não é endereço de outro equipamento. É uma descrição do prefixo usado na configuração.',
    takeaway: 'Calcule a rede com a máscara; só depois interprete o caminho.',
  },
  {
    id: 'mac',
    title: 'MAC e enlace',
    heading: 'Destino final e próximo vizinho',
    objective: 'O02',
    questionId: 'c-mac',
    diagram: 'network',
    lead: 'O pacote IP viaja até o destino final. Em cada enlace Ethernet, um quadro entrega esse pacote ao próximo participante daquele trecho.',
    sections: [
      {
        title: 'Duas identificações, dois alcances',
        paragraphs: [
          'No enlace Ethernet, os dados são transportados em quadros. O quadro contém endereços MAC de origem e destino. O pacote IP está dentro dele e possui seus próprios endereços IP. Não são duas grafias da mesma identificação. O MAC é usado naquele enlace; o IP permite endereçamento e encaminhamento entre redes.',
          'Um switch aprende endereços MAC observando a origem dos quadros recebidos e associa esses endereços a portas. Quando conhece a porta do MAC de destino, pode encaminhar por ela. Quando ainda não conhece, pode distribuir o quadro pelas outras portas do mesmo segmento lógico local, conforme as regras de switching. A separação desses segmentos por VLAN será estudada depois. Isso não transforma o switch comum em um resolvedor DNS.',
        ],
      },
      {
        title: 'ARP descobre um vizinho IPv4',
        paragraphs: [
          'ARP (Address Resolution Protocol) permite descobrir qual endereço de enlace corresponde a um endereço IPv4 local. Se o computador precisa enviar a um vizinho e não tem a associação em cache, solicita essa informação na rede local. O equipamento que possui aquele IPv4 responde com seu MAC. Associações recentes podem ser consultadas na tabela ARP, por exemplo com arp -a.',
          'Para um destino em outra rede, o vizinho Ethernet é o próximo salto indicado pela rota, normalmente o gateway do exemplo. O host não faz ARP pela internet procurando o MAC do servidor remoto. Envia um quadro ao gateway com um pacote cujo IP de destino ainda é o servidor. O roteador remove o quadro recebido e encapsula o pacote no enlace seguinte.',
        ],
      },
      {
        title: 'O que muda durante o percurso',
        paragraphs: [
          'A cada salto roteado, o encapsulamento de enlace pode mudar. O IP de destino normalmente continua representando o destino final; mecanismos como NAT podem reescrever endereços e serão aprofundados depois. Em IPv6, a descoberta de vizinhos não usa ARP. Nesta lição, o caso é explicitamente IPv4 sobre Ethernet.',
          'Separar quadro e pacote ajuda no diagnóstico. Se a descoberta do vizinho falha, o host pode nem entregar o primeiro quadro. Se ela funciona, ainda não há garantia de rota de retorno ou serviço remoto. Um dado de ARP é uma peça de evidência local, não uma prova de funcionamento de toda a rede.',
        ],
      },
    ],
    example: {
      title: 'Quem recebe o primeiro quadro?',
      data: 'Cliente: 192.168.10.25\nGateway: 192.168.10.1 / MAC 02:00:00:00:00:01\nServidor remoto: 203.0.113.40',
      reasoning: [
        'A rota aponta para o gateway como próximo salto.',
        'ARP descobre o MAC do gateway no enlace local, se ele ainda não está em cache.',
        'O quadro usa MAC destino 02:00:00:00:00:01; o pacote dentro dele usa IP destino 203.0.113.40.',
      ],
      conclusion: 'Primeira entrega local ao gateway; destino IP final continua remoto.',
      limit: 'ARP local não verifica se o servidor remoto tem serviço ativo.',
    },
    misconception:
      'MAC não substitui o IP final e não é descoberto por ARP através de todos os roteadores.',
    takeaway: 'Pergunte separadamente: qual é o destino final e quem recebe neste enlace?',
  },
  {
    id: 'gateway',
    title: 'Gateway',
    heading: 'A saída para outras redes',
    objective: 'O04',
    questionId: 'c-gateway',
    diagram: 'network',
    lead: 'Conhecer o endereço do destino não cria um caminho até ele. É a rota que indica onde entregar o próximo pacote.',
    sections: [
      {
        title: 'Da rede conectada para uma rota remota',
        paragraphs: [
          'O host mantém uma tabela de rotas: entradas que relacionam prefixos de destino a uma interface ou próximo salto. Quando várias rotas se aplicam, prefere o prefixo mais específico. Uma rota default, representada por 0.0.0.0/0 no IPv4, cobre destinos que não encontraram uma rota mais específica. Ela não substitui automaticamente a rota da rede local.',
          'No exemplo de uma única LAN, a rota default aponta para o gateway 192.168.10.1. Esse equipamento encaminha pacotes para outras redes. Para entregar o primeiro quadro, o cliente precisa alcançar esse próximo salto pelo enlace. Depois, cada roteador toma sua própria decisão. O cliente não precisa conhecer a lista completa de roteadores da internet.',
        ],
      },
      {
        title: 'O que acontece quando o gateway falta',
        paragraphs: [
          'Se só existe a rota conectada e nenhuma rota para o destino remoto, a comunicação local pode continuar funcionando. O cliente consegue chegar à impressora na mesma rede, mas não tem para onde enviar o pacote remoto. Um nome já resolvido em cache não resolve esse problema. DNS fornece informação sobre nomes; não instala automaticamente a rota que falta.',
          'Um gateway configurado incorretamente também pode impedir o primeiro salto. O valor precisa corresponder à configuração planejada e ser alcançável segundo as rotas usadas. Não escolha “.1” por costume: redes podem usar outros endereços. Confirme o plano correto antes de corrigir. Sistemas com VPNs ou rotas específicas podem alcançar redes remotas mesmo sem a default esperada; por isso consulte a tabela de rotas.',
        ],
      },
      {
        title: 'Um aparelho, várias funções',
        paragraphs: [
          'O roteador doméstico pode também funcionar como switch, ponto de acesso, servidor DHCP e encaminhador DNS. Isso faz parecer que gateway e DNS são a mesma coisa. Eles podem usar o mesmo endereço na sua configuração, mas as funções continuam distintas. Se o encaminhamento funciona e a resolução falha, separar funções é essencial para investigar.',
          'Um ping bem-sucedido ao gateway comprova resposta ICMP daquele endereço a partir do cliente naquele momento. Não comprova o acesso externo. Um ping com timeout também não prova sozinho que o gateway está desligado: o equipamento pode filtrar ICMP. Combine configuração, rota e testes de serviço, preservando os limites de cada observação.',
        ],
      },
    ],
    example: {
      title: 'Sem saída, com rede local',
      data: 'Cliente: 192.168.10.25/24\nRota: 192.168.10.0/24 diretamente conectada\nRota default: ausente\nDestino remoto: 198.51.100.20',
      reasoning: [
        '192.168.10.80 pertence à rota conectada, portanto não precisa da default neste caso.',
        '198.51.100.20 não pertence à rede conectada e não há outra rota.',
        'Investigar a configuração de rota esperada é mais direcionado que trocar DNS.',
      ],
      conclusion: 'Há caminho local modelado, mas falta rota para o destino remoto.',
      limit:
        'O estado do servidor remoto ainda não foi verificado; a ausência de rota local impede esse teste.',
    },
    misconception:
      'Gateway encaminha pacotes. DNS consulta informações sobre nomes. O mesmo aparelho pode prestar ambos os serviços.',
    takeaway: 'Procure a rota aplicável antes de culpar o destino ou trocar o resolvedor.',
  },
  {
    id: 'dns',
    title: 'DNS',
    heading: 'Do nome ao endereço',
    objective: 'O05',
    questionId: 'c-dns',
    lead: 'Quando você usa um nome, a aplicação precisa descobrir informações sobre ele. A resposta dessa consulta não é a página do site.',
    sections: [
      {
        title: 'O que o DNS entrega',
        paragraphs: [
          'DNS significa Domain Name System, Sistema de Nomes de Domínio. É um sistema distribuído de consulta. Um registro A pode associar um nome a um endereço IPv4; AAAA faz associação com IPv6. Há também outros registros, como MX para roteamento de e-mail. Nesta unidade concentramos a consulta de endereços para um acesso web.',
          'Um resolvedor recebe consultas do cliente e obtém respostas, possivelmente consultando outros servidores DNS. Registros podem ser guardados em cache durante um prazo. O navegador e o sistema também podem guardar resultados. Por isso, nem toda abertura de página gera uma nova consulta pela rede e nem sempre o navegador usa exatamente o mesmo caminho de resolução de nslookup.',
        ],
      },
      {
        title: 'Sucesso, nome inexistente e timeout',
        paragraphs: [
          'Uma resposta com endereço informa que aquela consulta produziu aquele resultado. Não prova que o servidor aceita conexão HTTPS ou que o conteúdo está disponível. Uma resposta NXDOMAIN informa que o nome consultado não existe segundo a resolução realizada. Verifique erro de digitação e contexto antes de mudar a rede inteira.',
          'Timeout significa que não houve resposta dentro do prazo. É diferente de receber uma resposta de nome inexistente. O resolvedor pode estar indisponível, a rota até ele pode falhar ou um filtro pode bloquear a consulta. “O DNS não respondeu” descreve uma observação; “o servidor DNS caiu” é uma hipótese que exige mais evidências.',
        ],
      },
      {
        title: 'Como usar uma consulta como teste',
        paragraphs: [
          'nslookup portal.example 192.168.10.10 consulta explicitamente o resolvedor indicado. No curso, isso ocorre num cenário simulado. Em uma organização real, use resolvedores e testes autorizados: trocar para DNS público pode violar política ou impedir nomes internos. Comparar outro cliente e um resolvedor alternativo permitido ajuda a delimitar o problema.',
          'DNS também precisa de conectividade. Se o resolvedor está em outra rede, a consulta pode exigir gateway antes de obter o endereço do site. A sequência “primeiro DNS, depois qualquer roteamento” não é universal. O navegador pode ainda usar DNS sobre HTTPS, cache ou proxy. Explique o caminho testado, sem afirmar que todos os programas se comportam igual.',
        ],
      },
    ],
    example: {
      title: 'Falha de resolução sem falha IP geral',
      data: 'ping 198.51.100.20 → responde\nnslookup portal.example 192.168.10.10 → timeout\nConsulta a resolvedor alternativo autorizado → 203.0.113.40',
      reasoning: [
        'Existe resposta IP do alvo testado, não prova de toda internet.',
        'A consulta original falha, enquanto outra resolução autorizada responde.',
        'Comparar serviço/caminho do resolvedor original é a investigação mais sustentada.',
      ],
      conclusion: 'O caminho de resolução original merece investigação.',
      limit:
        'Ainda não identificamos se houve falha do processo DNS, bloqueio ou outro problema de caminho.',
    },
    misconception:
      'Resolver um nome não estabelece TCP, não verifica certificado e não baixa a página.',
    takeaway: 'Separe a consulta DNS do acesso ao serviço que usa seu resultado.',
  },
  {
    id: 'tcp',
    title: 'TCP e conexões',
    heading: 'Chegar ao equipamento é só parte da conversa',
    objective: 'O06',
    questionId: 'c-tcp',
    diagram: 'layers',
    lead: 'O transporte conecta endpoints das aplicações. Vamos acompanhar TCP sem atribuir a ele o trabalho do DNS ou da criptografia.',
    sections: [
      {
        title: 'Pacotes, fluxo e portas',
        paragraphs: [
          'IP permite endereçar e encaminhar pacotes. TCP (Transmission Control Protocol) oferece às aplicações um fluxo de bytes ordenado, usando números de sequência, confirmações e retransmissões. Se pacotes se perdem, TCP tenta recuperá-los segundo suas regras; se a comunicação não consegue prosseguir, ela pode falhar. Confiabilidade não significa que a rede nunca falha.',
          'Uma conexão relaciona endereços IP e portas de origem e destino. O navegador geralmente usa uma porta de origem temporária para acessar a porta do serviço. Isso ajuda o sistema a distinguir conversas simultâneas. A porta 443 é convencional para HTTPS, mas o número sozinho não torna qualquer conteúdo seguro ou garante o protocolo realmente servido.',
        ],
      },
      {
        title: 'Estabelecer antes de trocar dados',
        paragraphs: [
          'Na abertura TCP simplificada, o cliente envia SYN, o servidor responde SYN-ACK e o cliente confirma com ACK. Essa negociação sincroniza o início da comunicação. Não é preciso decorar os nomes antes de entender a função: os dois lados precisam concordar em iniciar aquela conexão e reconhecer dados conforme chegam.',
          'Um timeout pode significar que a tentativa ou resposta não completou o caminho no prazo. Uma recusa indica uma resposta que rejeitou a conexão, mas não identifica por si só qual processo ou filtro tomou a decisão. Testar a porta é mais direcionado a um serviço do que usar apenas ping, pois ICMP e TCP são protocolos diferentes.',
        ],
      },
      {
        title: 'TCP não é toda a web',
        paragraphs: [
          'No exemplo tradicional de HTTPS com HTTP/1.1 ou HTTP/2 sobre TCP, a conexão TCP é seguida pela negociação TLS e então pelas mensagens HTTP. Se a conexão TCP nem se estabelece, ainda não demonstramos sucesso de TLS nessa tentativa. Se TCP funciona e o certificado falha, o diagnóstico muda de etapa.',
          'HTTP/3 usa QUIC sobre UDP, e não essa mesma conexão TCP. UDP fornece datagramas; QUIC implementa mecanismos de transporte e segurança sobre ele. Portanto “UDP não pode transportar web confiável” é falso. Nosso diagrama escolhe explicitamente o caso TCP para estudar uma conversa por vez, sem dizer que é o único caminho possível.',
        ],
      },
    ],
    example: {
      title: 'ICMP respondeu; e a porta?',
      data: 'ping 203.0.113.40 → responde\nTest-NetConnection 203.0.113.40 -Port 443\nTcpTestSucceeded: False',
      reasoning: [
        'A resposta ICMP não é uma resposta ao serviço web.',
        'O teste da porta não confirmou estabelecimento TCP.',
        'Investigar porta/política/caminho é apropriado; não afirmar que TLS está saudável.',
      ],
      conclusion: 'Há evidências distintas para ICMP e para o endpoint TCP.',
      limit: 'False não distingue sozinho bloqueio, ausência de serviço ou falha em algum trecho.',
    },
    misconception:
      'TCP não cifra por definição e não garante que a aplicação vai produzir uma resposta correta.',
    takeaway: 'Teste a conversa que você precisa, sem extrapolar um protocolo para outro.',
  },
  {
    id: 'https',
    title: 'HTTP, HTTPS e TLS',
    heading: 'Uma conexão, uma proteção, uma mensagem',
    objective: 'O06',
    questionId: 'c-https',
    diagram: 'layers',
    lead: 'HTTP diz como pedir e responder. TLS protege a comunicação. DNS e TCP resolvem outras partes do problema.',
    sections: [
      {
        title: 'O que a aplicação pede',
        paragraphs: [
          'HTTP (Hypertext Transfer Protocol) organiza requisições e respostas. Uma requisição pode conter método, caminho e cabeçalhos. GET /curso pede um recurso; a resposta traz um status, cabeçalhos e possivelmente um corpo. Status 200 normalmente indica sucesso; 404 indica recurso não encontrado; 500 indica erro interno. Receber um erro HTTP ainda demonstra que alguma troca de aplicação aconteceu.',
          'O navegador interpreta HTML, busca recursos adicionais e processa a resposta para compor a página. Um único site pode depender de vários nomes e serviços. Nosso primeiro caso considera um recurso principal. Se esse recurso respondeu e uma imagem não carregou, ainda é necessário investigar a dependência correspondente, não declarar que nada funciona.',
        ],
      },
      {
        title: 'Por que HTTPS precisa de TLS',
        paragraphs: [
          'HTTPS aplica proteção TLS (Transport Layer Security) ao uso de HTTP. TLS negocia parâmetros e chaves para proteger a comunicação, incluindo confidencialidade e integridade, e normalmente permite autenticar o servidor com certificado. A verificação envolve o nome esperado e a cadeia de confiança. Proteção do canal não garante que todo conteúdo do site seja honesto ou que a aplicação não tenha vulnerabilidades.',
          'Um erro de certificado pode ocorrer depois de resolver o nome e alcançar o endpoint. Ignorar o aviso não é um procedimento de correção padrão. Verifique nome, validade, confiança e relógio do cliente com evidências. Sem acesso administrativo, registre e encaminhe. Trocar DNS ou desativar validação TLS indiscriminadamente pode esconder o problema ou criar risco.',
        ],
      },
      {
        title: 'Por que abrir por IP pode mudar o resultado',
        paragraphs: [
          'Vários sites podem compartilhar o mesmo endereço. O nome usado na conexão ajuda a selecionar o site e é relevante para o certificado. Ao digitar apenas o IP, você pode atingir uma aplicação padrão ou obter um certificado que não corresponde ao que pediu. Portanto, “pelo IP abriu” não é sempre um teste equivalente ao acesso por nome.',
          'No exemplo TCP desta unidade, pense em camadas de observação: obter endereço; alcançar rede e porta; negociar TLS; trocar HTTP. Elas podem falhar separadamente. Em HTTP/3, transporte e segurança têm outra organização com QUIC; a função de HTTP como mensagem de aplicação continua distinta da resolução de nomes.',
        ],
      },
    ],
    example: {
      title: 'O nome resolveu, mas o certificado falhou',
      data: 'DNS → 203.0.113.40\nTCP 443 → conectado\nTLS → nome do certificado não corresponde a portal.example',
      reasoning: [
        'Resolução e conexão têm evidências positivas nesta tentativa.',
        'O erro relatado é de validação na negociação TLS.',
        'Conferir nome e configuração do certificado é mais direcionado que trocar gateway.',
      ],
      conclusion:
        'Não há evidência de HTTPS validado com sucesso; investigar a identidade apresentada.',
      limit:
        'Não conclua ataque ou erro de uma equipe específica sem examinar a configuração e o contexto.',
    },
    misconception:
      'O cadeado protege o canal verificado; não certifica a qualidade ou intenção de todo conteúdo.',
    takeaway: 'Diferencie endereço, conexão, proteção e mensagem da aplicação.',
  },
  {
    id: 'percurso',
    title: 'O caminho completo',
    heading: 'Acompanhe uma requisição do início ao fim',
    objective: 'O07',
    questionId: 'c-percurso',
    diagram: 'flow',
    lead: 'Agora vamos reunir as peças, incluindo os casos em que uma etapa usa informações que já estavam guardadas.',
    sections: [
      {
        title: 'O cenário que estamos modelando',
        paragraphs: [
          'Considere um computador IPv4 sobre Ethernet, uma interface ativa, um gateway conhecido, um resolvedor DNS local e um servidor web remoto. O acesso escolhido usa HTTP/2 sobre TLS e TCP. Não há proxy ou VPN. Declarar essas condições permite seguir uma conversa realista sem fingir cobrir todas as arquiteturas de uma vez.',
          'Você informa https://portal.example/curso. Se o navegador já possui uma resposta DNS válida em cache, pode aproveitá-la. Se precisa consultar o resolvedor, envia uma consulta até ele. Esse envio também exige endereço, rota e enlace: se o resolvedor fosse remoto, o cliente poderia usar gateway antes mesmo de conhecer o IP do servidor web.',
        ],
      },
      {
        title: 'Uma entrega local para um destino remoto',
        paragraphs: [
          'Com o endereço do portal, o host consulta a rota. No nosso caso a default aponta para o gateway. Se faltar a associação MAC desse vizinho em cache, ocorre ARP local. O cliente envia ao gateway um quadro que contém o pacote destinado ao portal. Os roteadores seguintes encaminham conforme suas tabelas, e a resposta precisa de caminho de retorno.',
          'No destino e nas políticas do caminho, a porta deve aceitar a conexão. TCP estabelece a comunicação; TLS negocia a proteção e valida a identidade esperada; a aplicação troca HTTP. O navegador então interpreta o recurso recebido. Conexões existentes podem ser reaproveitadas: nem toda navegação repete todos os handshakes do zero.',
        ],
      },
      {
        title: 'Uma sequência explicativa, não uma lei universal',
        paragraphs: [
          'Cache, múltiplos endereços, IPv6, HTTP/3, DNS sobre HTTPS, proxies e conexões reutilizadas mudam detalhes. A demonstração abaixo explicita as decisões e mostra o ramo da consulta DNS. Use os controles para ler a justificativa de cada etapa. A descrição textual tem a mesma informação e pode ser percorrida pelo teclado.',
          'Para diagnosticar, não é preciso desenhar toda a internet. É preciso ligar o sintoma a uma pergunta verificável: houve resposta de nome? A rota existe? O próximo salto é alcançável? A porta respondeu? TLS validou? HTTP retornou algo? Cada resposta reduz o espaço de hipóteses, mas não deve dizer mais do que observou.',
        ],
      },
    ],
    example: {
      title: 'Acesso remoto com sucesso',
      data: 'Cliente: 192.168.10.25/24\nDNS local: 192.168.10.10\nGateway: 192.168.10.1\nportal.example → 203.0.113.40\nTCP → TLS validado → HTTP 200',
      reasoning: [
        'Consultar o DNS local usa comunicação na LAN; o gateway não é obrigatório para esse destino.',
        'O IP do portal é remoto no modelo, então a rota default aponta para o gateway.',
        'TCP/TLS/HTTP positivos descrevem esse acesso, e não todos os sites.',
      ],
      conclusion: 'O recurso testado foi acessado com a proteção e a resposta esperadas.',
      limit: 'Outros destinos, portas, nomes ou momentos podem ter resultados diferentes.',
    },
    misconception:
      'DNS não é um equipamento obrigatório “no meio” de todo pacote enviado ao gateway.',
    takeaway: 'Separe decisões e observe o caminho efetivamente testado.',
  },
  {
    id: 'diagnostico',
    title: 'Diagnóstico com evidências',
    heading: 'Um comando precisa responder a uma pergunta',
    objective: 'O08',
    questionId: 'c-diagnostico',
    lead: 'Não comece mudando tudo. Colete configuração, escolha testes que separem hipóteses e registre os limites da conclusão.',
    sections: [
      {
        title: 'Leia a configuração antes de testar destinos',
        paragraphs: [
          'No Windows, ipconfig /all lista informações dos adaptadores. Procure a interface que realmente está conectada: IPv4, máscara, gateway, DHCP e DNS. Compare com a configuração esperada para aquele local. Em route print, examine as rotas; um campo de gateway sozinho não descreve todas as rotas possíveis. Não publique outputs reais com identificações internas sem revisão.',
          'Uma interface desconectada, um IPv4 fora do plano ou a ausência de rota relevante pode explicar o sintoma antes de chegar ao site. Endereço 169.254.x.x num cliente que esperava DHCP direciona a coleta para obtenção de configuração e rede local. Isso não autoriza escolher um IP qualquer ou garantir que o problema é o servidor DHCP.',
        ],
        output:
          'Ethernet: conectado\nDHCP habilitado: Sim\nIPv4: 192.168.10.25\nMáscara: 255.255.255.0\nGateway: 192.168.10.1\nDNS: 192.168.10.10',
      },
      {
        title: 'Ping e tracert mostram observações específicas',
        paragraphs: [
          'ping envia solicitações de eco ICMP e espera respostas. Para o gateway, ele testa resposta ICMP até aquela saída local. Para um IP remoto, testa um caminho externo específico sem depender da resolução daquele nome. Resposta é evidência positiva; timeout pode ser filtragem, perda ou indisponibilidade. Ping 127.0.0.1 verifica aspectos locais da pilha, não testa o cabo ou todo o adaptador físico.',
          'tracert usa limites de saltos crescentes e respostas dos roteadores para observar o caminho. Asteriscos indicam ausência de resposta a uma sondagem; alguns roteadores não respondem e continuam encaminhando tráfego. Não diagnostique uma queda apenas porque um salto intermediário mostra *. Se o destino responde depois, esse fato precisa participar da interpretação.',
        ],
      },
      {
        title: 'Resolução e serviço pedem testes próprios',
        paragraphs: [
          'nslookup consulta DNS e permite indicar o resolvedor. Compare timeout com resposta negativa e com resposta de endereço. Um resolvedor alternativo só deve ser usado se permitido pelo ambiente. Uma consulta bem-sucedida não prova que a porta HTTPS abre. Para testar TCP no Windows, Test-NetConnection com -Port 443 informa se uma conexão de teste conseguiu se estabelecer; não valida a página nem todos os aspectos de TLS.',
          'Uma boa conclusão separa fato, hipótese e próxima ação. Fato: “a consulta ao resolvedor X expirou”. Hipótese: “serviço ou caminho até X pode estar falhando”. Próxima ação: “comparar cliente e resolvedor autorizado, verificar serviço/log”. Não desative firewall ou proteção TLS apenas para obter uma tela verde. Depois de uma correção autorizada, repita o teste que falhou e registre resultado e limites.',
        ],
      },
    ],
    example: {
      title: 'O ping não respondeu; o HTTPS respondeu',
      data: 'nslookup portal.example → 203.0.113.40\nping 203.0.113.40 → timeout\nTCP 443 → conectado\nHTTPS → resposta HTTP 200',
      reasoning: [
        'Existe resolução observada e acesso de aplicação positivo.',
        'ICMP e HTTPS não têm obrigação de receber a mesma política de filtragem.',
        'Não há base para desligar controles ou declarar servidor fora do ar só pelo ping.',
      ],
      conclusion: 'O serviço testado funciona, apesar da falta de resposta ICMP.',
      limit:
        'A causa específica do timeout ICMP não foi identificada; filtragem é uma possibilidade.',
    },
    misconception:
      'Um teste que falha não é automaticamente uma causa raiz. Interprete o conjunto e o alcance das evidências.',
    takeaway:
      'No laboratório a seguir, escolha testes, leia outputs e sustente sua decisão. Tudo ocorre numa simulação declarada.',
  },
];

export const objectives = {
  O01: 'Distinguir rede, cliente e serviço',
  O02: 'Separar IP, nome e MAC',
  O03: 'Interpretar máscara e destino local',
  O04: 'Decidir quando usar gateway',
  O05: 'Distinguir DNS de acesso ao serviço',
  O06: 'Relacionar TCP, TLS e HTTP',
  O07: 'Selecionar testes por hipótese',
  O08: 'Limitar conclusões às evidências',
} as const;

export const sources = [
  ['Requisitos de hosts e camadas · RFC 1122', 'https://www.rfc-editor.org/rfc/rfc1122.html'],
  ['Conceitos de DNS · RFC 1034', 'https://www.rfc-editor.org/rfc/rfc1034.html'],
  ['HTTP e mensagens · MDN', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview'],
  ['HTTP/3 · RFC 9114', 'https://www.rfc-editor.org/rfc/rfc9114.html'],
  [
    'Comandos Windows · Microsoft Learn',
    'https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/windows-commands',
  ],
];
