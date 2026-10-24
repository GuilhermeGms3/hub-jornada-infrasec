import type { Objective, Question } from '../domain/types';

type Choice = [text: string, explanation: string];
const portalCase =
  'Estação: 192.168.30.24/24\nGateway e default: 192.168.30.1\nDNS: 192.168.30.10\nnslookup portal.example → 203.0.113.40\nping 203.0.113.40 → responde\nTCP 443 ao portal → conexão recusada\nOutro site autorizado → HTTPS funciona';
const noRouteCase =
  'Estação: 192.168.60.24/24\nImpressora 192.168.60.80 → funciona\nIP remoto em cache: 198.51.100.70\nTabela: 192.168.60.0/24 diretamente conectada\nSem default, VPN ou rota específica para o remoto';
const evidence: Record<string, string> = {
  'a-name': portalCase,
  'a-layer': portalCase,
  'a-test': portalCase,
  'a-limit': portalCase,
  'b-route': noRouteCase,
  'b-test': noRouteCase,
  'b-limit': noRouteCase,
};
const recoveryByObjective: Record<Objective, string> = {
  O01: 'ip-dns',
  O02: 'ip-dns',
  O03: 'mascara-ip',
  O04: 'gateway-dns',
  O05: 'web-ip',
  O06: 'web-ip',
  O07: 'local-remoto',
  O08: 'icmp-servico',
};
function q(
  id: string,
  objective: Objective,
  family: string,
  prompt: string,
  right: Choice,
  wrong1: Choice,
  wrong2: Choice,
  context?: string,
): Question {
  const choices = [right, wrong1, wrong2];
  const offset = [...id].reduce((n, char) => n + char.charCodeAt(0), 0) % 3;
  const options = choices
    .map((_, i) => choices[(i + offset) % 3])
    .map((choice, i) => ({ id: `op-${i}`, text: choice[0], explanation: choice[1] }));
  return {
    id,
    objective,
    family,
    prompt,
    context: context || evidence[id],
    version: '1.0',
    options,
    correct: options.find((o) => o.text === right[0])!.id,
    essential: true,
    remediation: recoveryByObjective[objective],
    hints: [
      'Separe o que foi observado da explicação que você está supondo.',
      `Retome a função envolvida: ${right[1]}`,
      `Compare as opções com as evidências. ${right[1]}`,
      `Resolução comentada: ${right[0]}. ${right[1]}`,
    ],
  };
}

