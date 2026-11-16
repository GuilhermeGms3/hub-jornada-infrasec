# Revisão humana e piloto — pendentes

Testes de software e execução de comandos não substituem revisão humana ou calibração psicométrica. Nenhum índice local estima aprovação Cisco.

## Revisão técnica
Especialista registra data, versão do conteúdo, imagem/versão da bancada, objetivo oficial e problemas encontrados. Por aula verificar precisão, ambiguidade, pré-requisitos, correção de cada alternativa, pistas involuntárias e execução positiva/negativa. Classificar como pendente, aprovado, corrigir ou bloquear, com motivo. Aprovação editorial exige revisão humana efetiva e resolução das falhas bloqueantes.

| Aula | Matriz v2.0 | Evidência a revisar | Estado |
|---|---|---|---|
| ipv6-deep | 1.4, 3.2 | /56-/60-/64, ND, RA, retorno | pendente |
| ospfv3-lab | 3.3 | Full, rota, ping, falha/recuperação | pendente |
| wireless-deep | 1.5, 1.6 | RF versus autenticação/IP/DNS | pendente |
| aaa-deep | 4.1 | reject/timeout e recuperação de gestão | pendente |
| ansible-deep | 5.5 | inventário, coleta, changed=0 e assert negativo | pendente |

## Piloto
Usar voluntários com identificadores aleatórios, sem nomes ou credenciais. Separar primeira tentativa sem consulta de tentativas assistidas; registrar versão, conjunto de itens, resposta, correção, tempo e dificuldade de compreensão. Repetições do mesmo aluno não são amostras independentes.

Começar por entrevistas de compreensão: aluno explica alternativas e executa lab com parâmetros novos. Medir onde o texto induz erro e se a correção permite transferência. Após corrigir ambiguidades, planejar amostra com especialista em avaliação para estimar dificuldade, discriminação, funcionamento dos distratores e incerteza. Não fixar corte nem equivalência Cisco apenas por distribuição de domínios.

Registrar observação, interpretação e decisão editorial separadamente. Não preencher como aprovado sem a atividade correspondente. O ensaio atual permanece aberto, curto e sem validação de prontidão.
