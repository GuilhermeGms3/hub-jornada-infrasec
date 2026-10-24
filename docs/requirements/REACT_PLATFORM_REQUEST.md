# CORREÇÃO ARQUITETURAL DEFINITIVA — INFRASEC

A orientação anterior foi interpretada incorretamente e precisa ser corrigida.

O objetivo NÃO é manter o frontend antigo do Hub Jornada InfraSec como aplicação principal.

Também NÃO é criar uma aplicação nova que ignore a organização, as categorias, as jornadas e os fluxos que o Hub original já possuía.

**O objetivo correto é reconstruir completamente o frontend, aproveitando a arquitetura de informação e a organização funcional e curricular do Hub anterior, enquanto seu conteúdo pedagógico é profundamente reformulado.**

## 1. Três decisões independentes

### Frontend: RECONSTRUIR

Criar e evoluir o novo frontend utilizando a implementação React/TypeScript da NET-R01 como ponto de partida, desde que continue tecnicamente adequada.

A nova interface deve ter identidade visual moderna, componentes reutilizáveis, navegação consistente, ótima responsividade, acessibilidade e experiência de estudo superior.

Não é necessário reproduzir o HTML ou o CSS visual do Hub antigo.

### Organização: PRESERVAR E EVOLUIR

Utilizar o Hub original como referência de arquitetura de informação.

Inspecionar e mapear:

- Grupos da sidebar.
- As 29 páginas e suas responsabilidades.
- Página Hoje.
- Meu nível e progresso.
- Jornada de 12 semanas.
- Missões diárias.
- Redes.
- Help Desk e NOC.
- Linux.
- SOC.
- Cloud e arquitetura.
- Certificações.
- Laboratórios.
- Simulados.
- Carreira.
- Portfólio.
- Recursos.
- Organização interna de cada seção.

Aproveitar a lógica de organização que funciona, corrigindo incoerências e melhorando a UX.

Não copiar a aparência antiga.

Não reduzir o produto inteiro à única unidade NET-R01.

Não criar páginas vazias para fingir que todos os conteúdos já estão disponíveis.

### Conteúdo: RECONSTRUIR PEDAGOGICAMENTE

Utilizar o padrão didático da NET-R01 como referência.

Reformular o conteúdo educacional de cada seção do Hub.

Preservar objetivos, cenários, casos, atividades e laboratórios aproveitáveis, depois de revisão.

Substituir instruções superficiais por ensino real:

- Explicações completas.
- Demonstrações.
- Diagramas.
- Exemplos resolvidos.
- Prática guiada.
- Exercícios independentes.
- Feedback específico.
- Recuperação.
- Revisão.
- Evidências confiáveis.

Não substituir apenas palavras e parágrafos. A reformulação deve melhorar efetivamente o que o aluno consegue compreender e fazer.

## 2. Corrigir a direção da implementação recente

A última execução utilizou o Hub legado como aplicação principal e incorporou a NET-R01 por Shadow DOM.

Essa solução pode ser preservada como referência técnica, mas NÃO representa a arquitetura final desejada.

Avalie a forma segura de continuar a partir da aplicação React NET-R01 anterior, preservando seus conteúdos, correções, simulador, testes e persistência.

Crie uma branch específica para essa correção.

Não apague o trabalho das branches anteriores.

Não reverta commits indiscriminadamente.

Não perca dados de progresso.

Não transporte o frontend legado inteiro para dentro do React.

O novo frontend deve ser a aplicação principal.

## 3. Reconstruir a arquitetura de informação

Antes de criar novas telas, faça um inventário das páginas e seções do Hub antigo.

Para cada seção, registre:

- Nome e posição na navegação antiga.
- Propósito original.
- Conteúdo e organização interna.
- Fluxo do estudante.
- Funcionalidades úteis.
- Problemas pedagógicos.
- Componentes reaproveitáveis.
- Nova representação na interface.
- Conteúdo que precisa ser reescrito.