export const checks: Question[] = [
  q(
    'c-redes',
    'O01',
    'lan-print',
    'A impressão local funciona, mas um site externo não abre. O que já sabemos?',
    [
      'Existe comunicação com aquele serviço local.',
      'Imprimir é evidência de uma comunicação específica na LAN. A saída remota precisa de testes próprios.',
    ],
    ['A internet inteira está funcionando.', 'Impressão local pode funcionar sem saída externa.'],
    ['Não existe comunicação na rede local.', 'O documento impresso contradiz essa conclusão.'],
  ),
  q(
    'c-cliente',
    'O01',
    'roles-file',
    'Um notebook solicita uma página e atende pedidos de arquivos de outro computador. Qual é seu papel?',
    [
      'Cliente no acesso web e servidor no compartilhamento.',
      'Cliente e servidor são papéis de cada interação.',
    ],
    ['Só cliente, porque é um notebook.', 'O tamanho ou tipo físico não determina o papel.'],
    [
      'Só servidor, porque compartilha arquivos.',
      'O mesmo dispositivo pode fazer pedidos a outro serviço.',
    ],
  ),
  q(
    'c-ip',
    'O02',
    'linklocal-context',
    'DHCP era esperado, mas o Windows recebeu 169.254.18.7 sem gateway. Qual investigação vem primeiro?',
    [
      'Obtenção da configuração e caminho DHCP.',
      'No contexto dado, a configuração link-local sugere que a concessão esperada não foi obtida.',
    ],
    ['Trocar o nome do site.', 'Isso não explica a configuração local fora do esperado.'],
    [
      'Concluir que o servidor DHCP está definitivamente desligado.',
      'O caminho ou outras condições também podem impedir a concessão.',
    ],
  ),
  q(
    'c-mascara',
    'O03',
    'mask-local-24',
    '192.168.10.25/24 e 192.168.10.80/24 pertencem à mesma rede no modelo ensinado?',
    [
      'Sim, a rede resultante é 192.168.10.0/24.',
      'Aplicar 255.255.255.0 aos dois endereços produz o mesmo prefixo.',
    ],
    [
      'Não, o último número precisa ser igual.',
      'Hosts diferentes normalmente usam endereços diferentes dentro da rede.',
    ],
    [
      'Não é possível comparar sem consultar DNS.',
      'A decisão é baseada em endereço/máscara e rotas, não em nome.',
    ],
  ),
  q(
    'c-mac',
    'O02',
    'ethernet-next-hop',
    'Um pacote sai para 203.0.113.40 via gateway local. Qual MAC vai no primeiro quadro Ethernet?',
    [
      'O MAC do próximo salto local indicado pela rota.',
      'O quadro entrega localmente; o pacote mantém o IP do destino remoto no modelo.',
    ],
    [
      'O MAC do servidor remoto, descoberto por ARP pela internet.',
      'ARP IPv4 tem escopo do enlace local.',
    ],
    [
      'Nenhum, porque um pacote IP nunca usa Ethernet.',
      'IP pode ser transportado dentro de quadros Ethernet.',
    ],
  ),
  q(
    'c-gateway',
    'O04',
    'default-absent',
    'Existe somente rota da LAN. Não há default ou rota específica ao destino remoto. O que pode acontecer?',
    [
      'Recurso local funciona, mas falta rota para o remoto.',
      'A rota conectada não depende da existência de default.',
    ],
    ['Trocar DNS cria a rota que falta.', 'Resolver nome não instala caminho remoto.'],
    [
      'Até um host da mesma LAN fica obrigatoriamente inacessível.',
      'A rota diretamente conectada continua existindo.',
    ],
  ),
  q(
    'c-dns',
    'O05',
    'dns-success-scope',
    'nslookup retornou um endereço. O que esse teste comprova?',
    [
      'A consulta ao resolvedor produziu aquele endereço.',
      'Isso não testa a disponibilidade TCP, TLS ou HTTP do serviço.',
    ],
    ['O site necessariamente devolveu HTTP 200.', 'DNS não é uma requisição HTTP ao site.'],
    [
      'O certificado foi validado.',
      'A validação TLS acontece no acesso correspondente, não na consulta DNS.',
    ],
  ),
  q(
    'c-tcp',
    'O06',
    'transport-quic',
    'Qual afirmação evita generalizar o exemplo TCP para toda a web?',
    [
      'HTTP/3 usa QUIC sobre UDP.',
      'O curso usa um exemplo TCP, mas a web também usa outra organização de transporte.',
    ],
    ['Todo HTTP precisa de TCP.', 'Essa afirmação ignora HTTP/3.'],
    [
      'UDP impede qualquer aplicação de implementar confiabilidade.',
      'QUIC implementa mecanismos sobre UDP.',
    ],
  ),
  q(
    'c-https',
    'O06',
    'certificate-stage',
    'DNS respondeu e TCP conectou, mas o certificado não corresponde ao nome. Onde está a falha observada?',
    [
      'Na validação TLS dessa conexão.',
      'Nome/endereço e conexão positiva não garantem identidade TLS validada.',
    ],
    [
      'No DNS com certeza, independentemente do endereço retornado.',
      'A falha relatada é de certificado; DNS pode precisar ser investigado, mas não é causa comprovada.',
    ],
    [
      'No HTTP 200, que comprova sucesso de tudo.',
      'O cenário não apresentou HTTP 200 e houve falha de validação.',
    ],
  ),
  q(
    'c-percurso',
    'O07',
    'remote-resolver-route',
    'O resolvedor DNS está em outra rede. O cliente precisa consultá-lo antes de saber o IP do site. Qual caminho faz sentido?',
    [
      'Usar rota até o resolvedor para enviar a consulta DNS.',
      'Consultas DNS também são comunicação de rede e podem exigir gateway.',
    ],
    [
      'Nenhum pacote pode usar gateway antes de resolver o site.',
      'O endereço do resolvedor já pode estar configurado.',
    ],
    [
      'ARP precisa descobrir diretamente o MAC do site remoto.',
      'O vizinho local é determinado pela rota; ARP não percorre a internet.',
    ],
  ),
  q(
    'c-diagnostico',
    'O08',
    'icmp-https-contrast',
    'Ping expira, mas o acesso HTTPS ao mesmo destino funciona. Qual conclusão é defensável?',
    [
      'O HTTPS funciona no teste; a ausência de ICMP não prova host desligado.',
      'Protocolos podem ser tratados por políticas distintas.',
    ],
    [
      'O host está desligado, apesar de responder HTTPS.',
      'Isso contradiz a evidência de aplicação.',
    ],
    [
      'É preciso desativar o firewall de todos os equipamentos.',
      'Não há causa ou necessidade demonstrada para essa mudança ampla.',
    ],
  ),
];

