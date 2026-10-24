# Arquitetura mínima proposta — nova experiência InfraSec

Status: proposta da Fase 0; **não implementada**. A [arquitetura da raiz](../../ARCHITECTURE.md) descreve o Hub atual. Este documento não afirma que já existem componentes React nesta aplicação principal.

## Escolha e justificativa

Propor React + TypeScript + Vite para uma aplicação estática independente em `apps/learn/`, no mesmo repositório e branch de reconstrução. Esse isolamento preserva os entrypoints, testes e 26 chaves antigas. Não converter `src/` legado em uma migração ampla.

O benefício concreto é representar blocos de aula e exercícios com contratos discriminados, manter resposta/dica/feedback próximos sem manipulação duplicada de DOM e testar componentes pequenos. TypeScript permite detectar exercício sem feedback por opção na autoria tipada; não substitui validação de backups. Vite oferece build isolado e controle de caminho de assets. Não melhora o conteúdo por si só.

Alternativas: ESM atual minimiza ferramenta nova, mas exigiria novas convenções de renderização/estado para o player; copiar ConcursoOS traria servidor, schema, papéis e domínio de edital desnecessários. React sem isolamento colocaria em risco o funcionamento legado. A primeira escolha mantém custo de build adicional explícito e nenhuma dependência dos projetos de referência em runtime.

Famílias candidatas: React 19, TypeScript 5.9 e Vite 8, observadas no manifesto ConcursoOS. Versões exatas e engine Node devem ser conferidas e fixadas na Fase 1; **não foram instaladas nem testadas aqui**. Não copiar lockfile de outro produto. Usar npm/lockfile próprios da nova aplicação, sem alterar a raiz.

## Recorte inicial

Uma entrada para NET-R01, leitor com sumário contextual, demonstração acessível, exemplos, prática guiada, avaliação independente, recuperação, revisão e backup. Não criar login, API, servidor de banco, sistema de concursos, catálogo vazio de certificações, chat, IA, ranking ou painel de produtividade.

```text
apps/learn/                    # estrutura proposta, ainda não criada
  src/
    app/                      # composição, navegação e tratamento de falhas
    content/net-r01/           # aulas e exercícios originais versionados
    curriculum/               # unidades, objetivos e pré-requisitos
    domain/                   # correção, evidências, elegibilidade e revisão
    features/course-player/   # orquestra estudo e retomada
    components/               # leitor, demonstração e exercício onde houver uso
    persistence/              # repositório local e importação/exportação
    styles/                   # tokens e leitura responsiva
    tests/                    # regras e conteúdo; E2E fora do bundle
```

Criar pastas somente quando houver arquivo com responsabilidade concreta. Na R01, `domain` pode conter poucos módulos; não são necessários serviços, repositórios e factories para toda entidade conceitual.

## Fluxo de dados

```text
conteúdo versionado → validação estrutural → player/blocos React
aluno → resposta + ajuda usada → corretor puro → tentativa
tentativa → persistência → projeção por objetivo → feedback/recuperação
tentativa posterior → revisão → histórico com datas e limitações
```

Conteúdo não importa React/DOM/storage. Domínio não conhece componentes ou localStorage. A UI usa IDs estáveis; reordenar lições não muda identidades. Persistência não interpreta texto como código. Projeções são derivadas de tentativas válidas, não porcentagens duplicadas gravadas em várias telas.

Estado local simples com reducer no player e funções puras de transição. Sem Redux, Zustand ou TanStack Query na primeira unidade: não há estado remoto a sincronizar. As recomendações oficiais do React sobre [estrutura de estado](https://react.dev/learn/choosing-the-state-structure) e [reducers](https://react.dev/learn/extracting-state-logic-into-a-reducer) sustentam centralizar transições e evitar estado derivado redundante; não exigem usar reducer para todo controle.

## Player e autoria

Aulas como dados TypeScript com união de blocos permitidos: parágrafo, título, conceito, lista, tabela, output, exemplo resolvido, diagrama por etapas e referência a exercício. Texto fica nos arquivos de conteúdo, não embutido em páginas de interface. Não usar HTML arbitrário, `eval`, MDX executável ou `dangerouslySetInnerHTML` para notas/progresso. Escape normal de React; comandos são exibidos como texto e nunca executados.

Inicialmente não há necessidade de parser Markdown. Sua adoção futura exige ganho editorial medido, conteúdo seguro e contrato de blocos equivalente. Usar TypeScript como autoria não pode tornar o texto uma coleção de frases curtas: o padrão editorial exige explicação desenvolvida.

Componentes iniciais: `CoursePlayer`, `LessonReader`, `RequestPathDiagram`, `WorkedExample`, `Exercise`, `Feedback` e `ProgressNotice` apenas quando implementarem algo necessário. `Exercise` recebe contrato discriminado; correção continua no domínio. Uma página não deve acumular renderização, correção, armazenamento e política de revisão.

Navegação proposta por fragmentos (`#/unidade/NET-R01/licao/...`) para funcionar em hospedagem estática sem fallback de servidor. Voltar/avançar do navegador preservam contexto; mudança de lição transfere foco ao título. Deep links devem ser validados e retornar mensagem recuperável. Evitar Router adicional inicialmente; confirmar se o requisito de navegação justificar sua inclusão.

## Renderização e experiência

Cabeçalho discreto, título da lição, sumário recolhível no celular e coluna de leitura de aproximadamente 65–75 caracteres. Explicações essenciais abertas; glossário e aprofundamentos opcionais por divulgação progressiva. Um parágrafo não vira um card. Diagrama em SVG/HTML com controles de etapa, legenda, tabela equivalente e sem reprodução automática obrigatória. Tema claro inicial, tokens próprios consistentes; tema escuro só após testar contraste e leitura.

Estados de resposta: ainda não enviada, rascunho, enviada, feedback e próxima ação. Persistência informa salvo, somente nesta sessão ou falha recuperável; não mentir que salvou. Avaliação independente não mostra gabarito antes de finalizar o conjunto. Voltar à aula encerra a elegibilidade independente daquela tentativa, sem impedir a consulta.

## Execução futura e publicação

Fase 0 não adiciona scripts. Na Fase 1, a nova aplicação deverá oferecer `dev`, `lint`, `typecheck`, `test`, `test:content`, `test:e2e`, `build` e `preview`, com instruções executadas antes de declaradas funcionais. O Hub mantém `npm test` na raiz.

Publicação é etapa separada: testar build em subdiretório, caminho base e refresh/deep links, conforme a [documentação Vite de deploy estático](https://vite.dev/guide/static-deploy.html). Não modificar GitHub Pages ou workflow atual na auditoria. Vite exige configurar `base` conforme o caminho real; não reutilizar cegamente o caminho do simulador CCNA.

## Fronteira de confiança

Correção local não equivale a prova supervisionada. O estudante pode inspecionar gabaritos ou modificar storage. O sistema acompanha estudo pessoal; não emite certificação nem atesta execução real de comandos. Entradas de backup são não confiáveis, devem ter limites e validação antes de entrar no estado. Os detalhes estão em [DATA_MODEL](DATA_MODEL.md) e [PERSISTENCE](PERSISTENCE.md).
