# MACROPROMPT MASTER — RECONSTRUÇÃO DA PLATAFORMA INFRASEC

## PAPEL, MISSÃO E AUTORIDADE

Você atuará como uma equipe multidisciplinar sênior, reunindo as responsabilidades de:

- Arquiteto de software.
- Engenheiro frontend sênior.
- Engenheiro backend, quando necessário.
- Especialista em sistemas de aprendizagem.
- Designer instrucional.
- Professor de redes de computadores.
- Professor de segurança da informação.
- Professor de computação em nuvem.
- Especialista em preparação para certificações.
- Engenheiro de qualidade e testes.
- Especialista em UX educacional.
- Especialista em acessibilidade.
- Especialista em modelagem de dados.
- Revisor técnico e pedagógico.
- Auditor de confiabilidade de avaliações.
- Responsável pela manutenção e evolução do produto.

Seu trabalho não é apenas gerar código.

**Sua missão é conceber e construir uma plataforma de aprendizagem autossuficiente, tecnicamente sustentável, pedagogicamente profunda e capaz de acompanhar a evolução real de um estudante desde o conhecimento zero até a preparação séria para certificações profissionais de tecnologia.**

Você terá acesso a dois projetos de referência:

1. **Hub Jornada InfraSec**, contendo jornadas de redes, segurança, cloud, laboratórios, simuladores, materiais e funcionalidades de acompanhamento.
2. **ConcursoOS**, contendo uma arquitetura de aplicação estruturada, componentes, sessões de estudo, acompanhamento por conhecimento, mecanismos de avaliação, recuperação e revisão.

Considere ambos como fontes de ideias e componentes potencialmente reutilizáveis, não como arquiteturas obrigatórias.

Não presuma que qualquer implementação está correta apenas porque funciona.

Não confunda quantidade de código com qualidade técnica.

Não confunda quantidade de material com profundidade pedagógica.

Não confunda conclusão de atividade com aprendizagem demonstrada.

Não confunda uma aplicação visualmente elaborada com uma plataforma educacional eficaz.

Seu trabalho deve corrigir precisamente esses problemas.

---

# PARTE I — VISÃO E PRINCÍPIOS INEGOCIÁVEIS

## 1. A visão do produto

O produto final deve oferecer uma experiência semelhante à de uma escola técnica digital, mas com aprendizado individualizado, prático e orientado por competências.

A pessoa deve poder iniciar sem conhecimento prévio e avançar progressivamente pelos fundamentos até os assuntos exigidos por certificações.

O estudante deve conseguir:

1. Descobrir o que vai aprender.
2. Entender por que o assunto importa.
3. Aprender conceitos dentro da própria aplicação.
4. Acompanhar exemplos resolvidos.
5. Interagir com demonstrações.
6. Praticar com orientação.
7. Resolver problemas sem orientação.
8. Receber correções compreensíveis.
9. Identificar por que errou.
10. Recuperar conhecimentos fracos.
11. Revisar conhecimentos ao longo do tempo.
12. Aplicar conhecimentos em cenários novos.
13. Executar laboratórios externos quando necessário.
14. Acompanhar seu progresso real.
15. Preparar-se progressivamente para certificações.
16. Consultar conteúdos anteriores sem perder o contexto.
17. Retomar o estudo após interrupções.
18. Entender claramente o que já sabe e o que ainda precisa aprender.

**O ensino deve acontecer prioritariamente dentro da aplicação.**

Materiais externos podem aprofundar, complementar ou permitir a prática técnica, mas não podem ser requisitos para compreender explicações fundamentais.

O estudante não deve precisar procurar outro curso para entender os assuntos que a plataforma anuncia ensinar.

## 2. O erro que não pode se repetir

O antigo Hub Jornada InfraSec desenvolveu funcionalidades de organização, acompanhamento e avaliação sem desenvolver suficientemente a experiência de ensino correspondente.

O resultado contém atividades que pedem ao aluno para estudar determinados assuntos, abrir notas externas ou executar exercícios sem necessariamente ensinar primeiro os conhecimentos necessários.

A reconstrução deve evitar integralmente esse padrão.

São exemplos de conteúdo insuficiente:

- "Estude o modelo OSI."
- "Entenda a diferença entre TCP e UDP."
- "Pesquise o funcionamento do DNS."
- "Abra as notas sobre roteamento."
- "Configure uma VLAN."
- "Explique o funcionamento do NAT."
- "Revise os conceitos antes de realizar o simulado."

Essas frases podem aparecer como objetivos ou instruções auxiliares, mas não constituem aulas.

Uma aula precisa desenvolver as explicações necessárias para cumprir essas instruções.

## 3. Princípio didático central

Para cada conhecimento essencial, o produto deve responder:

- O que é?
- Para que serve?
- Por que existe?
- Qual problema resolve?
- Como funciona?
- Como se relaciona com conhecimentos anteriores?
- Qual exemplo concreto demonstra seu funcionamento?
- Como identificar seu comportamento?
- O que acontece quando falha?
- Quais erros iniciantes costumam cometer?
- Como diferenciar situações parecidas?
- Como aplicar o conhecimento?
- Como verificar se o aluno entendeu?

A explicação deve ser construída de forma progressiva.

Não introduza termos técnicos importantes sem explicá-los.

Não pule fundamentos alegando que são conhecimentos básicos.

Não trate definições curtas como conteúdo suficiente quando o assunto exige mecanismos, exemplos e aplicações.

## 4. Profundidade sem prolixidade

A plataforma deve ensinar profundamente, mas não despejar textos enormes sem estrutura.

Use uma progressão de exposição:

- Explicação inicial intuitiva.
- Conceito técnico preciso.
- Representação visual.
- Exemplo concreto.
- Demonstração do mecanismo.
- Aplicação guiada.
- Comparação com conceitos semelhantes.
- Exercício de verificação.
- Síntese do que foi aprendido.

O texto precisa ter substância.

A interface precisa favorecer a leitura.

A experiência não deve ser artificialmente fragmentada em dezenas de telas de duas frases.

Também não deve apresentar uma única página gigantesca sem organização.

Escolha a granularidade com base na aprendizagem, não na estética.

## 5. Idioma

Toda a experiência principal deve estar em português brasileiro.

Isso inclui:

- Navegação.
- Aulas.
- Objetivos.
- Exemplos.
- Exercícios.
- Feedback.
- Dicas.
- Explicações de gabaritos.
- Recuperação.
- Revisões.
- Mensagens de erro.
- Indicadores de progresso.

Termos técnicos internacionais devem ser preservados quando apropriados, com explicação em português.

Exemplo:

"Domain Name System (DNS), ou Sistema de Nomes de Domínio, é o sistema usado para consultar informações associadas a nomes de domínio."

Não traduza nomes de comandos, protocolos ou produtos de maneira incorreta.

---

# PARTE II — AUDITORIA E REAPROVEITAMENTO DOS PROJETOS

## 6. Inspeção obrigatória dos repositórios

Antes de implementar qualquer funcionalidade, examine os dois projetos reais.

Leia primeiro os arquivos de documentação.

Não tome decisões com base apenas no nome de pastas.

Examine implementações, contratos de dados, dependências, testes e fluxos de usuário.

### Hub Jornada InfraSec

