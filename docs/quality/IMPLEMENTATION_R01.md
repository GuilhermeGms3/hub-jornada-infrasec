# Implementação funcional NET-R01 — 23/10/2026

Branch: `codex/infrasec-r01-implementacao`, criada sobre Fase 0/`fd4d5f5`. Esta entrega executa a [instrução posterior de engenharia](../requirements/IMPLEMENTATION_REQUEST.md); a restrição antiga de produzir somente documentação não se aplica a ela. Hub e ConcursoOS continuam preservados.

## O que funciona

Aplicação estática independente em [`apps/learn`](../../apps/learn/README.md), com React 19.3.1, TypeScript 5.9.3 e Vite 8.3.5. Node usado: 22.20.0. Manifesto e lockfile próprios; versões foram verificadas no registry e instaladas. ESLint 10 substitui o candidato 9, cujo instalador informou fim de suporte; engines e peer dependencies foram conferidos. Prettier é ferramenta de desenvolvimento para manter fontes legíveis. Apenas React/React DOM são dependências de runtime. Sem backend, autenticação, IA ou banco remoto.

| Entrega | Implementação concreta |
| --- | --- |
| Ensino | 11 lições originais em PT-BR, três seções desenvolvidas por lição, exemplo resolvido, erro comum, síntese e checagem; cobrem os 12 tópicos solicitados, com LAN/internet integradas em redes |
| Exemplos | 11 casos resolvidos com dados, raciocínio, conclusão e limite; incluem rede local, decisão de rota, DNS, acesso remoto, configuração inesperada e falha de resolução |
| Visualizações | Rede em SVG com descrição, alternativa textual mobile; cálculo IPv4 por AND interativo; camadas do exemplo HTTPS; percurso de oito etapas controlável por teclado |
| Exercícios | 41 questões: 11 checagens, 16 itens em duas formas de avaliação, 8 de revisão, 6 de recuperação; todas com objetivo e feedback individual por alternativa |
| Simulador | 9 cenários × 8 ações de coleta; outputs derivados de estados explícitos; diagnóstico exige evidências relevantes antes de encerrar |
| Prática guiada | Quatro níveis de ajuda registrados, transcript persistido e histórico de tentativas de laboratório, sem alegar execução real |
| Avaliação | Runs congelados, rascunhos salvos, correção só ao finalizar; consulta/ajuda reclassificam conjunto como assistido |
| Recuperação | Seis contrastes reensinados com exercícios próprios; erros objetivos priorizam sugestões, sem diagnosticar causa humana |
| Revisão | Agenda simples 1/3/7 dias após conjunto independente aprovado; tentativa antecipada não avança intervalo; resultados persistidos |
| Progresso | Leitura, prática e observações por O01–O08 separadas; duas famílias independentes corretas são critério local limitado; repetição não acrescenta diversidade nem apaga erro sem observação nova |
| Continuidade | Navegação por hash, retomada de lição e respostas; storage com versão; backup validado/confirmado; erro de leitura/escrita e conflito de outra aba visíveis |

## Arquivos e contratos atuais

Código efetivo: `apps/learn/src/domain/types.ts`; regra de correção/observação/agenda em `domain/learning.ts`; cenário/outputs em `domain/simulator.ts`; validação/backup em `persistence/storage.ts`. Esses arquivos descrevem o contrato implementado, prevalecendo sobre campos apenas propostos nos documentos da Fase 0.

O modelo mantém uma única unidade no envelope, sem framework genérico de currículo, curso multiusuário ou algoritmo de confiança. Não é necessário universalizar a primeira experiência para cumprir o recorte. Não foi copiado código ou banco do ConcursoOS: foram adaptados os princípios de tentativa versionada, declaração separada de evidência e feedback rastreável. Conteúdo e itens são originais; referências conceituais não são reprodução de materiais terceiros.

### Ajustes à proposta preliminar

- Onze lições em vez de dez: separação de IPv4, máscara e MAC mantém os pré-requisitos mais claros; LAN/internet são ensinadas junto de redes.
- Duas formas de oito decisões e uma revisão de oito, em vez do conjunto preliminar de nove decisões. Há um item por objetivo em cada forma; todos são essenciais neste primeiro recorte. Exigir 80% e todos os essenciais resulta em necessidade de acertar o conjunto inteiro. Isso está explicado na interface; o critério não é calibrado.
- Estado local operado por hook com ref atual e funções puras, sem biblioteca de estado ou reducer genérico obrigatório. Persistência ocorre em operações explícitas, fora de funções de atualização React com efeitos colaterais.
- Backup schema 1 contém unidade/retomada/leitura/rascunhos/tentativas/runs/revisões/laboratório. Não implementa migração de formatos ainda não publicados ou importação de resultados antigos.
- Agenda usa intervalos UTC de 24h e exibição no fuso do browser; preferências de fuso e agenda por calendário local não foram criadas.
- Uma questão inválida ou de versão incompatível não concede evidência atual. Não há serviço editorial, publicação remota ou certificado.

## Verificações executadas

