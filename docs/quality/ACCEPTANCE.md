# Entregas, critérios e evidências

Data: 23/10/2026. Fase autorizada nesta execução: Fase 0, conforme instrução operacional do macroprompt. Não confundir proposta de arquitetura com implementação.

## Estado desta entrega

| Critério Fase 0 | Estado / evidência |
| --- | --- |
| Branch separada | `codex/infrasec-reconstrucao-fase-0`, criada sobre `master` em `29f670f` |
| Dois projetos inspecionados | [REUSE_AUDIT](../architecture/REUSE_AUDIT.md), com raízes e commits |
| Matriz concreta de reaproveitamento | Componentes, dependências, limitações e decisão por origem |
| Arquitetura mínima e riscos | [ARCHITECTURE](../architecture/ARCHITECTURE.md), [DECISIONS](../architecture/DECISIONS.md), [KNOWN_LIMITATIONS](KNOWN_LIMITATIONS.md) |
| Primeiro percurso e R01 preliminar | Dez lições, exemplo resolvido, objetivos, casos e políticas em `docs/content` |
| Contratos e evidências honestas | `DATA_MODEL`, `PERSISTENCE` e políticas em `docs/pedagogy` |
| Código original preservado | Diff deve conter apenas `docs/` e atualização documental de `.codex/PROJECT_MEMORY.md` |
| Projeto ConcursoOS preservado | Sem mudanças, serviços, banco, migrations ou dependências alterados |
| Testes do Hub | `npm test`: **147 aprovados em 2,2 minutos**, executados novamente nesta fase |
| Nova aplicação | Não implementada; nenhum teste/build da nova stack executado |

## Verificação documental de encerramento

Executar e registrar: `git diff --check`; inspeção do diff e dos arquivos novos; validação de links relativos e da presença dos documentos exigidos; verificação de que código/manifestos/workflows não mudaram; `git -C F:/DSF/ConcursoOS status --short`. Não existem scripts lint/typecheck/build na raiz do Hub, e documentos novos não exigem executar o build do ConcursoOS. Não há migrations novas.

Os 147 testes verificam o comportamento atual, incluindo bugs caracterizados. Não validam o modelo pedagógico proposto. A suíte do ConcursoOS não foi executada: ele é referência somente de leitura e nenhuma alteração foi feita nele.

Resultados documentais efetivamente obtidos nesta fase:

- Validação por script Node em leitura: **21 arquivos Markdown, 19 documentos exigidos presentes, 41 links relativos verificados, nenhuma falha de link ou estrutura de tabela**. A especificação mestra foi excluída da revisão de tabelas/links porque preserva literalmente o texto recebido.
- SHA-256 do anexo e de `docs/requirements/MASTER_SPEC.md`: `5EA09FCA1BF3EB3EE28A19D0C6F9D9FDE8A621429DB5507EB9C7E1A3BC2F1698`; cópia fiel confirmada.
- Recontagem Node dos catálogos: 12 semanas, 84 missões, 252 passos, 139 manuais; banco CCNA com 628 registros/625 IDs/621 enunciados distintos/295 explicações vazias; Security+ com 145 questões.
- `git diff --check`: sem erros. Busca dirigida por resíduos temporários/credenciais na documentação nova: sem ocorrências nos padrões pesquisados; não equivale a auditoria integral de segredos.
- Consulta de diff por extensões de código/manifestos: nenhuma mudança. `git -C F:/DSF/ConcursoOS status --short`: vazio, referência preservada.

Consultas de documentação técnica foram realizadas via Context7 (skill `context7-mcp`) para React/estado e Vite/deploy, com fontes oficiais vinculadas na arquitetura. As versões observadas nos manifests foram registradas como observadas; versões da aplicação nova não foram instaladas. Este é suporte à proposta, não validação de um toolchain novo.

## Plano de implementação por entregas

| Entrega futura | Trabalho concreto | Critério de saída |
| --- | --- | --- |
| 1 — fundação mínima | Criar `apps/learn`, verificar versões/Node, scripts reais, contratos tipados e adaptador local | Inicia/builda isolado; testes rejeitam dados inválidos; raiz/legado intactos |
| 2 — conteúdo R01 | Redigir aulas completas, demonstração conceitual, exemplos, itens e variantes originais | Matriz O01–O08 completa; gabaritos/feedback por opção; revisão técnica registrada |
| 3 — primeiro percurso funcional | Leitor, sumário, navegação, diagramas, prática, salvar e retomar com conteúdo real | L01 até primeiro exercício utilizável, teclado e mobile testados; sem link externo essencial |
| 4 — avaliação | Runs congelados, correção estruturada, ajuda/consulta e evidências | Erro essencial, repetição ou texto não aprovam indevidamente; casos A/B e variantes testados |
| 5 — recuperação/revisão/backup | Reensinos por erro, agenda simples, histórico e importação/exportação | Caso diferente após ajuda; revisão posterior; restauração íntegra e falhas de storage claras |
| 6 — verificação | Testes unitários/conteúdo/integração/E2E, build de produção em subpasta e acessibilidade básica | Comandos reais executados, resultados e limitações registrados; sem falhas críticas ocultas |
| 7 — piloto | Aplicar protocolo com iniciantes e revisar bloqueios | Resultados observados, sem alegar eficácia sem teste humano |
| 8 — expansão | Planejar NET-R02 e depois demais fundamentos | Padrão da R01 revisado; nenhum catálogo vazio nem promessa CCNA completo |

Não construir todas as entregas num único commit. Contratos da fundação devem permanecer pequenos e ser ajustados pelo conteúdo real; evitar scaffolding extensivo antes das aulas. O primeiro recorte funcional não pode usar placeholders disfarçados de conteúdo definitivo.

## Aceite do produto novo — ainda pendente

- Inicializa isolado, funciona em desktop/mobile e mantém navegação/foco.
- Ensina os fundamentos necessários sem curso externo oculto.
- Explica exemplos e limitações técnicas; dados de simulação são coerentes.
- Corrige decisões estruturadas; texto mínimo, ajuda e notas declaradas não viram domínio.
- Distingue leitura, treino, caso independente e revisão com datas/versionamento.
- Preserva histórico e dados inválidos recuperáveis; backup passa por validação.
- Documenta execução e autoria de unidade/exercício com comandos realmente testados.
- Passa por revisão técnica e piloto exploratório, com limites claros de validade.

Essa lista não está marcada como entregue. A Fase 0 prepara decisões concretas; a R01 funcional continua sendo a prova de conceito a construir.
