# Arquitetura do Hub Jornada InfraSec

## Contrato

Aplicacao estatica, sem framework, backend ou bundler. Sao baseline: UX e textos atuais, divulgacao progressiva, 12 semanas/60 missoes, N0-N3, thresholds 70/75/80, provas, readiness, recomendacoes, soft gating, rotas, 14 aliases, foco/ARIA, 24 storage keys e os dois progressos independentes.

- `infrasec-task-progress`: progresso semanal legado.
- `infrasec-guided-progress`: missoes `not-started`, `doing`, `blocked` e `done`.

Os bugs de entregavel sem `createdAt` e JSON corrompido em `infrasec-task-progress` permanecem caracterizados e nao foram corrigidos.

## Estrutura final

```text
src/
  main.js
  bootstrap/
    feature-initializer.js
    legacy-bootstrap.js
    legacy-bridge.js
  core/
    storage.js
    events.js
    navigation.js
    presentation.js
  data/
    academy/catalog.js
    adaptive/catalog.js
    architecture/catalog.js
    career/catalog.js
    exams/catalog.js
    journey/catalog.js
    legacy/catalog.js
  features/
    academy/controller.js
    adaptive/controller.js
    architecture/controller.js
    career/controller.js
    career/development-controller.js
    exams/controller.js
    journey/controller.js
  learning/
    assessment.js
    evidence.js
    progression.js
    recommendations.js
  portfolio/deliverables.js
  practice/scoring.js
  readiness/rules.js
```

Os seis `hub-*.js` historicos sao shims de 3-4 linhas. O HTML possui apenas `<script type="module" src="src/main.js"></script>`.

## Composition root

`src/main.js` importa o bootstrap critico e inicializa explicitamente:

```text
career -> academy -> architecture -> journey -> adaptive -> exams
```

Cada controller exporta `initialize*()` e nao executa ao ser importado. `initializeFeature()` isola falhas de features, reportando o erro como `pageerror` e continuando a composicao. Core e `legacy-bootstrap` ficam fora desse isolamento: uma falha critica, inclusive o parse legado de `task-progress`, continua interrompendo o bootstrap.

Carreira e Jornada recebem `weeks`, `weekSelect` e `loadTemplate` por injecao. Provas recebe `adaptiveApi` por injecao. Assim, features nao importam bootstrap nem outra feature; a unica importacao interna entre controllers e `career/controller -> career/development-controller`, dentro da mesma feature.

## Navegacao

`core/navigation.js` e a fonte unica para:

- `resolveRoute(hash)` e aliases;
- `activatePage(pageId, scroll)`;
- `navigateToPage(pageId, replace, scroll)`;
- `handleHash()`;
- `getActivePage()`, `getPageIndex()` e `getPageAt()`;
- metadados publicos `pages`.

Fluxo preservado:

```text
hash/alias -> page -> DOM e storage -> PAGE_CHANGED -> controllers
```

O controller da Jornada cuida somente de missoes, semana/dia, roadmap, syllabus, sincronizacao com a semana legada e destinos guiados.

## Adaptive e provas

`features/adaptive/controller.js` consome storage, events, navigation, catalogo e os modulos puros `evidence`, `progression` e `recommendations`. Expoe `adaptiveApi`, que encaminha para a implementacao inicializada sem registrar globals.

`features/exams/controller.js` recebe essa API pelo composition root e usa `assessment` para score, threshold, best, history, aprovacao cumulativa e selecao foundation/applied. O controller permanece responsavel apenas por fluxo, DOM, storage e eventos.

## Dependencias

Direcao efetiva:

```text
data -----------+
learning -------+--> features --> main/bootstrap
practice -------+
readiness ------+
portfolio ------+
core -----------+
```

`core` nao conhece features; `data` nao acessa DOM/storage; dominio nao conhece controllers. O grafo de 29 modulos e 70 imports foi auditado sem ciclos.

## Compatibilidade

Somente `bootstrap/legacy-bridge.js` escreve globals:

| Global | Motivo atual | Condicao de remocao |
| --- | --- | --- |
| `InfraSecStorage` | testes e consumidores historicos da API de persistencia | migrar consumidores externos/testes para imports. |
| `InfraSecEvents` | testes e listeners historicos | migrar consumidores externos/testes para imports. |
| `InfraSecDomain` | testes diretos das regras puras | testar exports ESM diretamente. |
| `InfraSecHub` | testes e links/scripts externos de navegacao | consumir `core/navigation.js`. |
| `InfraSecAdaptive` | testes e integracao historica de provas | consumir `adaptiveApi`. |

O produto moderno nao le nenhuma dessas fachadas. Elas apontam para os mesmos objetos/funcoes ESM e nao duplicam estado.

## Bridges DOM

Mantidos por contrato observavel:

- clicks de abas da Jornada: reutilizam ativacao, ARIA e persistencia de Academia/Carreira;
- clicks/setas nas abas: comportamento nativo de foco e teclado;
- `change` de `weekSelect`: sincroniza jornada legada, guiada, Kindle, leitura, ingles e portfolio;
- `change` dos selects de pratica: aciona renderizacao especifica da atividade;
- click de download: inicia download nativo.

Removido anteriormente: click artificial para template; Jornada chama `loadTemplate()` diretamente. Nesta fase, chamadas `window.InfraSecHub` e `window.InfraSecAdaptive` foram substituidas por navigation/adaptive ESM.

## Persistencia e eventos

`core/storage.js` possui as mesmas 24 keys e codecs. Os unicos acessos diretos a `localStorage` estao nele e no bloco deliberadamente legado de `infrasec-task-progress` em `legacy-bootstrap.js`.

Eventos oficiais preservados:

- `infrasec:page-changed`;
- `infrasec:competency-changed`;
- `infrasec:deliverables-changed`.

## Reducao final

| Arquivo historico | Inicio desta fase | Final |
| --- | ---: | ---: |
| `hub-jornada-guiada.js` | 326 | 4 |
| `hub-nivel-adaptativo.js` | 299 | 3 |
| `hub-provas-nivel.js` | 150 | 4 |

Implementacoes resultantes: Jornada 293 linhas + Navigation 67; Adaptive 318; Provas 146.

## Divida tecnica

- `legacy-bootstrap.js` ainda inicializa por efeito colateral e preserva acesso direto ao progresso legado.
- As cinco fachadas globais continuam por compatibilidade externa/testes, embora o produto nao dependa delas.
- Bridges DOM de semana, pratica e abas exigem APIs publicas dos respectivos controllers antes de serem removidas.
- Controllers nao possuem ciclo de vida `destroy/unsubscribe`; o composition root pressupoe uma inicializacao por carregamento.
- Adaptive e Carreira continuam controllers grandes, mas dados e regras ja estao fora deles.

Proxima fase recomendada, nao iniciada: qualidade operacional e entrega, com CI para os 121 testes, lint/formatacao ESM e migracao gradual dos testes para imports antes de remover as fachadas globais. Nao iniciar Persistence V2 ou novos motores junto dessa limpeza.
