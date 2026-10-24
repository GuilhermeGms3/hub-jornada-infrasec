# Hub original + ensino NET-R01

## Decisão e escopo

Alternativa **A**: Hub original como produto principal, player React montado dentro dele.
Alternativa B exigiria duplicar as 29 páginas, controllers e navegação no novo shell e introduziria
risco sem melhorar o ensino. O shell original permanece HTML/CSS/ESM. Só a unidade tem build.

Branch `codex/infrasec-integracao-hub`, baseada na `master` `8feaf53`, incluindo o servidor/Docker
posterior à criação da R01. O código e documentação R01 foram recuperados da implementação
`97fc7f4`. A branch anterior permanece disponível. Não houve alteração em ConcursoOS.

## Integração

- Menu com os mesmos seis grupos e 29 páginas. Barra contextual, anterior/próximo, Hoje, nível,
  plano, progressos, segurança, cloud, carreira, bibliotecas e simuladores permanecem.
- Redes → Missões de redes agora oferece a unidade antes das missões. O acesso ao ensino básico
  continua visível mesmo quando o Hub recomenda preparação para as atividades avançadas.
- `#redes/r01` retoma a posição persistida; `#redes/r01/aula/dns` é exemplo de deep link.
  Outras telas: `pratica`, `avaliacao`, `recuperacao`, `revisao`, `progresso`.
- O catálogo global continua com 29 entradas; R01 é subrota de `network-practice`.
- Shadow DOM separa CSS e seletores, com um único documento, histórico e armazenamento por origem.
  O adaptador transforma links contextuais para o namespace R01, inclusive copiar/abrir em nova aba.
  Não há iframe. O sumário recolhível é contextual; a sidebar escura original permanece global.
- O player permanece montado ao navegar pelo Hub, preservando a sessão e a posição. O router
  comunica tanto mudanças de hash quanto navegações por `pushState`. Sair de uma avaliação
  para outra página marca consulta; não produz uma aprovação independente.
- Onboarding e bloqueio de nível não interceptam a unidade para iniciantes. Seu comportamento
  nas páginas antigas continua coberto pelos testes existentes.
- Falha de carregamento oferece mensagem e recarregamento; o Hub continua navegável.

## Conteúdo preservado

11 lições PT-BR, exemplos resolvidos, diagramas e demonstrações, 41 questões comentadas,
9 cenários simulados, avaliação, 6 recuperações, revisão, histórico e cópias. O conteúdo, critérios,
versões e contratos de persistência da R01 não foram reescritos para esta integração.
Os recursos antigos continuam disponíveis. As demais jornadas ainda precisam de aprofundamento;
esta entrega não afirma que todos os materiais antigos foram substituídos.

## Progresso

As 26 chaves legadas não são migradas ou apagadas. R01 usa `infrasec-learn:v1`, mesmo schema e
formato de backup anteriores. Leitura e evidências antigas não promovem domínio R01; nenhuma
nota R01 é lançada automaticamente na prontidão ou nível legado.

LocalStorage é separado por origem. Para trazer dados da porta 5174 para 4173, exporte pelo botão
Salvar cópia na aplicação anterior, importe no player integrado, confira e confirme. O fluxo oferece
download do estado anterior e substitui apenas a R01. Não há fusão nem acesso automático à outra
origem. Permanece a detecção de dados corrompidos, quota e conflito entre abas; use uma aba de estudo.

## Fidelidade visual

Linha de base real: checkout separado de `8feaf53`, servido na porta 4176. Versão integrada: 4173.
Capturas Chromium em 1440×1000 e 390×1000, com onboarding já visto e conteúdos liberados em ambas,
em [evidence/integration](evidence/integration). Arquivos `before-*` e `after-*` são capturas reais;
`*-content` mostra o conteúdo após rolar o menu mobile. A imagem conceitual da etapa anterior
não é usada como evidência da integração.

