# Project Memory

## Project identity
- Purpose: Hub estatico de estudo guiado para InfraSec, redes, operacao, SOC e cloud.
- Repository root: `hub-jornada-infrasec-repo`.
- Main stack: HTML, CSS e JavaScript classico; testes Playwright em Node.js 22.

## Canonical sources
- Architecture: `ARCHITECTURE.md`.
- Requirements: solicitacoes da tarefa atual e `README.md`.
- API/contracts: 26 storage keys, tres eventos internos e regras puras documentados em `ARCHITECTURE.md`.
- Data model: schemas persistidos no `localStorage`, sem schema unificado.
- Frontend/design system: `hub-estudos-infrasec.html` e `hub-*.css`.
- Tests/build: `package.json`, `playwright.config.js` e `tests/`.

## Architecture map
- Modules: composition root ESM, core/navigation, dominio puro, catalogos, controllers inicializaveis e bridge legado unico.
- Dependency direction: data/core/domain -> features -> main/bootstrap; Provas recebe adaptive por injecao.
- Important flows: jornada, diagnostico, N0-N3, provas, evidencias, portfolio e readiness.
- Persistence: 26 keys no `localStorage`; JSON e strings cruas coexistem.
- Auth/security boundaries: aplicacao local estatica, sem autenticacao ou backend.

## Non-negotiable constraints
- Preservar nomes, formatos e fallbacks das 26 keys.
- Preservar UX, eventos, navegacao, progressao, recomendacoes e soft gating.
- Nao corrigir ainda `task-progress` corrompido nem entregavel legado sem `createdAt`.
- Preservar thresholds 70/75/80, gates, schemas, ordem storage -> evento e bugs legados caracterizados.

## Active scope
- Requested outcome: transformar todos os dias das 12 semanas em sessoes verificaveis, incluindo consolidacao no sabado e revisao no domingo.
- In scope: 84 missoes, 252 passos, perguntas, outputs, checklists, importacao de notas e evidencia obrigatoria.
- Out of scope: execucao nativa de comandos pelo navegador, API proprietaria do Packet Tracer, mudanca de progressao N0-N3, backend ou framework.

## Decisions
- 2026-08-14 - usar bridge classica `window.InfraSecStorage` - consumidores ainda sao IIFEs e a migracao geral para ES Modules esta fora do escopo.
- 2026-08-14 - manter bootstrap de `infrasec-task-progress` direto - o parse fatal e contrato caracterizado.
- 2026-08-14 - usar `window.InfraSecEvents` sobre `CustomEvent` no `window` - preserva listeners legados enquanto os scripts ainda sao IIFEs.
- 2026-08-14 - manter bridges DOM artificiais - os eventos `click/change` ainda executam controladores de UI e sincronizacao nao extraidos.
- 2026-08-14 - usar uma bridge stateless `window.InfraSecDomain` - reduz globals por arquivo e permite funcoes puras em scripts classicos.
- 2026-08-14 - controllers montam snapshots explicitos - dominio nao conhece storage, DOM, eventos ou navegacao.
- 2026-08-14 - scoring compartilha apenas thresholds e checklist - rubricas diferentes nao foram forcadas em motor universal.
- 2026-08-14 - `src/main.js` e o unico entrypoint ESM - imports estaticos preservam a inicializacao observavel em `DOMContentLoaded`.
- 2026-08-14 - catalogos sao ESM sem efeitos colaterais - controllers importam dados em vez de usar `InfraSecCatalogs`.
- 2026-08-14 - `legacy-bootstrap.js` exporta semana/template - `InfraSecLegacy`, `weeks` e `weekSelect` deixam de ser globals.
- 2026-08-14 - entregaveis usam construcao/deduplicacao central - schema e `sourceId` permanecem contratos.
- 2026-08-14 - `core/navigation.js` e a fonte unica de rota - preserva hash, alias, storage e PAGE_CHANGED.
- 2026-08-14 - controllers exportam inicializadores - `main.js` compoe features e isola falhas nao criticas.
- 2026-08-14 - features recebem dependencias cruzadas por injecao - evita imports entre features/bootstrap e ciclos.
- 2026-08-14 - `legacy-bridge.js` e o unico produtor de globals - codigo moderno usa somente imports ESM.
- 2026-08-20 - antenas de terceiros exigem execucao local e licenca declarada - Security+ Exam90 foi incorporado; XLSX Packt nao foi apresentado como simulador e repositorios sem licenca nao foram copiados.
- 2026-08-20 - SC-200/SC-300 reutilizam `infrasec-deep-certs` - novos IDs preservam o schema e os thresholds existentes.
- 2026-09-11 - os 180 passos da jornada usam metadados estruturados - cada passo possui tipo, instrucao, acao, destino e validacao sem criar persistencia nova.
- 2026-09-15 - sessoes guiadas verificaveis usam `infrasec-guided-sessions` - notas importadas geram `verified`; interpretacao e evidencia continuam obrigatorias para concluir.
- 2026-09-15 - a jornada passa a ter sete dias - sabado consolida em lab e domingo revisa erros e planeja a semana seguinte.

## Current state
- Completed: core/dominio, catalogos, controllers, navigation, composition root, bridge unico, certificacoes e conducao verificavel dos 252 passos da jornada.
- In progress: nenhuma fase adicional iniciada.
- Known issues: `Invalid time value` sem `createdAt`; JSON corrompido de task progress interrompe bootstrap.
- Verification performed: baseline arquitetural 121/121 em 2026-08-14; expansao de certificacoes 125/125 em 2026-08-20; passos acionaveis 129/129 em 2026-09-11; sessoes verificaveis e auditoria das 12 semanas 147/147, sintaxe e QA visual desktop em 2026-09-15.

## Next safe actions
- Em fase separada, adicionar CI/lint e migrar testes externos para imports ESM antes de remover as cinco fachadas globais.
