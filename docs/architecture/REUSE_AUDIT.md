# Auditoria de reaproveitamento

Status: inspeção estática realizada em 23/10/2026; decisões de reaproveitamento propostas. Nenhum porte realizado.

## Fontes e método

| Fonte | Checkout / referência observada |
| --- | --- |
| Hub InfraSec | `D:\dsf\hub-jornada-infrasec`, base `29f670f35c3129cd5c3a184cff8347f43c03673b`, branch original `master` |
| ConcursoOS | `F:\DSF\ConcursoOS`, HEAD `c004812ea4f09672a25146b6b1d6388998449043`, branch `codex/consolidacao-funcional-2026-10-19` |

Checkouts sem alterações no início. Foram lidos README, arquitetura e instruções aplicáveis, além dos módulos citados abaixo. No ConcursoOS, `docs/INDEX.md`, `docs/reconstruction/README.md` e ADRs 0005, 0008, 0010, 0019 e 0025 resolvem divergências com descrições históricas. A reconstrução vigente migra capacidades para Python; descrevê-lo apenas como Spring seria incorreto.

A inspeção do ConcursoOS foi estática, sem conexão com seu banco ou execução de serviços. Resultados de QA registrados lá não são resultados desta auditoria. Os testes do Hub são verificados separadamente em [ACCEPTANCE](../quality/ACCEPTANCE.md). A auditoria de conteúdo extenso é amostral; contagens estruturais não validam gabaritos.

## Arquitetura e dependências reais

**Hub:** HTML/CSS/JavaScript ESM, composição em `src/main.js`, controllers em `src/features`, catálogos em `src/data`, funções puras em `src/learning`, `src/journey`, `src/readiness` e `src/practice`. Sem backend de negócio, autenticação ou banco servidor. `src/core/storage.js` inventaria 26 chaves de localStorage. Node serve testes e Playwright 1.62.1 é a dependência direta de desenvolvimento da raiz. Não há build/lint/typecheck na raiz. O simulador CCNA é um subprojeto independente React 19.2/Vite 7.2, conforme seu manifesto, e não determina a stack do Hub.

**ConcursoOS:** frontend React 19.3.0, TypeScript 5.9.2, Vite 8.3.0, Router 7.18.3 e TanStack Query 5.102.8, conforme `apps/web/package.json`. Backend ainda inclui Java 21/Spring Boot 4.0.8 em `apps/api/pom.xml`, PostgreSQL/Flyway, e corte Python 3.13+ em `apps/api-python` com FastAPI/Pydantic e SQLAlchemy. ADR 0019 estabelece destino Python e coexistência temporária; não é recomendação para InfraSec. Testes incluem Vitest/Testing Library, testes Java e pytest. Conteúdo/questões/tentativas são persistidos no servidor; a página React consome DTOs, não corrige por conta própria.

## Matriz — Hub

Os caminhos nesta tabela são relativos à raiz do Hub.