Priorize:

- README.md.
- ARCHITECTURE.md.
- src/main.js.
- src/data.
- src/features.
- src/learning.
- src/journey.
- src/readiness.
- src/core.
- testes.
- projetos/.
- materiais CCNA.
- materiais Security+.
- materiais AWS.
- materiais AZ-900.
- materiais SC-900.
- simuladores.
- laboratórios.

Identifique:

- Atividades que podem ser transformadas em bons exercícios.
- Casos práticos reaproveitáveis.
- Conteúdos com explicações realmente úteis.
- Bancos com problemas de qualidade.
- Critérios de avaliação frágeis.
- Dependências externas.
- Falhas de integração.
- Estruturas de estado reutilizáveis.
- Funcionalidades que não precisam existir na primeira versão.

### ConcursoOS

Examine a arquitetura real, incluindo frontend, backend, contratos de dados, persistência e testes.

Investigue especialmente, quando presentes:

- StudySessionPage.tsx.
- KnowledgeDetailPage.tsx.
- QuestionCard.tsx.
- LearningCycleService.java.
- StudyEngineService.java.
- Modelos de conhecimento.
- Histórico de respostas.
- Avaliações.
- Domínio.
- Sessões de estudo.
- Recuperação.
- Revisão.
- Componentes compartilhados.
- Design system.
- Serviços de persistência.

Não copie as regras do ConcursoOS sem avaliar se servem para ensinar redes, segurança e cloud.

Uma plataforma de concursos e uma plataforma de formação técnica possuem necessidades diferentes.

O aproveitamento deve ser criterioso.

## 7. Matriz obrigatória de reaproveitamento

Produza um documento chamado:

`docs/architecture/REUSE_AUDIT.md`

Esse documento deve apresentar, por componente:

- Origem.
- Caminho real no repositório.
- Finalidade.
- Dependências.
- Pontos fortes.
- Limitações.
- Riscos.
- Decisão de preservar, adaptar, recriar ou descartar.
- Justificativa da decisão.
- Relação com a nova experiência de aprendizagem.

Não copie componentes inteiros apenas porque são sofisticados.

O novo sistema não precisa herdar todos os problemas e responsabilidades das aplicações antigas.

## 8. Reutilização de conteúdo

Considere os materiais anteriores como fontes de referência e candidatos à adaptação.

Cada conteúdo reutilizado deve passar por revisão:

1. Precisão técnica.
2. Atualidade.
3. Clareza.
4. Profundidade.
5. Pré-requisitos.
6. Idioma.
7. Cobertura do objetivo.
8. Licença e atribuição.
9. Qualidade dos exemplos.
10. Qualidade das explicações.
11. Adequação ao formato interativo.
12. Existência de lacunas.
13. Adequação ao público iniciante.

Não incorpore automaticamente grandes coleções de Markdown.

Arquivos Markdown podem ser usados como fonte de autoria, mas precisam resultar em conteúdo renderizado e didaticamente integrado.

Materiais cuja licença não permita o reaproveitamento devem permanecer fora do código redistribuído até existir permissão adequada.

---

# PARTE III — ARQUITETURA DO NOVO SISTEMA

## 9. Escolha arquitetural

Avalie inicialmente React, TypeScript e Vite como candidatos ao frontend, considerando a estrutura do ConcursoOS.

Contudo, confirme se essa escolha oferece vantagens concretas para:

- Componentes didáticos.
- Exercícios interativos.
- Visualizações.
- Estado da aplicação.
- Navegação.
- Testabilidade.
- Manutenção.
- Reaproveitamento.
- Acessibilidade.

Não adote uma arquitetura complexa apenas para parecer profissional.

Não instale um backend antes de demonstrar sua necessidade.

Não copie automaticamente Spring Boot, serviços Python, PostgreSQL, filas, caches ou infraestrutura distribuída.

A primeira unidade deve funcionar com a menor arquitetura que permita evolução sustentável.

## 10. Arquitetura orientada ao domínio educacional

Separe claramente as responsabilidades:

### Conteúdo

Responsável pelas explicações, exemplos, recursos visuais e materiais didáticos.

### Currículo

Responsável pelas trilhas, módulos, unidades, objetivos, pré-requisitos e dependências.

### Exercícios

Responsável pelos tipos de questão, problemas, interações, tentativas e correções.

### Avaliação

Responsável por verificar respostas conforme regras explícitas.

### Evidências

Responsável por registrar o que o estudante efetivamente realizou ou demonstrou.

### Domínio

Responsável por interpretar evidências, respeitando suas limitações.

### Recuperação

Responsável por selecionar intervenções relacionadas às dificuldades observadas.

### Revisão

Responsável por reapresentar conhecimentos em outros momentos e contextos.

### Progresso

Responsável por registrar leitura, estudo, atividades, conclusão, tentativas e retomada.

### Interface

Responsável por apresentar o conteúdo e permitir interações acessíveis.

### Persistência

Responsável por manter dados consistentes, recuperáveis e versionados.

Não misture todas essas responsabilidades em um único componente de página.

## 11. Organização sugerida

A estrutura exata deve resultar da auditoria, mas considere uma organização semelhante a:

```text
src/
  app/
  routes/
  components/
    ui/
    learning/
    exercises/
    diagrams/
    feedback/
  features/
    course-player/
    guided-practice/
    assessments/
    review/
    progress/
  domain/
    curriculum/
    learning/
    evidence/
    mastery/
    assessment/
  content/
    networks/
      r01/
  data/
  persistence/
  services/
  styles/
  tests/

docs/
  architecture/
  pedagogy/
  content/
  quality/
  decisions/
```

Essa estrutura é uma proposta, não uma obrigação.

Evite criar dezenas de diretórios vazios.

Uma pasta só deve existir quando houver conteúdo ou responsabilidade concreta.

## 12. Design de componentes reutilizáveis

Planeje componentes para:

- Objetivos da aula.
- Texto explicativo.
- Exemplos.
- Diagramas.
- Demonstrações passo a passo.
- Conceitos importantes.
- Glossário contextual.
- Exercícios.
- Alternativas.
- Respostas estruturadas.
- Dicas.
- Feedback.
- Recuperação.
- Revisão.
- Progresso.
- Histórico.
- Estados de conclusão.

Crie componentes genéricos somente quando existir repetição real ou um padrão comprovado.

Evite abstrações prematuras.

A primeira unidade deve orientar a criação da biblioteca de componentes, e não o contrário.

## 13. Conteúdo desacoplado da apresentação

A arquitetura deve permitir modificar uma aula sem reescrever os componentes do frontend.

Defina modelos explícitos para:

- Curso.
- Módulo.
- Unidade.
- Lição.
- Bloco didático.
- Exemplo.
- Exercício.
- Tentativa.
- Resposta.
- Feedback.
- Objetivo.
- Evidência.
- Revisão.

Cada entidade precisa ter identificadores estáveis.

O conteúdo deve ter controle de versão.

Evite usar posição em arrays como identidade permanente do progresso.

## 14. Segurança da renderização

Se forem usados Markdown, MDX ou outros formatos de autoria:

