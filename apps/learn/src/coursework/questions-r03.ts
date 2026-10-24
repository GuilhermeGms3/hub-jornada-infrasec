import { question as q } from './authoring';
export const r03Questions = [
  q(
    'net-r03',
    'c-scope',
    'escopo',
    'NET-SCOPE',
    'comprehension',
    'Qual pergunta ajuda a delimitar o problema?',
    'Usuário relata “rede lenta”.',
    [
      [
        'Qual operação, desde quando e em quais dispositivos?',
        'Delimita serviço, tempo e abrangência para escolher testes relevantes.',
      ],
      [
        'Posso trocar todos os endereços agora?',
        'Propõe intervenção antes de delimitar o problema e avaliar impacto.',
      ],
      [
        'Qual marca de teclado você usa?',
        'Sem relação demonstrada com o sintoma, não discrimina hipóteses de conectividade.',
      ],
    ],
    'a',
    'Procure uma informação que mude o próximo teste.',
  ),
  q(
    'net-r03',
    'c-loopback',
    'ordem',
    'NET-TEST-ORDER',
    'comprehension',
    'O que este sucesso não comprova?',
    'ping 127.0.0.1 respondeu.',
    [
      [
        'Houve resposta local da pilha no teste.',
        'Essa é a observação limitada que o resultado permite.',
      ],
      [
        'O cabo até o switch está funcionando.',
        'O loopback não precisa atravessar a interface física e o enlace.',
      ],
      ['O teste foi dirigido ao loopback.', 'O destino está explicitamente informado.'],
    ],
    'b',
    'Desenhe onde o pacote termina.',
  ),
  q(
    'net-r03',
    'c-dns',
    'protocolos',
    'NET-TEST-LIMITS',
    'comprehension',
    'Qual distinção é correta?',
    'Consulta A retorna NXDOMAIN; consulta B expira sem resposta.',
    [
      [
        'São o mesmo resultado e provam o servidor desligado.',
        'Uma delas recebeu resposta; não são observações equivalentes.',
      ],
      [
        'NXDOMAIN confirma que o portal está saudável.',
        'O resultado se refere ao nome consultado, não à aplicação.',
      ],
      [
        'A recebeu resposta negativa de nome; B não recebeu resposta no prazo.',
        'A distinção muda as hipóteses e as próximas verificações.',
      ],
    ],
    'c',
    'Uma resposta negativa ainda é uma resposta.',
  ),
  q(
    'net-r03',
    'c-stars',
    'tracert',
    'NET-TRACE',
    'comprehension',
    'Como interpretar o salto silencioso?',
    'Linha 2: asteriscos. Linha 3: destino responde.',
    [
      [
        'Não houve resposta intermediária observada; isso não prova queda no salto 2.',
        'O destino respondeu a uma sonda posterior, apesar do silêncio intermediário.',
      ],
      [
        'O salto 2 certamente descartou todos os pacotes.',
        'A resposta posterior contradiz a afirmação de bloqueio total.',
      ],
      [
        'O DNS foi comprovadamente apagado.',
        'A observação não demonstra alteração de cadastro DNS.',
      ],
    ],
    'a',
    'Considere a evidência das linhas seguintes.',
  ),
  q(
    'net-r03',
    'i-upload',
    'escopo',
    'NET-SCOPE',
    'independent',
    'Qual teste melhor representa o relato?',
    'Página inicial abre. Falha apenas ao anexar arquivo após login em duas estações.',
    [
      [
        'Ping para um endereço público aleatório.',
        'Não representa a operação autenticada de anexo.',
      ],
      [
        'Reproduzir anexo autorizado, registrar horário, resposta e comparar condição equivalente.',
        'A observação acompanha o sintoma real e permite investigar o fluxo afetado.',
      ],
      [
        'Declarar que todos os sites estão fora do ar.',
        'O escopo informado é uma operação específica e há página inicial funcionando.',
      ],
    ],
    'b',
    'Teste a operação que ainda não foi validada.',
  ),
  q(
    'net-r03',
    'i-apipa-first',
    'ordem',
    'NET-TEST-ORDER',
    'independent',
    'Por onde começar a investigação?',
    'Interface em uso: 169.254.9.22/16, DHCP habilitado, sem gateway. Portal remoto não abre.',
    [
      [
        'Revisar configuração e aquisição DHCP no enlace antes de atribuir a falha ao portal.',
        'O estado local já revela ausência de configuração IPv4 roteada utilizável.',
      ],
      [
        'Alterar somente a URL do portal para HTTPS.',
        'Isso não resolve a configuração local descrita.',
      ],
      [
        'Atestar que o servidor web está desligado.',
        'O cliente não oferece caminho IPv4 válido para testar esse servidor.',
      ],
    ],
    'a',
    'Há pré-condições locais ainda não verificadas?',
  ),
  q(
    'net-r03',
    'i-tcp',
    'protocolos',
    'NET-TEST-LIMITS',
    'independent',
    'Qual conclusão respeita o alcance do teste?',
    'DNS esperado; Test-NetConnection porta 443: TcpTestSucceeded True. Login ainda falha.',
    [
      [
        'O login funcionou, porque a porta respondeu.',
        'O teste TCP não valida autenticação e autorização da aplicação.',
      ],
      [
        'DNS foi necessariamente adulterado.',
        'O cenário informa resolução esperada e não apresenta evidência de adulteração.',
      ],
      [
        'A conexão TCP funcionou; investigar TLS e a operação de login com seu contexto.',
        'As etapas seguintes ainda não foram comprovadas pela conexão.',
      ],
    ],
    'c',
    'Qual protocolo foi exercitado pelo comando?',
  ),
  q(
    'net-r03',
    'i-trace-service',
    'tracert',
    'NET-TRACE',
    'independent',
    'Qual registro evita uma causa inventada?',
    'Tracert deixa de responder após salto 4; HTTPS funciona no mesmo intervalo.',
    [
      [
        '“Queda total comprovada no roteador 5.”',
        'O serviço funcionando não sustenta essa conclusão categórica.',
      ],
      [
        '“Sondas sem respostas posteriores; serviço HTTPS funcionou; verificar política/limites antes de localizar falha.”',
        'Separa observações de diagnóstico e de aplicação sem inferir um componente defeituoso.',
      ],
      [
        '“Tudo foi testado e não há qualquer falha possível.”',
        'Um teste bem sucedido não valida toda operação nem outros momentos.',
      ],
    ],
    'b',
    'O relatório deve conseguir conter os dois resultados sem negar um deles.',
  ),
  q(
    'net-r03',
    'r-vpn',
    'escopo',
    'NET-SCOPE',
    'review',
    'Qual comparação é mais informativa?',
    'Sistema interno falha só quando VPN está ligada.',
    [
      [
        'Comparar rotas, resolvedor e acesso à mesma operação com e sem VPN em condições autorizadas.',
        'A variável acompanha o sintoma; a comparação ajuda sem nomear prematuramente a causa.',
      ],
      [
        'Trocar o mouse e considerar o caso resolvido.',
        'Não há relação sustentada com o caminho do serviço.',
      ],
      [
        'Concluir que todo servidor está fora do ar.',
        'O escopo depende de uma condição de acesso.',
      ],
    ],
    'a',
    'Compare uma condição por vez.',
  ),
  q(
    'net-r03',
    'r-local',
    'ordem',
    'NET-TEST-ORDER',
    'review',
    'Que investigação o resultado prioriza?',
    'Configuração plausível; loopback responde; gateway não responde; outro host local também não responde.',
    [
      [
        'Somente a validade do certificado do portal remoto.',
        'Ainda falta demonstrar o caminho local relevante.',
      ],
      ['Desinstalar todos os adaptadores.', 'É intervenção ampla sem causa demonstrada nem plano.'],
      [
        'Verificar enlace, configuração, VLAN e políticas locais com evidências adicionais.',
        'Os resultados orientam o caminho local, mas não identificam sozinhos um dispositivo culpado.',
      ],
    ],
    'c',
    'Localize o primeiro trecho ainda não demonstrado.',
  ),
  q(
    'net-r03',
    'r-refused',
    'protocolos',
    'NET-TEST-LIMITS',
    'review',
    'Qual diferenciação é útil?',
    'Host A: conexão TCP recusada. Host B: tentativa TCP sem resposta até expirar.',
    [
      [
        'Ambos provam exclusivamente falha DNS.',
        'São testes de conexão com comportamentos diferentes.',
      ],
      [
        'Recusa sugere rejeição ativa; timeout mantém hipóteses como descarte, caminho e indisponibilidade.',
        'Nenhum dos dois identifica sozinho toda a causa, mas os próximos testes podem diferir.',
      ],
      ['Recusa confirma login aceito.', 'Recusar a conexão não autentica um usuário.'],
    ],
    'b',
    'Compare resposta recebida com ausência de resposta.',
  ),
  q(
    'net-r03',
    'r-rtt',
    'tracert',
    'NET-TRACE',
    'review',
    'O que um RTT alto intermediário mede diretamente?',
    'Salto 2 responde em 200 ms; destino em 25 ms.',
    [
      [
        'Tempo de ida e volta da resposta daquela sonda, sem provar atraso de todo tráfego encaminhado.',
        'Resposta de diagnóstico pode ter tratamento diferente; compare o serviço e repita medições relevantes.',
      ],
      [
        'Exatamente 200 ms de atraso no cabo entre saltos 1 e 2.',
        'O RTT inclui o retorno e não isola esse enlace.',
      ],
      ['O tempo de execução da aplicação remota.', 'Tracert não executa a operação da aplicação.'],
    ],
    'a',
    'Não transforme tempo de resposta da sonda em medida de um enlace isolado.',
  ),
  q(
    'net-r03',
    'm-observation',
    'escopo',
    'NET-SCOPE',
    'remediation',
    'Qual frase é observação reproduzível?',
    'Você precisa substituir “rede ruim” por um registro útil.',
    [
      [
        '“O roteador provavelmente está cansado.”',
        'Não descreve teste reproduzível nem hipótese técnica clara.',
      ],
      [
        '“O usuário não sabe usar o sistema.”',
        'Atribui culpa sem registrar o comportamento observado.',
      ],
      [
        '“Às 10:08, abrir pedido no portal retornou HTTP 503 em duas estações.”',
        'Registra ação, instante, resultado e parte do escopo sem inventar causa.',
      ],
    ],
    'c',
    'Outra pessoa precisa entender o que repetir.',
  ),
  q(
    'net-r03',
    'm-gateway',
    'ordem',
    'NET-TEST-ORDER',
    'remediation',
    'Gateway respondeu: o que ainda pode faltar?',
    'Usuário não abre o sistema externo pelo nome.',
    [
      [
        'Nada; uma resposta local valida todos os destinos.',
        'O teste tem um destino e protocolo específicos.',
      ],
      [
        'Alcance remoto, resolução e operação do serviço.',
        'Sucesso até a saída local não valida automaticamente as etapas seguintes.',
      ],
      [
        'Somente escolher outro papel de parede.',
        'Não há relação com a hipótese de conectividade.',
      ],
    ],
    'b',
    'Até onde foi o teste realizado?',
  ),
  q(
    'net-r03',
    'm-icmp',
    'protocolos',
    'NET-TEST-LIMITS',
    'remediation',
    'Qual resultado tem mais relação com abrir o portal?',
    'Ping expira, mas a página HTTPS solicitada retorna o conteúdo esperado.',
    [
      [
        'A transação HTTPS testada funcionou; não usar ping como veto automático.',
        'A aplicação foi exercitada diretamente, enquanto ICMP pode ter política diferente.',
      ],
      ['O portal certamente está desligado.', 'Há resposta da aplicação no cenário.'],
      [
        'As credenciais de todos os usuários foram validadas.',
        'Carregar uma página não testa todas as contas ou operações.',
      ],
    ],
    'a',
    'Escolha o resultado que representa a tarefa.',
  ),
  q(
    'net-r03',
    'm-ttl',
    'tracert',
    'NET-TRACE',
    'remediation',
    'Por que TTL crescente revela respostas de diferentes saltos?',
    'Considere o mecanismo do tracert do Windows.',
    [
      ['TTL transmite a senha de cada roteador.', 'TTL não carrega credenciais.'],
      [
        'DNS adiciona um endereço por segundo.',
        'O mecanismo não depende dessa criação de registros.',
      ],
      [
        'Cada roteador reduz TTL; quando ele termina pode retornar ICMP Time Exceeded.',
        'Sondas com limites crescentes permitem observar respostas progressivamente mais distantes.',
      ],
    ],
    'c',
    'Pense em um limite de saltos, não em um mapa recebido pronto.',
  ),
];