| Componente / caminho | Finalidade e dependências | Pontos fortes | Limitações e riscos | Decisão e uso futuro |
| --- | --- | --- | --- | --- |
| `src/main.js`, `src/bootstrap/feature-initializer.js` | Compor controllers e isolar falhas; DOM e módulos core | Composição explícita | Bootstrap legado continua crítico | Preservar no Hub; adaptar o princípio, sem importar bootstrap no novo player |
| `src/core/navigation.js` | Hashes, aliases, DOM e eventos | Endereços compartilháveis | Conhece IDs/abas antigas | Recriar navegação pequena da unidade, manter legado intacto |
| `src/data/journey/catalog.js`, `step-guidance.js` | Missões e instruções; enriquecimento por categoria | Sequência, pré-requisitos e falha induzida | 84 missões/252 passos não equivalem a aulas; primeira leitura aponta para `.md` inglês | Adaptar a sequência; recriar ensino original da R01 e identidades estáveis |
| `src/data/academy/catalog.js` | 6 bancadas de redes, 6 incidentes, 4 SOC, 4 cloud, 8 terminais, 9 planos | Situações de diagnóstico e outputs contextualizados | Teoria frequentemente manda diferenciar/entender sem demonstrar | Adaptar cenários após revisão; APIPA e DNS como candidatos, não conteúdo aprovado automaticamente |
| `src/features/academy/controller.js` | DOM, coleta e rubricas | Feedback e produção de artefatos | Correção por termos e extensão; certificação por checkboxes/nota digitada | Recriar avaliação; preservar somente ideias de interação justificadas |
| `src/journey/session.js` | Passos, importação de notas e evidências | Retomada e separação entre execução vinculada e explicação | Mínimos de caracteres e score manual 100 não verificam entendimento | Recriar regra de evidência; leitura/registro nunca concedem desempenho independente |
| `src/learning/assessment.js`, `progression.js`, `evidence.js` | Provas e níveis N0–N3 | Regras testáveis e diagnóstico separado | Quatro itens por etapa; aprovação cumulativa; domínio amplo com poucos casos | Preservar no legado; novo modelo por objetivo, diversidade e recência, sem importar thresholds |
| `src/core/storage.js` e `src/bootstrap/legacy-bootstrap.js:17` | Persistência central e progresso antigo | Chaves inventariadas | Parse fatal legado, sem schema unificado e escrita sem retorno de erro | Recriar adaptador versionado isolado; não tocar nas 26 chaves antigas |
| `src/readiness/rules.js` | Portões de prontidão por cargo | Impede média de compensar gate crítico | Insumos incluem evidência fraca e plano de certificação autodeclarado | Não portar prontidão profissional; aproveitar somente a ideia de critério essencial |
| `src/data/architecture/catalog.js`, `src/features/architecture/controller.js` | Mapas operacionais e investigação | Relaciona fluxo a pontos de falha | Escopo maior que a primeira aula | Adaptar depois; R01 terá uma demonstração própria e acessível |
| `tests/specs/*` | Regressão e limites | Preserva contratos observáveis | Caracteriza inclusive bugs e regras fracas | Preservar; criar testes novos separados que proíbam falsos sinais de domínio |
| `projetos/CCNA-Labs/labs/` | Laboratórios `.pkt` | Execução em ferramenta real | Arquivos não executados nesta fase; licença não autoriza copiar qualquer material adjacente | Candidatos a lab opcional; nenhuma dependência obrigatória na R01 |
| `projetos/CCNA_Course_Notes/` | Notas Markdown | Material de consulta | Inglês, imagens remotas, direitos não resolvidos pela mera presença da pasta | Referência para revisão; não redistribuir automaticamente |
| `projetos/CCNA-Exam-Simulator/src/data/questions.js` | Banco e simulador React separado | Volume e domínios distintos | 628 registros, 625 IDs e 621 textos distintos; 295 explicações vazias, recontados nesta fase; não é prova de revisão individual | Não copiar banco na R01; escrever itens originais com objetivos e feedback |
| `projetos/cert-antenas/security-plus-sy0-701/` | Simulador HTML, banco e PBQs | Modos e feedback | 145 itens, recontados nesta fase; inglês; comentários históricos citam 90; licença/procedência requerem checagem por ativo | Fora da R01; curadoria antes de expansão |
| `projetos/cert-antenas/AWS-Certified-Cloud-Practitioner-Notes/` | Notas e 23 provas Markdown | Acervo de referência | Índices/documentos externos à aula, idioma e versionamento | Referência futura; não importar como curso |
| `projetos/cert-antenas/az-900/`, `SC-900-Study-Prep/` | README e guia HTML/flashcards | SC-900 tem explicações mais extensas | Experiência separada; qualidade e direitos por material | Reavaliar na fase cloud; nada entra no runtime inicial |

## Matriz — ConcursoOS

Os caminhos nesta tabela são relativos a `F:\DSF\ConcursoOS`.

