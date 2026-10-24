# Reconstrução InfraSec

## Expansão pedagógica vigente — Semana 1 (24/10/2026)

R02/R03/R04 implementadas junto da R01, sem redesign. Veja [conteúdo, testes e limites](quality/WEEK1_EXPANSION.md),
[matriz de cobertura](content/WEEK1_COVERAGE.md), [procedência e decisões](content/ASSET_REUSE.md) e
[pedido](requirements/PEDAGOGICAL_EXPANSION_REQUEST.md). Os blocos seguintes preservam as etapas anteriores.

## Direção vigente — novo frontend principal (24/10/2026)

React/TypeScript como aplicação principal, organização InfraSec preservada e ensino R01 nativo.
Veja [inventário das 29 páginas](architecture/INFORMATION_INVENTORY.md),
[pedido vigente](requirements/REACT_PLATFORM_REQUEST.md) e
[implementação, acesso, testes e limites](quality/REACT_PLATFORM.md).
Execute `npm run dev` na raiz e abra a porta 4173. As seções abaixo documentam etapas anteriores.

## Implementação funcional da NET-R01 — 23/10/2026

A nova aplicação está em [`apps/learn`](../apps/learn/README.md), branch `codex/infrasec-r01-implementacao`. Inclui onze lições, diagramas, 41 questões, nove cenários de laboratório, avaliação independente, recuperação, revisão e progresso local recuperável. Veja [execução, testes e limites](quality/IMPLEMENTATION_R01.md). Para iniciar: `cd apps/learn`, `npm ci`, `npm run dev`.

A entrega abaixo permanece como histórico da Fase 0. Seus contratos propostos não significam que todos os campos/recursos planejados foram implementados; o relatório atual e os tipos do código registram o que existe de fato. Hub e ConcursoOS seguem preservados.

## Fase 0 — auditoria e proposta

Data: 23/10/2026. Branch: `codex/infrasec-reconstrucao-fase-0`.

**Entrega atual: auditoria, proposta de arquitetura e especificação preliminar. Nenhum código de aplicação foi modificado. A nova plataforma e a NET-R01 ainda não estão implementadas.**

A [especificação mestra](requirements/MASTER_SPEC.md), fornecida pelo usuário, determina na instrução operacional inicial: “Nesta primeira execução, não modifique código”. Os documentos abaixo concretizam essa fase; não autorizam declarar as fases seguintes concluídas. O README e a arquitetura da raiz continuam descrevendo o Hub executável atual.

## Leitura para decisão

1. [Auditoria dos dois projetos e reaproveitamento](architecture/REUSE_AUDIT.md).
2. [Arquitetura mínima proposta](architecture/ARCHITECTURE.md) e [decisões](architecture/DECISIONS.md).
3. [Primeiro percurso e especificação NET-R01](content/NET-R01-SPEC.md).
4. [Avaliação concreta da unidade](content/NET-R01-ASSESSMENT.md).
5. [Entregas, aceite e verificação](quality/ACCEPTANCE.md).

## Contratos de continuidade

| Responsabilidade | Documento |
| --- | --- |
| Identidades, conteúdo, tentativas e projeções | [DATA_MODEL](architecture/DATA_MODEL.md) |
| Armazenamento, falhas e backup | [PERSISTENCE](architecture/PERSISTENCE.md) |
| Sequência de ensino | [LEARNING_MODEL](pedagogy/LEARNING_MODEL.md) |
| Contrato editorial | [UNIT_STANDARD](pedagogy/UNIT_STANDARD.md) |
| Correção e limites | [ASSESSMENT_POLICY](pedagogy/ASSESSMENT_POLICY.md) |
| Evidência e estado observado | [MASTERY_POLICY](pedagogy/MASTERY_POLICY.md) |
| Intervenções por erro | [REMEDIATION](pedagogy/REMEDIATION.md) |
| Revisão posterior | [REVIEW_POLICY](pedagogy/REVIEW_POLICY.md) |
| Objetivos observáveis da R01 | [NET-R01-OBJECTIVES](content/NET-R01-OBJECTIVES.md) |
| Revisão técnica e fontes | [NET-R01-CONTENT-REVIEW](content/NET-R01-CONTENT-REVIEW.md) |
| Testes futuros | [TEST_STRATEGY](quality/TEST_STRATEGY.md) |
| Acessibilidade e validação com iniciantes | [ACCESSIBILITY](quality/ACCESSIBILITY.md) |
| Riscos e limites | [KNOWN_LIMITATIONS](quality/KNOWN_LIMITATIONS.md) |

## Limites desta entrega

Os dois checkouts foram lidos. Não foram copiados código ou conteúdo do ConcursoOS, instaladas dependências, alterados bancos, executadas migrations ou modificadas configurações de publicação. Apenas documentação foi criada e a memória local do projeto recebeu a nova direção. Os caminhos `apps/learn/` apresentados nos documentos são propostas; não existem nesta entrega.

O recorte inicial futuro é “Redes de Computadores — Do Zero à Base para CCNA”, começando apenas por NET-R01. Não é curso completo de CCNA nem promessa de aprovação. A expansão depende de revisão da primeira unidade e de avaliação com iniciantes reais.
