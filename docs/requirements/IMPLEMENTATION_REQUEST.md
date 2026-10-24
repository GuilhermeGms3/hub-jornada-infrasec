# EXECUÇÃO DE ENGENHARIA — INFRASEC: SAIR DO PLANEJAMENTO E CONSTRUIR

## CONTEXTO

A Fase 0 da reconstrução InfraSec foi concluída na branch `codex/infrasec-reconstrucao-fase-0`, com commit `fd4d5f5`.

Foram produzidos documentos de auditoria dos projetos Hub Jornada InfraSec e ConcursoOS, arquitetura, políticas pedagógicas, critérios de avaliação e especificação preliminar da unidade NET-R01.

O macroprompt mestre permanece como especificação do produto.

**Esta execução NÃO é uma nova fase de planejamento. Sua finalidade é implementar efetivamente a nova aplicação.**

Leia os documentos existentes e trabalhe a partir das decisões fundamentadas. Caso encontre contradições, escolha a alternativa que melhor atenda à aprendizagem, à simplicidade e à manutenção, documentando a decisão.

Não gaste outra execução apenas reescrevendo documentos já produzidos.

## 1. BRANCH E PROTEÇÃO DOS PROJETOS

Crie uma nova branch de implementação a partir do commit mais recente da Fase 0, incorporando seu conteúdo.

Nome sugerido:

`codex/infrasec-r01-implementacao`

Não reinicie a auditoria do zero.

Não altere os projetos originais Hub Jornada InfraSec e ConcursoOS.

Não descarte a documentação existente.

Não execute operações destrutivas sobre arquivos de usuário ou branches alheias.

## 2. OBJETIVO DESTA EXECUÇÃO

Implementar uma nova aplicação InfraSec funcional contendo a **primeira unidade de redes integralmente ensinada, praticada e avaliada dentro da interface**.

Ao final, deve existir uma aplicação que possa ser instalada, iniciada, navegada e utilizada por uma pessoa iniciante.

Não entregue somente componentes genéricos, wireframes, arquivos vazios ou documentação.

Construa a experiência real.

## 3. ESCOPO DE IMPLEMENTAÇÃO

### A. Fundação técnica funcional

Implemente a estrutura necessária para executar a aplicação.

Reaproveite componentes e padrões do ConcursoOS quando isso reduzir esforço sem introduzir dependências desnecessárias.

Utilize a arquitetura definida na Fase 0 ou justifique mudanças pontuais.

A aplicação deve conter:

- Bootstrap funcional.
- Roteamento.
- Layout responsivo.
- Player didático.
- Componentes de conteúdo.
- Componentes de exercícios.
- Estado do estudante.
- Correção verificável.
- Persistência local.
- Retomada do estudo.
- Tratamento de erros.
- Testes automatizados.

Não implemente backend se a primeira experiência não precisar dele.

### B. Experiência de aprendizagem completa

Construa uma interface voltada ao estudo real, não um dashboard administrativo.

O aluno deve conseguir abrir o curso, entrar na unidade R01, estudar os assuntos sequencialmente e realizar atividades sem deixar a aplicação.

Implemente uma navegação coerente entre aulas, exemplos, atividades, avaliação e revisão.

Crie uma identidade visual profissional, limpa e consistente, otimizada para leitura e exercícios técnicos.

### C. Unidade NET-R01 integral

Título: **Como um computador acessa um site**.

Escreva e integre aulas completas em português brasileiro cobrindo:

1. Redes de computadores, dispositivos e comunicação.
2. Cliente e servidor.
3. Rede local e internet.
4. Endereçamento IPv4.
5. Máscaras e identificação da rede local.
6. MAC e comunicação no enlace.
7. Gateway e comunicação remota.
8. DNS e resolução de nomes.
9. TCP e conexões.
10. HTTP, HTTPS e TLS.
11. Caminho completo de uma requisição.
12. Diagnóstico com ipconfig, ping, nslookup e tracert.

Cada assunto precisa ser ensinado com explicações, exemplos e conexões conceituais.

Não entregue um parágrafo curto por tópico.

Não use textos provisórios do tipo "conteúdo em breve".

Não considere uma lista de definições equivalente a uma aula.

Explique primeiro, demonstre depois e só então cobre aplicação.

### D. Diagramas e demonstrações

Implemente recursos visuais úteis para compreender:

