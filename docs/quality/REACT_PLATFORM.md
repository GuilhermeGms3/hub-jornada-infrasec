# InfraSec: novo frontend principal

## Direção executada em 24/10/2026

Frontend reconstruído em React/TypeScript a partir da R01, organização do Hub inventariada e
conteúdo R01 preservado. O pedido vigente é [REACT_PLATFORM_REQUEST.md](../requirements/REACT_PLATFORM_REQUEST.md).
Esta entrega é o primeiro recorte funcional, não a reformulação concluída de todas as formações.

Branch `codex/infrasec-react-plataforma`, baseada na implementação R01 `97fc7f4`.
O commit `7d5f40c` reaplica somente o servidor/Docker de `8feaf53`, necessários para a execução
estática completa. A integração Shadow DOM foi salva e publicada separadamente na branch
`codex/infrasec-integracao-hub`, commit `0284dda`. Nenhuma branch foi apagada; não houve reversão
indiscriminada. A arquitetura por Shadow DOM não está presente na nova aplicação.

## O que está disponível

- Shell novo: seis grupos globais e destinos para as 29 responsabilidades anteriores; responsivo,
  com menu mobile recolhível, estado ativo, breadcrumb, foco e link para saltar ao conteúdo.
- Hoje: ação real de começar/retomar, tentativa em andamento, revisão vencida quando existe,
  contagem efetiva de leituras e avaliações. Nenhuma porcentagem inventada de certificação.
- Redes: unidade R01 disponível, ciclo de estudo, dependências e cinco unidades seguintes
  claramente planejadas, sem links para cursos vazios.
- R01 nativa: 11 aulas, diagramas, exemplos, 41 questões, nove cenários, seis recuperações,
  avaliações, revisão e backup. Sumário contextual separado da navegação global.
- Meu nível: evidências reais da R01 e acesso separado ao diagnóstico antigo; não importa N0–N3.
- Plano/visão/tarefas/semana 1: organização nativa de 12 semanas e 84 missões, objetivos,
  pré-requisitos, resultados e evidências propostas. São roteiro curricular, não aulas concluídas.
- Demais áreas: propósito e fluxo próprios, status de reformulação e distinção entre ferramenta,
  referência complementar e formação. Recursos anteriores abrem explicitamente em outra aba.

O inventário foi registrado **antes** das novas telas em
[INFORMATION_INVENTORY.md](../architecture/INFORMATION_INVENTORY.md): posição, finalidade,
organização interna, fluxo, recurso útil, problema pedagógico, reaproveitamento, representação
nova e conteúdo a reescrever para cada página. O catálogo nativo é uma fotografia curada dessas
responsabilidades; não importa controllers/HTML/CSS do Hub. O roteiro contém metadados das
missões, não seus avaliadores frágeis ou os antigos links MD como ensino obrigatório.

## Arquitetura e execução

`apps/learn/src/app/App.tsx` compõe shell, router e um único estado de estudo. `src/platform/`
contém navegação, telas, estilos e catálogos. `UnitPlayer` apenas compõe as features didáticas
existentes. Conteúdo, regras, simulador e codec de persistência da R01 não mudaram.

`index.html` da raiz encaminha à aplicação compilada em `platform/index.html`, preservando query
e hash. O bundle está versionado para servidor estático/Docker/Pages. Não depende de Vite em runtime.

```powershell
# Na raiz: execução completa, incluindo ferramentas anteriores
npm ci
npm run dev
# http://127.0.0.1:4173/

# Para alterar o frontend
npm --prefix apps/learn ci
npm --prefix apps/learn run dev
# http://127.0.0.1:5174/

# Atualizar o bundle principal antes de commitar
npm run build:platform
```

No Windows, encerre o Vite desta aplicação antes de reinstalar dependências para não bloquear seu
binário nativo. O Vite em 5174 aponta recursos anteriores para o servidor da raiz em 4173.
O preview isolado em 4174 testa o novo bundle; para usar recursos antigos, execute a versão completa.
Não houve instalação de novas dependências, backend, conta ou banco.

## Rotas e estado

`#/hoje`, `#/redes`, `#/meu-nivel`, `#/jornada` e os hashes do inventário são destinos do novo
frontend. `#redes-pratica` e `#academia-pratica` resolvem para a formação de redes. Os demais
aliases anteriores continuam resolvendo. R01 mantém `#/aula/dns`, `#/pratica`, `#/avaliacao`,
`#/recuperacao`, `#/revisao`, `#/progresso`; também aceita `#/redes/r01/aula/dns` e
`#redes/r01`, este último retomando a tela persistida. Voltar/avançar usa o histórico nativo.

