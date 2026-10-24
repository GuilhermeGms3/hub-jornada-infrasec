import { question as q } from './authoring';
export const r04Questions = [
  q(
    'net-r04',
    'c-fact',
    'registro',
    'OPS-EVIDENCE',
    'comprehension',
    'Qual trecho deve ser identificado como hipótese?',
    'Registro: “DNS expirou às 10:02. Talvez a regra esteja bloqueando a consulta.”',
    [
      [
        '“DNS expirou às 10:02”, se o teste foi observado e preservado.',
        'Essa é uma observação com contexto; deve ter comando e resultado associados.',
      ],
      [
        '“Talvez a regra esteja bloqueando a consulta.”',
        'É uma explicação possível que ainda exige teste ou evidência adicional.',
      ],
      [
        'O horário, porque todo horário é uma causa.',
        'Horário situa o evento; não explica sozinho sua causa.',
      ],
    ],
    'b',
    'Separe o resultado do teste de uma explicação para ele.',
  ),
  q(
    'net-r04',
    'c-branch',
    'runbook',
    'OPS-RUNBOOK',
    'comprehension',
    'Qual passo tem uma decisão verificável?',
    'Você está revisando um procedimento de configuração.',
    [
      ['“Conferir a internet.”', 'Não identifica método, alvo ou critério.'],
      [
        '“Se nada der certo, mudar tudo.”',
        'Intervenção ampla sem hipótese, autorização ou parada.',
      ],
      [
        '“Se DHCP habilitado e APIPA, registrar o output e investigar aquisição; se manual divergente, comparar com o plano antes de alterar.”',
        'As condições observadas orientam caminhos diferentes.',
      ],
    ],
    'c',
    'Um runbook precisa dizer como o resultado muda a próxima ação.',
  ),
  q(
    'net-r04',
    'c-after',
    'mudanca',
    'OPS-VALIDATION',
    'comprehension',
    'O que falta para validar a solução?',
    'Antes: erro ao salvar pedido. Depois: comando de alteração terminou sem erro.',
    [
      [
        'Repetir salvar o pedido no contexto autorizado e registrar o resultado.',
        'Sucesso do comando não comprova a operação afetada.',
      ],
      ['Somente aumentar o tamanho do ticket.', 'Texto maior não cria um teste que não ocorreu.'],
      [
        'Declarar o incidente resolvido imediatamente.',
        'Ainda falta evidência funcional posterior.',
      ],
    ],
    'a',
    'Compare a ação técnica com a tarefa do usuário.',
  ),
  q(
    'net-r04',
    'c-handoff',
    'escalonar',
    'OPS-HANDOFF',
    'comprehension',
    'Qual encaminhamento permite continuidade?',
    'Você não tem acesso ao serviço DNS corporativo.',
    [
      ['“Problema de outro setor.”', 'Não informa contexto nem dados úteis.'],
      [
        'Impacto, horários, consulta/servidor, resultados, ações realizadas e acesso necessário.',
        'O responsável consegue correlacionar e continuar a investigação.',
      ],
      [
        'Senha do usuário enviada por mensagem pública.',
        'Expõe informação sensível e não é evidência necessária.',
      ],
    ],
    'b',
    'O próximo técnico precisa saber o que já foi observado.',
  ),
  q(
    'net-r04',
    'i-source',
    'registro',
    'OPS-EVIDENCE',
    'independent',
    'Como registrar a informação ainda não reproduzida?',
    'Usuário diz que todas as estações falharam às 08:00; você testou apenas uma às 08:20.',
    [
      [
        'Relato abrangente do usuário separado do teste de uma estação, com seus respectivos horários.',
        'Não transforma o escopo relatado em observação técnica própria.',
      ],
      [
        '“Todas falharam, comprovado pelo técnico às 08:00.”',
        'Atribui execução e escopo que não ocorreram.',
      ],
      [
        'Apagar o relato porque não foi comprovado.',
        'O relato é informação útil quando sua origem e limite estão claros.',
      ],
    ],
    'a',
    'Preserve a origem de cada afirmação.',
  ),
  q(
    'net-r04',
    'i-stop',
    'runbook',
    'OPS-RUNBOOK',
    'independent',
    'Qual decisão respeita o limite do procedimento?',
    'Runbook de laboratório exige autorização para alterar endereço. Você está em suporte remoto de produção sem essa autorização.',
    [
      [
        'Executar release e tentar recuperar depois.',
        'Pode interromper o acesso e viola a pré-condição de ambiente/permissão.',
      ],
      [
        'Inventar um valor anterior para preencher rollback.',
        'Não cria um estado real recuperável.',
      ],
      [
        'Parar antes da alteração, preservar coleta permitida e encaminhar pedido de autorização.',
        'Pré-condições e critérios de parada existem para evitar execução fora do escopo.',
      ],
    ],
    'c',
    'Um procedimento útil também diz quando não prosseguir.',
  ),
  q(
    'net-r04',
    'i-rollback',
    'mudanca',
    'OPS-VALIDATION',
    'independent',
    'Qual plano de retorno é executável?',
    'Uma opção de configuração será alterada em um laboratório autorizado.',
    [
      [
        '“Se der problema, desfazer” sem registrar valor ou responsável.',
        'Não explica como reconhecer regressão nem restaurar o estado.',
      ],
      [
        'Guardar valor anterior, definir gatilho, responsável e método de retorno, incluindo revalidação.',
        'Explicita condições e recursos necessários, sem supor que retorno seja instantâneo em todos os clientes.',
      ],
      [
        'Mudar todas as opções para evitar dúvida.',
        'Amplia impacto e dificulta atribuir o efeito a uma mudança específica.',
      ],
    ],
    'b',
    'O estado anterior precisa ser conhecido antes da ação.',
  ),
  q(
    'net-r04',
    'i-sla',
    'escalonar',
    'OPS-HANDOFF',
    'independent',
    'Como comunicar o prazo sem inventar acordo?',
    'O usuário pede previsão; você não tem acesso à política/SLA e ainda investiga a causa.',
    [
      [
        'Informar o estado, responsável e próximo retorno a confirmar pela política, sem prometer restauração não sustentada.',
        'Distingue acompanhamento de um prazo de solução que não foi estabelecido.',
      ],
      [
        'Prometer exatamente dez minutos porque parece rápido.',
        'Não há base técnica nem contratual para essa promessa.',
      ],
      [
        'Dizer que o serviço foi restaurado para acalmar o usuário.',
        'Contradiz o estado da investigação e oculta o impacto.',
      ],
    ],
    'a',
    'É possível dar próximo passo sem inventar prazo de correção.',
  ),
  q(
    'net-r04',
    'r-time',
    'registro',
    'OPS-EVIDENCE',
    'review',
    'O que acrescentar para correlacionar estes eventos?',
    'Cliente registra 10:00; servidor registra 13:00; fusos e sincronização não foram informados.',
    [
      [
        'Concluir que o servidor só recebeu três horas depois.',
        'Sem contexto de relógio, a diferença pode não ser atraso de transporte.',
      ],
      ['Assumir que todos os logs usam o mesmo fuso.', 'A hipótese não foi confirmada.'],
      [
        'Fuso, origem e sincronização dos relógios antes de ordenar os eventos.',
        'A comparação temporal requer contexto compatível.',
      ],
    ],
    'c',
    'Relógios diferentes não devem ser comparados como se fossem um só.',
  ),
  q(
    'net-r04',
    'r-condition',
    'runbook',
    'OPS-RUNBOOK',
    'review',
    'Qual acréscimo torna “testar DNS” reproduzível?',
    'O documento tem apenas esse verbo e não informa o ambiente.',
    [
      [
        'Nome alvo, resolvedor, origem, resultado esperado e próxima ação para timeout ou resposta negativa.',
        'Define pergunta e condições para interpretar o resultado.',
      ],
      ['Uma lista de marcas de roteadores.', 'Não preenche alvo nem critério do teste.'],
      [
        'A frase “usar bom senso” no encerramento.',
        'Não substitui critérios concretos nem pré-condições.',
      ],
    ],
    'a',
    'Outra pessoa precisa saber o que executar e comparar.',
  ),
  q(
    'net-r04',
    'r-validate',
    'mudanca',
    'OPS-VALIDATION',
    'review',
    'Qual é o estado correto do atendimento?',
    'Após corrigir resolução, nslookup responde. O usuário não está disponível para repetir a operação afetada.',
    [
      [
        'Resolvido em definitivo, porque um comando respondeu.',
        'Falta validar a tarefa original e possíveis condições específicas.',
      ],
      [
        'Configuração/resolução verificadas; validação funcional pendente com próximo responsável.',
        'Registra progresso real sem criar um teste inexistente.',
      ],
      [
        'Nenhuma evidência existe e todos os registros devem ser apagados.',
        'Os resultados coletados continuam úteis com seus limites.',
      ],
    ],
    'b',
    'Não apague o que se sabe nem invente o que falta.',
  ),
  q(
    'net-r04',
    'r-portfolio',
    'escalonar',
    'OPS-HANDOFF',
    'review',
    'Qual descrição do portfólio é honesta?',
    'Você resolveu o caso sintético da plataforma e exportou um runbook, sem executar em equipamento real.',
    [
      [
        '“Implantação corporativa validada.”',
        'Não corresponde ao ambiente nem ao nível de verificação.',
      ],
      [
        '“Domínio de toda a operação NOC.”',
        'Um caso finito não demonstra toda uma função profissional.',
      ],
      [
        '“Análise de cenário simulado; decisões corrigidas localmente e documento autoral ainda sem revisão externa.”',
        'Identifica ambiente, resultado e limite sem diminuir o valor do estudo.',
      ],
    ],
    'c',
    'Nomeie o que foi executado e o que ainda não foi verificado.',
  ),
  q(
    'net-r04',
    'm-proof',
    'registro',
    'OPS-EVIDENCE',
    'remediation',
    'O que fortalece uma evidência além de mencionar o comando?',
    'Ticket diz apenas “executei ping”.',
    [
      [
        'Destino, horário, origem e output relevante, acompanhados de interpretação.',
        'Permite situar e conferir a observação.',
      ],
      ['Escrever “ping” dez vezes.', 'Repetição não fornece o resultado ausente.'],
      ['Adicionar uma senha administrativa.', 'É dado sensível desnecessário, não prova do teste.'],
    ],
    'a',
    'O leitor precisa saber qual comportamento foi observado.',
  ),
  q(
    'net-r04',
    'm-safe',
    'runbook',
    'OPS-RUNBOOK',
    'remediation',
    'Qual condição deve aparecer antes de uma ação de alteração?',
    'O runbook propõe mudar parâmetros da interface.',
    [
      ['Somente a cor do terminal.', 'Não define se a execução é adequada ou autorizada.'],
      [
        'Ambiente, autorização, estado anterior, impacto e critério de parada.',
        'São pré-condições para uma execução controlada e com limites conhecidos.',
      ],
      [
        'Obrigação de executar em qualquer computador disponível.',
        'Ignora escopo, permissão e riscos operacionais.',
      ],
    ],
    'b',
    'Procedimento não equivale a autorização.',
  ),
  q(
    'net-r04',
    'm-service',
    'mudanca',
    'OPS-VALIDATION',
    'remediation',
    'Qual teste final é compatível com o problema original?',
    'Usuário não conseguia exportar relatório após login; ping do gateway responde depois.',
    [
      [
        'Outro ping para o mesmo gateway, apenas.',
        'Pode repetir a observação local, mas continua sem representar a exportação.',
      ],
      [
        'Nenhum teste, porque a configuração parece correta.',
        'A aparência da configuração não valida o serviço.',
      ],
      [
        'Repetir a exportação autorizada e registrar resultado, mantendo dados sensíveis protegidos.',
        'Exercita a operação que falhava e fornece evidência funcional.',
      ],
    ],
    'c',
    'Volte ao verbo usado pelo usuário no relato.',
  ),
  q(
    'net-r04',
    'm-message',
    'escalonar',
    'OPS-HANDOFF',
    'remediation',
    'Qual mensagem ao usuário preserva a incerteza?',
    'A equipe recebeu os dados, mas a causa segue aberta.',
    [
      [
        '“Encaminhamos os testes ao responsável; a investigação continua e informaremos o próximo retorno.”',
        'Explica estado e continuidade sem inventar causa ou solução.',
      ],
      [
        '“Foi invasão confirmada.”',
        'O cenário não fornece evidência que sustente essa classificação.',
      ],
      [
        '“Já resolveu”, sem repetir a operação.',
        'Oculta validação pendente e pode encerrar indevidamente o atendimento.',
      ],
    ],
    'a',
    'Linguagem simples também deve continuar verdadeira.',
  ),
];