| Componente / caminho | Finalidade e dependências | Pontos fortes | Limitações e riscos | Decisão e uso futuro |
| --- | --- | --- | --- | --- |
| `apps/web/src/pages/StudySessionPage.tsx` | Executar blocos do dia; API, Query, Router, ícones | Distingue minutos e execução de evidência; estados de erro/vazio | É orquestrador de cronograma, não player de aulas | Adaptar princípio de retomada e ação principal; recriar página para ensino |
| `apps/web/src/pages/KnowledgeDetailPage.tsx`, `StudyReader` | Ler nota, relações, histórico; DTOs e Query | Exemplo resolvido, armadilhas, fontes e versão | Um conjunto curto de campos não garante profundidade; depende do backend | Adaptar composição editorial; blocos didáticos próprios, sem copiar chamada de API |
| `apps/web/src/components/QuestionCard.tsx` | Seleção e feedback controlados por props | Fieldset, estados editoriais, fonte e relação com conhecimento | Assume alternativa única e feedback servidor; link absoluto `/app` | Adaptar semântica/contrato de apresentação; reescrever componente tipado para contexto local |
| `apps/api/src/main/java/org/concursoos/attempts/AttemptService.java` e testes | Corrigir pelo gabarito versionado e registrar tentativa; DB, identidade e transação | Cliente não decide acerto; histórico rastreável | Autoridade de servidor não existe no browser local | Adaptar identidade/versionamento e regras puras; não prometer antifraude local |
| `apps/api/src/main/java/org/concursoos/mastery/MasteryModelV1.java`, `MasteryModelV1Test.java` | Interpretar evidências por conhecimento | Desconta repetições, exclui evidências inválidas, expõe limites e idade | Heurística não calibrada e thresholds de concursos | Adaptar regras de elegibilidade/diversidade; não portar percentuais ou confiança como medição |
| `apps/api/src/main/java/org/concursoos/studyengine/StudyEngineService.java` | Recomendar até três ações explicáveis | Justifica seleção e falta de recursos | Baseado em edital, targets, banco e notas elegíveis | Adaptar seleção determinística por objetivo da unidade; não criar motor universal |
| `apps/api/src/main/java/org/concursoos/learningcycles/LearningCycleService.java` | Avaliar → interpretar → declarar atividade → reavaliar → comparar | IDs de tentativas de suporte, snapshots, distingue repetidos e novos; não alega causalidade | Serviço grande com SQL, locks, roles, targets e APIs | Adaptar ciclo conceitual em funções pequenas; não copiar serviço Spring |
| `apps/api/src/main/java/org/concursoos/reviews/ReviewSchedulingStrategyV1.java` | Intervalos e histórico separados | Estratégia versionada e limites | Inclui valores heurísticos de retenção/estabilidade sem calibração própria para InfraSec | Recriar agenda simples; não portar números de retenção |
| `docs/CONTENT_MODEL.md` | Fonte editorial e lifecycle | Publicação versionada, procedência e conteúdo separado de domínio | Flyway como autoria seria burocracia para R01 local | Adaptar lifecycle em arquivos versionados e revisão explícita |
| `docs/adr/0010-separate-planning-from-study-execution.md`, ADRs 0005/0008/0025 | Políticas de evidência e ciclos | Distingue execução, conhecimento, revisão e declaração | Regras e infraestrutura específicas do ConcursoOS | Adaptar princípios, documentar contratos InfraSec independentes |
| `apps/api-python/`, `apps/api/`, ferramentas de descoberta e infraestrutura | APIs, ingestão documental, workers e persistência multiárea | Resolve necessidades reais daquele produto | Custo operacional e escopo sem relação com R01 | Não portar; nenhum backend, fila, login ou coletor nesta primeira versão |
| Renderer Three.js e seis espaços descritos em `docs/reconstruction/README.md` | Ambiente espacial e navegação do ConcursoOS | Identidade própria | Não demonstra benefício no ensino da primeira unidade | Não portar cenas/menus; diagramas próprios com função didática |

## Direitos e conteúdo

`F:\DSF\ConcursoOS\LICENSE` declara Apache License 2.0 e copyright dos contribuidores. Isso permite avaliar reaproveitamento de código sob suas condições, mas não reclassifica como livres todos os materiais ou questões externos. Nenhum código foi copiado nesta fase. Se houver cópia futura, registrar origem/commit, alterações e avisos aplicáveis; inventariar eventuais condições adicionais antes de redistribuir.

No Hub foram localizados arquivos de licença em CCNA-Labs, CCNA-1-Study-Hub, AWS, SC-900 e alguns roadmaps. **Localização não é auditoria jurídica nem autorização geral.** A R01 será redigida originalmente a partir de conceitos verificáveis, sem transportar bancos comunitários ou copiar livros. Referenciar uma fonte não concede direito de reprodução. Publicação com licença desconhecida permanece bloqueada por ativo.

## Decisões resultantes

1. A nova experiência precisa ser centrada em aula, não em catálogo, métricas ou cronograma.
2. Reutilização predominante será de princípios e casos reescritos; não de páginas inteiras.
3. Composição modular e funções puras do Hub são boas referências. Contratos de tentativa e honestidade de evidência do ConcursoOS são referências melhores que os thresholds antigos.
4. Conteúdo didático original, correção por decisão estruturada e tentativas versionadas são o investimento principal.
5. Revisão deve registrar desempenho posterior; a agenda não mede memória.
6. A aplicação antiga e os dados ficam intactos; nenhuma aprovação antiga será importada como domínio novo.

Os riscos priorizados e decisões ainda não verificadas estão em [KNOWN_LIMITATIONS](../quality/KNOWN_LIMITATIONS.md). A arquitetura mínima está em [ARCHITECTURE](ARCHITECTURE.md).
