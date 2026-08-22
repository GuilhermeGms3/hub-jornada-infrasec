const component = (id, label, kind, responsibility, io, dependencies, telemetry, failures) => ({
  id, label, kind, responsibility, io, dependencies, telemetry, failures
});

const architectures = [
  {
    id: 'client-server', title: 'Cliente-servidor e fluxo HTTP', level: 'Fundamento',
    goal: 'Seguir uma requisicao do navegador ao banco e separar conectividade, protocolo, aplicacao e dados.',
    components: [
      component('browser', 'Navegador', 'app', 'Monta a requisicao HTTP, envia cookies/tokens e interpreta a resposta.', 'URL e sessao -> requisicao HTTP -> HTML/JSON', 'DNS, conectividade e certificado confiavel', 'DevTools Network, status HTTP, tempo DNS/TCP/TLS', 'Cache local, proxy, certificado, token expirado'),
      component('dns', 'DNS', 'network', 'Traduz o nome do servico para um endereco alcancavel.', 'Nome -> consulta -> IP/CNAME', 'Resolver configurado, zona e registros', 'Tempo de resolucao, NXDOMAIN, SERVFAIL', 'Registro incorreto, TTL antigo, resolver indisponivel'),
      component('edge', 'Firewall / LB', 'security', 'Filtra a entrada, termina TLS e distribui requisicoes para destinos saudaveis.', 'TCP/443 -> politica -> backend', 'Certificado, regras, health checks e rotas', '4xx/5xx, TLS handshake, targets healthy, conexoes', 'Regra bloqueando, certificado vencido, backend unhealthy'),
      component('api', 'API', 'app', 'Autentica, valida entrada e executa a regra de negocio.', 'HTTP/JSON -> regra -> resposta', 'Identidade, configuracao, cache e banco', 'Latencia p95, taxa 5xx, logs correlacionados, saturacao', 'Excecao, secret ausente, pool esgotado, timeout'),
      component('database', 'Banco', 'data', 'Persiste e consulta o estado duravel da aplicacao.', 'Query/transacao -> linhas/confirmacao', 'Rede privada, credencial, schema e capacidade', 'Conexoes, locks, slow queries, CPU, replica lag', 'Credencial, indisponibilidade, lock, schema divergente')
    ],
    flow: ['Usuario informa a URL e o navegador consulta o DNS.', 'O cliente abre TCP/TLS com o endereco retornado.', 'Firewall/LB aplica politica e escolhe um backend saudavel.', 'A API autentica, valida e consulta o banco.', 'A resposta retorna com status, headers e um identificador de correlacao.'],
    runbook: [['Rede', 'nslookup, Test-NetConnection, handshake TLS e health check'], ['Aplicacao', 'status HTTP, request ID, logs da API e dependencias'], ['Dados', 'pool, query, locks e tempo de resposta'], ['Saida', 'teste antes/depois e rollback da mudanca']],
    scenario: 'O portal abre, mas o login retorna HTTP 500. O banco esta saudavel e o Load Balancer mostra o backend como healthy.', impact: 'Todos os usuarios novos nao conseguem iniciar sessao.',
    evidence: [['DevTools Network', 'POST /login -> 500 em 182 ms | x-request-id=req-7f21', true], ['Log da API pelo request ID', 'SecretNotFound: AUTH_SIGNING_KEY | request=req-7f21', true], ['Metricas do banco', 'CPU 18% | connections 21/200 | query p95 12 ms', true], ['Reiniciar o notebook', 'O sintoma permanece no mesmo navegador.', false], ['Tabela ARP do usuario', 'Gateway possui entrada dinamica normal.', false]],
    hypotheses: ['Banco de dados saturado', 'Secret de assinatura ausente na API', 'DNS aponta para endereco errado'], domains: ['Cliente', 'Rede/edge', 'Aplicacao/configuracao', 'Dados'], correct: [1, 2],
    questions: [['Qual evidencia liga o erro ao mesmo fluxo?', ['Endereco MAC', 'Request ID', 'TTL do DNS'], 1], ['Health check verde prova que...', ['Toda funcao da API esta saudavel', 'O teste configurado respondeu, nao todas as dependencias', 'O banco esta consistente'], 1], ['Primeira correcao controlada?', ['Criar/restaurar o secret e reiniciar apenas o workload afetado', 'Apagar o banco', 'Liberar firewall any/any'], 0]],
    terms: ['dns', 'tls', 'request id', '500', 'secret', 'api', 'validacao', 'rollback']
  },
  {
    id: 'layered', title: 'Arquitetura em camadas', level: 'Fundamento',
    goal: 'Localizar responsabilidades e impedir que um sintoma de interface esconda a camada realmente defeituosa.',
    components: [
      component('presentation', 'Apresentacao', 'app', 'Coleta entrada, mostra estado e traduz erros para o usuario.', 'Acao -> chamada -> estado visual', 'Contrato da API e sessao', 'Erros de frontend, Web Vitals, status HTTP', 'Bundle antigo, validacao incorreta, estado inconsistente'),
      component('controller', 'API / Controller', 'app', 'Delimita o contrato, valida formato e devolve status coerente.', 'DTO -> validacao -> comando', 'Autenticacao e servico de dominio', '4xx/5xx por rota, payload invalido, request ID', 'Contrato divergente, validacao ausente, erro mal mapeado'),
      component('domain', 'Servico de dominio', 'app', 'Aplica regras e coordena o caso de uso sem conhecer a interface.', 'Comando -> regra -> resultado', 'Politicas e portas de dados', 'Erros de negocio, duracao do caso de uso', 'Regra regressiva, dependencia lenta, falta de idempotencia'),
      component('repository', 'Repositorio', 'data', 'Traduz as operacoes do dominio para persistencia.', 'Entidade/consulta -> SQL -> entidade', 'Driver, transacao e schema', 'Tempo de query, pool e erros de persistencia', 'N+1, transacao incorreta, campo divergente'),
      component('database', 'Banco / Infra', 'data', 'Armazena dados com integridade e disponibilidade.', 'SQL -> dados duraveis', 'Rede, volume, schema e credencial', 'CPU, IOPS, locks, conexoes e replica', 'Constraint, lock, disco cheio, migration parcial')
    ],
    flow: ['A apresentacao envia um payload conforme o contrato.', 'O controller valida formato, identidade e permissao.', 'O servico aplica a regra de negocio.', 'O repositorio abre a operacao de persistencia.', 'O resultado sobe pelas camadas e vira resposta ao usuario.'],
    runbook: [['Contrato', 'Payload, status e validacao na borda'], ['Dominio', 'Regra acionada e resultado esperado'], ['Persistencia', 'Transacao, query, constraint e schema'], ['Correlacao', 'Mesmo request ID entre controller, service e repository']],
    scenario: 'A tela informa “erro ao salvar”, a API retorna 409 e o banco segue disponivel. A mudanca mais recente adicionou unicidade ao campo email.', impact: 'Novos cadastros com email repetido falham; demais operacoes funcionam.',
    evidence: [['Resposta da API', '409 Conflict | code=EMAIL_ALREADY_EXISTS | request=req-991', true], ['Log do servico', 'CreateUser rejected by business rule: duplicate email', true], ['Log do banco', 'No database error for request=req-991', true], ['CPU do notebook', 'Uso 11%, memoria normal.', false], ['Traceroute para a API', '3 saltos, sem perda.', false]],
    hypotheses: ['Falha de rede entre API e banco', 'Regra de unicidade rejeitou o cadastro', 'Frontend sem acesso ao DNS'], domains: ['Apresentacao', 'Contrato/API', 'Dominio', 'Persistencia/infra'], correct: [1, 2],
    questions: [['HTTP 409 representa melhor...', ['Conflito com o estado atual', 'Timeout de gateway', 'Falha de DNS'], 0], ['Onde a regra de email unico deve ser compreendida?', ['Somente no CSS', 'Dominio e constraint do banco', 'No DNS'], 1], ['Qual resposta melhora suporte?', ['500 generico', '409 com codigo estavel e mensagem segura', '200 mesmo sem salvar'], 1]],
    terms: ['contrato', '409', 'dominio', 'unicidade', 'constraint', 'request id', 'validacao', 'rollback']
  },
  {
    id: 'services', title: 'Monolito versus microsservicos', level: 'Intermediario',
    goal: 'Comparar simplicidade operacional e distribuicao de falhas sem tratar microsservicos como melhoria automatica.',
    components: [
      component('client', 'Cliente', 'app', 'Consome uma capacidade de negocio sem conhecer sua implantacao interna.', 'Pedido -> API -> acompanhamento', 'Contrato e identidade', 'Erros por operacao e tempo total', 'Retry indevido, versao de contrato'),
      component('gateway', 'API Gateway', 'network', 'Roteia, autentica e limita chamadas na entrada.', 'Rota publica -> servico', 'Discovery, politicas e backends', 'Rota, 429, 502/504, latencia', 'Rota errada, rate limit, backend sem target'),
      component('orders', 'Servico Pedidos', 'app', 'Registra o pedido e publica o fato de negocio.', 'POST pedido -> estado PENDING + evento', 'Banco local, broker e idempotencia', '5xx, publish failures, pedidos pendentes', 'Acoplamento sincrono, duplicacao, evento nao publicado'),
      component('queue', 'Fila / Broker', 'observe', 'Amortece picos e desacopla processamento no tempo.', 'Evento -> particao/fila -> consumidor', 'Retencao, DLQ e consumidores', 'Lag, idade, throughput, DLQ', 'Consumidor parado, poison message, retencao curta'),
      component('payment', 'Servico Pagamento', 'app', 'Processa pagamento de forma idempotente.', 'Evento de pedido -> transacao -> evento', 'Gateway financeiro e banco local', 'Erros externos, duplicatas, tempo de processamento', 'Timeout, chave de idempotencia ausente, dependencia externa'),
      component('datastores', 'Dados por servico', 'data', 'Mantem ownership local e evita banco compartilhado entre dominios.', 'Comandos locais -> estado local', 'Schema e migracoes independentes', 'Conexoes, lag de eventos, reconciliacao', 'Dados inconsistentes, migration, leitura obsoleta')
    ],
    flow: ['Gateway envia a criacao ao servico de pedidos.', 'Pedidos persiste PENDING e publica OrderCreated.', 'O broker conserva e entrega o evento.', 'Pagamento processa com chave idempotente e publica o resultado.', 'Pedidos atualiza seu estado por evento, aceitando consistencia eventual.'],
    runbook: [['Monolito', 'Menos saltos e deploy simples; falha pode ter blast radius maior'], ['Microsservicos', 'Ownership e escala independentes; rede e consistencia viram parte do sistema'], ['Fila', 'Lag, idade da mensagem, DLQ e taxa de consumo'], ['Contrato', 'Versao do evento, idempotencia e compatibilidade']],
    scenario: 'Pedidos ficam em PENDING. Criacao retorna 202, pagamentos nao aparecem e o broker acumula mensagens.', impact: 'Pedidos sao aceitos, mas nenhum pagamento conclui desde 14:20.',
    evidence: [['Metrica do broker', 'consumer_lag{payment}=1842 | oldest_message=21m', true], ['Estado do consumidor', 'payment-consumer replicas=0 desired=2 after failed deploy', true], ['DLQ', '0 mensagens; schema dos eventos permanece valido.', true], ['Ping no notebook do cliente', 'Gateway responde em 12 ms.', false], ['Limpar cache do navegador', 'Pedidos anteriores continuam PENDING.', false]],
    hypotheses: ['Consumidor de pagamentos sem replicas', 'Banco de pedidos corrompido', 'DNS do cliente indisponivel'], domains: ['Cliente/edge', 'Servico sincrono', 'Mensageria/processamento assincrono', 'Dados'], correct: [0, 2],
    questions: [['O 202 indica que...', ['O pagamento terminou', 'A requisicao foi aceita para processamento', 'O banco esta inconsistente'], 1], ['Metrica principal para fila acumulada?', ['Consumer lag e idade', 'TTL do DNS', 'Resolucao da tela'], 0], ['Protecao contra evento duplicado?', ['Idempotencia', 'CORS', 'NAT'], 0]],
    terms: ['202', 'consumer lag', 'fila', 'replicas', 'idempotencia', 'consistencia eventual', 'validacao', 'rollback']
  },
  {
    id: 'distributed', title: 'Sistemas distribuidos e resiliencia', level: 'Intermediario',
    goal: 'Raciocinar sobre timeout, retry, cache, concorrencia e observabilidade em varias instancias.',
    components: [
      component('load-balancer', 'Load Balancer', 'network', 'Distribui requisicoes apenas para instancias consideradas saudaveis.', 'Conexao -> algoritmo -> instancia', 'Health check e service registry', 'Targets, 502/504, conexoes e latencia', 'Health check raso, distribuicao desigual'),
      component('replica-a', 'API replica A', 'app', 'Executa a mesma versao do servico de forma descartavel.', 'Request -> processamento', 'Config, cache e banco', 'Versao, erro, saturacao e request ID', 'Config divergente, deploy parcial'),
      component('replica-b', 'API replica B', 'app', 'Compartilha carga sem depender de estado local de sessao.', 'Request -> processamento', 'Sessao externa e configuracao', 'Versao, erro, saturacao e request ID', 'Sessao local, secret antigo, clock skew'),
      component('cache', 'Cache', 'data', 'Reduz latencia com dados temporarios e politica explicita de expiracao.', 'Chave -> hit/miss -> valor', 'TTL, invalidacao e origem', 'Hit ratio, evictions, memoria, latencia', 'Dado obsoleto, stampede, indisponibilidade'),
      component('queue', 'Fila de trabalho', 'observe', 'Move tarefas lentas para processamento resiliente.', 'Job -> ack/retry/DLQ', 'Consumidor, retencao e backoff', 'Lag, retries, DLQ e idade', 'Retry storm, poison message, perda por ack incorreto'),
      component('database', 'Banco primario', 'data', 'Serializa o estado critico com garantias conhecidas.', 'Transacao -> commit', 'Rede, storage e replicas', 'Locks, CPU, IOPS, conexoes', 'Hot row, failover, lock prolongado')
    ],
    flow: ['O LB escolhe uma replica saudavel.', 'A replica consulta cache e usa o banco em cache miss.', 'Tarefas longas sao publicadas na fila.', 'Consumidores processam com retry limitado e idempotencia.', 'Traces unem os saltos e permitem comparar replicas.'],
    runbook: [['Timeout', 'Definir por dependencia e manter budget total'], ['Retry', 'Poucas tentativas, backoff, jitter e apenas operacoes seguras'], ['Cache', 'TTL, invalidacao, hit ratio e fallback'], ['Trace', 'Trace ID, spans, erro por instancia e versao']],
    scenario: 'Metade das requisicoes retorna 500 e metade funciona. As duas replicas constam como healthy apos um deploy gradual.', impact: 'Falha intermitente em todas as regioes clientes, aproximadamente 50%.',
    evidence: [['Erros por instancia', 'api-a 0.2% 5xx | api-b 49.8% 5xx', true], ['Versao e config', 'api-a v2.4 secret=v3 | api-b v2.4 secret=v2', true], ['Trace com falha', 'replica=api-b span=sign-token error=invalid key version', true], ['Media global de CPU', 'CPU media 31%.', false], ['Reinstalar navegador', 'Falha volta de forma intermitente.', false]],
    hypotheses: ['Uma replica manteve secret/config antigo', 'Banco indisponivel para todas as replicas', 'TTL do DNS do cliente'], domains: ['Distribuicao/replicas', 'Cache', 'Fila', 'Banco'], correct: [0, 0],
    questions: [['Por que health check pode ficar verde?', ['Pode testar somente uma rota rasa', 'Sempre valida todos os secrets', 'Ele mede DNS do cliente'], 0], ['Sinal que localiza a falha?', ['Erro agregado apenas', 'Erro por instancia e trace', 'Quantidade de usuarios'], 1], ['Rollback mais seguro?', ['Retirar api-b do pool ou restaurar config conhecida', 'Dobrar retries', 'Apagar cache de todos'], 0]],
    terms: ['replica', '50%', 'trace', 'secret', 'health check', 'configuracao', 'validacao', 'rollback']
  },
  {
    id: 'cloud', title: 'Arquitetura cloud resiliente', level: 'Intermediario',
    goal: 'Mapear rede, identidade, disponibilidade, dados, custo, backup e recuperacao em um workload cloud.',
    components: [
      component('dns-cdn', 'DNS / CDN', 'network', 'Resolve nomes e entrega conteudo cacheavel perto do usuario.', 'Nome/objeto -> edge', 'Origem, certificado e cache policy', 'Hit ratio, origem, latencia e erros', 'Origem errada, cache obsoleto, certificado'),
      component('waf-lb', 'WAF / LB publico', 'security', 'Protege e distribui entrada para sub-redes privadas.', 'HTTPS -> regra -> target', 'Security group/NSG, certificado e health', 'Bloqueios, targets, 4xx/5xx, TLS', 'Regra ampla, regra bloqueando, target unhealthy'),
      component('compute', 'Compute privado', 'app', 'Executa workloads sem exposicao administrativa direta.', 'Request -> servico', 'IAM/RBAC, egress, config e autoscaling', 'CPU, memoria, replicas, logs e traces', 'Role ausente, escala, imagem/config divergente'),
      component('database', 'Banco gerenciado', 'data', 'Mantem dados privados com backup e alta disponibilidade configuraveis.', 'Transacao -> armazenamento', 'Subnet privada, credencial e KMS', 'Conexoes, lag, storage, backup', 'SG/NSG, failover, quota, chave'),
      component('storage', 'Object Storage', 'data', 'Armazena objetos duraveis com politica de acesso e ciclo de vida.', 'Objeto -> bucket/container', 'IAM, criptografia e lifecycle', '4xx, bytes, requests e custo', 'Publico, policy incorreta, custo de egress'),
      component('iam-monitor', 'IAM + Monitor', 'observe', 'Controla identidade e registra mudancas, alertas, custo e auditoria.', 'Principal -> policy -> evento', 'Logs de atividade, budget e notificacao', 'Denied actions, audit trail, budget e alertas', 'Privilegio amplo, log ausente, budget inexistente')
    ],
    flow: ['DNS/CDN entrega estatico ou encaminha para a origem.', 'WAF/LB aceita HTTPS e envia a compute privada.', 'Workload assume uma identidade, sem credencial fixa.', 'Banco e storage permitem apenas acoes e origens necessarias.', 'Logs, metricas, traces, auditoria e budget alimentam operacao.'],
    runbook: [['Disponibilidade', 'Multizona, health checks, autoscaling e teste de falha'], ['Seguranca', 'Sub-redes privadas, identidade, menor privilegio e secrets'], ['Dados', 'Backup, restore testado, RPO, RTO e criptografia'], ['Custo', 'Tags, budget, anomalias, storage e egress']],
    scenario: 'A aplicacao grava no banco, mas upload de comprovantes retorna 403 depois da troca de uma role.', impact: 'Fluxo financeiro continua, mas comprovantes nao podem ser anexados.',
    evidence: [['Log da aplicacao', 'PutObject denied for role app-prod on bucket receipts-prod', true], ['Audit trail IAM', 'Policy s3:PutObject/storage write removida no change CHG-882', true], ['Politica efetiva', 'Permite GetObject; nao permite PutObject no prefixo /incoming', true], ['CPU do banco', 'CPU 16%, conexoes normais.', false], ['Abrir porta 22 no SG', 'Nao altera o acesso ao storage.', false]],
    hypotheses: ['Role do workload perdeu permissao de escrita', 'Banco esta sem espaco', 'Load Balancer sem certificado'], domains: ['Edge/rede', 'Compute', 'Identidade e autorizacao', 'Dados'], correct: [0, 2],
    questions: [['Como conceder acesso?', ['Chave root no codigo', 'Permissao minima no prefixo necessario para a identidade do workload', 'Bucket publico'], 1], ['Evidencia de quem mudou a policy?', ['Audit trail/activity log', 'ARP', 'Cache do navegador'], 0], ['Backup confiavel exige...', ['Job verde apenas', 'Teste de restauracao com RPO/RTO', 'Mais uma senha'], 1]],
    terms: ['403', 'iam', 'role', 'menor privilegio', 'audit', 'prefixo', 'validacao', 'rollback']
  },
  {
    id: 'security', title: 'Arquitetura de seguranca e Zero Trust', level: 'Avancado',
    goal: 'Tratar identidade, dispositivo, rede, workload e telemetria como controles combinados, nao como um unico firewall.',
    components: [
      component('identity', 'IdP / Identidade', 'security', 'Autentica pessoas e workloads e emite afirmacoes verificaveis.', 'Credencial + fator -> token', 'Diretorio, MFA, risco e ciclo de vida', 'Falhas, MFA, risco, tokens e privilegios', 'Conta orfa, MFA ausente, token roubado'),
      component('policy', 'Policy Engine', 'security', 'Decide acesso usando identidade, dispositivo, contexto e recurso.', 'Sinais -> decisao allow/deny', 'Politicas, inventario e classificacao', 'Decisoes, motivos, excecoes e drift', 'Excecao ampla, policy conflitante, dado desatualizado'),
      component('endpoint', 'Endpoint / EDR', 'observe', 'Fornece postura e detecta comportamento no dispositivo.', 'Telemetria -> risco/alerta', 'Agente, identidade e inventario', 'Cobertura, alertas, isolamento e versao', 'Agente parado, dispositivo nao gerenciado'),
      component('segment', 'Segmentacao', 'network', 'Limita caminhos laterais por identidade, zona e necessidade.', 'Fluxo -> politica -> caminho', 'Inventario, tags e enforcement', 'Allows/denies, flux logs e mudancas', 'Any/any, tag errada, rota de bypass'),
      component('workload', 'Workload + Secrets', 'app', 'Executa com identidade propria e obtem secrets de cofre.', 'Identidade -> secret curto -> dependencia', 'Vault/KMS, rotacao e policy', 'Acessos, versoes, expiracao e erros', 'Secret no codigo, permissao ampla, rotacao quebrada'),
      component('siem', 'Logs / SIEM', 'observe', 'Correlaciona identidade, endpoint, rede, cloud e workload.', 'Eventos -> regra -> incidente', 'Tempo sincronizado, parsing e retencao', 'Cobertura, atraso, regras, falsos positivos', 'Fonte ausente, clock skew, regra sem contexto')
    ],
    flow: ['IdP autentica com MFA e emite token de curta duracao.', 'Policy engine avalia usuario, dispositivo, risco e recurso.', 'Segmentacao permite apenas o caminho necessario.', 'Workload usa identidade propria para buscar secrets.', 'SIEM correlaciona decisoes, fluxos e comportamento para resposta.'],
    runbook: [['Verificar explicitamente', 'Identidade, dispositivo, contexto e recurso em cada decisao'], ['Menor privilegio', 'Acesso minimo, temporario e revisado'], ['Assumir violacao', 'Segmentar, detectar, conter e recuperar'], ['Telemetria', 'IdP, EDR, flow logs, audit, workload e cofre']],
    scenario: 'Uma conta valida com MFA acessa administracao a partir de dispositivo nao gerenciado e IP nunca visto. Minutos depois, consulta dezenas de secrets.', impact: 'Possivel sessao roubada com tentativa de descoberta de credenciais.',
    evidence: [['Log do IdP', 'user=admin MFA=success device=unknown ip=198.51.100.88 risk=high', true], ['Log do cofre', '47 secret list/get attempts in 3m; normal baseline=2/day', true], ['EDR', 'No managed device matches session device ID.', true], ['Ping no gateway corporativo', 'Gateway interno responde normalmente.', false], ['CPU do banco', 'CPU 22%, sem alertas.', false]],
    hypotheses: ['Sessao/token comprometido em dispositivo nao confiavel', 'Falha fisica no datacenter', 'Banco em deadlock'], domains: ['Identidade/policy', 'Endpoint', 'Rede', 'Workload/secrets', 'Deteccao'], correct: [0, 0],
    questions: [['MFA bem-sucedido significa...', ['Sessao definitivamente legitima', 'Um fator foi satisfeito; contexto ainda precisa ser avaliado', 'EDR saudavel'], 1], ['Contencao inicial coerente?', ['Revogar sessao/token, limitar conta e preservar eventos', 'Apagar todos os logs', 'Liberar any/any'], 0], ['Controle que reduz movimento lateral?', ['Segmentacao e policy por necessidade', 'Um unico VLAN para tudo', 'Senha compartilhada'], 0]],
    terms: ['mfa', 'risco', 'dispositivo', 'token', 'secrets', 'revogar', 'telemetria', 'validacao']
  }
];

export const architectureCatalog = Object.freeze({ architectures });
