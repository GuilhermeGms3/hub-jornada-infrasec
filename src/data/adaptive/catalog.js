const levelLabels = ['Comecando', 'Base em formacao', 'Pratica guiada', 'Competencia demonstrada'];

const domains = {
  network: {
    title: 'Redes', page: 'network-practice', prepPage: 'journey', prepLabel: 'Voltar ao plano de redes',
    next: 'Entender IP, gateway e DNS antes de configurar roteadores.',
    glossary: ['IP = endereco do dispositivo', 'Gateway = saida para outra rede', 'DNS = traduz nome para IP']
  },
  operations: {
    title: 'Help Desk e NOC', page: 'helpdesk-noc', prepPage: 'week-one', prepLabel: 'Fazer a Semana 1',
    next: 'Aprender a separar sintoma, hipotese, evidencia e correcao.',
    glossary: ['Sintoma = o que o usuario percebe', 'Evidencia = dado que testa uma hipotese', 'Escalar = passar com contexto']
  },
  linux: {
    title: 'Linux e Git', page: 'linux-guide', prepPage: 'linux-guide', prepLabel: 'Abrir o guia basico',
    next: 'Praticar navegacao, arquivos e permissoes antes dos desafios.',
    glossary: ['Shell = interface de comandos', 'Diretorio = pasta', 'Permissao = quem pode ler, escrever ou executar']
  },
  security: {
    title: 'Seguranca e SOC', page: 'soc', prepPage: 'dependencies', prepLabel: 'Revisar dependencias',
    next: 'Diferenciar login, permissao, log e alerta antes de investigar incidentes.',
    glossary: ['Log = registro de um evento', 'Alerta = regra que destacou um evento', 'IOC = indicador relevante para a investigacao']
  },
  cloud: {
    title: 'Cloud', page: 'cloud', prepPage: 'dependencies', prepLabel: 'Revisar rede primeiro',
    next: 'Entender rede, identidade e responsabilidade compartilhada antes de criar recursos.',
    glossary: ['Cloud = infraestrutura consumida como servico', 'VPC/VNet = rede virtual', 'IAM/RBAC = controle de acesso']
  },
  architecture: {
    title: 'Arquitetura', page: 'architecture', prepPage: 'journey', prepLabel: 'Revisar o fluxo basico',
    next: 'Seguir uma requisicao de cliente para DNS, aplicacao e dados.',
    glossary: ['Componente = parte do sistema', 'Dependencia = algo necessario para funcionar', 'Fluxo = ordem percorrida pela requisicao']
  },
  career: {
    title: 'Carreira e portfolio', page: 'portfolio', prepPage: 'today', prepLabel: 'Voltar para a missao atual',
    next: 'Concluir uma evidencia pequena antes de pensar em uma vaga inteira.',
    glossary: ['Entregavel = prova concreta do estudo', 'Portfolio = conjunto de evidencias', 'Rubrica = criterio usado na avaliacao']
  },
  english: {
    title: 'Ingles tecnico', page: 'english', prepPage: 'english', prepLabel: 'Abrir ingles basico',
    next: 'Aprender cinco termos por semana e usa-los em um ticket curto.',
    glossary: ['Issue = problema', 'Evidence = evidencia', 'Resolution = resolucao']
  }
};

const pageRequirements = {
  dependencies: ['network', 0], 'network-practice': ['network', 1], 'packet-tracer': ['network', 1],
  'weekly-overview': ['network', 0], 'weekly-tasks': ['network', 0], 'week-one': ['network', 0],
  'helpdesk-noc': ['operations', 1], 'ticket-simulator': ['operations', 0], 'validated-labs': ['operations', 1],
  'linux-guide': ['linux', 0], terminal: ['linux', 1], soc: ['security', 1], cloud: ['cloud', 1],
  architecture: ['architecture', 1], certifications: ['career', 0], 'cert-practice': ['career', 1],
  portfolio: ['career', 0], readiness: ['career', 0], simulations: ['career', 0], interview: ['career', 1],
  english: ['english', 0]
};

const questions = [
  ['network', 'Para que serve um endereco IP?', ['Nao sei ainda', 'Identificar um dispositivo em uma rede IP', 'Guardar a senha do Wi-Fi', 'Traduzir nomes de sites'], 1],
  ['network', 'Um site abre pelo IP, mas nao pelo nome. Qual servico merece ser testado primeiro?', ['Nao sei ainda', 'DHCP', 'DNS', 'Bluetooth'], 2],
  ['operations', 'Ao receber "a internet caiu", qual e o melhor primeiro passo?', ['Nao sei ainda', 'Reiniciar tudo', 'Descobrir escopo, horario e sintoma exato', 'Trocar o roteador'], 2],
  ['operations', 'O que torna um ticket util para outra pessoa?', ['Nao sei ainda', 'Muitos termos dificeis', 'Evidencias, impacto, acao e resultado', 'Somente a frase "resolvido"'], 2],
  ['linux', 'Qual comando mostra o diretorio atual no Linux?', ['Nao sei ainda', 'pwd', 'rm', 'chmod'], 1],
  ['linux', 'Em permissoes Linux, o que significa a letra r?', ['Nao sei ainda', 'Reiniciar', 'Rotear', 'Ler'], 3],
  ['security', 'Autenticacao responde qual pergunta?', ['Nao sei ainda', 'Quem e voce?', 'Quanto custa?', 'Qual rota usar?'], 1],
  ['security', 'Varias falhas de login em contas diferentes vindas do mesmo IP sao...', ['Nao sei ainda', 'Prova definitiva de malware', 'Um sinal para investigar', 'Sempre normais'], 2],
  ['cloud', 'No modelo de responsabilidade compartilhada, o cliente ainda precisa proteger...', ['Nao sei ainda', 'Identidades, configuracoes e dados', 'O predio do provedor', 'Os cabos submarinos'], 1],
  ['cloud', 'VPC na AWS e VNet no Azure representam principalmente...', ['Nao sei ainda', 'Uma rede virtual', 'Um banco de dados', 'Uma certificacao'], 1],
  ['architecture', 'Em uma aplicacao web simples, qual fluxo faz mais sentido?', ['Nao sei ainda', 'Banco -> teclado -> DNS', 'Navegador -> DNS/rede -> aplicacao -> dados', 'Firewall -> mouse -> impressora'], 2],
  ['architecture', 'Uma dependencia e...', ['Nao sei ainda', 'Algo que o componente precisa para funcionar', 'Um erro obrigatorio', 'Um tipo de usuario'], 1],
  ['career', 'Qual item e melhor evidencia de portfolio?', ['Nao sei ainda', 'Uma lista de tecnologias', 'Um lab com objetivo, comandos, resultado e aprendizado', 'Dizer que estudou muito'], 2],
  ['career', 'Antes de marcar uma certificacao, o melhor sinal e...', ['Nao sei ainda', 'Ter visto o nome dos assuntos', 'Conseguir explicar, praticar e revisar erros de simulados limpos', 'Decorar dumps'], 2],
  ['english', 'Em um ticket, "root cause" significa...', ['Nao sei ainda', 'Causa raiz', 'Usuario final', 'Rede publica'], 1],
  ['english', 'A frase "the request timed out" indica que...', ['Nao sei ainda', 'A solicitacao excedeu o tempo de espera', 'A senha foi alterada', 'O arquivo foi salvo'], 1]
];

export const adaptiveCatalog = Object.freeze({ levelLabels, domains, pageRequirements, questions });
