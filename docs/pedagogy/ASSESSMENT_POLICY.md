# Política de avaliação proposta

## O que cada ação comprova

| Ação | Pode registrar | Não pode comprovar |
| --- | --- | --- |
| Abrir/percorrer aula | Navegação e leitura reconhecida pelo aluno | Entendimento ou retenção |
| Checkbox, nota digitada | Autodeclaração | Prova realizada/verificada |
| Anotação livre | Reflexão salva | Correção semântica automática |
| Checagem objetiva | Acerto daquele item, ajuda e contexto | Domínio amplo por um acerto |
| Prática guiada | Decisão observada com ajuda registrada | Desempenho independente |
| Caso novo sem ajuda | Desempenho nos objetivos e cenário avaliados | Capacidade profissional geral |
| Revisão em outra data | Resultado posterior no recorte avaliado | Percentual de memória ou garantia de aprovação |
| Output de simulador | Ação no cenário modelado | Comando executado em equipamento real |
| Lab externo documentado | Relato/arquivo apresentado e eventual verificação específica | Execução comprovada apenas porque existe texto ou print |

## Correção

O domínio calcula acerto a partir de resposta estruturada, gabarito versionado e estado do cenário. Não confiar em `score`, `passed` ou `correct` recebidos do componente, formulário ou backup. Nenhum comprimento mínimo de texto, regex de palavras-chave ou checkbox concede aprovação.

R01 começa com escolha única, interpretação estruturada de configuração/output e decisões de diagnóstico. Cada alternativa tem explicação e objetivo associado. Rotas de teste tecnicamente equivalentes recebem crédito quando discriminam a hipótese. Penalizar ação destrutiva sem evidência é critério explícito do caso, não veto genérico a ferramentas administrativas.

Checagens e prática guiada mostram feedback imediato. Avaliação independente congela a seleção e só mostra correção completa ao finalizar o conjunto. Resposta não enviada permanece rascunho. Abandono preserva rascunho e histórico, sem produzir aprovação de conjunto.

Ajuda ou consulta da aula permanece possível durante avaliação, mas registra `assisted` e encerra elegibilidade independente desse run. Repetir um item após revelar o gabarito pode consolidar estudo, mas não cria evidência nova por repetição.

## Aprovação local inicial

Critério proposto em [NET-R01-ASSESSMENT](../content/NET-R01-ASSESSMENT.md): ao menos 80% no conjunto e acerto de todos os critérios essenciais definidos por caso, sem ajuda. O corte é hipótese de produto, não benchmark certificado. Texto longo não compensa erro essencial. “Demonstrado neste conjunto” é diferente de “todos os objetivos demonstrados”; a projeção depende da cobertura de cada objetivo.

Se não houver caso novo elegível, mostrar a insuficiência e permitir treino; não simular novidade trocando números. Questão com erro editorial é descontinuada, com impacto visível no resultado e reavaliação quando necessário.
