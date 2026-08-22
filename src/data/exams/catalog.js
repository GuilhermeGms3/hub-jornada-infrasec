const q = (prompt, options, correct, explanation) => ({ prompt, options, correct, explanation });

const sources = {
  network: ['Topicos oficiais CCNA 200-301 v1.1', 'https://learningcontent.cisco.com/documents/marketing/exam-topics/200-301-CCNA-v1.1.pdf'],
  operations: ['Pratica operacional do hub', '#helpdesk-noc'],
  linux: ['Objetivos oficiais LPI Linux Essentials', 'https://www.lpi.org/our-certifications/linux-essentials-overview/'],
  security: ['Guia oficial Microsoft SC-900', 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-900'],
  cloud: ['Guia oficial AWS CLF-C02', 'https://docs.aws.amazon.com/aws-certification/latest/cloud-practitioner-02/cloud-practitioner-02.html'],
  architecture: ['Arquitetura pratica do hub', '#arquitetura'],
  career: ['Rubricas e evidencias do hub', '#portfolio'],
  english: ['Ingles tecnico do hub', '#ingles']
};

const banks = {
  network: {
    foundation: [
      q('Qual elemento identifica logicamente um host em uma rede IPv4?', ['Endereco MAC', 'Endereco IP', 'Nome do usuario', 'Porta do switch'], 1, 'O IP identifica logicamente o host e permite encaminhamento entre redes; o MAC atua no enlace local.'),
      q('Qual servico entrega automaticamente IP, mascara, gateway e DNS a um cliente?', ['DHCP', 'HTTP', 'SSH', 'ARP'], 0, 'DHCP fornece parametros de rede. ARP apenas resolve IP para MAC na rede local.'),
      q('Qual e a principal funcao do gateway padrao?', ['Traduzir nomes', 'Encaminhar trafego para outras redes', 'Criar usuarios', 'Armazenar paginas'], 1, 'O host envia ao gateway os destinos que nao pertencem a sua rede local.'),
      q('O que o DNS normalmente retorna ao consultar um nome de site?', ['Uma senha', 'Um endereco IP', 'Uma VLAN', 'Uma mascara aleatoria'], 1, 'DNS relaciona nomes a registros, como enderecos IPv4 ou IPv6.')
    ],
    applied: [
      q('O gateway responde e 1.1.1.1 responde, mas example.com nao resolve. Qual hipotese vem primeiro?', ['Falha de DNS', 'Cabo desconectado', 'Gateway ausente', 'Placa sem IP'], 0, 'Conectividade local e externa por IP funcionam; a diferenca e a resolucao de nomes.'),
      q('Um host recebeu 169.254.20.8/16. O que deve ser investigado primeiro?', ['Servidor ou caminho ate o DHCP', 'Registro DNS do site', 'Senha do roteador', 'Horario do sistema'], 0, 'APIPA indica que o cliente nao obteve concessao DHCP.'),
      q('Dois PCs estao na mesma VLAN e sub-rede, mas um nao pinga o outro. Qual verificacao inicial e mais util?', ['Portas, VLAN de acesso, IP e mascara', 'Configurar OSPF', 'Criar NAT', 'Trocar o DNS publico'], 0, 'O problema esta no dominio local; configuracoes de camada 2 e enderecamento devem ser verificadas antes de roteamento.'),
      q('Um traceroute para apos o primeiro roteador. O que esse resultado prova?', ['Que o DNS esta perfeito', 'Que o caminho funciona ate o primeiro salto e falha depois dele', 'Que o servidor final esta desligado', 'Que existe malware'], 1, 'O traceroute delimita onde as respostas deixam de voltar, mas nao prova sozinho a causa final.')
    ]
  },
  operations: {
    foundation: [
      q('Qual frase descreve melhor um sintoma?', ['A causa confirmada', 'O comportamento percebido pelo usuario ou monitoramento', 'A correcao aplicada', 'O nome do tecnico'], 1, 'Sintoma e o que foi percebido. Causa raiz exige investigacao e evidencia.'),
      q('Antes de reiniciar um servico indisponivel, o tecnico deveria...', ['Coletar estado, logs, horario e impacto', 'Apagar os logs', 'Fechar o ticket', 'Trocar todas as senhas'], 0, 'Coletar evidencias antes da mudanca evita destruir contexto e permite validar a hipotese.'),
      q('Quando um chamado deve ser escalado?', ['Sempre imediatamente', 'Quando excede acesso, competencia, impacto ou SLA do nivel atual', 'Somente quando o usuario reclama duas vezes', 'Nunca'], 1, 'Escalonamento responsavel inclui contexto quando o caso ultrapassa o limite de atuacao.'),
      q('Qual informacao e essencial ao encerrar um ticket?', ['Somente "resolvido"', 'Causa, acao, teste depois e resultado', 'Opiniao sobre o usuario', 'Uma captura sem contexto'], 1, 'O encerramento deve permitir auditoria e repeticao da solucao.')
    ],
    applied: [
      q('Dez usuarios de uma VLAN perderam acesso, mas outras VLANs funcionam. Qual e o melhor escopo inicial?', ['Toda a internet', 'A VLAN, seu trunk e gateway', 'O computador de um unico usuario', 'O DNS mundial'], 1, 'O padrao de impacto aponta para o dominio compartilhado pela VLAN afetada.'),
      q('Um usuario nao navega por nome, mas ping por IP funciona. Qual conjunto de evidencias e mais objetivo?', ['nslookup e configuracao DNS', 'Uso de CPU e brilho da tela', 'show version e horario', 'Senha do Wi-Fi de outro setor'], 0, 'nslookup e o servidor DNS configurado testam diretamente a hipotese de resolucao.'),
      q('Apos corrigir uma porta de switch, qual validacao fecha melhor o incidente?', ['Ver apenas a configuracao', 'Repetir o teste do usuario e registrar estado antes/depois', 'Aguardar sem testar', 'Reiniciar o switch novamente'], 1, 'A validacao deve reproduzir o servico afetado, nao apenas mostrar que um comando foi aceito.'),
      q('Um incidente critico depende de uma equipe externa. O ticket deve conter...', ['Somente prioridade critica', 'Impacto, linha do tempo, evidencias, acoes e responsavel atual', 'Uma lista de tecnologias', 'Nenhuma hipotese'], 1, 'Esse contexto reduz retrabalho e preserva responsabilidade durante o escalonamento.')
    ]
  },
  linux: {
    foundation: [
      q('Qual comando mostra o diretorio de trabalho atual?', ['pwd', 'ps', 'grep', 'sudo'], 0, 'pwd significa print working directory.'),
      q('Qual comando lista arquivos incluindo ocultos, com detalhes?', ['ls -la', 'cd /', 'rm -rf', 'echo'], 0, 'ls -la combina formato longo e exibicao de entradas ocultas.'),
      q('Na permissao rwx, a letra x representa...', ['Leitura', 'Escrita', 'Execucao', 'Exclusao'], 2, 'x permite executar um arquivo ou atravessar um diretorio.'),
      q('Qual ferramenta procura um padrao de texto em arquivos ou entrada?', ['grep', 'mkdir', 'chmod', 'uname'], 0, 'grep filtra linhas que correspondem a um padrao.')
    ],
    applied: [
      q('Um servico falhou ao iniciar. Qual sequencia preserva melhor a investigacao?', ['systemctl status, journalctl da unidade, validar configuracao', 'reboot, apagar logs, tentar novamente', 'chmod 777 em tudo', 'desinstalar o sistema'], 0, 'Estado, logs e validacao da configuracao testam causas sem ampliar o impacto.'),
      q('Qual comando ajuda a verificar portas TCP/UDP em escuta?', ['ss -lntup', 'pwd', 'whoami', 'cp -r'], 0, 'ss mostra sockets e, com essas opcoes, portas em escuta e processos quando permitido.'),
      q('Um arquivo deve ser lido e escrito apenas pelo dono. Qual permissao numerica e adequada?', ['777', '600', '755', '444'], 1, '600 concede leitura e escrita ao dono e nenhuma permissao aos demais.'),
      q('Antes de fazer commit, qual comando mostra as alteracoes de conteudo ainda nao preparadas?', ['git diff', 'git clone', 'git init', 'git push --force'], 0, 'git diff ajuda a revisar a mudanca antes de prepara-la e registra-la.')
    ]
  },
  security: {
    foundation: [
      q('Autorizacao determina...', ['Quem o usuario afirma ser', 'O que uma identidade autenticada pode acessar', 'A velocidade da rede', 'O endereco do DNS'], 1, 'Autenticacao valida identidade; autorizacao decide permissoes.'),
      q('Qual principio concede somente as permissoes necessarias?', ['Menor privilegio', 'Acesso publico', 'Senha compartilhada', 'Confianca implicita'], 0, 'Menor privilegio reduz impacto de erro ou comprometimento.'),
      q('Qual e a diferenca mais correta entre log e alerta?', ['Sao sempre iguais', 'Log registra evento; alerta destaca uma condicao relevante', 'Alerta armazena backup', 'Log bloqueia usuarios'], 1, 'Alertas normalmente sao gerados a partir de eventos ou correlacoes de logs.'),
      q('MFA reduz principalmente o risco de...', ['Uso de uma senha comprometida como unico fator', 'Falha de energia', 'Cabo rompido', 'Disco cheio'], 0, 'Um segundo fator dificulta o uso isolado de credenciais roubadas.')
    ],
    applied: [
      q('Um IP tenta uma senha comum em muitas contas. Qual classificacao e mais provavel?', ['Password spraying', 'Backup normal', 'Varredura de porta apenas', 'Falha de DNS'], 0, 'Password spraying distribui poucas senhas entre varias contas para evitar bloqueios por conta.'),
      q('Apos falhas de login, a mesma conta obteve sucesso de um pais incomum. Qual proximo passo e mais defensavel?', ['Ignorar porque houve sucesso', 'Validar contexto, conter sessao/conta e preservar evidencias', 'Apagar os logs', 'Bloquear toda a internet'], 1, 'O sucesso apos tentativas e a mudanca de contexto aumentam o risco e justificam contencao proporcional.'),
      q('Qual item sozinho NAO deve ser tratado como prova de ataque?', ['Um IP listado sem contexto', 'Uma cadeia de processo suspeita correlacionada', 'Login impossivel geograficamente com sessao ativa', 'Hash malicioso confirmado no host'], 0, 'Um indicador precisa de contexto, fonte, tempo e correlacao para sustentar conclusao.'),
      q('Um alerta foi falso positivo. O que deve acontecer?', ['Desativar todos os alertas', 'Documentar a causa e ajustar a regra sem perder cobertura', 'Apagar o caso', 'Classificar como incidente critico'], 1, 'Ajuste controlado reduz ruido mantendo capacidade de deteccao.')
    ]
  },
  cloud: {
    foundation: [
      q('Qual modelo entrega aplicacao pronta ao usuario, enquanto o provedor gerencia a pilha?', ['IaaS', 'PaaS', 'SaaS', 'On-premises'], 2, 'SaaS entrega o software como servico com a maior parte da pilha gerenciada pelo provedor.'),
      q('Qual componente representa uma rede virtual isolada na AWS?', ['VPC', 'S3', 'IAM User', 'CloudTrail'], 0, 'VPC organiza enderecamento, sub-redes, rotas e controles de rede.'),
      q('No modelo compartilhado, quem configura permissoes de identidades do cliente?', ['Sempre o provedor', 'O cliente', 'O fabricante do notebook', 'O DNS publico'], 1, 'O cliente continua responsavel por identidades, dados e configuracoes de seus recursos.'),
      q('Duas zonas de disponibilidade na mesma regiao ajudam principalmente em...', ['Alta disponibilidade', 'Traducao DNS local', 'Criacao de senhas', 'Licenciamento de usuario'], 0, 'Distribuir cargas entre zonas reduz dependencia de um unico local fisico.')
    ],
    applied: [
      q('Uma VM aceita SSH de 0.0.0.0/0. Qual melhoria segue menor privilegio?', ['Permitir somente origem administrativa via VPN/Bastion', 'Liberar todas as portas', 'Desativar logs', 'Mover para outra regiao sem alterar regra'], 0, 'Restringir origem e usar acesso administrativo controlado reduz exposicao.'),
      q('Uma funcao precisa ler apenas um bucket. Qual politica e melhor?', ['Administrador total', 'Permissao de leitura no bucket especifico', 'Acesso anonimo', 'Credencial raiz embutida'], 1, 'A acao e o recurso devem ser limitados ao requisito real.'),
      q('Qual servico ou recurso ajuda a detectar aumento inesperado de gasto?', ['Budget/alerta de custo', 'Tabela de rotas', 'Grupo de seguranca', 'Registro DNS A'], 0, 'Orcamentos e alertas de custo monitoram consumo financeiro contra limites.'),
      q('Um recurso privado precisa baixar atualizacoes sem aceitar conexoes iniciadas da internet. Qual desenho e coerente?', ['Subnet privada com saida controlada por NAT', 'IP publico aberto', 'Remover toda rota', 'Liberar SSH mundial'], 0, 'NAT permite saida iniciada internamente sem publicar diretamente o recurso.')
    ]
  },
  architecture: {
    foundation: [
      q('Em um sistema web simples, qual componente normalmente recebe a requisicao do navegador?', ['Aplicacao/API ou servidor web', 'Teclado do banco', 'Impressora', 'Compilador local'], 0, 'A camada de entrada recebe HTTP e encaminha o processamento.'),
      q('Uma dependencia e...', ['Um componente ou servico necessario para outro funcionar', 'Um erro planejado', 'Uma senha publica', 'Uma tela decorativa'], 0, 'Dependencias formam o grafo operacional do sistema.'),
      q('Qual telemetria mede quantas requisicoes falham?', ['Taxa de erros', 'Cor do servidor', 'Quantidade de usuarios cadastrados apenas', 'Nome do repositorio'], 0, 'Taxa de erro e um sinal operacional junto com latencia e trafego.'),
      q('Separar apresentacao, aplicacao e dados ajuda principalmente a...', ['Entender responsabilidades e dominios de falha', 'Eliminar toda latencia', 'Evitar qualquer banco', 'Dispensar seguranca'], 0, 'Camadas tornam dependencias e responsabilidades mais explicitas.')
    ],
    applied: [
      q('A API retorna 500, o banco esta saudavel e o log mostra "secret not found". Qual dominio falhou?', ['Configuracao/segredos da aplicacao', 'DNS do usuario', 'Cabo do monitor', 'Banco obrigatoriamente'], 0, 'A evidencia aponta para configuracao necessaria a aplicacao, nao para saude do banco.'),
      q('Retries sem limite durante uma indisponibilidade podem causar...', ['Amplificacao de carga e falha em cascata', 'Menos trafego sempre', 'Correcao automatica garantida', 'Eliminacao de timeout'], 0, 'Retries precisam de limite, backoff e jitter para nao amplificar falhas.'),
      q('Usuarios recebem dados antigos apenas apos ativar cache. Qual hipotese e mais direta?', ['Politica de expiracao ou invalidacao do cache', 'Falha fisica do teclado', 'Problema de VLAN obrigatorio', 'Senha expirada'], 0, 'Staleness apos cache aponta para TTL ou invalidacao inadequados.'),
      q('Por que usar uma fila entre produtor e consumidor?', ['Desacoplar ritmo e absorver picos', 'Garantir latencia zero', 'Eliminar observabilidade', 'Substituir identidade'], 0, 'Filas desacoplam processamento, mas exigem tratamento de repeticao, atraso e falha.')
    ]
  },
  career: {
    foundation: [
      q('Qual portfolio prova melhor uma habilidade?', ['Lista de nomes de ferramentas', 'Lab com objetivo, evidencia, resultado e aprendizado', 'Print sem contexto', 'Curriculo com muitas palavras-chave'], 1, 'Evidencia contextualizada permite avaliar raciocinio e execucao.'),
      q('Por que dumps de certificacao nao sao uma boa estrategia?', ['Porque prejudicam aprendizado e podem violar regras do exame', 'Porque toda prova e gratuita', 'Porque labs nao existem', 'Porque respostas corretas nao importam'], 0, 'Dumps incentivam memorizacao de itens possivelmente sigilosos e nao demonstram competencia.'),
      q('Um README de lab deveria comecar por...', ['Objetivo e contexto', 'Uma lista de emojis', 'A resposta final sem passos', 'Dados pessoais'], 0, 'Objetivo e contexto explicam o problema que a evidencia pretende resolver.'),
      q('Qual item ajuda um recrutador a reproduzir um projeto?', ['Pre-requisitos e instrucoes de execucao', 'Somente o nome do autor', 'Uma imagem sem legenda', 'Uma nota dizendo que funcionou'], 0, 'Execucao reproduzivel aumenta a confianca no artefato.')
    ],
    applied: [
      q('Para uma vaga NOC junior, qual trio de evidencias e mais coerente?', ['Troubleshooting de rede, ticket e lab de monitoramento', 'Tres clones sem alteracao', 'Somente curso de design', 'Lista de linguagens sem projetos'], 0, 'As evidencias devem corresponder ao trabalho esperado na vaga.'),
      q('Ao explicar um incidente em entrevista, qual estrutura e mais clara?', ['Contexto, acao, evidencia, resultado e aprendizado', 'Tecnologias aleatorias', 'Somente a causa', 'Culpar outro time'], 0, 'Uma narrativa verificavel mostra raciocinio, responsabilidade e resultado.'),
      q('Voce erra subnetting repetidamente em simulados. Qual proximo passo?', ['Voltar ao conceito, resolver exercicios e registrar os erros', 'Agendar a prova imediatamente', 'Usar dumps', 'Ignorar porque a media geral subiu'], 0, 'Lacunas recorrentes devem retornar ao ciclo de estudo e pratica.'),
      q('Qual certificacao deve ter prioridade?', ['A que se conecta a vaga alvo e a pratica que voce consegue demonstrar', 'Sempre a mais cara', 'A com o logo mais bonito', 'Todas ao mesmo tempo'], 0, 'Certificacao complementa uma estrategia de entrada e nao substitui evidencia.')
    ]
  },
  english: {
    foundation: [
      q('Em um ticket, "issue" significa...', ['Problema ou ocorrencia', 'Senha', 'Roteador', 'Custo'], 0, 'Issue e usado para descrever o problema acompanhado.'),
      q('"Root cause" significa...', ['Causa raiz', 'Usuario final', 'Proximo salto', 'Arquivo temporario'], 0, 'Root cause e a causa subjacente confirmada pela investigacao.'),
      q('"Resolution" em um incidente significa...', ['Resolucao aplicada', 'Pergunta inicial', 'Endereco IP', 'Tempo limite'], 0, 'Resolution registra como o servico foi restaurado ou o problema resolvido.'),
      q('"The request timed out" indica que...', ['A solicitacao excedeu o tempo de espera', 'O usuario alterou a senha', 'O arquivo foi apagado', 'O switch criou uma VLAN'], 0, 'Timeout ocorre quando a resposta nao chega dentro do limite esperado.')
    ],
    applied: [
      q('Qual frase e mais adequada para o resumo de um ticket?', ['Users in VLAN 20 cannot resolve internal hostnames since 09:10.', 'Network bad.', 'Everything is broken maybe.', 'I clicked many things.'], 0, 'A frase identifica escopo, sintoma e horario em linguagem objetiva.'),
      q('"Unable to resolve the hostname" descreve...', ['Falha ao resolver o nome', 'Permissao de arquivo', 'Disco cheio', 'Login bem-sucedido'], 0, 'Resolve hostname refere-se a transformar o nome em endereco, normalmente via DNS.'),
      q('Qual frase comunica escalonamento com evidencia?', ['Escalated to the network team with traceroute and VLAN impact attached.', 'Sent it somewhere.', 'Not my problem.', 'Rebooted everything.'], 0, 'A frase indica destino e contexto entregue no escalonamento.'),
      q('Qual encerramento e mais profissional?', ['Service restored after correcting the DNS server; lookup and user access were validated.', 'Done.', 'It works somehow.', 'User was wrong.'], 0, 'O encerramento registra correcao e validacao sem linguagem acusatoria.')
    ]
  }
};

export const examCatalog = Object.freeze({ sources, banks });