- Não permita execução arbitrária de código proveniente de conteúdo não confiável.
- Controle HTML incorporado.
- Valide URLs.
- Evite XSS.
- Restrinja componentes permitidos.
- Trate adequadamente blocos de código e comandos técnicos.
- Não execute exemplos de terminal automaticamente.
- Não permita que dados de progresso sejam interpretados como código.

As decisões devem ser proporcionais ao produto, sem adicionar dependências ou camadas desnecessárias.

---

# PARTE IV — MODELO PEDAGÓGICO

## 15. Hierarquia curricular

Adote uma estrutura conceitual:

**Área → Trilha → Curso → Módulo → Unidade → Lição → Atividade → Evidência.**

Exemplo:

Área: Redes.

Trilha: Fundamentos de Redes.

Curso: Redes do Zero.

Módulo: Comunicação e Conectividade.

Unidade: R01 — Como um computador acessa um site.

Lição: O papel do endereço IP.

Atividade: Identificar a comunicação entre duas máquinas.

Evidência: Respostas e decisões verificadas sobre um cenário novo.

Não transforme obrigatoriamente cada nível em uma tela.

O modelo de dados pode conter mais níveis do que a navegação visível.

## 16. Dependências conceituais

Cada unidade deve declarar os conhecimentos necessários para compreendê-la.

Exemplo:

Para ensinar subnetting, é preciso verificar se o aluno entende:

- Representação de endereços IPv4.
- Relação entre IP e máscara.
- Prefixos.
- Noção de rede e host.
- Representação binária necessária ao cálculo.

Se algum pré-requisito estiver ausente, o sistema deve encaminhar para a explicação correspondente.

Não permita que uma trilha simplesmente presuma conhecimento sem avisar.

## 17. Contrato completo de uma unidade

Uma unidade completa deve conter:

### 17.1 Identificação

- Título.
- Descrição.
- Objetivos observáveis.
- Pré-requisitos.
- Relação com outras unidades.
- Relação com certificações.
- Versão.
- Tempo estimado, quando fundamentado.
- Grau de dificuldade.

### 17.2 Motivação

Explique por que aquele assunto importa.

Use um problema real para criar contexto.

### 17.3 Explicação conceitual

Desenvolva o assunto progressivamente.

Diferencie analogias didáticas do comportamento técnico real.

### 17.4 Demonstração

Mostre visualmente como o mecanismo funciona.

### 17.5 Exemplo resolvido

Resolva um problema completo e explique as decisões.

### 17.6 Checagem de compreensão

Use uma ou mais perguntas curtas para detectar confusões antes de avançar.

### 17.7 Prática guiada

Permita que o aluno trabalhe com dicas graduais.

### 17.8 Prática independente

Apresente um problema novo.

### 17.9 Feedback diagnóstico

Explique os acertos e erros.

### 17.10 Recuperação

Reensine conhecimentos específicos quando necessário.

### 17.11 Síntese

Conecte os conceitos aprendidos.

### 17.12 Revisão

Retome o conhecimento posteriormente em situações diferentes.

### 17.13 Evidências

Registre separadamente o que foi estudado, praticado e demonstrado.

## 18. Objetivos de aprendizagem observáveis

Evite objetivos vagos:

- Conhecer redes.
- Entender DNS.
- Aprender roteamento.

Prefira objetivos verificáveis:

- Diferenciar nome de domínio e endereço IP.
- Explicar a função de um gateway.
- Interpretar uma configuração IPv4.
- Identificar quando duas máquinas estão na mesma sub-rede.
- Escolher um teste apropriado para investigar determinada falha.
- Justificar uma hipótese com base em outputs.
- Reconhecer quando a evidência é insuficiente para afirmar uma causa.

Cada objetivo deve estar associado a uma forma de verificação.

## 19. Exemplos resolvidos

Um exemplo resolvido não pode apresentar apenas pergunta e resposta.

Deve conter:

1. Contexto.
2. Informações disponíveis.
3. Objetivo.
4. Hipóteses possíveis.
5. Seleção do procedimento.
6. Execução ou simulação.
7. Observação.
8. Interpretação.
9. Conclusão.
10. Limites da conclusão.
11. Erros comuns.

O aluno deve conseguir compreender como a conclusão foi construída.

## 20. Prática guiada

A prática guiada deve permitir intervenção progressiva.

Defina níveis de ajuda:

- Nível 0: enunciado original.
- Nível 1: orientação conceitual.
- Nível 2: indicação do aspecto a investigar.
- Nível 3: procedimento sugerido.
- Nível 4: explicação completa.

O nível de ajuda utilizado deve ser registrado.

Uma resposta correta após receber a solução completa não deve contar como desempenho independente.

## 21. Transferência de conhecimento

A avaliação deve apresentar situações diferentes daquelas ensinadas no exemplo.

Não basta trocar números e manter a mesma estrutura textual.

Varie:

- Contexto.
- Sintomas.
- Informações disponíveis.
- Ordem dos eventos.
- Hipóteses.
- Dados irrelevantes.
- Restrições.
- Possíveis explicações.

O objetivo é verificar se o aluno consegue aplicar o princípio aprendido.

## 22. Recuperação direcionada

Quando ocorrer erro, o sistema deve identificar o objetivo de aprendizagem envolvido, quando isso for verificável.

Exemplo:

Erro: confundir DNS com gateway.

Recuperação:

1. Explicar novamente as duas funções.
2. Mostrar um contraste concreto.
3. Apresentar dois casos diferentes.
4. Solicitar classificação e justificativa.
5. Reavaliar com novo cenário.

Não utilize simplesmente "tente novamente" como estratégia principal.

## 23. Revisão e retenção

A revisão deve ocorrer após o aprendizado inicial.

O mecanismo pode utilizar intervalos graduais, mas não precisa adotar um algoritmo sofisticado prematuramente.

Registre:

- Data da aprendizagem.
- Última prática.
- Última demonstração independente.
- Resultado das revisões.
- Objetivos frágeis.
- Objetivos não avaliados recentemente.

Não apresente estimativas de retenção como se fossem medições diretas da memória humana.

---

# PARTE V — MOTOR DE EXERCÍCIOS E AVALIAÇÃO

## 24. Tipos de exercícios

Projete suporte evolutivo para os seguintes tipos:

### Múltipla escolha

Uma resposta correta, alternativas plausíveis e explicação individual.

### Múltipla seleção

Mais de uma resposta correta, com regras explícitas de pontuação.

### Associação

Relacionar conceitos, funções e situações.

### Ordenação

Organizar etapas ou decisões conforme uma lógica técnica.

### Preenchimento estruturado

Completar dados objetivos verificáveis.

### Interpretação de output

Ler resultados de comandos e responder questões contextualizadas.

### Diagnóstico

Analisar sintomas, formular hipóteses e escolher testes.

### Configuração

Informar parâmetros que possam ser validados.

### Simulação de decisão

Selecionar ações em um ambiente com estados verificáveis.

### Laboratório externo

Executar atividades fora da aplicação e registrar evidências, distinguindo evidência autodeclarada de validação efetiva.

### Resposta aberta

Permitir explicações textuais, mas não fingir correção semântica automática quando não existir mecanismo confiável para isso.

Nem todos os tipos precisam ser implementados na primeira entrega.

Implemente os necessários para a R01 e registre os demais no planejamento.

## 25. Contrato de uma questão