- Comunicação entre cliente e servidor.
- Endereçamento local.
- Papel da máscara.
- Papel do gateway.
- Resolução DNS.
- Percurso de uma requisição web.
- Relação entre IP, TCP, TLS e HTTP.

Prefira SVG e componentes locais quando forem suficientes.

Os diagramas devem estar tecnicamente corretos, ser responsivos e possuir explicações textuais e alternativas acessíveis.

Pelo menos uma representação deve permitir acompanhar o fluxo passo a passo, exibindo o que acontece em cada etapa e por quê.

Não crie animações decorativas sem função pedagógica.

### E. Exemplos resolvidos

Inclua exemplos completos de:

- Identificação de rede local.
- Decisão de usar gateway.
- Consulta DNS.
- Acesso a servidor remoto.
- Falha de configuração IPv4.
- Falha de resolução DNS.

Cada exemplo precisa mostrar dados, hipóteses, raciocínio, resultado e interpretação.

### F. Exercícios durante as aulas

Implemente atividades reais com correção específica.

Utilize tipos adequados ao conhecimento, como:

- Múltipla escolha.
- Associação ou classificação.
- Ordenação.
- Interpretação de configuração.
- Interpretação de outputs.
- Seleção de diagnóstico.

Os exercícios precisam possuir gabaritos, justificativas e mapeamento dos conhecimentos avaliados.

### G. Simulador de troubleshooting

Esta é uma das funcionalidades centrais desta execução.

Implemente um simulador didático determinístico de diagnóstico básico de redes.

O aluno receberá cenários com estados técnicos explícitos e poderá escolher comandos ou ações.

O sistema apresentará outputs coerentes com a configuração do cenário.

Inclua, conforme os objetivos da R01:

- Rede funcionando.
- Gateway ausente ou incorreto.
- DNS incorreto ou indisponível.
- Endereço local inválido.
- Falha de conectividade local.
- Destino remoto indisponível.
- Situação em que um ping falha, mas isso não prova ausência de conectividade de aplicação.

O aluno deve selecionar testes, interpretar resultados e tomar decisões.

Não faça a simulação apenas procurar palavras-chave em comandos digitados.

Não gere outputs contraditórios com o estado da rede.

Não chame essa atividade de execução real de terminal.

### H. Prática guiada

Implemente pelo menos um percurso completo de diagnóstico guiado.

O aluno deve poder receber pistas graduais.

Registre quando foram utilizadas.

As pistas não devem ser tratadas como desempenho independente.

### I. Avaliação independente

Crie cenários diferentes dos exemplos resolvidos.

Exija que o aluno:

- Interprete evidências.
- Selecione testes.
- Distinga hipóteses.
- Evite conclusões precipitadas.
- Identifique a explicação mais sustentada.
- Reconheça evidência insuficiente.

Não revele o gabarito antes da conclusão da tentativa.

A correção deve identificar os conceitos envolvidos nos erros.

### J. Recuperação

Implemente recuperação contextual para pelo menos as confusões centrais:

- IP versus DNS.
- Gateway versus DNS.
- Rede local versus rede remota.
- Falha de ICMP versus indisponibilidade de serviço.
- Máscara versus endereço IP.
- Conectividade IP versus aplicação web.

A recuperação deve apresentar uma explicação alternativa e uma nova atividade.

Não se limite a repetir a mesma pergunta.

### K. Revisão

Implemente um mecanismo simples e funcional de revisão da R01.

O estudante deve poder revisar posteriormente usando questões ou casos alternativos.

Registre o resultado e diferencie conhecimento praticado de conhecimento demonstrado de forma independente.

### L. Persistência e retomada

Implemente persistência de:

- Unidade iniciada.
- Lição atual.
- Conteúdo concluído.
- Atividades respondidas.
- Tentativas.
- Dicas utilizadas.
- Resultados.
- Dificuldades identificadas.
- Revisões.

Inclua tratamento de erros de armazenamento.

Se houver exportação/importação, implemente de modo validado e versionado, sem sobrescrever silenciosamente dados incompatíveis.

Não introduza autenticação ou backend sem necessidade.

## 4. CONTEÚDO NÃO PODE SER SUPERFICIAL

Antes de considerar uma lição concluída, verifique:

