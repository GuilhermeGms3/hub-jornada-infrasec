import type { CourseUnit } from './types';
import { question } from './authoring';
import { r03Questions } from './questions-r03';
import { scenarioById, simulate } from '../domain/simulator';

export const r03: CourseUnit = {
  id: 'net-r03',
  version: '1.0',
  title: 'Troubleshooting de conectividade',
  motivation:
    '“A internet caiu” pode descrever um único site com erro, uma consulta DNS que expira ou vários computadores sem configuração. Você aprenderá a escolher testes que separam essas situações e a registrar conclusões proporcionais.',
  prerequisite:
    'Recomendado: NET-R01 e configuração/DHCP na NET-R02. Você pode abrir as aulas e praticar agora; a avaliação mede decisões sobre cenários, não execução no Windows real.',
  references: [
    {
      title: 'Microsoft: ping',
      url: 'https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/ping',
    },
    {
      title: 'Microsoft: tracert',
      url: 'https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/tracert',
    },
    {
      title: 'Microsoft: Test-NetConnection',
      url: 'https://learn.microsoft.com/en-us/powershell/module/nettcpip/test-netconnection',
    },
  ],
  lessons: [
    {
      id: 'escopo',
      title: 'Transformar o relato em um problema testável',
      objective: 'NET-SCOPE',
      observable:
        'Separar sintoma, escopo, hipótese e evidência antes de escolher uma intervenção.',
      prerequisites: ['NET-CONFIG'],
      vocabulary:
        'Sintoma é o comportamento percebido. Escopo delimita quem, onde, quando e o que falha. Hipótese é uma explicação a testar. Evidência é uma observação com contexto que pode fortalecer ou enfraquecer uma hipótese.',
      sections: [
        {
          title: 'O relato do usuário é a entrada, não o diagnóstico',
          paragraphs: [
            'Quando alguém diz que “a rede está lenta”, preserve suas palavras e peça um exemplo reproduzível. Qual aplicação? Qual operação? Desde quando? Acontece em um equipamento ou em vários? Há mensagem de erro? A conexão é cabo, Wi-Fi ou VPN? Essas perguntas não são burocracia: definem o serviço e o caminho que os próximos testes precisam representar.',
            'A resposta pode revelar que somente o upload de um portal falha depois do login enquanto outros sites abrem. Um ping para um endereço público mede algo diferente desse upload. Se você coleta o teste mais familiar sem delimitar a tarefa, pode obter um resultado correto e ainda assim irrelevante. O objetivo é escolher uma observação que discrimine hipóteses para a operação afetada.',
          ],
        },
        {
          title: 'Comparação controlada vale mais que uma sequência aleatória',
          paragraphs: [
            'Compare condições próximas: mesmo serviço em outro computador da mesma rede, mesmo computador em outra conexão autorizada ou outro serviço no mesmo destino. Mude uma condição por vez e anote diferenças de horário, conta, endereço e método. Se o problema só aparece com VPN, isso orienta investigar rotas, DNS e políticas desse contexto; não prova que a VPN tem um defeito específico.',
            'Formule hipóteses que possam ser contrariadas: “o nome não está sendo resolvido pelo servidor configurado” admite um teste de resolução; “a internet está ruim” não define uma observação suficiente. Pergunte antes de executar: se o teste tiver sucesso, qual hipótese ficará mais fraca? Se falhar, quantas causas ainda poderiam produzir o resultado? Esse exercício previne conclusões categóricas apoiadas em sinais ambíguos.',
          ],
        },
        {
          title: 'Registrar incerteza melhora a continuidade',
          paragraphs: [
            'Uma boa anotação separa o que foi relatado do que você reproduziu. “Usuário relata falha desde 09:00; reproduzida às 09:14 ao abrir o pedido 17; resposta HTTP 503” contém escopo, ação e resultado. Já “servidor ruim” não permite que outra pessoa repita o teste. Não inclua senhas, tokens, dados de clientes ou prints sem revisão; descreva o necessário com identificadores controlados.',
            'O diagnóstico pode terminar esta etapa sem causa raiz. Isso é aceitável se as hipóteses restantes e o próximo teste estiverem claros. A pressão por resolver não autoriza inventar certeza. Ao escalar, uma hipótese bem delimitada com evidências preservadas ajuda mais do que uma lista de comandos executados sem explicação ou uma correção não autorizada que apaga o estado anterior.',
          ],
        },
      ],
      diagram: [
        'Relato',
        'Serviço + usuário + rede + horário',
        'Hipóteses concorrentes',
        'Teste que separa hipóteses',
      ],
      example: {
        title: 'Portal com erro não é toda a internet',
        data: '09:14 — duas estações recebem HTTP 503 no portal\nOutros sites abrem\nDNS do portal retorna o endereço esperado\nTCP 443 estabelece conexão',
        reasoning: [
          'O escopo envolve o portal em pelo menos duas estações, não todos os serviços.',
          'Resolução e conexão TCP funcionaram no teste observado.',
          'Investigar aplicação/dependências ou intermediários que podem gerar 503, encaminhando horário e operação.',
        ],
        conclusion:
          'Há evidência de falha do serviço web no fluxo testado, sem causa raiz ainda comprovada.',
        limit:
          'Um 503 pode vir de proxy ou balanceador; o teste não identifica automaticamente o componente de origem.',
      },
      misconception:
        'Sintoma não é sinônimo de causa. Um teste bem sucedido não representa automaticamente a operação que o usuário não consegue concluir.',
      takeaway:
        'Descreva o problema de um jeito que outra pessoa consiga reproduzir e contrariar suas hipóteses.',
      recovery:
        'Escreva quatro linhas separadas: relato, observação, hipótese e próximo teste. Se uma linha começar com “com certeza” sem dado novo, reveja a classificação. No exemplo, 503 é observação; indisponibilidade de uma dependência é hipótese até existir evidência correspondente.',
    },
    {
      id: 'ordem',
      title: 'Escolher testes do local ao serviço',
      objective: 'NET-TEST-ORDER',
      observable:
        'Selecionar uma sequência de testes que avalie configuração, pilha local, enlace, saída e serviço.',
      prerequisites: ['NET-CONFIG', 'NET-SCOPE'],
      vocabulary:
        'Loopback é o caminho lógico para a própria pilha, como 127.0.0.1. Teste de gateway verifica um destino local importante, mas não todos os destinos da LAN. Referência de funcionamento é uma condição conhecida para comparação.',
      sections: [
        {
          title: 'Primeiro, saber o que deveria existir',
          paragraphs: [
            'Leia a configuração da interface relevante e o plano esperado. Um computador com APIPA e gateway vazio precisa de uma investigação diferente de outro com endereço e rota corretos. Verifique estado do enlace, prefixo, concessão e rota. Esses dados permitem escolher o próximo teste; pular diretamente para um nome na internet mistura obtenção de configuração, roteamento, resolução e serviço em uma única falha difícil de interpretar.',
            'Um ping para 127.0.0.1 testa resposta local da pilha IP sob aquela implementação e política. Ele não atravessa o cabo até o switch e não comprova que a placa está fisicamente conectada. A diferença entre um teste local que responde e um gateway que não responde ajuda a localizar a investigação, mas uma política pode afetar ICMP; mantenha as conclusões compatíveis com o método.',
          ],
        },
        {
          title: 'Avançar sem transformar a ordem em ritual',
          paragraphs: [
            'Teste um destino local relevante e, quando fizer sentido, o gateway configurado. Depois use um destino remoto conhecido para investigar alcance IP e uma consulta ao resolvedor apropriado para nomes. A ordem local → remoto reduz variáveis, mas não é um script que precisa executar todos os comandos em todo chamado. Se a configuração já revela uma inconsistência documentada, é razoável investigar essa inconsistência antes de acumular pings.',
            'Escolha destinos autorizados e esperados para o ambiente. Um serviço interno pode depender de VPN, DNS corporativo e rotas que não existem no acesso público. Usar um endereço público qualquer como único critério pode produzir uma falsa sensação de normalidade. Compare a rota necessária à operação, a interface de saída e um serviço equivalente; o que funciona fora da VPN não valida o caminho interno.',
          ],
        },
        {
          title: 'Cada teste responde uma pergunta limitada',
          paragraphs: [
            'Uma resposta ICMP do gateway mostra alcance IP até aquele destino no instante observado. Ela não valida automaticamente o enlace de todos os usuários nem o acesso da rede a todas as aplicações. Uma resposta do endereço remoto comprova o caminho de ida e volta necessário àquela troca ICMP, mas não a aceitação da porta da aplicação. O próximo teste depende da hipótese restante, não de uma promessa de que um ping “certifica a internet”.',
            'Registre comando, destino, interface quando relevante, horário, resultado e interpretação. Se o teste falha, considere endereço incorreto, política de resposta, perda e caminhos assimétricos antes de afirmar que o equipamento está desligado. Quando tiver evidência suficiente para propor uma ação, preserve o estado e siga autorização e validação. O laboratório da unidade exige coleta mínima antes da conclusão, sem executar nada na rede real.',
          ],
        },
      ],
      diagram: [
        'Configuração e rota esperada',
        'Pilha local / enlace e destino local',
        'Alcance remoto por IP',
        'Nomes / porta / operação da aplicação',
      ],
      example: {
        title: 'Loopback responde, gateway não',
        data: 'ipconfig: 10.9.2.18/24, gateway 10.9.2.1\nping 127.0.0.1: responde\nping 10.9.2.1: timeout\nMesmo serviço funciona no notebook vizinho',
        reasoning: [
          'A resposta local não prova o caminho até o switch.',
          'A falha ao gateway orienta verificar enlace, endereço, VLAN, ARP e política ICMP no caminho local.',
          'Comparar a interface e o contexto do vizinho reduz hipóteses; consultar evidências locais antes de trocar DNS.',
        ],
        conclusion: 'A investigação começa no caminho local/configuração/política até o gateway.',
        limit:
          'Timeout não prova que o gateway esteja desligado nem identifica uma porta de switch específica.',
      },
      misconception: 'Loopback respondendo não é prova de cabo ou Wi-Fi funcionando.',
      takeaway:
        'A ordem dos testes é um método para reduzir hipóteses, não uma lista que garante a causa.',
      recovery:
        'Desenhe onde cada teste termina. O pacote para 127.0.0.1 não precisa sair para o switch. Em seguida desenhe o pacote até o gateway e outro até um servidor remoto. O primeiro ponto ainda não verificado ajuda a escolher a coleta; ele não autoriza nomear um equipamento defeituoso sem evidência.',
    },
    {
      id: 'protocolos',
      title: 'Separar DNS, ICMP, porta e aplicação',
      objective: 'NET-TEST-LIMITS',
      observable:
        'Interpretar resultados aparentemente contraditórios sem confundir protocolos e camadas.',
      prerequisites: ['R01-DNS', 'R01-HTTPS', 'NET-TEST-ORDER'],
      vocabulary:
        'ICMP é usado em mensagens de controle e diagnóstico; não é uma porta TCP. NXDOMAIN é uma resposta DNS de nome inexistente; timeout informa ausência de resposta no prazo. Conexão TCP não é uma transação HTTPS completa.',
      sections: [
        {
          title: 'Nome resolvido não significa site disponível',
          paragraphs: [
            'nslookup consulta resolução DNS e mostra qual servidor respondeu. Uma resposta com endereço não abre uma conexão com o portal. Se a consulta expira, investigue configuração, alcance e comportamento do resolvedor. Se responde NXDOMAIN, houve uma resposta indicando inexistência do nome naquele contexto. São resultados diferentes; limpar cache repetidamente não explica por que o servidor respondeu dessa maneira nem corrige automaticamente um cadastro.',
            'Uma aplicação pode usar cache ou mecanismos de resolução diferentes da consulta que você executou. Registre o nome exato, o servidor consultado e o horário. Digitar um endereço IP no navegador também altera o pedido em comparação com usar o nome: hospedagem virtual, certificado e cabeçalhos podem depender dele. O teste pode ser útil para formular hipóteses, mas não é uma substituição perfeita da transação HTTPS original.',
          ],
        },
        {
          title: 'ICMP pode ser filtrado enquanto o serviço funciona',
          paragraphs: [
            'Ping normalmente depende de mensagens ICMP Echo Request e Echo Reply. Um destino pode não responder a elas por política, mesmo aceitando conexões TCP na porta 443. Portanto, timeout no ping e página HTTPS abrindo não são uma contradição: métodos diferentes medem comportamentos diferentes. O teste que representa melhor o problema de um portal é a operação do serviço, complementada por testes do caminho conforme necessário.',
            'Test-NetConnection com porta 443 pode verificar conexão TCP ao destino escolhido. Isso não negocia obrigatoriamente toda a sessão TLS nem valida login e operação de negócio. Já uma resposta HTTP demonstra que algum componente do caminho processou uma requisição HTTP. Um 401/403 exige investigação diferente de timeout TCP, e um 503 pode envolver aplicação, proxy ou dependência. Nomeie exatamente o estágio observado em vez de chamar todo erro de “rede”.',
          ],
        },
        {
          title: 'Testar a hipótese que falta',
          paragraphs: [
            'Se IP remoto responde, consulta ao DNS configurado expira e a operação por nome falha, investigar resolução é proporcional. Se DNS responde corretamente e a conexão TCP é recusada, investigue serviço em escuta, endereço, política ou rejeição ativa conforme o contexto. Uma recusa não é igual a ausência de resposta. Não desative firewall nem altere servidor DNS de uma empresa como experimento genérico sem autorização e análise de impacto.',
            'Mantenha testes comparáveis: destino, protocolo, porta, origem e instante. Resultados de momentos diferentes podem refletir uma falha intermitente, caches ou mudança de rota. Uma conclusão útil informa “o acesso TCP a este destino/porta funcionou às 10:20” e propõe a próxima verificação da aplicação; ela não afirma que todo acesso está normal ou que o único teste que falhou deve estar errado.',
          ],
        },
      ],
      diagram: [
        'Nome → consulta DNS',
        'Endereço → caminho IP',
        'Porta → conexão TCP',
        'TLS / HTTP → operação de serviço',
      ],
      example: {
        title: 'O ping falha e o portal abre',
        data: 'ping remoto: timeout\nConsulta DNS: endereço esperado\nTCP 443: conexão estabelecida\nHTTPS: página carregada\nPolítica: ICMP de diagnóstico não permitido',
        reasoning: [
          'O portal foi validado por uma operação de aplicação.',
          'O resultado do ping pode ser explicado pela política do protocolo de diagnóstico.',
          'Não reiniciar o servidor nem mudar gateway para corrigir uma indisponibilidade que o acesso HTTPS não reproduz.',
        ],
        conclusion:
          'Não há evidência de indisponibilidade do portal nesse teste; ping não é critério exclusivo.',
        limit:
          'Carregar uma página não valida todas as operações autenticadas ou o comportamento em outro horário.',
      },
      misconception:
        'DNS correto não garante TCP, e TCP estabelecido não garante TLS, autorização e aplicação.',
      takeaway:
        'Resultados só parecem contraditórios quando esquecemos o que cada teste realmente mede.',
      recovery:
        'Monte quatro caixas: resolução, alcance, porta e operação. Coloque cada resultado na caixa correspondente. Uma caixa marcada como sucesso não preenche automaticamente as seguintes. Para erro DNS, compare timeout com resposta negativa; para serviço, compare conexão TCP com uma ação de negócio real.',
    },
    {
      id: 'tracert',
      title: 'Ler caminhos, tempos e limites do tracert',
      objective: 'NET-TRACE',
      observable:
        'Interpretar saltos e asteriscos e registrar a próxima coleta sem localizar falsamente a falha.',
      prerequisites: ['NET-TEST-LIMITS'],
      vocabulary:
        'TTL limita a quantidade de saltos de um pacote. ICMP Time Exceeded pode indicar que o TTL terminou. RTT é tempo de ida e volta da resposta observada, não atraso exclusivo de um enlace.',
      sections: [
        {
          title: 'Como o caminho aparece',
          paragraphs: [
            'O tracert do Windows envia sondas com TTL crescente. Roteadores diminuem o TTL ao encaminhar; quando ele acaba, pode retornar uma mensagem ICMP Time Exceeded. O programa associa essas respostas aos saltos. Um destino que responde permite encerrar a observação do caminho. Implementações de traceroute em outros sistemas podem usar sondas diferentes, como UDP; registre qual ferramenta foi usada e não trate todas as variantes como idênticas.',
            'As respostas mostram interfaces e tempos das sondas observadas, não um mapa perfeito e permanente de todos os cabos. Balanceamento, túneis, filtros e caminhos de retorno podem alterar o que aparece. Um nome exibido pode depender de resolução reversa; usar a opção de não resolver nomes ajuda a separar demora de consulta de demora de resposta das sondas. Ainda assim, não transforma o resultado em certeza sobre topologia interna.',
          ],
        },
        {
          title: 'Asteriscos não identificam automaticamente uma queda',
          paragraphs: [
            'Um salto pode não responder no prazo ou limitar respostas de diagnóstico, enquanto encaminha pacotes normalmente. Se aparecem asteriscos em um salto e o destino final responde depois, há evidência de encaminhamento suficiente para sondas posteriores, apesar da ausência de uma resposta intermediária. Declarar “o terceiro roteador caiu” apenas porque a terceira linha tem asteriscos ignora esse fato.',
            'Tempos exibidos são de ida e volta de cada resposta. Uma resposta lenta de um roteador intermediário não mede diretamente o atraso do enlace anterior nem prova que ele atrasa o tráfego de aplicação. Compare repetição, destino final, perda do serviço e medições apropriadas. Se o caminho deixa de responder até o fim, você ainda precisa considerar política de diagnóstico, destino e fluxo real antes de nomear uma causa.',
          ],
        },
        {
          title: 'Do output ao registro de investigação',
          paragraphs: [
            'Use tracert como parte de uma pergunta: até quais pontos há resposta observada e como isso se compara à referência? Registre origem, destino por IP ou nome, ferramenta, horário, interface/VPN e resultado. Se o destino resolve para vários endereços, preserve qual foi testado. Um teste por nome em um momento e por outro IP no seguinte pode estar comparando serviços ou caminhos diferentes.',
            'No encerramento, combine o caminho com os testes que representam a operação afetada. Se HTTPS funciona e tracert tem asteriscos, registre a limitação do diagnóstico, não uma falha resolvida que nunca foi demonstrada. Se serviço e caminho falham de modo reproduzível, encaminhe as evidências sem alegar que uma fronteira não observável é necessariamente o ponto de descarte. Esse registro prepara o ticket e o runbook da R04.',
          ],
        },
      ],
      diagram: [
        'Sonda TTL 1 → possível resposta do salto 1',
        'Sonda TTL 2 → possível resposta do salto 2',
        'Asterisco = resposta ausente no prazo',
        'Relacionar caminho e teste do serviço',
      ],
      example: {
        title: 'Um salto silencioso entre respostas',
        data: 'tracert -d 203.0.113.40\n1  2 ms 10.4.0.1\n2  * * *\n3  20 ms 203.0.113.40\nHTTPS do mesmo destino responde',
        reasoning: [
          'O salto 2 não retornou resposta observada para essas sondas.',
          'O destino respondeu na sondagem posterior; a ausência intermediária não prova interrupção de encaminhamento.',
          'Relacionar o resultado ao HTTPS e documentar a limitação em vez de escalar uma queda presumida no salto 2.',
        ],
        conclusion:
          'Há silêncio de diagnóstico intermediário; não há prova de queda naquele salto.',
        limit:
          'O caminho observado não valida todos os fluxos, nem os tempos de uma operação autenticada.',
      },
      misconception:
        'O número de uma linha com asteriscos não é automaticamente a localização física da falha.',
      takeaway:
        'Tracert informa respostas observadas a sondas; a conclusão precisa do contexto e do serviço.',
      recovery:
        'Se o salto 2 estivesse comprovadamente impedindo todo encaminhamento, como uma sonda posterior alcançaria o destino? Essa pergunta não prova saúde completa, mas mostra por que os asteriscos sozinhos não bastam. Volte ao teste do serviço e registre o que realmente foi reproduzido.',
    },
  ],
  questions: r03Questions,
  lab: {
    title: 'Duas evidências, uma decisão de escopo',
    scenario:
      'A área financeira relata portal indisponível. Antes de tocar no roteador, colete o estado e compare as camadas. Os outputs usam o motor local da R01; a tarefa agora é escolher o encaminhamento e o limite da conclusão.',
    outputs: [
      { id: 'dns', label: 'Consultar DNS', output: simulate(scenarioById['icmp-filter'], 'dns') },
      { id: 'ping', label: 'Testar ICMP', output: simulate(scenarioById['icmp-filter'], 'remote') },
      {
        id: 'https',
        label: 'Testar HTTPS',
        output: simulate(scenarioById['icmp-filter'], 'https'),
      },
      {
        id: 'report',
        label: 'Detalhar operação do usuário',
        output:
          'A página inicial abre. A falha relatada acontece somente ao exportar um relatório depois do login. Essa exportação ainda não foi reproduzida pelo técnico.',
      },
    ],
    required: ['https', 'report'],
    question: question(
      'net-r03',
      'lab-scope',
      'escopo',
      'NET-SCOPE',
      'guided',
      'Qual próximo passo representa o sintoma original?',
      'O ping isolado expira; o portal inicial abre.',
      [
        [
          'Reiniciar o gateway porque ping falhou.',
          'A decisão ignora a página funcionando e a operação ainda não reproduzida.',
        ],
        [
          'Encerrar: uma página abriu e isso valida toda a aplicação.',
          'A exportação autenticada ainda não foi testada.',
        ],
        [
          'Reproduzir e registrar a exportação autorizada, preservando horário e resposta, sem usar ping como critério exclusivo.',
          'O próximo teste precisa representar a ação que falha; o motor comprova apenas os outputs coletados.',
        ],
      ],
      'c',
      'Qual operação foi relatada e qual você realmente testou?',
    ),
  },
};
