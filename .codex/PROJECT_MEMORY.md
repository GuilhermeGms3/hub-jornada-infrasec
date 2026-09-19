# Project Memory

## Implementação vigente — NET-R01 (2026-10-23)
- Branch `codex/infrasec-r01-implementacao`, criada sobre Fase 0/`fd4d5f5`; pedido posterior autoriza implementação e testes de todo o recorte R01 sem perguntar entre subetapas.
- Aplicação nova independente em `apps/learn/`, React 19.3.1, TypeScript 5.9.3, Vite 8.3.5, Node testado 22.20.0. Manifesto/lockfile próprios. Hub/ConcursoOS não foram modificados em runtime.
- Entregue: 11 lições originais PT-BR, 11 exemplos, 41 questões, diagramas SVG/HTML, demonstração de máscara/percurso, 9 cenários × 8 ações, ajuda, duas avaliações de 8 decisões, 6 recuperações, revisão de 8 itens e agenda 1/3/7 dias.
- Progresso exclusivo `infrasec-learn:v1`, schema 1/conteúdo 1.0; backup SHA-256 validado e confirmado, dados inválidos preservados, falhas/quota/conflitos indicados. Sem migração das 26 chaves antigas.
- Evidência por objetivo e famílias, sem palavras-chave, autodeclaração ou texto mínimo para aprovar. Consulta/ajuda torna avaliação assistida; repetição não aumenta diversidade nem limpa fragilidade sem observação nova.
- Execução: `cd apps/learn; npm ci; npm run dev`, URL `http://127.0.0.1:5174/`. Build e preview independentes; sem deploy externo.
- Validação: 105 testes Vitest (54 de conteúdo incluídos), 11 E2E Chromium, 147 testes do Hub, lint/typecheck/build, npm audit sem vulnerabilidades, 32 layouts adicionais sem overflow/erro de console. Capturas e detalhes em `docs/quality/IMPLEMENTATION_R01.md`.
- Limites: sem piloto com iniciantes ou revisão técnica humana independente; sem auditoria WCAG, outros browsers, terminal real, curso completo CCNA, sincronização ou prova supervisionada. Banco finito; agenda/estados são heurísticos explícitos.
- Próximo passo: testar aprendizagem com iniciantes e revisar R01 antes de expandir. As propostas/históricos abaixo não substituem o contrato atual em `apps/learn/src/domain/types.ts`.

## Direção vigente — reconstrução, Fase 0 (2026-10-23)
- Pedido atual: executar o macroprompt em outra branch. A instrução operacional final restringe esta primeira execução à auditoria/proposta, sem modificar código.
- Branch: `codex/infrasec-reconstrucao-fase-0`, base `master`/`29f670f`.
- Referência adicional inspecionada somente em leitura: `F:\DSF\ConcursoOS`, HEAD `c004812`, branch `codex/consolidacao-funcional-2026-10-19`.
- Fontes canônicas desta direção: `docs/README.md`, `docs/requirements/MASTER_SPEC.md`, `docs/architecture/REUSE_AUDIT.md` e `docs/quality/ACCEPTANCE.md`.
- Entrega: documentação de auditoria dos dois projetos, arquitetura mínima proposta, contratos/políticas, primeiro percurso e especificação preliminar NET-R01. Nenhum player novo foi implementado.
- Proposta futura: `apps/learn/` independente, React/TypeScript/Vite com versões/engines a validar na Fase 1; sem backend, dependência runtime dos projetos de referência ou migração dos resultados antigos.
- Primeira trilha: Redes do Zero à Base para CCNA; primeira unidade NET-R01. Não anunciar curso CCNA completo ou domínio baseado em leitura/autodeclaração.
- Verificação nesta fase: `npm test`, 147 aprovados (2,2 min). Validação documental e diff registradas no encerramento.
- Próxima ação: fundação mínima e redação integral da R01 nas fases seguintes, com objetivos e avaliação versionados; não expandir catálogo antes de revisar a primeira unidade.
- As seções históricas abaixo descrevem o Hub preservado. Seu escopo de manutenção e limitações continuam vigentes para o legado; não impõem thresholds ou critérios fracos ao produto novo.

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
- 2026-09-19 - ambiente local e Docker servem os mesmos arquivos estaticos - `npm run dev` usa `scripts/static-server.cjs`; Compose usa Nginx e inclui antenas/biblioteca sem artefatos de desenvolvimento.

## Current state
- Completed: core/dominio, catalogos, controllers, navigation, composition root, bridge unico, certificacoes, conducao verificavel dos 252 passos da jornada e execucao local/Docker documentada.
- In progress: nenhuma fase adicional iniciada.
- Known issues: `Invalid time value` sem `createdAt`; JSON corrompido de task progress interrompe bootstrap.
- Verification performed: baseline arquitetural 121/121 em 2026-08-14; expansao de certificacoes 125/125 em 2026-08-20; passos acionaveis 129/129 em 2026-09-11; sessoes verificaveis e auditoria das 12 semanas 147/147, sintaxe e QA visual desktop em 2026-09-15; `npm run dev`, Compose/Nginx healthy, rotas HTTP e 147/147 testes em 2026-09-19.

## Next safe actions
- Em fase separada, adicionar CI/lint e migrar testes externos para imports ESM antes de remover as cinco fachadas globais.