export const assessmentA: Question[] = [
  q(
    'a-roles',
    'O01',
    'internal-web-roles',
    'O portal de RH oferece uma página ao navegador da estação. Quem atende o pedido?',
    [
      'O serviço web atua como servidor nessa interação.',
      'O papel é atender a solicitação do cliente.',
    ],
    [
      'O navegador vira servidor só porque recebe dados.',
      'Receber uma resposta não inverte os papéis dessa interação.',
    ],
    ['O switch é o servidor de toda página.', 'Encaminhar quadros não é servir o recurso HTTP.'],
  ),
  q(
    'a-address',
    'O02',
    'remote-frame-config',
    'O portal remoto tem IP 203.0.113.40. A rota usa 192.168.30.1. Qual combinação descreve a primeira entrega?',
    [
      'IP final do portal; quadro ao MAC do próximo salto.',
      'Separar pacote e enlace mantém destino final e entrega local coerentes.',
    ],
    [
      'IP final é necessariamente reescrito para o gateway.',
      'No modelo sem NAT, encaminhar não substitui o IP final.',
    ],
    [
      'O nome do portal substitui os endereços MAC do quadro.',
      'O nome é usado pela aplicação/resolução, não como MAC Ethernet.',
    ],
  ),
  q(
    'a-mask',
    'O03',
    'mask-26-split',
    'Dois hosts são 192.168.10.25/26 e 192.168.10.80/26. A máscara é 255.255.255.192. As redes são .0/26 e .64/26. Como interpretar?',
    [
      'São redes diferentes, apesar dos três primeiros octetos iguais.',
      'O prefixo /26 usa também bits do último octeto.',
    ],
    [
      'São sempre locais porque começam com 192.168.10.',
      'A regra visual de /24 não vale para qualquer máscara.',
    ],
    [
      'O endereço MAC decide os bits do prefixo.',
      'O prefixo IPv4 é calculado por endereço e máscara.',
    ],
  ),
  q(
    'a-route',
    'O04',
    'specific-before-default',
    'A tabela tem rota conectada da LAN e uma default. O destino está na rede conectada. Qual entrada é aplicável nesse modelo?',
    [
      'A rota conectada, mais específica que /0.',
      'Default não deve substituir uma rota mais específica para o destino.',
    ],
    [
      'A default sempre vence por ser saída da internet.',
      'A escolha considera a especificidade do prefixo.',
    ],
    [
      'O resolvedor DNS escolhe a interface Ethernet.',
      'Resolução não substitui consulta à tabela de rotas.',
    ],
  ),
  q(
    'a-name',
    'O05',
    'resolved-port-refusal',
    'No RH, DNS retornou 203.0.113.40 e TCP 443 recebeu recusa. Outro site funciona. Qual hipótese investigar primeiro?',
    [
      'Serviço/porta ou política do portal.',
      'A resolução ocorreu; a recusa direciona a coleta ao endpoint e seu caminho.',
    ],
    [
      'Falha DNS já está comprovada pelo sintoma.',
      'O nome foi resolvido nessa consulta; não ignore essa evidência.',
    ],
    [
      'O cabo da estação está certamente rompido.',
      'Outro acesso funcional contradiz essa causa geral.',
    ],
  ),
  q(
    'a-layer',
    'O06',
    'tcp-refusal-before-tls',
    'No acesso explicitamente TCP do portal, a conexão 443 foi recusada. O que foi comprovado sobre TLS?',
    [
      'Não foi comprovada negociação TLS bem-sucedida nessa tentativa.',
      'A conexão necessária ao exemplo não se estabeleceu.',
    ],
    ['TLS foi validado porque o nome resolveu.', 'DNS não negocia proteção TLS.'],
    [
      'TCP recusado é um status HTTP 404.',
      'Recusa de transporte não é resposta HTTP da aplicação.',
    ],
  ),
  q(
    'a-test',
    'O07',
    'listener-policy-investigation',
    'A conexão ao portal é recusada. Qual próxima ação discrimina melhor as hipóteses?',
    [
      'Verificar listener/logs e política, ou comparar origem autorizada.',
      'Essas evidências ajudam a separar disponibilidade do serviço e tratamento do acesso.',
    ],
    [
      'Desativar toda proteção antes de registrar o caso.',
      'Mudança ampla sem coleta não identifica a causa e cria risco.',
    ],
    [
      'Trocar DNS sem comparar qualquer dado.',
      'O cenário já mostrou resolução e uma resposta à conexão.',
    ],
  ),
  q(
    'a-limit',
    'O08',
    'refusal-scope',
    'Qual registro limita corretamente a conclusão da recusa TCP?',
    [
      'Houve recusa no endpoint testado; a causa precisa de evidência adicional.',
      'Um processo ausente ou uma política podem produzir sinais que exigem investigação.',
    ],
    [
      'O processo web está definitivamente parado e não existe outra causa.',
      'A recusa isolada não identifica com certeza quem a produziu.',
    ],
    ['A internet inteira está indisponível.', 'Outros serviços funcionam no cenário.'],
  ),
];

