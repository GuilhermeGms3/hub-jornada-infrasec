# Acessibilidade, usabilidade e piloto pedagógico

Status: requisitos e protocolo; nenhuma auditoria de conformidade da aplicação nova foi realizada.

## Referência e requisitos

WCAG 2.2 AA como meta de projeto. Não declarar conformidade por usar HTML semântico ou passar ferramenta automatizada. Avaliar teclado, foco, contraste, zoom, mensagens, ordem de leitura e conteúdo não textual no fluxo real.

| Fluxo | Aceite proposto |
| --- | --- |
| Ler e navegar | Link para conteúdo; hierarquia h1/h2/h3; mudança de lição foca título; voltar preserva contexto |
| Sumário mobile | Recolhível por botão com nome/estado; conteúdo principal acessível sem atravessar 29 entradas |
| Responder | Fieldset/legend, labels, nomes estáveis e ordem lógica; validação associada ao campo |
| Feedback | Texto perto da resposta, anúncio por status quando adequado; não depender somente de verde/vermelho |
| Diagrama | Controles por teclado, descrição/tabela equivalente, estado textual e legenda; não depender de hover ou arrastar |
| Zoom e viewport | Testar 320/390/768/1440 px e zoom 200%; sem overflow da página; código/tabela podem ter rolagem local identificada |
| Movimento | Respeitar redução de movimento; etapas manuais; animação não contém explicação exclusiva |
| Erro de storage | Aviso perceptível, ação de exportar/retomar e valores preservados |

Testes futuros: teclado sem mouse, contraste medido nos tokens finais, automação como apoio, inspeção com NVDA quando disponível e dispositivos móveis/navegadores escolhidos. Registrar ausências, inclusive leitor de tela não disponível, em vez de alegar cobertura universal.

## Protocolo com iniciantes reais

Objetivo: verificar se o ensino interno prepara para raciocinar num caso novo. Não medir somente satisfação, tempo ou conclusão. Recrutar voluntários sem base de redes; um piloto com 3–5 pessoas é exploratório, não amostra de eficácia estatística. Pedir consentimento para observações e registrar dados mínimos sem informações de rede pessoal.

1. Registrar familiaridade inicial e breve tarefa de diagnóstico sem ensinar o gabarito.
2. Pedir que a pessoa inicie/retome a unidade sozinha, pensando em voz alta quando confortável.
3. Permitir as ajudas da aplicação e anotar onde ela precisa buscar explicação fora.
4. Observar primeiro caso independente, uso de ajuda, decisões, justificativas e limites de conclusão.
5. Realizar recuperação específica e caso diferente; não contar repetição do gabarito como transferência.
6. Agendar revisão posterior em outra data, com variante não revelada.
7. Debrief: conceitos ainda confusos, volume de leitura, diagrama, feedback, navegação e sensação de progresso.

Registrar por participante pseudonimizado: objetivos iniciais/finais observados, tentativas, ajuda máxima, bloqueios, pedidos de fonte externa, abandonos, problemas de acessibilidade, respostas em revisão e sugestões. Não inventar registros para preencher o relatório.

## Critérios de decisão

Uma pessoa consegue explicar os papéis e escolher testes que discriminem hipóteses num caso diferente, usando somente a aula para aprender? Em quais objetivos isso não aconteceu? O feedback permite corrigir raciocínio sem só revelar resposta? Houve erro crítico causado pela própria explicação? Acessibilidade impediu demonstrar o que sabe?

Cada falha deve gerar revisão identificável do conteúdo ou interação. Aprovar para expansão somente após revisar os bloqueios críticos e registrar os limites; não assumir que um acerto isolado ou todos os testes de frontend comprovam ensino eficaz. Ainda não há participantes ou resultados nesta entrega.
