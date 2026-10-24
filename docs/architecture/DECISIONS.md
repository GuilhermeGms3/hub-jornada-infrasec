# Decisões propostas e critérios para revisão

Data: 23/10/2026. Estas decisões orientam a próxima fase; não representam implementação concluída.

| ID | Decisão | Evidência / justificativa | Custo e condição para revisar |
| --- | --- | --- | --- |
| D01 | Entregar apenas Fase 0 nesta execução | Instrução operacional final do macroprompt | A aplicação nova continua não iniciada; avançar posteriormente por recortes verificáveis |
| D02 | Nova aplicação isolada em `apps/learn/` | Hub usa bootstrap legado; usuário pediu branch separada e preservar referências | Mais de um manifesto; separar comandos e publicação, sem deletar raiz |
| D03 | Propor React/TypeScript/Vite, sem servidor | Leitor/exercícios precisam de estados explícitos; ConcursoOS fornece padrões tipados, mas depende de API | Build adicional; verificar versões/engines na Fase 1; ESM continua opção se benefício não se confirmar |
| D04 | Conteúdo original em blocos TypeScript | Catálogos atuais separam dados; `.md` cru e frases imperativas não ensinam | Autoria menos familiar que Markdown; revisar se editor precisará de formato textual seguro |
| D05 | Não copiar motor Java/Python do ConcursoOS | LearningCycleService exige DB/identidade/targets; objetivo inicial é uma unidade local | Sem sincronização/contas; reconsiderar somente com necessidade real |
| D06 | IDs/versionamento e tentativas preservadas | Attempt e MasteryModelV1 limitam repetições e dados editoriais inválidos | Histórico aumenta; avaliar tamanho com dados reais, sem truncamento silencioso |
| D07 | Sem importar domínio antigo | `validateManualStep`, rubricas por termos e nota declarada de certificação | Continuidade do histórico exige exportação/arquivo, não promoção para novo modelo |
| D08 | Desempenho restrito ao objetivo/caso observado | Quatro perguntas antigas não demonstram domínio amplo | Indicadores menos vistosos, mas rastreáveis; ajustar critérios com evidência humana |
| D09 | Revisão simples de 1/3/7 dias como hipótese inicial | Reaproveitar separação de revisão, não retenção numérica do ConcursoOS | Intervalos não calibrados; ajustar em protocolo com iniciantes |
| D10 | localStorage versionado e backup validado | R01 tem pouco estado; storage atual não trata todas as falhas | Sem atomicidade entre múltiplas chaves; usar envelope único, limites e preservação de original |
| D11 | Navegação por hash para R01 estática | Evita exigir fallback servidor e permite deep links | Navegação pequena precisa de validação/foco; adotar Router apenas se fluxo crescer |
| D12 | Nenhuma expansão antes de revisar R01 | Material atual acumulou funções antes de aulas completas | Não haverá catálogo amplo na primeira entrega |
| D13 | R01 sem dependência externa para compreender | Primeira missão atual requer `.md` inglês | Laboratórios externos serão opcionais; futuras práticas reais podem ser obrigatórias com retorno integrado |

## O que não é herdado

Thresholds 70/75/80 do Hub não definem automaticamente a nova política. O 80% proposto para a avaliação R01 é hipótese explícita, com critérios essenciais obrigatórios e observação por objetivo. Estados de confiança, estimativa de retenção e readiness do ConcursoOS não serão apresentados como medição válida para InfraSec.

## Validações ainda necessárias

- Compatibilidade das versões escolhidas com o Node disponível, plugins e ferramentas de teste.
- Profundidade e carga da unidade de dez lições; poderá ser dividida em sessões sem excluir fundamentos.
- Clareza dos diagramas e dos limites de diagnóstico para iniciantes.
- Diversidade suficiente de casos e ausência de pistas involuntárias nas alternativas.
- Persistência em modo privado/quota e restauração sem perda de dados.
- Direitos por ativo se algum código/conteúdo de referência vier a ser copiado.

Nenhum desses pontos justifica alterar as aplicações de referência agora. A ordem de implementação está em [ACCEPTANCE](../quality/ACCEPTANCE.md).
