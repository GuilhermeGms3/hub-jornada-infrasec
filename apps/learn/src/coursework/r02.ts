import type { CourseUnit } from './types';
import { question } from './authoring';
import { r02Questions } from './questions-r02';

export const r02: CourseUnit = {
  id: 'net-r02',
  version: '1.0',
  title: 'Configuração de rede e DHCP',
  motivation:
    'O notebook conecta ao Wi-Fi, mas não acessa o sistema. Antes de trocar DNS ou reiniciar o roteador, você precisa identificar qual interface está em uso, de onde veio sua configuração e o que os campos permitem concluir.',
  prerequisite:
    'Recomendado: IPv4, máscara e gateway nas aulas 3, 4 e 6 da R01. As explicações e a prática desta unidade continuam abertas, mesmo sem avaliação anterior.',
  references: [
    { title: 'DHCP: RFC 2131, seções 3 e 4', url: 'https://www.rfc-editor.org/rfc/rfc2131' },
    { title: 'IPv4 link-local: RFC 3927', url: 'https://www.rfc-editor.org/rfc/rfc3927' },
    {
      title: 'Microsoft: ipconfig',
      url: 'https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/ipconfig',
    },
  ],
  lessons: [
    {
      id: 'interfaces',
      title: 'Ler a interface certa',
      objective: 'NET-CONFIG',
      observable:
        'Interpretar IPv4, máscara, gateway, DNS e origem da configuração no adaptador relevante.',
      prerequisites: ['R01-IP', 'R01-MASK', 'R01-ROTA'],
      vocabulary:
        'Interface é o ponto de conexão lógico ou físico; adaptador é a representação desse ponto no sistema. Prefixo identifica a parte de rede. DHCP habilitado informa a origem pretendida, não garante concessão válida.',
      sections: [
        {
          title: 'Um computador pode ter várias redes ao mesmo tempo',
          paragraphs: [
            'Ethernet, Wi-Fi, VPN, máquinas virtuais e interfaces desconectadas podem aparecer no mesmo ipconfig /all. Não escolha simplesmente a primeira linha com IPv4. Comece pelo caminho do serviço: qual conexão o usuário utiliza e o problema aparece com a VPN ligada ou desligada? Observe o estado da mídia e o nome do adaptador. Uma placa sem cabo não explica sozinha uma falha que acontece no Wi-Fi ativo.',
            'A interface tem endereço e prefixo próprios. O endereço 192.168.40.27 com máscara 255.255.255.0 pertence ao prefixo 192.168.40.0/24. Isso ajuda a decidir se o destino é local; a tabela de rotas decide por onde enviar. Duas interfaces podem ter rotas para o mesmo destino, e a escolha não é provada apenas por haver um gateway no texto. Quando houver dúvida, relacione a configuração com route print e o ambiente esperado.',
          ],
        },
        {
          title: 'Os campos têm funções diferentes',
          paragraphs: [
            'IPv4 identifica a interface naquele contexto; máscara determina a rede conectada. O gateway é um próximo salto para redes remotas e precisa ser alcançável no enlace apropriado. DNS é o serviço consultado para resolver nomes e pode ficar em outra rede. Portanto, não copie o IP do gateway para o campo DNS por costume: um equipamento pode desempenhar as duas funções, mas isso precisa fazer parte do projeto da rede.',
            'DHCP habilitado indica que o cliente solicita configuração automaticamente. Servidor DHCP, concessão obtida e concessão expira ajudam a entender qual servidor respondeu e a validade temporal da configuração. Um endereço visualmente plausível não confirma que ela pertence à rede atual. Compare os valores com um plano autorizado ou um equipamento de referência equivalente, sem divulgar MACs, nomes internos ou dados de outros usuários em um relatório público.',
          ],
        },
        {
          title: 'Interpretar antes de modificar',
          paragraphs: [
            'Faça uma tabela campo → valor observado → valor esperado → interpretação. Se o plano define gateway .1 e o computador apresenta .254, você tem uma divergência de configuração a investigar. Ainda não sabe se alguém digitou o valor, se uma opção do DHCP está incorreta ou se outro servidor respondeu. Preservar a origem da configuração evita aplicar uma correção temporária que será desfeita na próxima concessão.',
            'Uma máscara incorreta pode levar o computador a tentar ARP para um destino que deveria alcançar por roteador. Já DNS incorreto tende a afetar nomes, embora a conectividade IP possa continuar. Separe configuração observada de teste realizado: ipconfig mostra o que o sistema conhece; um ping ou tentativa de serviço verifica outro aspecto do caminho. Mudar vários campos de uma vez elimina a oportunidade de distinguir as hipóteses.',
          ],
        },
      ],
      diagram: [
        'Identificar conexão usada',
        'Localizar adaptador e estado',
        'Ler IP / prefixo / gateway / DNS',
        'Comparar com plano e rotas',
      ],
      example: {
        title: 'Ethernet desconectada não é o Wi-Fi ativo',
        data: 'Ethernet: mídia desconectada\nWi-Fi: IPv4 192.168.40.27 /24\nGateway 192.168.40.1\nDNS 192.168.50.10\nDHCP habilitado: sim',
        reasoning: [
          'O relato ocorre no Wi-Fi; o estado desconectado da Ethernet é esperado.',
          'O gateway está no prefixo conectado /24. O DNS está remoto e dependerá de rota.',
          'Verificar a rota e o alcance do DNS antes de atribuir a falha à placa ou trocar endereços.',
        ],
        conclusion:
          'A configuração é coerente com DNS remoto; ainda faltam testes do caminho e da resolução.',
        limit:
          'Coerência não garante que o gateway responda nem que o servidor DNS esteja disponível.',
      },
      misconception:
        '“DHCP habilitado: sim” não significa que o computador recebeu uma configuração correta. É necessário verificar endereço, concessão e plano esperado.',
      takeaway:
        'A configuração deve ser interpretada no adaptador e contexto corretos antes de qualquer mudança.',
      recovery:
        'Se os campos se confundiram, separe duas perguntas: “para onde vai meu pacote?” envolve IP, prefixo e rota; “qual endereço corresponde a este nome?” envolve o resolvedor. Um DNS remoto depende de conectividade, mas não se torna o gateway. Use a tabela do exemplo e explique a função de cada campo sem repetir seu número.',
    },
    {
      id: 'dora',
      title: 'Como uma configuração chega por DHCP',
      objective: 'NET-DHCP-DORA',
      observable: 'Relacionar Discover, Offer, Request e ACK à obtenção inicial de uma concessão.',
      prerequisites: ['NET-CONFIG'],
      vocabulary:
        'Concessão (lease) é a autorização temporária de uso de configuração. Escopo é o conjunto de endereços e opções administrados. Relay encaminha mensagens DHCP entre redes quando o servidor não está no enlace do cliente.',
      sections: [
        {
          title: 'Um cliente sem endereço precisa descobrir um servidor',
          paragraphs: [
            'Na obtenção inicial simplificada, o cliente transmite DHCPDISCOVER para localizar servidores. Como ainda não tem uma configuração IPv4 utilizável, não pode pressupor que já conhece um servidor na rede. O DHCP usa UDP, com porta 67 no servidor e 68 no cliente. No mesmo domínio de broadcast a descoberta pode chegar diretamente ao servidor; em redes diferentes costuma depender de um agente relay configurado no caminho.',
            'Um servidor pode responder com DHCPOFFER, propondo endereço, duração e parâmetros. A oferta não é ainda a confirmação final de que o cliente passou a utilizar aquela configuração. Podem existir várias ofertas. Compare isso com uma recepção que apresenta vagas: receber uma proposta não é o mesmo que aceitar e obter a confirmação de uma reserva. Essa analogia ajuda com a sequência, mas o protocolo possui regras e estados específicos.',
          ],
        },
        {
          title: 'Escolher e confirmar uma proposta',
          paragraphs: [
            'DHCPREQUEST comunica a solicitação do cliente; na seleção inicial ele identifica a oferta escolhida e permite que outros servidores reconheçam que sua oferta não foi aceita. DHCPACK confirma a configuração concedida. A sigla DORA resume Discover → Offer → Request → ACK. Ela descreve um fluxo inicial útil para aprender, mas não representa toda comunicação DHCP, como renovação de uma concessão existente ou resposta negativa DHCPNAK.',
            'O cliente precisa considerar conflitos de endereço e outras condições antes de usar a configuração. Por isso, observar um ACK no registro do servidor não prova por si só que a aplicação do usuário funciona. Depois de adquirir os parâmetros, ainda existem conectividade de enlace, rotas, DNS e serviço. Além do endereço, o servidor pode distribuir máscara, roteador e resolvedores: uma concessão pode chegar com opções inadequadas para o ambiente.',
          ],
        },
        {
          title: 'Localizar a etapa ajuda a restringir a investigação',
          paragraphs: [
            'Se uma captura autorizada mostra Discover repetido sem Offer, investigue alcance até o serviço, relay, servidor e disponibilidade de endereços. Não conclua imediatamente que o servidor está desligado: uma VLAN errada ou filtro no caminho pode produzir o mesmo resultado visto pelo cliente. Caso haja Offer, Request e NAK, a hipótese mudou; há comunicação, mas o servidor recusou a configuração solicitada.',
            'Ao consultar logs, mantenha horário, interface, identificador do cliente e contexto da rede. São dados de diagnóstico e podem ser sensíveis; use exemplos sintéticos no portfólio. Um incidente em vários novos clientes após uma mudança de VLAN sugere uma investigação diferente de um único cliente que mantém configuração manual antiga. O objetivo é transformar uma sequência de mensagens em hipóteses verificáveis, sem decorar apenas quatro palavras.',
          ],
        },
      ],
      diagram: [
        'Cliente → Discover → servidor/relay',
        'Servidor → Offer → cliente',
        'Cliente → Request → servidor',
        'Servidor → ACK → cliente',
      ],
      example: {
        title: 'A oferta não chegou',
        data: '09:10:00 cliente → DHCPDISCOVER\n09:10:04 cliente → DHCPDISCOVER\nNenhum DHCPOFFER observado no ponto de captura\nOutro cliente na mesma rede obtém concessão.',
        reasoning: [
          'A aquisição inicial começou, mas não há oferta visível ao cliente.',
          'Outro cliente funcionar enfraquece uma indisponibilidade global, sem eliminar problema por porta/VLAN/cliente.',
          'Comparar enlace e caminho e consultar logs do servidor/relay com o mesmo horário.',
        ],
        conclusion: 'Investigar por que a oferta não está chegando a este cliente.',
        limit:
          'Uma captura em um único ponto não identifica sozinha qual dispositivo descartou a mensagem.',
      },
      misconception:
        'Receber uma Offer não é equivalente a aplicar uma concessão confirmada. E nem toda renovação repete DORA completo.',
      takeaway:
        'A sequência explica a negociação; logs e escopo dizem onde investigar quando uma etapa não aparece.',
      recovery:
        'Imagine duas ofertas válidas para o mesmo cliente. A mensagem que escolhe a proposta precisa acontecer antes da confirmação. Escreva a função de cada mensagem, não só a ordem. Se há Request e NAK, não diga “nenhum servidor respondeu”: a resposta negativa já é evidência de comunicação.',
    },
    {
      id: 'lease',
      title: 'Lease, renovação e mudança de rede',
      objective: 'NET-DHCP-LEASE',
      observable:
        'Distinguir aquisição inicial, renovação e expiração e escolher uma ação proporcional.',
      prerequisites: ['NET-DHCP-DORA'],
      vocabulary:
        'T1 é o momento de iniciar renovação com o servidor original; T2 inicia nova tentativa com servidores disponíveis. Valores padrão usuais são 50% e 87,5% do lease quando outros tempos não foram fornecidos.',
      sections: [
        {
          title: 'O endereço tem prazo e contexto',
          paragraphs: [
            'Uma concessão autoriza usar o endereço durante um intervalo, não para sempre. O cliente guarda informações de tempo e tenta manter a configuração antes de ela expirar. Se o lease for de oito horas e os tempos não forem especificados de outra forma, T1 costuma ocorrer após quatro horas e T2 após sete. Esses valores ilustram os padrões do protocolo; não substituem os parâmetros efetivamente fornecidos e os estados observados.',
            'Na renovação em T1, o cliente tenta contatar o servidor que concedeu o endereço. Não é necessário começar do zero com Discover em toda renovação. Se não consegue renovar, pode manter o endereço até o fim da concessão enquanto prossegue nas tentativas permitidas. A ausência temporária de resposta em uma renovação não prova que o computador perdeu imediatamente o acesso ou que deve receber um novo endereço a cada tentativa.',
          ],
        },
        {
          title: 'Quando o contexto muda',
          paragraphs: [
            'Em T2 o cliente tenta obter confirmação de servidores disponíveis por rebinding. Ao expirar a concessão sem confirmação, não deve continuar usando indefinidamente a configuração antiga como se ainda estivesse autorizada. DHCPNAK também indica que a configuração solicitada não foi aceita e exige outro tratamento. Esse raciocínio é mais útil que decorar “rodar renew resolve”: a consequência depende do estado e da resposta.',
            'Trocar de Wi-Fi, conectar VPN ou mover o computador de VLAN pode alterar as redes e rotas disponíveis. Um endereço que funcionava no escritório não pertence necessariamente à rede do laboratório. Compare horário da concessão, servidor e plano da nova rede. Uma configuração manual, por sua vez, não será corrigida apenas por solicitar renovação DHCP, porque o adaptador não está configurado para obter esses parâmetros daquela maneira.',
          ],
        },
        {
          title: 'Comandos podem alterar o estado que você investiga',
          paragraphs: [
            'ipconfig /all coleta informações. ipconfig /renew solicita renovação DHCP para os adaptadores aplicáveis. ipconfig /release libera a configuração DHCP e pode interromper o acesso; não é um teste neutro, principalmente em suporte remoto. Colete o estado antes e use ações de alteração somente em ambiente autorizado, com forma de recuperar a sessão e critério de parada. Nesta aplicação os comandos são explicados, não executados no seu computador.',
            'Depois de uma renovação autorizada, registre valores anteriores, resposta do comando, nova concessão e repetição do teste que falhava. Se a comunicação retorna sem mudança de IP, isso não invalida a ação: um servidor pode renovar o mesmo endereço. Se a falha persiste, preserve o resultado e mude de hipótese com base no que foi observado, em vez de repetir comandos indefinidamente ou apagar toda a configuração.',
          ],
        },
      ],
      diagram: [
        'Concessão válida',
        'T1: tentar renovar no servidor original',
        'T2: tentar outros servidores',
        'Expiração sem confirmação: parar uso da concessão',
      ],
      example: {
        title: 'Falha em T1 não é expiração',
        data: 'Lease obtido: 08:00\nExpiração: 16:00\nT1 padrão: 12:00; T2 padrão: 15:00\n12:01: servidor original sem resposta\nAplicação continua acessível.',
        reasoning: [
          'O lease ainda tem validade; uma tentativa sem resposta não implica expiração.',
          'Registrar o evento e monitorar tentativas posteriores e a disponibilidade do serviço DHCP.',
          'Não liberar o endereço do usuário remotamente apenas para reproduzir uma aquisição inicial.',
        ],
        conclusion: 'Investigar a renovação sem declarar perda imediata da concessão.',
        limit:
          'O exemplo usa tempos padrão; um servidor pode fornecer outros valores e o cliente pode receber NAK.',
      },
      misconception:
        'Renovar pode manter o mesmo IP. Liberar o endereço não é uma ação de coleta sem impacto.',
      takeaway:
        'Concessão, estados e tempos explicam o que o cliente pode fazer; toda mudança precisa de validação.',
      recovery:
        'Desenhe uma linha de oito horas: marcar T1 não apaga as horas restantes. Separe “não respondeu agora” de “não tenho mais autorização”. Depois compare /all, /renew e /release e identifique qual apenas observa e qual pode derrubar uma sessão remota.',
    },
    {
      id: 'apipa',
      title: 'APIPA e configurações inesperadas',
      objective: 'NET-APIPA',
      observable:
        'Reconhecer IPv4 link-local e investigar sem confundir ausência de concessão com falha DNS.',
      prerequisites: ['NET-CONFIG', 'NET-DHCP-DORA'],
      vocabulary:
        'APIPA é o mecanismo de autoconfiguração IPv4 link-local no Windows. A faixa 169.254.0.0/16 identifica o espaço link-local; a seleção automática evita partes reservadas desse espaço. Link-local não é uma configuração normal de acesso roteado à internet.',
      sections: [
        {
          title: 'Um endereço local não resolve a falta de configuração da rede',
          paragraphs: [
            'Quando a aquisição automática de configuração IPv4 não está disponível, um cliente Windows pode configurar um endereço link-local. Ver 169.254.x.x no adaptador relevante, com gateway vazio, é um sinal para investigar a obtenção de configuração adequada. Ele não informa sozinho se o servidor DHCP caiu, se o cabo está ruim ou se a VLAN está incorreta. A hipótese segura é mais restrita: não há evidência de concessão IPv4 utilizável para aquela rede.',
            'IPv4 link-local foi concebido para comunicação no enlace local, sem ser roteado como uma rede corporativa normal. Dois equipamentos em condições compatíveis podem se comunicar localmente, mas isso não cria gateway, resolução de nomes corporativa ou acesso remoto. Ainda pode existir IPv6 funcional no mesmo dispositivo. Portanto, declarar que “o computador não tem rede nenhuma” apenas por APIPA em uma interface pode ignorar outras interfaces e protocolos.',
          ],
        },
        {
          title: 'Compare o cliente, a rede e o tempo',
          paragraphs: [
            'Primeiro confirme que DHCP está habilitado, que você observa o adaptador em uso e que há enlace. Depois descubra o escopo: outros clientes novos recebem configuração? Clientes antigos funcionam porque ainda têm lease válido? Existe mudança recente em porta, SSID, VLAN ou relay? Essas comparações orientam quem deve investigar a próxima etapa e evitam culpar DNS quando sequer há endereço e rota adequados.',
            'Um servidor DHCP inesperado também merece atenção. Se o plano define uma rede e vários clientes passam a receber outra, registre identificador do servidor, horário e opções antes de corrigir. Pode existir equipamento de laboratório conectado indevidamente ou configuração administrativa errada; não classifique o caso como ataque sem evidências. Desligar equipamentos ou criar IP manual sem coordenação pode ampliar o incidente e produzir duplicidade de endereços.',
          ],
        },
        {
          title: 'Validar uma recuperação significa repetir o caminho relevante',
          paragraphs: [
            'Em laboratório autorizado, compare a configuração antes e depois de restaurar o alcance DHCP. Confirme concessão, prefixo, gateway e DNS previstos; teste alcance local, remoto e o serviço que motivou o chamado. Obter um endereço 192.168.x.x não encerra automaticamente a investigação: a opção de gateway ou o servidor DNS podem continuar incorretos. Documente cada verificação com seu próprio resultado, sem transformar mudança visual em prova de solução.',
            'Para levar a prática ao computador real, apenas colete ipconfig /all no adaptador relevante e produza uma tabela sem segredos. Se não tiver ambiente de testes, use os dados sintéticos da unidade e identifique o exercício como simulado. Não tente introduzir falhas na rede de trabalho. O aluno conclui uma análise local com critérios objetivos aqui; a execução física e suas evidências continuam sendo uma atividade externa declarada, nunca certificada por um clique.',
          ],
        },
      ],
      diagram: [
        '169.254.x.x na interface relevante',
        'Confirmar DHCP / enlace / contexto',
        'Comparar clientes e logs',
        'Restabelecer configuração e repetir testes',
      ],
      example: {
        title: 'Clientes antigos funcionam, novos não',
        data: 'A: lease válido 10.40.8.23/24, expira às 18:00\nB: recém-conectado, 169.254.44.12/16, gateway vazio\nB: DHCP habilitado, enlace ativo\nServidor: escopo sem endereços livres.',
        reasoning: [
          'O cliente A pode continuar usando uma concessão válida.',
          'B não apresenta uma configuração IPv4 roteada utilizável e precisa adquirir concessão.',
          'O registro do escopo acrescenta evidência concreta de falta de endereços; APIPA isoladamente não revelaria essa causa.',
        ],
        conclusion:
          'Encaminhar a investigação da capacidade do escopo com os registros e validar B após correção autorizada.',
        limit:
          'O sucesso de A não prova que novas concessões funcionam; a correção do escopo pertence à equipe autorizada.',
      },
      misconception:
        'APIPA é um sinal sobre autoconfiguração, não um diagnóstico exato de causa e nem uma falha de DNS por definição.',
      takeaway: 'Uma boa conclusão explica os dados e explicita o que ainda falta verificar.',
      recovery:
        'Compare dois dados: endereço link-local e log de escopo esgotado. O primeiro descreve o estado do cliente; o segundo sustenta uma causa possível naquele cenário. Não substitua uma observação por outra. Antes de alterar DNS, explique como o computador chegaria ao servidor remoto sem gateway utilizável.',
    },
  ],
  questions: r02Questions,
  lab: {
    title: 'A concessão que parece válida',
    scenario:
      'Laboratório sintético: após trocar de SSID, um notebook mantém endereço de outra rede. Escolha quais dados coletar antes de agir. Você não executará comandos no dispositivo real.',
    outputs: [
      {
        id: 'client',
        label: 'Ler configuração do cliente',
        output:
          'Wi-Fi: 192.168.7.44/24\nDHCP habilitado: não\nGateway 192.168.7.1\nDNS 192.168.7.1',
      },
      {
        id: 'plan',
        label: 'Consultar plano da rede',
        output:
          'SSID Treino: rede 10.40.8.0/24\nGateway 10.40.8.1\nConfiguração automática obrigatória\nOutro notebook recebe 10.40.8.25',
      },
      {
        id: 'logs',
        label: 'Consultar eventos DHCP do cliente',
        output: 'Nenhuma solicitação DHCP nessa interface; configuração manual ativa.',
      },
    ],
    required: ['client', 'plan'],
    question: question(
      'net-r02',
      'lab-manual',
      'interfaces',
      'NET-CONFIG',
      'guided',
      'Qual ação é sustentada pela coleta?',
      'Compare origem e plano antes de escolher.',
      [
        [
          'Trocar só o DNS por um público.',
          'O cliente continua no prefixo e gateway errados; isso não resolve a origem manual.',
        ],
        [
          'Registrar a divergência e aplicar a política de configuração automática somente com autorização, depois validar.',
          'Configuração manual é incompatível com o plano; /renew sozinho não resolve esse estado.',
        ],
        [
          'Concluir que o servidor DHCP está desligado.',
          'Outro cliente recebeu concessão e este nem tentou DHCP; a conclusão extrapola os dados.',
        ],
      ],
      'b',
      'O campo DHCP habilitado descreve uma escolha local; compare-o com a política da rede.',
    ),
  },
};
