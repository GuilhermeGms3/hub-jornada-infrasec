# Contratos de dados propostos

Atualização: este é o desenho da Fase 0. O contrato implementado da primeira unidade está em [`types.ts`](../../apps/learn/src/domain/types.ts), com diferenças e limites registrados no [relatório de execução](../quality/IMPLEMENTATION_R01.md).

Status: especificação de Fase 0, não contratos já implementados. Cada campo existe para a primeira unidade; a hierarquia curricular completa não obriga criar telas ou tabelas.

## Conteúdo e currículo

| Registro | Campos essenciais | Invariantes |
| --- | --- | --- |
| Course | `id`, `version`, `title`, `moduleIds`, `scopeNotice` | Curso inicial não se intitula CCNA completo |
| Module | `id`, `title`, `unitIds` | Referências existentes e únicas |
| Unit | `id`, `version`, `locale`, `title`, `objectiveIds`, `prerequisiteIds`, `lessonIds`, `assessmentIds`, `sourceIds`, `editorialStatus` | `NET-R01`; `pt-BR`; sem ciclos de pré-requisito |
| Objective | `id`, `unitId`, `description`, `essential`, `lessonIds`, `exerciseIds` | Comportamento observável; essencial sem exercício bloqueia publicação |
| Lesson | `id`, `version`, `title`, `objectiveIds`, `blocks` | Não usar índice como ID; cada objetivo possui ensino desenvolvido |
| Block | `id`, discriminante `type`, payload próprio | Tipos permitidos; sem HTML/JS arbitrário |
| Source | `id`, `title`, `url`, `accessedAt`, `rights`, `usage` | Diferenciar referência conceitual de reprodução autorizada |
| EditorialReview | `id`, `unitVersion`, `reviewType`, `reviewedAt`, `reviewerKind`, `findings`, `decision` | Não inventar revisor humano; assistente e humano têm rótulos distintos |

`editorialStatus`: draft, technical-review, ready-for-pilot, published, deprecated. Publicado não significa eficácia pedagógica comprovada. Mudança material em lição, questão ou gabarito incrementa versão. Correção de erro técnico inclui nota de impacto sobre evidências anteriores.

## Exercícios da R01

União discriminada inicial: `single-choice`, `structured-interpretation` e `diagnostic-decision`. Associação simples pode ser representada por campos de escolha; não precisa de drag-and-drop ou um quarto motor.

Contrato comum: `id`, `version`, `scenarioFamilyId`, `objectiveIds`, `modeEligibility`, `prompt`, `data`, `responseSchema`, `rubric`, `feedbackByOutcome`, `remediationByOutcome`, `hints`, `editorialStatus`, `sourceIds`. Alternativas têm `id` e texto; gabarito aponta a IDs existentes. Múltiplas escolhas de procedimento tecnicamente equivalentes são aceitas quando o estado do cenário as admite; não forçar uma ordem única arbitrária.

Cenário: configuração de host, interfaces relevantes, rotas simplificadas, resolvedor, destino/porta, políticas de ICMP/TCP e tabela finita de testes com outputs coerentes. Não é um terminal geral. Cada resposta simulada declara o que foi observado, sem alegar execução na máquina do aluno. IDs de resultado apoiam a rubrica.

## Tentativas e evidências

| Registro | Campos | Uso |
| --- | --- | --- |
| Attempt | `id`, `sessionId`, `exerciseId`, `exerciseVersion`, `unitVersion`, `scenarioFamilyId`, `mode`, `startedAt`, `submittedAt`, `response`, `hintLevel`, `solutionSeen`, `lessonConsulted`, `observedResult`, `rubricVersion` | Registro final preservado; nunca aceitar `correct` importado sem recomputar/verificar |
| AssessmentRun | `id`, `version`, `selectedExerciseVersions`, `status`, `startedAt`, `finishedAt`, `attemptIds`, `helpEvents` | Seleção congelada; estados active/completed/abandoned; inacabada não aprova conjunto |
| Evidence | `attemptId`, `objectiveId`, `kind`, `eligible`, `exclusionReasons`, `checkedAt` | Derivada de tentativa compatível e editorialmente válida |
| ObjectiveObservation | `objectiveId`, `status`, `supportingAttemptIds`, `limitations`, `lastIndependentAt` | Projeção reconstruível; sem persistir porcentagem global de domínio |
| ReviewTask | `id`, `objectiveIds`, `dueAt`, `policyVersion`, `originAttemptIds`, `status` | Agenda separada de conhecimento |
| ReviewResult | `id`, `reviewId`, `attemptIds`, `reviewedAt`, `outcome` | Tentativas novas e resultado observado, sem estimativa de memória |

Modos: comprehension, guided, independent, remediation, review. Um item visto em guided não vira caso novo por trocar seu ID ou números: `scenarioFamilyId` identifica o padrão de raciocínio compartilhado. Reutilização por família fica visível e limita interpretação.

Resposta aberta e diário de estudo: armazenados como `reflection`, sem correção automática ou elegibilidade independente. A aplicação pode indicar “anotação salva”, nunca “explicação correta” por tamanho/palavra-chave.

## Estado do estudo

`StudyProgress` contém `unitId`, `contentVersion`, `currentLessonId`, `currentBlockId`, `readingAcknowledgements`, `draftResponses`, `assessmentRuns`, `attempts`, `reviewTasks`, `reviewResults`, `updatedAt`. Abrir uma aula não equivale a terminar leitura; marcar leitura não equivale a responder. Rascunho não é tentativa final. Foco/cursor visual podem ser retomados sem carregar um feedback de outra versão.

Datas em ISO UTC; exibição e agendamento por dia consideram fuso configurado, inicialmente `America/Sao_Paulo`. Relógio do dispositivo não é relógio confiável de exame. Datas futuras/anômalas suspendem interpretação temporal e geram aviso, sem apagar histórico.

## Evolução e invalidação

Questão descontinuada permanece no snapshot histórico, mas fica inelegível para nova interpretação quando o gabarito ficou inválido. Um novo gabarito não reescreve a resposta do estudante. Histórico mostra “resultado anterior; item revisado” e permite reavaliação com versão nova. Mudança de unidade mantém reconhecimento de leitura por versão, sem converter automaticamente aprovação antiga em atual.

Importações são verificadas em runtime antes de se tornarem registros. TypeScript não valida JSON externo. Regras de tamanho, duplicidade, referências e versão estão em [PERSISTENCE](PERSISTENCE.md).
