# Riscos e limitações da Fase 0

## Matriz de riscos

| Prioridade | Risco / evidência | Impacto | Mitigação e verificação |
| --- | --- | --- | --- |
| P0 | Novo visual repetir roteiro sem explicação; `theory` da Academia é frequentemente imperativo | Repetir o problema original | Aula integral e caso resolvido antes de criar player; piloto resolve caso novo |
| P0 | Checkboxes/texto/nota declarada virarem domínio | Confiança injustificada | Política de evidência e testes negativos; não importar N3/readiness |
| P0 | Estado antigo ser sobrescrito pela versão nova | Perda de estudo | Aplicação/chave isoladas; teste compara as 26 chaves antes/depois |
| P0 | Cópia de componentes de referência trazer contratos/domínios indevidos | Dependência de servidor, edital ou dados externos | Adaptação por princípio; matriz de origem e justificativa |
| P1 | R01 de dez lições ficar longa ou superficial | Abandono ou pré-requisito oculto | Dividir sessões sem esvaziar conteúdo; observar iniciante |
| P1 | Casos A/B serem todo o banco independente | Memorização e cobertura incompleta | Completar famílias alternativas para O01–O08 antes de habilitar demonstração integral |
| P1 | Simplificação DNS/gateway/TCP ensinar mecanismo falso | Erro técnico persistente | Revisão com ramificação de DNS e exceções declaradas; revisor independente |
| P1 | localStorage bloqueado/quota e importação inválida | Perda de progresso | Tratamento de erro, original preservado e backup validado |
| P1 | Versões dos manifests de referência copiadas sem validar engines | Instalação/build falham | Fixar conjunto testado na Fase 1; nenhuma instalação nesta fase |
| P1 | Conteúdo de terceiros com direitos desconhecidos | Redistribuição indevida | Autoria original e checagem por ativo antes de incorporar |
| P1 | Cliente local tratado como prova supervisionada | Indicadores sem validade | Declarar limite de confiança e escopo; sem credencial/prontidão profissional |
| P2 | Escopo crescer para outras certificações cedo | Infraestrutura cresce antes do ensino | Não criar catálogo vazio; expansão após revisão da R01 |
| P2 | Documentação virar substituto de entrega | Plataforma continua sem aulas | Próximo incremento precisa de contratos executáveis e aula real, sem nova rodada genérica de planejamento |

## Limitações da auditoria

Inspeção do ConcursoOS foi de arquivos/documentação, sem executar frontend, API, banco ou testes dele. Docs contêm histórico parcialmente contraditório; ADRs e reconstrução recentes prevalecem. Não generalizar a qualidade de todo o produto a partir das páginas inspecionadas.

No Hub, os bancos e materiais foram analisados estruturalmente e por amostra ao longo desta conversa. Esta fase não fez revisão de cada gabarito nem executou todos os `.pkt`, PBQs ou exercícios. Os defeitos de UI e rota observados na auditoria anterior não foram repetidos nesta fase; não tratá-los como novo QA de produção. Publicação GitHub Pages não foi testada aqui.

Nenhum curso novo foi implementado. Não há dependências instaladas, migração, backup novo funcional, corretor novo, player novo ou resultado com iniciantes. Documentos de arquitetura/política são propostas explícitas; a primeira unidade não está pronta para consumo.

Não foi fechada matriz objetivo a objetivo do blueprint CCNA vigente. A promessa inicial é base de redes e R01, não certificação completa. Conteúdos de outras certificações ficam fora da primeira implementação.