Cada questão deve possuir, quando aplicável:

- ID estável.
- Versão.
- Tipo.
- Enunciado.
- Contexto.
- Dados.
- Alternativas.
- Gabarito.
- Explicação da solução.
- Explicação das alternativas incorretas.
- Objetivos avaliados.
- Dificuldade.
- Pré-requisitos.
- Fonte.
- Revisão técnica.
- Idioma.
- Referências oficiais, quando pertinentes.
- Condições de validade.
- Critérios de pontuação.
- Critérios de resposta parcialmente correta.
- Feedback por erro.
- Recomendações de recuperação.

Não force todos esses campos em questões onde não fazem sentido, mas defina um modelo auditável.

## 26. Integridade dos bancos

Garanta:

- IDs únicos dentro do escopo apropriado.
- Gabaritos válidos.
- Alternativas existentes.
- Ausência de opções duplicadas semanticamente.
- Enunciados completos.
- Ausência de ambiguidade não intencional.
- Explicações consistentes com a resposta.
- Referências verificáveis.
- Mapeamento de objetivos.
- Versionamento.
- Tratamento de questões descontinuadas.

Crie validações automatizadas para os problemas que podem ser identificados estruturalmente.

Não afirme que uma questão foi revisada semanticamente apenas porque passou em um validador JSON.

## 27. Pontuação

Separe:

- Pontuação do exercício.
- Conclusão da atividade.
- Desempenho independente.
- Uso de dicas.
- Evidências de competência.
- Revisões.
- Prontidão estimada para certificação.

O sistema não deve permitir que notas altas em atividades fáceis compensem indefinidamente falhas em objetivos essenciais.

A aprovação de uma unidade deve ter critérios claros.

Os limites numéricos iniciais são hipóteses de projeto e devem ser ajustados após validação.

## 28. Evidências de domínio

Não utilize regras como:

"Texto com 80 caracteres = evidência aceita como correta."

Não utilize:

"Cinco palavras-chave encontradas = domínio demonstrado."

Não utilize:

"Checkbox marcado = habilidade comprovada."

Essas informações podem indicar participação ou autodeclaração, mas não domínio.

Classifique evidências pela natureza e confiabilidade.

Exemplo de classes:

- Autodeclaração.
- Leitura concluída.
- Atividade registrada.
- Resposta objetiva corrigida.
- Prática guiada concluída.
- Desempenho independente verificado.
- Desempenho em caso novo.
- Revisão posterior satisfatória.
- Laboratório real documentado e, quando disponível, verificado.

Os indicadores apresentados devem ser compatíveis com as evidências disponíveis.

## 29. Estados de conhecimento

Considere estados como:

- Não iniciado.
- Introduzido.
- Em aprendizagem.
- Prática guiada realizada.
- Aguardando demonstração independente.
- Demonstrado em exercício específico.
- Necessita revisão.
- Fragilidade detectada.
- Evidência desatualizada.
- Evidência insuficiente.

Evite um único percentual que oculte toda a complexidade.

O sistema pode exibir um resumo simples ao usuário, mas deve preservar a rastreabilidade interna.

## 30. Prontidão certificatória

A prontidão não pode depender somente de checkboxes ou notas digitadas.

Quando houver simulados:

- Registre sua origem.
- Versão.
- Objetivos avaliados.
- Quantidade de questões.
- Resultados.
- Histórico.
- Condições de execução.
- Tempo, quando relevante.
- Áreas fracas.
- Limites da avaliação.

Não declare que o aluno está garantidamente pronto para passar.

Diferencie:

- Conteúdo percorrido.
- Objetivos praticados.
- Objetivos avaliados.
- Simulados realizados.
- Preparação estimada.
- Lacunas identificadas.

---

# PARTE VI — EXPERIÊNCIA DE USUÁRIO

## 31. A experiência principal deve ser estudar

A tela principal de aprendizagem não deve parecer um painel administrativo.

Evite priorizar:

- Métricas decorativas.
- Múltiplos menus.
- Ranking.
- Medalhas.
- Painéis de produtividade.
- Cards em excesso.
- Indicadores sem significado pedagógico.

O foco deve ser o conteúdo atual.

O aluno precisa entender imediatamente:

- O que está estudando.
- Onde está no percurso.
- O que já aprendeu.
- O que precisa fazer agora.
- Onde pedir ajuda.
- Como voltar.
- Como revisar.
- Como continuar.

## 32. Estrutura da tela de aula

Considere:

### Cabeçalho discreto

Título, unidade e progresso.

### Navegação contextual

Partes da unidade, sem poluir a tela.

### Área principal

Texto, exemplos, imagens, diagramas, demonstrações e exercícios.

### Ajuda contextual

Glossário, dúvidas comuns e pré-requisitos.

### Ação principal

Continuar, praticar, verificar ou revisar.

### Feedback

Próximo do exercício, sem depender de mensagens genéricas.

A disposição deve ser adaptada a desktop e mobile.

## 33. Qualidade de leitura

Use:

- Tipografia confortável.
- Largura adequada para textos longos.
- Hierarquia clara de títulos.
- Parágrafos legíveis.
- Espaçamento consistente.
- Contraste adequado.
- Destaques moderados.
- Blocos de código legíveis.
- Tabelas responsivas.
- Diagramas compreensíveis.
- Exemplos alinhados ao texto.

Não transforme cada parágrafo em um cartão.

Evite componentes que exigem muitos cliques para revelar explicações básicas.

## 34. Diagramas interativos

Use interatividade quando ela acrescentar compreensão.

Exemplos futuros:

- Visualização de pacotes atravessando uma rede.
- Seleção de um equipamento para compreender sua função.
- Simulação de DNS.
- Comparação de configurações IP.
- Representação de sub-redes.
- Montagem de topologias.
- Caminho de uma requisição.
- Regras de firewall e decisões de tráfego.

Não crie animações meramente decorativas.

Cada visualização precisa ter:

- Objetivo didático.
- Comportamento tecnicamente consistente.
- Legendas.
- Explicação.
- Estado compreensível.
- Alternativa acessível.

## 35. Acessibilidade

Use WCAG 2.2 AA como referência de projeto e teste.

Exija:

- Navegação por teclado.
- Foco visível.
- Semântica adequada.
- Labels.
- Mensagens de erro associadas aos controles.
- Feedback anunciável.
- Contraste.
- Responsividade.
- Zoom.
- Suporte a redução de movimento.
- Não depender somente de cor.
- Alternativas textuais para representações visuais.
- Fluxos que não dependam exclusivamente de arrastar elementos.

Não declare conformidade WCAG sem auditoria.

## 36. Design visual

Crie uma identidade profissional, contemporânea e tranquila.

O produto deve transmitir clareza, competência e confiabilidade.

Não copie integralmente o visual do Hub ou do ConcursoOS.

A identidade deve servir ao aprendizado.

Defina tokens de:

- Cor.
- Tipografia.
- Espaçamento.
- Bordas.
- Estados.
- Foco.
- Feedback.
- Densidade.
- Layout.
- Tema claro/escuro, caso haja justificativa.

Construa consistência sem criar um design system exagerado antes da primeira unidade.

---

# PARTE VII — PRIMEIRO CURSO E PRIMEIRA UNIDADE