Mudanças intencionais: entrada da R01 em Redes, sumário contextual recolhível, área de leitura
centralizada, CSS isolado e título da barra contextual. Identidade, grupos, links e shell preservados.
O mobile original apresentava overflow em Hoje (591 px em viewport de 390) e na barra (398 px).
Corrigidos margens da barra, quebra do cabeçalho, colunas fixas dos seletores e workspace Hoje.
O menu mobile longo continua com os mesmos grupos, sem redesenho global.

## Execução e manutenção

`npm run dev` na raiz serve tudo em 4173. O bundle versionado em `modules/net-r01/player.js`
permite servir o Hub por servidor estático/Docker/Pages sem exigir Vite em runtime.
Depois de alterar a fonte: `npm --prefix apps/learn ci` e `npm run build:learning`.
Não editar o bundle manualmente; commitar fonte e bundle juntos. Build independente continua
disponível para desenvolvimento e exportação dos dados anteriores.

Para próximas unidades, reutilizar os componentes didáticos e registrar o novo conteúdo no percurso
correspondente; não criar outro shell. O domínio da R01 ainda é específico desta unidade: expandir
objetivos e versionamento exige testes e revisão editorial, não apenas duplicar um catálogo.

## Limites

Não houve deploy remoto, ensaio com iniciantes, revisão técnica humana, teste de leitor de tela
ou matriz Firefox/Safari. Avaliação continua local e não supervisionada; laboratório simula outputs.
Os critérios pedagógicos antigos permanecem nas atividades antigas e precisam de revisão própria.
O novo ensino não depende deles e não os apresenta como validação da R01.

## Rotas preservadas

| Grupo | Hashes canônicos |
|---|---|
| Começar | `hoje`, `meu-nivel`, `jornada`, `visao-semanal`, `tarefas-jornada`, `semana-1` |
| Redes | `dependencias`, `redes-pratica`, `packet-tracer` |
| Operação e segurança | `helpdesk-noc`, `simulador-chamados`, `linux-git`, `terminal`, `soc` |
| Cloud e arquitetura | `cloud`, `arquitetura` |
| Carreira | `certificacoes`, `certificacoes-pratica`, `portfolio`, `labs-validados`, `prontidao`, `simulados`, `entrevista`, `ingles` |
| Recursos | `templates`, `fila-leitura`, `estante`, `biblioteca`, `nao-estudar` |

Os 14 aliases do catálogo permanecem: `inicio`, `plano-estudos`, `tarefas`, `semana1`, `arvore`,
`academia-pratica`, `laboratorio`, `central-carreira`, `estante`, `biblioteca`, `templates`,
`certificacoes`, `linux-git`, `nao-estudar`. Alguns coincidem com hashes canônicos.

## Verificações executadas

- `npm test` na raiz: **155 aprovados**, incluindo os 147 anteriores e os oito testes iniciais da integração.
- Após acrescentar laboratório/backup integrado: `npx playwright test tests/specs/learning-integration.spec.js`: **9 aprovados**. São 156 testes distintos no conjunto final, não 164.
- `npm test` em `apps/learn`: **105 aprovados** em cinco arquivos (incluem os 54 de conteúdo).
- `npm run test:e2e` em `apps/learn`: **11 aprovados**, incluindo backup, diagnóstico, avaliações e subdiretório.
- `npm run lint`, `npm run build`, `npm run build:hub`: aprovados; builds incluem `tsc --noEmit`.
- `npm run format:check`: aprovado após normalizar finais de linha dos arquivos trazidos da R01. `.gitattributes` local evita repetir a divergência CRLF/LF no próximo checkout.
- `git diff --check` e revisão do diff; conteúdo, domínio e persistência da R01 idênticos à branch anterior. O componente de backup recebeu apenas adaptação de navegação.
- Hoje, Redes e R01 sem overflow em 320, 390, 768 e 1440 px; capturas reais antes/depois. Sem alegação de auditoria WCAG completa.

Falhas intermediárias corrigidas: onboarding sobre deep link, gate legado ocultando fundamentos e
overflow mobile preexistente. Nenhum teste antigo foi removido ou enfraquecido para passar.