| Comando / inspeção | Resultado |
| --- | --- |
| `npm install` / `npm ci` em `apps/learn` | Instalação e reinstalação pelo lockfile concluídas; manifesto/lockfile separados |
| `npm run format` / `format:check` | Fontes formatadas e verificação final sem divergências |
| `npm run lint` | Aprovado |
| `npm run typecheck` | Aprovado |
| `npm test` em `apps/learn` | **105 testes aprovados**, em cinco arquivos |
| `npm run test:content` | **54 testes aprovados**, incluídos nos 105 acima |
| `npm run build` | Aprovado; bundle estático produzido, aproximadamente 342 kB JS/108 kB gzip |
| `npm run test:e2e` | **11 testes aprovados** em Chromium, incluindo bundle em `/estudo/` e recarregamento de deep link |
| `npm audit --audit-level=high` | Zero vulnerabilidades reportadas na consulta executada |
| `npm test` na raiz do Hub | **147 testes aprovados**; legado preservado |
| Navegador adicional | 8 telas × 4 larguras (320/390/768/1440): 32 verificações, sem overflow da página/tela vazia ou erros de console capturados |

As verificações de navegador usaram Playwright: o plugin Browser específico não estava disponível. O build foi testado via preview e servidor de teste em subdiretório; o dev server foi iniciado em `http://127.0.0.1:5174/`. Sem publicação externa.

Foram corrigidos durante a execução: associação explícita de labels aos selects; teste assíncrono sem await; feedback curto demais num item; link de salto que conflitaria com hash router; cálculo IPv4 que precisava recusar octetos vazios; alternativa mobile legível ao diagrama; compatibilidade de versão/futuro/repetição na interpretação de evidências. Rodadas finais passaram após as correções.

A primeira tentativa de `npm ci` no Windows falhou com EPERM porque o dev server mantinha o binding nativo Rolldown aberto. A instância criada nesta execução foi encerrada, a reinstalação repetida e as verificações refeitas. Nenhum processo de outro projeto foi encerrado; a orientação de reinstalação foi registrada no README.

## Fluxos de navegador cobertos

Inicialização com conteúdo; checagem e feedback; pista persistida; leitura sem domínio; retomada após reload; máscara /24→/26; percurso por etapas; todas as lições; diagnóstico com coleta obrigatória; duas formas independentes sem antecipar gabarito; consulta marcada como assistida; seis recuperações; revisão; JSON corrompido preservado; quota indisponível; teclado/link de salto; mobile; exportação/importação com prévia e confirmação; deep link em subdiretório.

O ambiente de teste usa contextos separados. Nenhum teste limpou dados pessoais do browser ou conectou serviços do ConcursoOS. Builds, node_modules e traces não entram no commit.

## Verificação visual

Capturas reais ficam em `evidence/`: desktop, mobile e laboratório. A referência gerada é somente orientação visual, não uma imagem usada como interface. A UI, textos e diagramas são nativos.

| Comparação | Referência / implementação / decisão |
| --- | --- |
| Paleta | Branco no conteúdo, trilho azul muito claro, texto navy e ação teal preservados |
| Estrutura | Cabeçalho discreto, sumário lateral e coluna central de leitura preservados; sumário recolhível mobile |
| Tipografia | Corpo 16 px e hierarquia de leitura; cabeçalho e controles usam fonte de sistema, sem download externo |
| Conteúdo do primeiro viewport | Texto técnico foi redigido e aprofundado; não copiado do mockup. Diagramas aparecem depois da primeira explicação, antes do restante da aula |
| Diagrama | SVG responsivo desktop e lista equivalente legível mobile; sem imagem raster no conteúdo ou arte decorativa |
| Densidade | Sem cards por parágrafo, métricas de domínio genéricas ou catálogo vazio de certificações |
| Estado | Aviso discreto de salvamento foi adicionado por necessidade funcional; falha não se apresenta como sucesso |

## Limitações reais e próximos passos

1. Não houve piloto com iniciantes reais ou revisão humana técnica independente. A entrega é funcional e revisada pelo assistente; eficácia pedagógica não está comprovada.
2. Banco finito, correção por escolhas/decisões estruturadas e simulação simplificada. Não há correção semântica de texto aberto, equipamento real ou verificação de execução externa.
3. As famílias e o critério de duas observações são heurísticas transparentes; não equivalem a medição psicométrica ou prontidão para CCNA.
4. Revisão reutiliza seu conjunto finito; repetições são identificadas e não aumentam diversidade. Intervalos não estimam memória.
5. localStorage/checksum não impedem fraude ou perda por limpeza do perfil. Outra aba é detectada, mas localStorage não oferece compare-and-swap atômico. Usar uma aba e guardar backups.
6. Chromium, teclado e layouts testados; sem auditoria WCAG completa, teste com leitor de tela, Safari/Firefox ou certificação de acessibilidade.
7. Sem instalador desktop/PWA, sincronização, multiusuário, migração do Hub ou publicação GitHub Pages. Executar com servidor HTTP local.
8. A proposta de múltiplas certificações permanece futura. Revisar esta unidade com iniciantes antes de ampliar o catálogo.

Próximo trabalho recomendado: piloto da R01 com o protocolo existente, revisar problemas observados e só então desenvolver a próxima unidade de endereçamento/sub-redes. A documentação atual não substitui o produto: aulas, exercícios, simulação e persistência estão em código executável no diretório indicado.