export const assessmentB: Question[] = [
  q(
    'b-roles',
    'O01',
    'peer-shared-backup',
    'Um computador recebe uma cópia de segurança enviada por outro e também usa um site. É possível ter papéis diferentes?',
    [
      'Sim, pode oferecer um serviço e ser cliente de outro.',
      'O papel depende de quem solicita e quem atende cada interação.',
    ],
    ['Não, só datacenters podem servir dados.', 'Um computador comum pode executar serviço.'],
    [
      'Não, acesso à internet impede compartilhar na LAN.',
      'São interações distintas e compatíveis.',
    ],
  ),
  q(
    'b-address',
    'O02',
    'name-multiple-addresses',
    'Um nome retorna dois endereços de serviço. O que isso indica?',
    [
      'Um nome pode estar associado a vários endereços.',
      'DNS não exige relação permanente de um nome para um único IP.',
    ],
    ['O nome agora é um MAC.', 'MAC pertence ao enlace; não é criado por resposta A/AAAA.'],
    [
      'É erro obrigatório: cada site precisa de IP exclusivo.',
      'Múltiplos nomes e endereços são possíveis.',
    ],
  ),
  q(
    'b-mask',
    'O03',
    'lan-same-prefix-24',
    'A estação é 192.168.60.24/24 e a impressora é 192.168.60.80. Sem rotas adicionais, como o host a classifica?',
    [
      'Como destino da rede diretamente conectada.',
      'O AND com a máscara /24 produz 192.168.60.0 nos dois.',
    ],
    [
      'Como remota porque os últimos octetos diferem.',
      'Diferença de host não significa rede diferente.',
    ],
    [
      'Como remota porque não foi feita consulta DNS.',
      'Os endereços já conhecidos permitem decidir o prefixo.',
    ],
  ),
  q(
    'b-route',
    'O04',
    'route-absent-cached-name',
    'O IP do portal já está em cache, mas a tabela tem só rota da LAN e nenhuma para o remoto. Por que a impressora funciona e o portal não?',
    [
      'Há rota local, mas falta rota remota aplicável.',
      'Ter o endereço em cache não cria encaminhamento.',
    ],
    [
      'DNS sempre instala a default automaticamente.',
      'Resolução e configuração de rotas são funções distintas.',
    ],
    [
      'O servidor remoto está comprovadamente desligado.',
      'O cliente nem demonstrou caminho até ele.',
    ],
  ),
  q(
    'b-name',
    'O05',
    'nxdomain-not-timeout',
    'A consulta recebeu NXDOMAIN para um nome digitado. Isso é igual a timeout?',
    [
      'Não. Houve uma resposta negativa sobre o nome, não ausência de resposta no prazo.',
      'Verificar grafia e contexto do nome é coerente com resposta negativa.',
    ],
    ['Sim, ambas provam que o servidor DNS não respondeu.', 'NXDOMAIN é uma resposta recebida.'],
    ['Não, NXDOMAIN comprova negociação TLS.', 'A resposta DNS não avalia certificado.'],
  ),
  q(
    'b-layer',
    'O06',
    'http-error-after-connection',
    'O navegador recebeu HTTP 500 em HTTPS validado. Qual interpretação é adequada?',
    [
      'Houve troca de aplicação; o erro reportado pede investigação do serviço.',
      'Receber status HTTP difere de falhar antes de estabelecer a comunicação.',
    ],
    ['Nenhuma mensagem HTTP foi recebida.', 'O status apresentado é uma mensagem HTTP.'],
    [
      'Trocar a máscara é a causa comprovada.',
      'Não há evidência de configuração local incorreta nesse resultado.',
    ],
  ),
  q(
    'b-test',
    'O07',
    'config-before-changing-route',
    'Falta rota ao destino remoto. Qual próxima ação evita inventar configuração?',
    [
      'Conferir o plano e a rota/default autorizada antes de alterar.',
      'O gateway correto depende da rede; não é obrigatoriamente o endereço .1.',
    ],
    [
      'Escolher qualquer IP terminando em .1.',
      'Convenção não é evidência de configuração correta.',
    ],
    [
      'Apagar os logs e reiniciar o serviço web remoto.',
      'Isso não investiga a ausência de rota no cliente.',
    ],
  ),
  q(
    'b-limit',
    'O08',
    'no-route-unknown-server',
    'Sem rota do cliente ao portal, o que sabemos sobre a saúde do portal?',
    [
      'Ela ainda não foi estabelecida; falta caminho para testar daqui.',
      'Falha local limita o alcance da conclusão.',
    ],
    [
      'Está necessariamente saudável porque a LAN imprime.',
      'O teste da impressora não verifica o portal.',
    ],
    [
      'Está necessariamente desligado porque não abriu.',
      'A ausência de rota já impede o acesso sem dizer o estado do destino.',
    ],
  ),
];