Ao sair de avaliação/revisão para outra tela, a tentativa fica assistida. O router mantém apenas
uma tela de unidade válida no campo persistido `route`, sem introduzir rotas globais no schema R01.

Mantida a chave `infrasec-learn:v1`, schema 1, versão 1.0 e formato de backup. Nenhuma chave legada
é apagada ou convertida em domínio. Trocar de caminho dentro da mesma origem preserva dados;
trocar porta/domínio/protocolo exige exportar na origem anterior e importar com confirmação na
nova. Backup substitui só o histórico R01 e oferece download do estado anterior; não mescla dados.

## Verificações

- `npm test` em `apps/learn`: **109 aprovados**, incluindo os 105 anteriores e quatro contratos de organização/rotas.
- `npm run test:e2e`: **19 aprovados**: dez fluxos didáticos preservados, oito da plataforma e um de subdiretório.
- `npm test` na raiz antes da adição dos testes novos da entrada principal: **147 aprovados**.
- `npx playwright test tests/specs/react-platform.spec.js`: **dois aprovados**, validando o React como entrada principal, bookmarks, retomada e ferramenta anterior real em outra aba. A raiz contém agora 149 testes distintos.
- `npm run lint`, `npm run format:check`, `npm run build`, `npm run build:platform`: executados. Ambos os builds incluem `tsc --noEmit`.
- Responsividade: Hoje, Redes, lição, laboratório, Cloud e plano em 320, 390, 768 e 1440 px sem overflow horizontal nos testes.
- Inspeção real Chromium, capturas desktop 1505×1045 e mobile 390×844; não são mockups. Não foram observados erros de página nas capturas finais.
- Diff de conteúdo, domínio e persistência contra a branch R01: sem alterações. O hook apenas ganhou leitura do estado atual para retomar bookmarks; seu schema é o mesmo.

Browser plugin não disponível na sessão; utilizado Playwright Chromium já instalado no projeto.
Os testes anteriores foram adaptados para abrir o sumário nativo e iniciar diretamente na unidade;
as verificações de correção, assistência, persistência, quota, corrupção e backup foram mantidas.
Um helper de avaliação passou a esperar as oito perguntas antes de responder, evitando corrida
entre mudança de hash e renderização.

## Revisão visual

Conceito: `evidence/platform-concept.png`; telas reais: `evidence/platform-*-desktop.png` e
`platform-*-mobile.png`. Comparação direta realizada no mesmo tamanho desktop.

| Ponto | Implementação e decisão |
|---|---|
| Shell | Sidebar clara, grupos recolhíveis e faixa de localização; não copia o shell escuro antigo. |
| Hierarquia | Título, próxima sessão, fatos reais e linhas de percurso na ordem do conceito. |
| Tipografia | System sans, títulos grandes e links de navegação de 14 px; ampliados após primeira comparação. |
| Cores | Branco/cinza azulado, texto navy e ação teal; sem métricas ou gradientes decorativos. |
| Componentes | Bloco de próxima sessão e linhas editoriais; sem grade de cursos fictícios. |
| Diagramas/ícones | SVG nativo escalável; esquema ilustrativo completo explicado dentro da unidade. Ícones simplificados em uma família consistente. |
| Mobile | O inset do conceito não é conteúdo da aplicação. A navegação recolhe e o conteúdo empilha de verdade. |
| Alterações intencionais | Ordem do Mapa/Formação conserva a posição original; textos adicionais delimitam escopo e evidência. |

## Limites e continuação

Esta entrega reconstrói o frontend e organiza o produto, mas **não migra nativamente todas as
ferramentas anteriores nem entrega aulas completas das semanas 2–12**. Esses recursos estão
identificados como anteriores, complementares ou em reformulação. R01 continua sendo o primeiro
recorte de ensino concluído em código. O projeto ainda não tem validação de aprendizagem com
iniciantes, revisão humana independente, auditoria WCAG completa ou matriz Firefox/Safari.

A próxima prioridade é reformular conteúdo dentro desta arquitetura: revisar os objetivos/casos
do próximo recorte de Redes, redigir aula e demonstração, adicionar prática, avaliação e recuperação
com os componentes existentes e testar. Não requer outro shell nem outra reorganização global.