## 37. Primeira trilha

A primeira trilha será:

**Redes de Computadores — Do Zero à Base para CCNA.**

Não a anuncie inicialmente como um curso completo de CCNA.

O objetivo inicial é formar uma base sólida e depois expandir para os demais objetivos oficiais.

Planeje a progressão futura sem implementar tudo agora.

Possíveis módulos:

1. Fundamentos da comunicação.
2. Endereçamento IPv4.
3. Máscaras e sub-redes.
4. Ethernet e switching.
5. VLANs.
6. Roteamento.
7. Serviços de rede.
8. Protocolos de transporte e aplicação.
9. Segurança básica de redes.
10. Redes sem fio.
11. Troubleshooting.
12. Automação e programabilidade.
13. Laboratórios integrados.
14. Preparação por objetivos CCNA.

A sequência deve ser revisada pedagogicamente e confrontada com o blueprint oficial da versão aplicável.

## 38. Primeira unidade obrigatória

Identificação:

`NET-R01`

Título:

**Como um computador acessa um site.**

Subtítulo:

**Entenda o caminho da comunicação e aprenda a investigar falhas básicas de conectividade.**

Público:

Iniciante absoluto.

Pré-requisitos:

Uso básico de computador e navegador.

Nenhum conhecimento anterior de redes deve ser obrigatório.

## 39. Problema motivador

Apresente uma situação:

"Você abre o navegador, digita um endereço e a página aparece. O que aconteceu entre o clique e o carregamento?"

Depois apresente variações:

- A página não abre.
- O endereço IP responde, mas o nome não.
- O computador não alcança o gateway.
- A configuração da rede está incorreta.
- O serviço de destino não responde.
- O DNS retorna uma resposta, mas o acesso HTTPS falha.

Esses cenários servirão para construir conhecimento gradualmente.

## 40. Sequência conceitual

Ensine:

### Lição 1 — O que é uma rede

Computadores, dispositivos, comunicação, redes locais e internet.

### Lição 2 — Cliente e servidor

Requisições, respostas e serviços.

### Lição 3 — Identificação na rede

Endereços IP, nomes, endereços MAC e diferenças de função.

### Lição 4 — Comunicação local

Rede local, máscara e destino dentro ou fora da rede.

### Lição 5 — Gateway

Próximo salto, roteamento básico e comunicação remota.

### Lição 6 — DNS

Resolução de nomes, consultas e diferenças entre nome e endereço.

### Lição 7 — Transporte

TCP e o estabelecimento básico de uma conexão.

### Lição 8 — Aplicação e segurança

HTTP, HTTPS e a função de TLS.

### Lição 9 — Caminho completo

Integração dos conceitos em uma comunicação realista.

### Lição 10 — Primeiros diagnósticos

Interpretação de configuração e uso criterioso de comandos.

Essa divisão pode ser ajustada se a análise pedagógica indicar outra organização melhor.

Não simplifique assuntos de forma tecnicamente falsa.

## 41. Aula com profundidade real

Para cada lição, escreva conteúdo suficiente para ensinar o conceito desde o início.

Exemplo: ao ensinar gateway, não basta dizer:

"Gateway é o equipamento utilizado para acessar outras redes."

A explicação precisa desenvolver:

- Por que redes distintas precisam de encaminhamento.
- Como o computador determina se o destino está na rede local.
- O que a máscara representa.
- Por que o gateway precisa ser alcançável.
- O que acontece sem gateway.
- O que acontece com gateway incorreto.
- Como essa falha aparece em testes.
- O que o gateway não faz.
- Como diferenciar essa falha de uma falha DNS.

Aplique esse padrão a todos os conceitos essenciais.

## 42. Exemplo resolvido completo

Utilize um cenário com:

- Computador.
- Endereço IPv4.
- Máscara.
- Gateway.
- DNS.
- Destino remoto.
- Servidor web.

Mostre os passos relevantes:

1. O usuário informa um endereço.
2. O navegador verifica ou solicita resolução de nome, conforme o caso.
3. O sistema determina o destino IP.
4. A máquina identifica o próximo salto.
5. O tráfego percorre a rede.
6. O transporte estabelece comunicação, quando aplicável.
7. TLS protege a sessão HTTPS.
8. A aplicação troca mensagens HTTP.
9. O navegador processa a resposta.

Explique simplificações e variações reais, como cache DNS, proxies, resolução por diferentes caminhos e o fato de nem toda comunicação web usar o mesmo transporte.

O exemplo deve ser didático sem apresentar uma sequência rígida como se fosse universal.

## 43. Laboratório guiado

Use outputs simulados verificáveis.

Exemplo:

```text
IPv4:       192.168.10.25
Máscara:    255.255.255.0
Gateway:    192.168.10.1
DNS:        192.168.10.10
```

Peça ao aluno para interpretar cada campo.

Depois apresente resultados de testes.

O aluno deve compreender qual hipótese cada comando investiga.

Não reduza a prática à memorização de comandos.

## 44. Diagnóstico interativo

Crie cenários que permitam ao aluno selecionar a próxima ação.

O cenário deve possuir estado técnico explícito.

Exemplo de falhas:

- Gateway ausente.
- DNS incorreto.
- Interface sem endereço válido.
- Problema de conectividade local.
- Serviço remoto indisponível.
- Bloqueio de determinado protocolo.

As respostas simuladas devem ser consistentes com o estado modelado.

Não use uma lista fixa de palavras-chave para determinar se o diagnóstico está correto.

## 45. Exercício independente

Apresente um cenário que não seja cópia do exemplo resolvido.

Permita que o aluno:

- Observe evidências.
- Formule hipóteses.
- Escolha testes.
- Interprete resultados.
- Identifique a hipótese mais sustentada.
- Reconheça quando faltam dados.
- Proponha uma próxima ação apropriada.

Avalie cada decisão com regras explícitas.

Não utilize uma justificativa textual longa como principal mecanismo automático de aprovação.

## 46. Feedback

O feedback deve explicar:

- O que a resposta demonstra.
- Por que uma opção é adequada.
- Por que outra não é adequada.
- O que ainda não pode ser concluído.
- Qual conceito foi confundido.
- Qual conteúdo revisar.

Evite:

"Resposta incorreta. Tente novamente."

Prefira explicações diretamente relacionadas ao erro.

## 47. Critério de conclusão da R01

O aluno deve conseguir, sem consultar outro curso:

- Explicar o papel de IP, máscara, gateway e DNS.
- Diferenciar comunicação local e remota.
- Descrever o caminho básico de acesso a um site.
- Relacionar TCP, TLS e HTTP ao acesso web.
- Interpretar uma configuração de rede básica.
- Reconhecer problemas típicos.
- Selecionar testes apropriados.
- Interpretar outputs.
- Resolver um caso independente.
- Justificar decisões com evidências verificáveis.
- Revisar erros conceituais.

A unidade deve distinguir claramente conclusão das aulas de domínio demonstrado.

---

# PARTE VIII — PERSISTÊNCIA E EVOLUÇÃO DOS DADOS

## 48. Persistência mínima confiável

A primeira versão pode utilizar armazenamento local.

Entretanto, implemente:

- Tratamento de falhas de leitura.
- Tratamento de falhas de gravação.
- Validação dos dados persistidos.
- Versão do formato de armazenamento.
- Recuperação de estados inválidos quando possível.
- Retomada do ponto de estudo.
- Histórico básico de tentativas.
- Separação entre conteúdo e progresso.

Não sobrescreva silenciosamente dados inválidos que possam ser recuperados.

## 49. Exportação e importação

Avalie a implementação de backup local com:

- Exportação de progresso.
- Importação validada.
- Versão de esquema.
- Verificação de integridade.
- Tratamento de duplicidades.
- Mensagens claras sobre incompatibilidades.
- Estratégia documentada de migração.

Não é necessário criar contas de usuário para oferecer esse recurso.

## 50. Evolução futura

A arquitetura deve permitir futuramente:

- Login.
- Sincronização.
- Múltiplos dispositivos.
- Progresso em servidor.
- Turmas.
- Acompanhamento docente.
- Catálogo maior.
- Simulados extensos.

Contudo, nenhuma dessas funcionalidades deve ser implementada antes de demonstrada a necessidade.

A preparação para evolução não justifica complexidade excessiva agora.

---

# PARTE IX — CERTIFICAÇÕES E EXPANSÃO

## 51. Certificações pretendidas

A visão de longo prazo inclui:

- Cisco CCNA.
- CompTIA Security+.
- AWS Certified Cloud Practitioner.
- Microsoft Azure Fundamentals AZ-900.
- Microsoft Security, Compliance, and Identity Fundamentals SC-900.
- SC-200.
- SC-300.
- Linux Essentials.
- Certificações fundamentais Fortinet aplicáveis.
- KCNA.

Não implemente todas inicialmente.

Crie apenas uma estratégia de expansão.

## 52. Fontes oficiais

Antes de desenvolver uma trilha certificatória:

1. Identifique a certificação atual.
2. Consulte a documentação oficial.
3. Registre versão e data dos objetivos.
4. Identifique os domínios cobrados.
5. Mapeie cada objetivo.
6. Associe aulas e exercícios.
7. Identifique lacunas.
8. Registre conteúdos ainda não ensinados.
9. Diferencie fundamentos gerais de objetivos específicos da prova.
10. Revise conteúdos após mudanças de blueprint.

Não invente correspondências com editais oficiais.

Se não for possível verificar uma versão atual, registre a limitação.

## 53. Matriz de cobertura

Cada certificação deve possuir futuramente uma matriz:

**Objetivo oficial → Conceitos → Unidades → Exercícios → Evidências → Revisões.**

A existência de uma questão sobre determinado objetivo não significa que o conteúdo foi ensinado adequadamente.

A existência de uma aula também não significa que o aluno dominou o assunto.

Mantenha as duas dimensões separadas.

## 54. Simulados

Os simulados devem permitir:

- Seleção por objetivo.
- Seleção por domínio.
- Modo estudo.
- Modo avaliação.
- Explicações.
- Histórico.
- Revisão de erros.
- Identificação de pontos fracos.
- Versões de bancos.
- Tratamento de questões invalidadas.

Não apresente simulados comunitários como provas oficiais.

Não utilize questões provenientes de fontes cuja redistribuição viole direitos autorais ou condições de uso.

---

# PARTE X — QUALIDADE DE ENGENHARIA

## 55. TypeScript e contratos

Caso TypeScript seja adotado:

- Evite `any` desnecessário.
- Modele estados explicitamente.
- Valide entradas externas.
- Separe regras puras de componentes.
- Defina contratos de persistência.
- Evite estados impossíveis.
- Use identificadores estáveis.
- Trate versões de dados.

Prefira código claro e testável a abstrações difíceis de compreender.

## 56. Testes unitários

Inclua testes para:

- Regras de correção.
- Estados de aprendizagem.
- Critérios de conclusão.
- Integridade dos dados.
- Progressão.
- Recuperação.
- Persistência.
- Versionamento.
- Seleção de exercícios.
- Feedback.
- Tratamento de tentativas.

Teste também os casos de erro e os limites das regras.

## 57. Testes de integração

Verifique:

- Iniciar uma unidade.
- Prosseguir entre lições.
- Responder uma questão.
- Receber feedback.
- Utilizar uma dica.
- Realizar prática guiada.
- Realizar avaliação independente.
- Salvar resultado.
- Retomar após recarregar.
- Revisar uma dificuldade.
- Importar progresso, se implementado.

## 58. Testes end-to-end

Use uma ferramenta adequada ao ambiente escolhido.

Cubra os percursos críticos da primeira unidade.

Não faça os testes dependerem de detalhes frágeis de estilo.

Priorize comportamento observável.

## 59. Testes negativos

Valide que o sistema não concede domínio indevidamente quando:

- O aluno só abre as páginas.
- O aluno marca atividades sem responder.
- O aluno utiliza todas as dicas.
- A resposta objetiva está incorreta.
- Os dados de progresso estão corrompidos.
- Uma tentativa pertence a outra versão do exercício.
- O estudante interrompe a sessão.
- O armazenamento falha.
- Um exercício não possui gabarito válido.
- A resposta está incompleta.

Esses testes são essenciais para corrigir os problemas do Hub anterior.

## 60. Testes de conteúdo

Crie validadores para:

- IDs duplicados.
- Pré-requisitos inexistentes.
- Referências quebradas.
- Objetivos sem conteúdo.
- Exercícios sem gabarito.
- Feedback ausente.
- Conteúdo sem versão.
- Questões sem mapeamento.
- Dependências circulares.
- Unidades com avaliação incompatível.
- Links internos inválidos.

Separe validação estrutural de revisão pedagógica humana.

## 61. Qualidade de código

Exija:

- Componentes com responsabilidade clara.
- Funções previsíveis.
- Tipos adequados.
- Tratamento de erros.
- Testes proporcionais ao risco.
- Código sem duplicação desnecessária.
- Dependências justificadas.
- Documentação útil.
- Sem hacks temporários ocultos.
- Sem componentes gigantescos quando houver divisão natural.
- Sem abstrações vazias.

Evite transformar o projeto em uma coleção de camadas burocráticas.

## 62. Dependências

Antes de adicionar uma biblioteca, responda:

- Qual problema ela resolve?
- Por que a solução atual não basta?
- Qual o custo de manutenção?
- Qual a estabilidade?
- Existe necessidade real?
- Há implicações de licença?
- Há risco de segurança?
- Como será testada?

Não instale bibliotecas apenas para implementar efeitos visuais triviais.

---

# PARTE XI — DOCUMENTAÇÃO OBRIGATÓRIA

## 63. Documentos de arquitetura

Produza:

`docs/architecture/REUSE_AUDIT.md`

Auditoria de reaproveitamento.

`docs/architecture/ARCHITECTURE.md`

Arquitetura real da nova aplicação.

`docs/architecture/DECISIONS.md`

Decisões e trade-offs.

`docs/architecture/DATA_MODEL.md`

Modelo de dados e contratos.

`docs/architecture/PERSISTENCE.md`

Persistência, riscos e evolução.

## 64. Documentos pedagógicos

Produza:

`docs/pedagogy/LEARNING_MODEL.md`

Modelo pedagógico e suas justificativas.

`docs/pedagogy/UNIT_STANDARD.md`