export const reviewQuestions: Question[] = [
  q(
    'r-roles',
    'O01',
    'local-service-no-internet',
    'Um serviço de arquivos só na LAN precisa, por definição, de internet para atender clientes locais?',
    [
      'Não. Serviço local pode ser oferecido na LAN.',
      'Localização e papel não exigem internet por definição.',
    ],
    [
      'Sim. Todo servidor só funciona na internet.',
      'Servidor é o papel na interação, não uma localização obrigatória.',
    ],
    ['Não pode ser servidor se usar notebook.', 'O hardware não define o papel do software.'],
  ),
  q(
    'r-address',
    'O02',
    'ip-and-name-hosting',
    'Dois nomes de sites usam o mesmo IP. Por que abrir só o IP pode trazer outro resultado?',
    [
      'O nome pode selecionar o site e precisa corresponder ao certificado.',
      'Hospedagem virtual e identidade TLS tornam nome e IP não intercambiáveis em todo teste.',
    ],
    ['Porque nomes são endereços MAC globais.', 'Nome de aplicação não é MAC.'],
    [
      'Porque IP não pode transportar HTTP.',
      'HTTP pode ser transportado sobre as conexões endereçadas por IP.',
    ],
  ),
  q(
    'r-mask',
    'O03',
    'mask-bit-and',
    'Por que o octeto 255 da máscara conserva os bits do endereço no cálculo AND?',
    [
      '255 representa oito bits 1; AND com 1 conserva cada bit correspondente.',
      'A decisão usa bits, não uma regra estética de números parecidos.',
    ],
    ['Porque 255 é o IP do gateway.', 'Máscara não é endereço de um equipamento.'],
    ['Porque DNS escolhe quais bits serão mantidos.', 'O cálculo não depende de consulta DNS.'],
  ),
  q(
    'r-route',
    'O04',
    'remote-resolver-default',
    'O resolvedor está em outra rede e não há rota até ele. Alterar somente o nome consultado resolve o caminho?',
    [
      'Não. É necessário investigar a rota para alcançar esse resolvedor.',
      'Uma consulta DNS também precisa de comunicação de rede.',
    ],
    ['Sim, qualquer nome cria uma rota.', 'Nomes não criam encaminhamento automaticamente.'],
    ['Sim, DNS não usa rede.', 'A consulta ao resolvedor remoto precisa atravessar redes.'],
  ),
  q(
    'r-dns',
    'O05',
    'cache-no-query',
    'Um site abriu sem nova consulta DNS observada. Isso contradiz o modelo?',
    [
      'Não. Uma informação válida pode estar em cache.',
      'O modelo inclui reaproveitamento, não obriga consulta a cada clique.',
    ],
    [
      'Sim. Todo pacote web contém obrigatoriamente uma nova consulta DNS.',
      'Consulta e pacote web têm funções distintas.',
    ],
    ['Sim. DNS não permite cache.', 'Caches são parte importante da resolução.'],
  ),
  q(
    'r-tls',
    'O06',
    'tls-identity',
    'A revisão mostra TCP conectado e certificado não confiável. Qual ação é mais adequada?',
    [
      'Verificar nome, confiança, validade e contexto, sem ignorar proteção como correção.',
      'Alcançar a porta não prova identidade TLS válida.',
    ],
    [
      'Ignorar qualquer alerta é a correção padrão.',
      'Isso remove a verificação em vez de explicar o erro.',
    ],
    ['Trocar a máscara sem coletar dado adicional.', 'O erro observado não demonstra essa causa.'],
  ),
  q(
    'r-test',
    'O07',
    'trace-stars-later-response',
    'tracert tem asteriscos em um salto e resposta do destino depois. O que fazer?',
    [
      'Considerar que sondagens intermediárias podem não receber resposta e correlacionar com o serviço.',
      'O destino posterior respondeu; um asterisco isolado não prova interrupção de encaminhamento.',
    ],
    ['Declarar que nada passa daquele salto.', 'Essa declaração contradiz a resposta posterior.'],
    [
      'Concluir que o DNS criptografou o caminho.',
      'DNS e criptografia não explicam esse comportamento.',
    ],
  ),
  q(
    'r-limit',
    'O08',
    'icmp-blocked-service-ok',
    'Um monitor ICMP alerta, mas usuários completam HTTPS. Qual é o limite do alerta?',
    [
      'Ele observa a falta de resposta ICMP; não prova indisponibilidade do HTTPS.',
      'Verificações por protocolo podem divergir legitimamente.',
    ],
    [
      'Todo usuário deve estar inventando o acesso.',
      'Não descarte uma evidência válida para preservar uma hipótese.',
    ],
    [
      'HTTPS é sempre permitido se ping falhar.',
      'O cenário mostra um caso, não uma regra universal.',
    ],
  ),
];