Use esse inventário para reconstruir a sidebar e a navegação no novo frontend.

Não descarte grupos ou percursos apenas porque a R01 ainda é a única unidade didática concluída.

Não transforme automaticamente todas as antigas páginas em cursos. Algumas representam ferramentas, outras atividades, outras referências e outras áreas de formação.

## 4. Preservar a profundidade da NET-R01

A NET-R01 é a referência de como o novo conteúdo deve ser apresentado.

Preserve suas aulas, diagramas, exemplos, exercícios, simulação, recuperação e revisão.

Integre essa experiência à estrutura de Redes do novo frontend.

O usuário deve conseguir navegar pelo produto e, quando entrar numa unidade, encontrar um ambiente de estudo aprofundado e focado.

A sidebar global organiza a plataforma.

O sumário contextual organiza o estudo da unidade.

Essas duas responsabilidades não devem ser confundidas.

## 5. Respeitar a organização interna antiga

A organização aproveitável não se limita à sidebar.

Examine também a sequência de conteúdos dentro de cada página antiga.

Por exemplo, se uma missão continha objetivo, cenário, passos, laboratório, evidências e revisão, preserve essa lógica quando ela for pedagogicamente adequada.

Mas reformule o conteúdo para incluir as explicações que faltavam.

Não descarte uma estrutura útil apenas porque seu conteúdo era superficial.

Não preserve conteúdo insuficiente apenas porque estava bem organizado.

## 6. Evoluir sem criar um portal vazio

O novo produto deve contemplar toda a visão InfraSec, mas distinguir claramente:

- Funcionalidades efetivamente disponíveis.
- Conteúdos em desenvolvimento.
- Unidades planejadas.
- Ferramentas funcionais.
- Referências complementares.

Não publique cursos vazios.

Não apresente planejamento como formação concluída.

Não invente progresso.

Priorize experiências completas dentro da organização maior.

## 7. Primeira entrega após a correção

Implemente um recorte funcional do novo frontend contendo:

1. Navegação global reconstruída a partir da arquitetura de informação do Hub.
2. Página inicial útil e compatível com o progresso real.
3. Área de Redes organizada conforme a formação original.
4. NET-R01 integrada nativamente como unidade de ensino.
5. Navegação contextual entre lições e atividades.
6. Retomada e persistência preservadas.
7. Tratamento coerente das demais áreas, sem cursos falsos.
8. Testes reais de navegação, regressão e responsividade.

Não pare em documentação ou mockups.

Depois dessa entrega, a prioridade será reformular sistematicamente o conteúdo das demais unidades e seções.

## 8. Restrições

Não usar o frontend legado como aplicação principal definitiva.

Não reproduzir cegamente seu visual.

Não descartar a organização curricular anterior.

Não reduzir InfraSec a um curso de fundamentos de redes.

Não reconstruir desnecessariamente os componentes didáticos da R01.

Não migrar tudo do legado de uma vez.

Não escrever aulas superficiais para preencher menus.

Não instalar backend ou dependências sem justificativa.

Não afirmar que uma seção ensina completamente quando apenas sua navegação foi implementada.

## 9. Critério final

A aplicação deve parecer um InfraSec novo e moderno, mas conservar a lógica e a amplitude de formação que tornavam o projeto anterior organizado.

Ao entrar em cada conteúdo educacional concluído, o estudante deve encontrar ensino aprofundado, como começou a acontecer na NET-R01.

**REFAZER A INTERFACE.
APROVEITAR E EVOLUIR A ORGANIZAÇÃO.
RECONSTRUIR O CONTEÚDO.
REUTILIZAR AS FUNCIONALIDADES BOAS.**

Esses quatro princípios devem orientar todas as próximas implementações.

Execute a correção arquitetural com código real, preserve o trabalho anterior e documente os resultados e limitações verificáveis.