- Ela explica o assunto desde os pré-requisitos?
- Há terminologia não explicada?
- O aluno consegue construir um modelo mental?
- Existe exemplo resolvido?
- Há aplicações concretas?
- Os erros comuns são discutidos?
- As avaliações cobram apenas o que foi ensinado?
- Um iniciante precisaria procurar outro curso?

Se houver lacunas, complete o conteúdo.

Não encurte explicações apenas para concluir a tarefa mais rapidamente.

Não infle o conteúdo com repetição artificial.

Qualidade didática é obrigatória.

## 5. REUTILIZAÇÃO DOS PROJETOS

Use as conclusões da Fase 0.

Reaproveite o ConcursoOS para componentes, padrões de organização e modelos de estado quando apropriado.

Reaproveite o Hub para casos, laboratórios e questões quando forem tecnicamente adequados.

Não transporte funcionalidades legadas desnecessárias.

Não integre materiais de terceiros sem verificar licença e adequação.

A nova aplicação deve conseguir funcionar independentemente dos projetos antigos.

## 6. TESTES OBRIGATÓRIOS

Implemente e execute testes para:

- Inicialização.
- Navegação.
- Progresso.
- Persistência.
- Correção de respostas.
- Feedback.
- Uso de dicas.
- Avaliação independente.
- Recuperação.
- Revisão.
- Integridade de IDs.
- Gabaritos.
- Objetivos sem atividades.
- Dados corrompidos.
- Prevenção de aprovação indevida.
- Coerência dos estados do simulador.

Teste especialmente que ler aulas, marcar etapas ou usar todas as dicas não produz automaticamente domínio independente.

Se o ambiente permitir, execute também testes end-to-end em navegador e verifique layout em desktop e mobile.

Não invente resultados.

## 7. TRABALHO CONTÍNUO

Esta execução está autorizada a avançar da fundação técnica até a implementação funcional da unidade R01, incluindo testes e correções.

Não interrompa a tarefa apenas porque concluiu o scaffolding.

Não encerre depois de criar componentes visuais vazios.

Não encerre depois de criar os primeiros arquivos de conteúdo.

Não encerre porque a documentação foi atualizada.

Não peça autorização entre subetapas que já estão explicitamente previstas neste comando.

Trabalhe de forma incremental, com código verificável e commits coerentes.

Não existe meta de tempo artificial. O objetivo é entregar o maior conjunto completo e correto de funcionalidades autorizado nesta execução, respeitando os limites reais do ambiente.

Caso uma limitação impeça a conclusão integral, entregue o recorte vertical mais completo possível, sem apresentar partes incompletas como prontas.

## 8. RESULTADO FINAL EXIGIDO

Ao terminar, apresente:

1. Branch e commits realizados.
2. Stack efetivamente utilizada.
3. Estrutura da nova aplicação.
4. Aulas escritas e integradas.
5. Diagramas implementados.
6. Exemplos resolvidos.
7. Exercícios funcionais.
8. Simulador de diagnóstico.
9. Avaliação independente.
10. Recuperação e revisão.
11. Persistência.
12. Testes executados, com resultados.
13. Comando para iniciar a aplicação.
14. Limitações reais.
15. Itens pendentes, se houver.
16. Evidências de que a entrega não é apenas uma interface ou documentação.

Quando possível, utilize capturas de tela reais para mostrar a experiência.

Não afirme que a unidade está pedagogicamente validada sem testes com iniciantes reais.

## 9. CRITÉRIO DE SUCESSO

A entrega deve permitir que uma pessoa abra a aplicação e realmente estude.

Ela deve conseguir aprender o que é IP, máscara, gateway, DNS e o caminho de uma requisição web sem depender de um curso externo.

Deve conseguir acompanhar demonstrações, praticar e receber correções.

Deve conseguir resolver um cenário de diagnóstico que não tenha sido apresentado anteriormente.

Deve conseguir interromper o estudo e retomá-lo.

Deve compreender quais conhecimentos demonstrou e quais ainda precisam ser revisados.

**Não quero outra entrega composta principalmente por documentação. Quero o primeiro produto funcional, com conteúdo real, exercícios reais, correções reais e uma experiência educacional completa.**

Implemente o máximo possível da R01 com profundidade e qualidade, sem sacrificar a precisão técnica para aumentar a quantidade de funcionalidades.

Comece agora pela leitura dos documentos da Fase 0 e avance diretamente para a implementação.