export const recoveryQuestions: Question[] = [
  q(
    'm-ip-dns',
    'O02',
    'recovery-name-vs-interface',
    'A configuração mostra IPv4 192.168.4.20 e DNS 192.168.4.10. Qual diferença importa?',
    [
      'O primeiro identifica a interface; o segundo é o resolvedor configurado para consultas.',
      'Os campos descrevem funções distintas, mesmo usando o mesmo formato de endereço.',
    ],
    ['DNS é a máscara do primeiro endereço.', 'Máscara é um campo próprio que descreve o prefixo.'],
    [
      'Todo endereço do campo DNS pertence ao servidor web final.',
      'O resolvedor consulta nomes; não precisa ser o servidor do site.',
    ],
  ),
  q(
    'm-gateway-dns',
    'O04',
    'recovery-gw-vs-dns',
    'O nome foi resolvido; falta rota remota. Qual função precisa ser investigada?',
    [
      'Encaminhamento/rota, não resolução como causa já comprovada.',
      'Saber o endereço não fornece o próximo salto.',
    ],
    [
      'Trocar só a grafia do nome cria a saída.',
      'A grafia de um nome não instala uma rota para outra rede.',
    ],
    [
      'DNS é responsável por encaminhar cada pacote do site.',
      'Resolvedor fornece informações; roteamento encaminha pacotes.',
    ],
  ),
  q(
    'm-local-remoto',
    'O07',
    'recovery-choose-route',
    'A impressora da LAN funciona e um destino remoto não. Qual comparação separa melhor o caminho?',
    [
      'Examinar configuração/rotas e testar o serviço remoto de forma específica.',
      'A comparação local/remoto delimita a investigação, sem presumir a causa.',
    ],
    ['Concluir que toda LAN está desligada.', 'A impressão funcional contradiz isso.'],
    ['Desativar TLS antes de testar rede.', 'Ainda não há evidência de falha TLS.'],
  ),
  q(
    'm-icmp-servico',
    'O08',
    'recovery-icmp-no-app-proof',
    'Só há timeout de ping; não foi testado o serviço. Qual conclusão é adequada?',
    [
      'Ainda falta evidência para declarar o serviço indisponível.',
      'ICMP pode ser filtrado; teste o protocolo/serviço relevante.',
    ],
    ['O servidor está definitivamente desligado.', 'Timeout isolado não distingue as hipóteses.'],
    ['O serviço está definitivamente saudável.', 'Também não há teste positivo da aplicação.'],
  ),
  q(
    'm-mascara-ip',
    'O03',
    'recovery-mask-purpose',
    'Ao manter o IP e mudar a máscara, o que pode mudar na interpretação do host?',
    [
      'A rede conectada calculada e quais destinos ele trata como locais.',
      'A máscara marca os bits de prefixo; uma mudança altera a decisão de rede.',
    ],
    ['O nome DNS de todos os servidores.', 'Não é função da máscara renomear serviços.'],
    ['O MAC gravado de todos os roteadores.', 'Máscara IPv4 não reescreve MACs.'],
  ),
  q(
    'm-web-ip',
    'O05',
    'recovery-service-vs-resolution',
    'O resolvedor retorna endereço e o servidor devolve HTTP 503. Onde a observação aponta?',
    [
      'Há resposta HTTP de indisponibilidade; não é ausência de resposta DNS.',
      'As etapas têm evidências diferentes e o erro veio da aplicação ou intermediário HTTP.',
    ],
    ['DNS não respondeu porque HTTP não foi 200.', 'Status HTTP não é resposta de consulta DNS.'],
    ['O cliente não pode ter recebido nada da rede.', 'Ele recebeu uma resposta HTTP no cenário.'],
  ),
];

export const questions = [
  ...checks,
  ...assessmentA,
  ...assessmentB,
  ...reviewQuestions,
  ...recoveryQuestions,
];
export const questionById = Object.fromEntries(
  questions.map((question) => [question.id, question]),
);
export const assessmentSets = [assessmentA.map((q) => q.id), assessmentB.map((q) => q.id)];