Contrato de uma unidade completa.

`docs/pedagogy/ASSESSMENT_POLICY.md`

O que cada tipo de avaliação pode comprovar.

`docs/pedagogy/MASTERY_POLICY.md`

Interpretação de evidências de domínio.

`docs/pedagogy/REMEDIATION.md`

Recuperação de conhecimentos.

`docs/pedagogy/REVIEW_POLICY.md`

Revisão e retenção.

## 65. Documentos da primeira unidade

Produza:

`docs/content/NET-R01-SPEC.md`

Especificação integral da unidade.

`docs/content/NET-R01-OBJECTIVES.md`

Objetivos verificáveis.

`docs/content/NET-R01-ASSESSMENT.md`

Questões, rubricas e critérios.

`docs/content/NET-R01-CONTENT-REVIEW.md`

Revisão técnica e pedagógica.

Esses documentos não substituem a implementação e as aulas reais.

## 66. Documentos de qualidade

Produza:

`docs/quality/TEST_STRATEGY.md`

Estratégia de testes.

`docs/quality/ACCESSIBILITY.md`

Requisitos e resultados de verificações.

`docs/quality/KNOWN_LIMITATIONS.md`

Limitações conhecidas.

`docs/quality/ACCEPTANCE.md`

Critérios de aceite e respectivas evidências.

Evite documentos repetitivos e genéricos.

Cada arquivo deve registrar decisões ou informações úteis e verificáveis.

---

# PARTE XII — ESTRATÉGIA DE IMPLEMENTAÇÃO

## 67. Trabalhe em fases

A implementação deve ser incremental, mas a visão arquitetural deve considerar a evolução futura.

Não tente criar toda a plataforma em um único commit ou uma única execução.

Não use o planejamento como desculpa para nunca entregar uma unidade funcional.

O objetivo é equilibrar planejamento suficiente e implementação concreta.

## 68. Fase 0 — Auditoria

Entregue:

- Inventário dos projetos.
- Auditoria de reaproveitamento.
- Identificação de dependências.
- Diagnóstico da arquitetura.
- Matriz de riscos.
- Proposta técnica inicial.
- Justificativa das escolhas.

Não altere os projetos originais.

## 69. Fase 1 — Arquitetura mínima

Defina:

- Stack.
- Estrutura de diretórios.
- Contratos de conteúdo.
- Contratos de exercícios.
- Estado da unidade.
- Persistência.
- Navegação.
- Estratégia de testes.
- Componentes mínimos.

Não implemente dashboard, login, simulados completos ou gamificação.

## 70. Fase 2 — Conteúdo pedagógico real

Escreva integralmente a R01.

Não entregue apenas:

- Títulos.
- Placeholders.
- Frases genéricas.
- Listas de conceitos.
- Links.
- Resumos extremamente curtos.

A unidade deve conter ensino substancial, exemplos e exercícios.

Revise sua precisão técnica.

## 71. Fase 3 — Player educacional

Construa a experiência de estudo para apresentar a R01.

Implemente:

- Aulas.
- Navegação.
- Diagramas necessários.
- Exemplos.
- Exercícios.
- Feedback.
- Estado.
- Persistência.
- Retomada.

A interface deve nascer do conteúdo real.

## 72. Fase 4 — Avaliação independente

Implemente o mecanismo necessário para verificar os objetivos da primeira unidade.

Separe atividade guiada de avaliação independente.

Não invente um motor universal de avaliação se a primeira unidade ainda não exige isso.

## 73. Fase 5 — Recuperação e revisão

Implemente recuperação para os erros conceituais efetivamente avaliados na R01.

Crie pelo menos situações alternativas suficientes para não depender somente da repetição do mesmo item.

Registre as evidências com honestidade.

## 74. Fase 6 — Verificação

Execute os testes disponíveis.

Verifique:

- Compilação.
- Tipagem.
- Fluxos.
- Correção.
- Persistência.
- Acessibilidade básica.
- Responsividade.
- Recuperação.
- Integridade de conteúdo.

Não invente resultados.

## 75. Fase 7 — Validação pedagógica

Forneça um protocolo de teste com iniciantes reais.

O teste deve verificar se uma pessoa consegue aprender e resolver um problema novo sem consultar outro curso.

Registre critérios de sucesso, erros, pontos de bloqueio e necessidade de ajuda.

Não afirme eficácia pedagógica comprovada sem realizar essa validação.

## 76. Fase 8 — Expansão

Somente após revisar a primeira unidade, planeje e construa as próximas.

Utilize os componentes comprovadamente úteis.

Não amplie o catálogo antes de estabilizar o padrão didático.

---

# PARTE XIII — GOVERNANÇA E CONTROLE DE ESCOPO

## 77. Prioridades

A ordem de importância é:

1. Precisão técnica.
2. Capacidade de ensinar.
3. Clareza de explicação.
4. Qualidade de exemplos.
5. Qualidade de prática.
6. Correção e feedback.
7. Confiabilidade das evidências.
8. Usabilidade.
9. Acessibilidade.
10. Persistência.
11. Manutenção.
12. Aparência visual.
13. Funcionalidades secundárias.

A aparência visual continua importante, mas não deve comprometer as prioridades anteriores.

## 78. Não construir funcionalidades inúteis

Não implemente inicialmente:

- Rede social.
- Chat comunitário.
- Marketplace.
- Sistema de pagamentos.
- Ranking competitivo.
- Perfil público.
- Integração com dezenas de serviços.
- Administração multiempresa.
- Backend distribuído.
- Agentes autônomos.
- Sistema de recomendação com IA.
- Dashboard executivo.
- Catálogo vazio de certificações.
- Personalização complexa sem dados reais.

Registre ideias futuras separadamente, sem poluir o escopo atual.

## 79. Não esconder lacunas

Sempre diferencie:

- Implementado.
- Parcialmente implementado.
- Planejado.
- Não iniciado.
- Bloqueado.
- Dependente de validação.
- Dependente de fonte oficial.
- Dependente de revisão pedagógica.

Não apresente protótipos como produtos completos.

Não apresente textos de exemplo como conteúdo definitivo.

Não apresente testes escritos como testes executados.

## 80. Não sacrificar a primeira unidade

Caso a implementação seja grande demais para uma única sessão de trabalho:

- Preserve a arquitetura acordada.
- Conclua um recorte vertical funcional.
- Documente as pendências.
- Deixe o repositório em estado utilizável.
- Não preencha lacunas com placeholders enganosos.
- Não anuncie como concluídos recursos incompletos.

A primeira experiência deve continuar sendo a prioridade.

---

# PARTE XIV — CRITÉRIOS FINAIS DE ACEITE

## 81. Aceite técnico

A primeira entrega deve:

- Inicializar corretamente.
- Apresentar a unidade R01.
- Manter navegação consistente.
- Corrigir exercícios.
- Persistir progresso.
- Permitir retomada.
- Tratar erros previsíveis.
- Possuir contratos de dados.
- Possuir testes para regras críticas.
- Não depender dos repositórios antigos em tempo de execução, salvo decisão explícita e justificada.
- Não exigir serviços externos desnecessários.
- Ser utilizável em desktop e dispositivos móveis.

## 82. Aceite pedagógico

A R01 deve:

- Ensinar os conceitos necessários desde o zero.
- Conectar os conceitos em uma explicação coerente.
- Demonstrar o funcionamento da comunicação.
- Conter exemplos resolvidos.
- Conter prática guiada.
- Conter exercícios independentes.
- Conter feedback explicativo.
- Conter recuperação.
- Conter revisão.
- Permitir que o aluno trabalhe em casos inéditos.
- Não exigir outro curso como pré-requisito oculto.

## 83. Aceite de avaliação

O sistema não deve:

- Aprovar conhecimento por comprimento de texto.
- Aprovar por presença de palavras-chave isoladas.
- Interpretar checkboxes como domínio.
- Interpretar leitura como competência.
- Tratar simulação de comando como execução real.
- Aceitar nota autodeclarada como resultado verificado.
- Declarar prontidão profissional ou certificatória sem evidências apropriadas.

## 84. Aceite de qualidade de conteúdo

A unidade precisa ser revisada para verificar:

- Correção factual.
- Coerência conceitual.
- Progressão.
- Terminologia.
- Exemplos.
- Ausência de lacunas importantes.
- Clareza.
- Tratamento de exceções.
- Exercícios adequados.
- Correções completas.
- Compatibilidade entre aula e avaliação.

## 85. Aceite de UX

A interface deve permitir que o estudante:

- Saiba onde está.
- Saiba o que está aprendendo.
- Navegue com facilidade.
- Leia confortavelmente.
- Interaja sem confusão.
- Identifique feedback.
- Consulte conceitos anteriores.
- Retome o estudo.
- Entenda os próprios resultados.

## 86. Aceite de documentação

O projeto deve conter documentação suficiente para outro desenvolvedor:

- Executar.
- Compreender a arquitetura.
- Criar uma unidade nova.
- Criar exercícios.
- Modificar o conteúdo.
- Entender a persistência.
- Executar testes.
- Interpretar critérios de domínio.
- Continuar o desenvolvimento.

A documentação precisa corresponder ao código implementado.

---

# PARTE XV — FORMATO DAS ENTREGAS DO CODEX

## 87. Relatório por etapa

Ao concluir cada etapa, apresente:

### Objetivo executado

O que esta etapa pretendia realizar.

### Arquivos examinados

Quais arquivos foram realmente inspecionados.

### Arquivos criados ou modificados

Caminhos exatos.

### Decisões tomadas

Decisões arquiteturais e pedagógicas.

### Implementação realizada

O que funciona de verdade.

### Testes

Quais foram executados, com resultados.

### Limitações

O que permanece incompleto.

### Riscos

Problemas conhecidos.

### Próxima etapa

O que deve ser feito a seguir.

Não produza relatórios inflados com afirmações genéricas.

## 88. Critério para avançar

Não pule diretamente da auditoria para a implementação de dezenas de componentes.

A progressão será:

**Auditoria → arquitetura mínima → especificação integral da R01 → implementação → testes → validação → expansão.**

Ao final de cada fase, deixe evidências suficientes para revisar a qualidade.

Continue a fase autorizada até alcançar seus critérios de aceite ou identificar um bloqueio real.

Não interrompa o trabalho por perguntas irrelevantes.

Quando uma decisão for reversível e de baixo risco, escolha a alternativa mais simples e documente.

Não altere os projetos originais.

---

# PARTE XVI — REGRAS ABSOLUTAS

## 89. Proibições

É proibido:

1. Recriar o Hub antigo apenas com outro visual.
2. Copiar integralmente o ConcursoOS sem justificativa.
3. Desenvolver infraestrutura complexa antes da experiência de aprendizagem.
4. Criar cursos compostos principalmente por listas de tarefas.
5. Exigir Markdown externo para entender fundamentos.
6. Usar termos técnicos importantes sem explicação.
7. Criar exercícios desconectados das aulas.
8. Criar avaliações sem critérios verificáveis.
9. Usar palavras-chave como prova suficiente de compreensão.
10. Declarar prontidão com base em autodeclarações.
11. Confundir volume de questões com qualidade.
12. Copiar bancos sem revisão.
13. Inventar objetivos oficiais de certificações.
14. Inventar resultados de testes.
15. Ignorar acessibilidade.
16. Descartar dados do estudante silenciosamente.
17. Implementar IA sem justificativa.
18. Adicionar backend sem necessidade demonstrada.
19. Construir funcionalidades decorativas em detrimento do conteúdo.
20. Declarar a plataforma completa porque a interface funciona.
21. Criar dezenas de unidades vazias.
22. Esconder funcionalidades incompletas atrás de indicadores de conclusão.
23. Tratar protótipos como recursos validados.
24. Utilizar conteúdos sem verificar direitos de uso.
25. Alterar os dois repositórios de referência.

## 90. Diretriz máxima

A arquitetura existe para sustentar o ensino.

A interface existe para facilitar a compreensão.

Os exercícios existem para desenvolver e verificar conhecimentos.

O progresso existe para representar evidências honestas.

As revisões existem para melhorar retenção e aplicação.

As certificações existem como objetivos de preparação, não como enfeites de catálogo.

O produto existe para ensinar.

**Quando houver conflito entre mais funcionalidades e melhor aprendizagem, escolha melhor aprendizagem.**

---

# PARTE XVII — INSTRUÇÃO OPERACIONAL INICIAL

Você recebeu dois projetos de referência e esta especificação mestra.

Sua primeira tarefa é executar a Fase 0:

1. Inspecionar os dois projetos.
2. Identificar a arquitetura real de cada um.
3. Mapear componentes reutilizáveis.
4. Mapear conteúdos aproveitáveis.
5. Identificar riscos e limitações.
6. Propor a arquitetura mínima da nova aplicação.
7. Especificar o primeiro percurso de estudo.
8. Registrar decisões fundamentadas em arquivos reais.
9. Preparar um plano de implementação dividido em entregas verificáveis.

**Nesta primeira execução, não modifique código.**

Não faça uma resposta superficial.

Não se limite a repetir este prompt em forma de checklist.

Produza uma análise concreta fundamentada nos projetos.

Sua proposta deve explicar claramente:

- Como a nova aplicação será organizada.
- Qual tecnologia será utilizada e por quê.
- Quais partes do ConcursoOS merecem reaproveitamento.
- Quais partes do Hub InfraSec merecem reaproveitamento.
- Quais funcionalidades serão abandonadas.
- Como será feita a autoria das aulas.
- Como será implementado o player educacional.
- Como serão apresentados exemplos e diagramas.
- Como os exercícios serão corrigidos.
- Como o sistema distinguirá estudo de domínio.
- Como funcionará a recuperação.
- Como funcionará a revisão.
- Como será persistido o progresso.
- Como os testes serão estruturados.
- Como o conteúdo poderá crescer futuramente.
- Quais critérios impedirão repetir os problemas dos projetos antigos.

Termine entregando a arquitetura proposta e a especificação preliminar da R01, com os riscos e as decisões que exigem validação.

**A meta não é construir rapidamente um novo portal. A meta é construir corretamente a fundação de uma plataforma capaz de ensinar redes, segurança e cloud de verdade.**

A primeira unidade completa será a prova de conceito do produto.

Não expanda o escopo antes de demonstrar que essa experiência funciona.