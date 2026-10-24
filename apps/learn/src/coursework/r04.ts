import type { CourseUnit } from './types';
import { question } from './authoring';
import { r04Questions } from './questions-r04';

export const r04: CourseUnit = {
  id: 'net-r04',
  version: '1.0',
  title: 'Runbooks, incidentes e evidências',
  motivation:
    'Uma investigação só ajuda a equipe se alguém consegue entender o impacto, repetir os testes, distinguir fatos de hipóteses e continuar o atendimento sem refazer tudo. Você vai transformar o raciocínio de rede em um registro profissional verificável.',
  prerequisite:
    'Recomendado: configuração/DHCP na R02 e interpretação de testes na R03. As aulas e o modelo editável são livres; um texto preenchido nunca substitui os critérios objetivos da avaliação.',
  references: [
    {
      title: 'NIST SP 800-61 Rev. 3: resposta a incidentes de segurança',
      url: 'https://csrc.nist.gov/pubs/sp/800/61/r3/final',
    },
    {
      title: 'Microsoft: ipconfig (limites das ações de configuração)',
      url: 'https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/ipconfig',
    },
  ],
  lessons: [
    {
      id: 'registro',
      title: 'Escrever um registro que outra pessoa possa usar',
      objective: 'OPS-EVIDENCE',
      observable:
        'Separar relato, observação, hipótese e conclusão com horário, escopo e procedência.',
      prerequisites: ['NET-SCOPE'],
      vocabulary:
        'Ticket registra um atendimento. Evidência é um dado com origem e contexto. Hipótese é uma explicação provisória. Linha do tempo ordena eventos com fuso/horário definidos; não deve misturar relógios sem identificar a diferença.',
      sections: [
        {
          title: 'Registrar o necessário para reproduzir',
          paragraphs: [
            'Comece por impacto e escopo: quem não consegue fazer qual operação, desde quando e em quais condições. Diferencie o horário informado pelo usuário do horário em que você reproduziu o problema. Registre origem do dado: observação própria, relato, log de sistema ou simulação. Sem essa separação, alguém pode tratar um boato como resultado técnico e tomar uma decisão de impacto desnecessário.',
            'Para cada teste, anote comando ou procedimento, alvo, ambiente, instante e resultado relevante. Uma imagem sem contexto pode esconder qual interface ou destino foi testado; uma lista de comandos sem outputs não comprova execução. Prefira registros curtos, mas completos o suficiente para que outro técnico repita o procedimento no mesmo contexto. Se não executou o teste, marque como proposto, não como realizado.',
          ],
        },
        {
          title: 'O que o dado permite e o que não permite afirmar',
          paragraphs: [
            '“Consulta DNS expirou contra o resolvedor configurado às 10:02” é uma observação. “O servidor está desligado” é uma hipótese que exige evidência adicional. Um bom ticket não precisa esconder a incerteza para parecer profissional: ele informa hipóteses restantes e o teste que pode distingui-las. Ao reunir várias fontes, preserve relações e possíveis divergências em vez de apagar o resultado que não combina com a explicação inicial.',
            'Mensagens, logs e capturas podem conter dados pessoais, nomes internos, tokens e endereços sensíveis. Colete apenas o necessário, use os canais autorizados e redija uma versão anonimizada para portfólio. Guardar uma senha no ticket não melhora a evidência. Em um incidente de segurança, preserve os dados conforme a política de resposta antes de alterar o sistema; não prometa integridade forense com um simples print sem processo de preservação.',
          ],
        },
        {
          title: 'Uma conclusão deve continuar rastreável',
          paragraphs: [
            'Ao fechar uma etapa, conecte conclusão aos dados: “a configuração manual diverge do plano e não houve solicitação DHCP; após mudança autorizada, nova concessão válida e operação reproduzida com sucesso”. A frase permite verificar a sequência. Se a intervenção não aconteceu, mantenha o status em investigação ou encaminhamento, com responsável e próximo passo. Não invente um depois para completar o modelo.',
            'Na plataforma, dados dos laboratórios são sintéticos e escolhas estruturadas são corrigidas automaticamente dentro do cenário. O texto que você edita é um artefato produzido por você; seu tamanho, uso de termos técnicos ou marcação de campos não prova que o procedimento foi executado numa rede real. Essa diferença deve aparecer no relatório exportado e no histórico, evitando transformar exercício de escrita em atestado de competência operacional.',
          ],
        },
      ],
      diagram: [
        'Relato e impacto',
        'Observação com origem e instante',
        'Hipóteses e teste discriminante',
        'Conclusão com limite',
      ],
      example: {
        title: 'Substituir uma conclusão prematura',
        data: 'Relato: portal falha desde 09:50\n10:02 -03:00: nslookup portal.interno contra DNS 10.20.1.53 expira\n10:03 -03:00: TCP 443 ao IP conhecido estabelece\nNenhuma alteração realizada.',
        reasoning: [
          'A resolução falhou no teste; TCP ao IP respondeu em outro teste.',
          'Não foi comprovado estado físico do DNS nem validada a operação por nome.',
          'Registrar hipótese sobre caminho/serviço de resolução e solicitar evidências do responsável.',
        ],
        conclusion:
          'Investigação de resolução encaminhada com outputs e horário; serviço original ainda não validado.',
        limit: 'Não classificar o incidente como resolvido sem repetir a operação afetada.',
      },
      misconception:
        'Um ticket preenchido não prova que seus testes aconteceram; origem e estado da evidência importam.',
      takeaway: 'Escreva para continuidade e reprodução, separando cada tipo de afirmação.',
      recovery:
        'Pinte as frases do ticket em quatro cores: relato, dado observado, hipótese e ação proposta. Se “servidor caiu” não tiver uma fonte verificável, mova para hipótese. Se um campo está sem dado, escreva “não coletado” em vez de criar um número.',
    },
    {
      id: 'runbook',
      title: 'Construir um runbook com decisões',
      objective: 'OPS-RUNBOOK',
      observable:
        'Ordenar passos com pré-condições, resultados esperados, ramificações e critérios de parada.',
      prerequisites: ['NET-TEST-ORDER', 'OPS-EVIDENCE'],
      vocabulary:
        'Runbook é um procedimento operacional reproduzível. Pré-condição define quando ele se aplica. Ramificação muda a próxima ação conforme o resultado. Critério de parada evita continuar em ambiente ou escopo inadequado.',
      sections: [
        {
          title: 'Uma receita útil diz quando não deve ser usada',
          paragraphs: [
            'Defina objetivo e ambiente antes dos comandos: por exemplo, investigar falta de configuração IPv4 em uma estação de laboratório Windows, sem alterar a rede de produção. Liste permissões, versão relevante, interface, ferramenta e dados esperados. Se o sintoma for apenas um erro de negócio após login, o runbook de aquisição DHCP pode não ser a primeira escolha. Reconhecer isso faz parte do procedimento.',
            'Cada passo precisa de uma pergunta e um resultado observável. “Verificar rede” é amplo demais; “coletar ipconfig /all da interface em uso e comparar IPv4, prefixo, gateway, DNS e origem com o plano autorizado” define algo verificável. O resultado esperado não precisa ser sempre sucesso: descobrir uma configuração manual inesperada já é uma observação que orienta a próxima ação.',
          ],
        },
        {
          title: 'Ramificações preservam o raciocínio',
          paragraphs: [
            'Depois da coleta, escreva condições: se há APIPA e DHCP habilitado, investigar obtenção de concessão; se a configuração manual diverge do plano, registrar a divergência antes de alterar; se configuração e caminho IP funcionam, mas consulta expira, seguir a investigação de resolução. Não mande trocar DNS, renovar endereço e reiniciar tudo em sequência fixa para qualquer falha.',
            'Inclua limites por etapa. Ping de gateway respondendo encerra a pergunta sobre aquela resposta, não todo o atendimento. Uma ausência de resposta pode exigir outro teste, em vez de uma correção imediata. O runbook é uma forma de manter decisões coerentes, não de fingir que um conjunto finito de comandos encontra toda causa. Quando a evidência sair do escopo, pare e encaminhe com o contexto preservado.',
          ],
        },
        {
          title: 'Teste o procedimento em um caso controlado',
          paragraphs: [
            'Leia seu runbook como alguém que não participou da redação. Ele identifica o alvo? Se duas interfaces aparecem, diz como escolher? Se o passo falhar, diz o que registrar e para onde ir? Há uma condição que exige autorização? Você consegue repetir o teste final que motivou o chamado? Essas perguntas revelam lacunas que uma lista de ferramentas pode esconder.',
            'A primeira aplicação deve ocorrer em um laboratório ou caso simulado conhecido, com resultado esperado e uma falha induzida controlada. Não transforme esse ensaio em autorização para modificar ambiente alheio. Na atividade desta unidade você pode editar e exportar o modelo; a correção automática avalia decisões do cenário, enquanto a qualidade e execução reais do documento continuam sujeitas a revisão humana.',
          ],
        },
      ],
      diagram: [
        'Pré-condições e escopo',
        'Coleta antes de alterar',
        'Se resultado A → próximo teste A',
        'Se fora do escopo → parar e escalar',
      ],
      example: {
        title: 'Uma ramificação para configuração inesperada',
        data: '1. Ler interface e plano autorizado.\n2. Se manual e divergente: registrar antes; pedir autorização.\n3. Se DHCP + APIPA: verificar alcance/logs de concessão.\n4. Se configuração esperada: testar caminho e serviço.\nParar se não houver acesso/autoridade necessários.',
        reasoning: [
          'A escolha depende do estado coletado.',
          'Alteração e investigação de DHCP não são aplicadas indiscriminadamente.',
          'O procedimento prevê parada e registra a condição observada.',
        ],
        conclusion:
          'A sequência é um mecanismo de decisão, não uma promessa de correção universal.',
        limit:
          'O modelo precisa ser adaptado ao ambiente, política e serviço efetivamente atendidos.',
      },
      misconception:
        'Um runbook não é apenas uma lista de comandos nem um script que deve continuar apesar de evidências contrárias.',
      takeaway: 'Cada passo explica pergunta, método, resultado e próxima decisão.',
      recovery:
        'Pegue “testar DNS” e expanda: qual nome, qual servidor, qual origem, qual resultado esperado e qual próximo passo diante de timeout ou resposta negativa? Se as respostas faltam, o verbo sozinho não orienta uma investigação reproduzível.',
    },
    {
      id: 'mudanca',
      title: 'Validar uma mudança e preparar rollback',
      objective: 'OPS-VALIDATION',
      observable:
        'Escolher intervenção mínima autorizada, teste antes/depois e retorno condicionado.',
      prerequisites: ['OPS-RUNBOOK'],
      vocabulary:
        'Validação confirma o comportamento esperado depois da ação. Rollback é um plano de retorno a um estado anterior conhecido quando aplicável. Autorização estabelece quem pode executar uma intervenção e em qual escopo.',
      sections: [
        {
          title: 'Coletar antes preserva a comparação',
          paragraphs: [
            'Antes de modificar, guarde valores anteriores, hipótese, impacto esperado e quem autorizou. Uma intervenção pode mudar mais do que a tela mostra: liberar DHCP pode encerrar suporte remoto; alterar DNS pode impedir resolução de serviços internos; reiniciar um equipamento pode apagar estado útil e atingir outros usuários. A solução não deve criar um risco maior que o problema investigado.',
            'Escolha uma alteração mínima e ligada à hipótese sustentada. Se duas variáveis forem mudadas juntas, um sucesso posterior pode não revelar qual delas era necessária. Nem toda investigação exige mudar algo: encaminhar um erro de aplicação ao responsável com evidência suficiente pode ser a ação correta de um atendimento de rede. O critério é reduzir risco e aumentar informação, não maximizar a quantidade de ações.',
          ],
        },
        {
          title: 'Validar é repetir o que importava',
          paragraphs: [
            'Depois da ação, repita o teste que falhava nas mesmas condições relevantes. Se o usuário não conseguia emitir uma nota após login, uma resposta de ping não fecha o caso. Teste também efeitos colaterais pertinentes, como acesso a outro serviço interno quando uma configuração de resolução mudou. Registre horário, resultado e se o comportamento é estável no intervalo observado.',
            'Se o teste final não foi realizado, escreva “validação pendente”, mesmo que a configuração pareça correta. Evite registrar “resolvido” apenas porque uma tarefa de alteração terminou sem mensagem de erro. O sucesso de um comando e a recuperação de uma operação são eventos diferentes. Quando for necessário acompanhamento, informe responsável, prazo e condição de reabertura de acordo com a política local.',
          ],
        },
        {
          title: 'Rollback é uma decisão preparada, não uma palavra no formulário',
          paragraphs: [
            'Descreva o estado anterior a restaurar, o gatilho para retorno, os riscos do retorno e quem pode executá-lo. Em uma mudança de opção DHCP, podem existir clientes com diferentes leases e tempos de renovação; reverter um valor no servidor não significa que todos os clientes mudaram imediatamente. Algumas intervenções não têm retorno simples; esse limite precisa ser reconhecido antes da execução, não escondido depois.',
            'Em um laboratório simulado é possível praticar a decisão sem aplicar mudanças reais. No ambiente externo, só execute procedimentos compatíveis com sua autorização, política e possibilidade de recuperação. A plataforma corrige escolhas estruturadas sobre validação e retorno; ela não verifica o estado de um roteador, não confirma que o aluno possui permissão e não transforma a exportação do documento em prova de implantação.',
          ],
        },
      ],
      diagram: [
        'Estado anterior + autorização',
        'Mudança mínima',
        'Repetir operação e verificar efeitos',
        'Aceitar ou executar retorno previsto',
      ],
      example: {
        title: 'Comando terminou, incidente não foi validado',
        data: 'Antes: consulta ao DNS autorizado expira.\nMudança autorizada: corrigir regra de acesso do laboratório.\nDepois: consulta responde.\nOperação do portal por nome: ainda não executada.\nRollback: restaurar regra anterior se aparecer bloqueio indevido, com responsável.',
        reasoning: [
          'A hipótese teve uma evidência favorável: a consulta agora responde.',
          'O serviço original ainda não foi repetido; falta validação funcional.',
          'Registrar esse limite e executar a operação antes de encerrar o incidente.',
        ],
        conclusion: 'Mudança aplicada; recuperação do serviço ainda pendente de confirmação.',
        limit:
          'O exemplo não autoriza alterar firewall real nem comprova todas as operações da aplicação.',
      },
      misconception: '“Comando executado sem erro” não é equivalente a “serviço restaurado”.',
      takeaway:
        'Uma mudança só ganha sentido quando ligada à hipótese, à autorização e à validação do serviço.',
      recovery:
        'Escreva dois resultados: saída do comando de alteração e resultado do teste funcional. Se o segundo não existe, não o substitua por um check de execução. Para rollback, preencha valor anterior, gatilho e responsável; se não conhece o valor anterior, pare antes de prometer retorno.',
    },
    {
      id: 'escalonar',
      title: 'Escalonar e comunicar sem perder o contexto',
      objective: 'OPS-HANDOFF',
      observable:
        'Produzir encaminhamento com impacto, evidências, limites e próximo responsável sem inventar causa ou prontidão.',
      prerequisites: ['OPS-EVIDENCE', 'OPS-VALIDATION'],
      vocabulary:
        'Escalonamento encaminha um caso para a capacidade ou autoridade adequada. SLA é um acordo de níveis de serviço, não um número universal que pode ser inventado. Runbook organiza execução; relatório explica o que aconteceu em um caso.',
      sections: [
        {
          title: 'Escalar é continuar o atendimento com outra capacidade',
          paragraphs: [
            'Escalone quando o caso ultrapassar sua permissão, conhecimento, acesso ou prazo estabelecido pela política. Não espere destruir a sessão de suporte para descobrir que precisava de acesso administrativo. Informe impacto real, escopo conhecido, horários, testes relevantes, alterações realizadas e hipóteses restantes. O próximo técnico deve conseguir escolher uma ação sem pedir novamente tudo que já foi coletado.',
            'Evite classificar severidade ou prazo com um número inventado. Um serviço indisponível pode afetar uma única pessoa, uma operação crítica de vários setores ou um ambiente de treinamento; a prioridade depende do contexto e dos acordos aplicáveis. Se a política não está disponível, registre a necessidade de confirmar prioridade com o responsável, sem apresentar sua estimativa como SLA contratado.',
          ],
        },
        {
          title: 'Duas formas de comunicar o mesmo caso',
          paragraphs: [
            'Para o usuário, explique em linguagem direta o impacto e o próximo passo: “o acesso pelo nome está falhando; encaminhamos os testes para a equipe responsável pela resolução; não foi necessário alterar sua estação”. Para a equipe técnica, forneça os dados suficientes, como servidor consultado, origem, horário e resultados. Reduzir jargão para um público não permite omitir incerteza ou afirmar solução inexistente.',
            'Quando novas evidências chegarem, atualize a linha do tempo e preserve o que mudou. Não reescreva o ticket como se a causa final fosse conhecida desde o início. Um histórico transparente mostra como uma hipótese foi fortalecida, descartada ou substituída. Isso serve tanto à operação quanto ao aprendizado: uma investigação pode ser boa mesmo quando a primeira hipótese estava errada, desde que os testes realmente a tenham colocado à prova.',
          ],
        },
        {
          title: 'Transformar a investigação em entregável profissional',
          paragraphs: [
            'Um entregável útil apresenta objetivo, ambiente, cenário, procedimento, resultados, interpretação, limites e próximos passos. Inclua dados anonimizados e identifique o que foi simulado, observado ou executado num ambiente autorizado. A conclusão deve caber no escopo: resolver um cenário finito aqui não comprova domínio de toda uma função NOC, SOC ou administração de redes.',
            'Use o modelo editável da prática para escrever seu caso e as decisões estruturadas para conferir a lógica. Se trabalhar com a coleta real opcional, solicite revisão do documento e dos outputs por alguém autorizado. A autoavaliação pode orientar revisão, mas não substitui evidência independente. Ao terminar, volte à jornada: registre o que ainda vale revisar e escolha uma atividade compatível, sem usar o tamanho do relatório como medida de competência.',
          ],
        },
      ],
      diagram: [
        'Impacto e escopo',
        'Evidências + mudanças + limites',
        'Responsável e próximo passo',
        'Comunicação ao usuário e acompanhamento',
      ],
      example: {
        title: 'Encaminhamento com causa ainda aberta',
        data: 'Impacto: duas estações não consultam nome interno.\nEvidências: consulta ao DNS configurado expira; acesso TCP ao IP de referência responde.\nAções: nenhuma alteração realizada.\nSolicitação: equipe de resolução verificar serviço/caminho às 10:02 -03:00.\nUsuário: informado de investigação em andamento.',
        reasoning: [
          'O encaminhamento preserva o que foi testado sem declarar servidor desligado.',
          'Identifica qual capacidade é necessária e fornece correlação temporal.',
          'Não fecha o caso nem promete prazo sem política aplicável.',
        ],
        conclusion:
          'O atendimento pode continuar sem perda de contexto e com incertezas explícitas.',
        limit:
          'A equipe que recebe ainda precisa investigar; o ticket não é uma confirmação automática de causa.',
      },
      misconception:
        'Escalonar não é escrever “não sei” e abandonar o caso, nem prometer um SLA que não foi consultado.',
      takeaway:
        'Um bom encaminhamento leva contexto, evidência e próximo passo; um bom portfólio mantém esses limites.',
      recovery:
        'Retire do ticket frases de culpa ou certeza sem prova. Acrescente quem é afetado, qual operação falha, quais testes existem e qual acesso falta. Depois escreva uma mensagem para o usuário sem comandos ou siglas: ela deve continuar verdadeira mesmo que a hipótese inicial seja descartada.',
    },
  ],
  questions: r04Questions,
  lab: {
    title: 'Uma alteração pronta para ser validada?',
    scenario:
      'Cenário sintético: o técnico corrigiu uma configuração do laboratório, mas quer encerrar o chamado usando apenas um ping. Examine evidências e produza um runbook no modelo editável. O documento é autodeclarado; as decisões estruturadas são avaliadas separadamente.',
    outputs: [
      {
        id: 'before',
        label: 'Ler registro anterior',
        output:
          'Operação afetada: exportar relatório autenticado.\nAntes: exportação retorna HTTP 503.\nHipótese inicial: dependência indisponível; causa ainda aberta.',
      },
      {
        id: 'after',
        label: 'Ler validação proposta',
        output:
          'Depois de uma ação autorizada, ping no gateway responde.\nNão há teste de exportação após a ação.',
      },
      {
        id: 'change',
        label: 'Consultar plano de mudança',
        output:
          'Alteração documentada em laboratório; valores anteriores disponíveis.\nResponsável por rollback identificado.\nSe ocorrer regressão, retornar conforme plano aprovado.',
      },
    ],
    required: ['before', 'after'],
    question: question(
      'net-r04',
      'lab-validation',
      'mudanca',
      'OPS-VALIDATION',
      'guided',
      'O chamado pode ser encerrado como resolvido agora?',
      'Compare o teste final com o sintoma original.',
      [
        [
          'Sim, porque qualquer ping valida a exportação.',
          'O ping ao gateway não representa a operação autenticada que falhava.',
        ],
        [
          'Não; repetir a exportação autorizada, registrar resultado e efeitos relevantes antes de encerrar.',
          'A validação deve corresponder ao serviço afetado. Se não puder executar, marcar pendente e encaminhar.',
        ],
        [
          'Sim, se o ticket tiver muitas linhas.',
          'Comprimento do texto não comprova execução ou recuperação.',
        ],
      ],
      'b',
      'O que o usuário não conseguia fazer e o que foi repetido depois?',
    ),
  },
};
