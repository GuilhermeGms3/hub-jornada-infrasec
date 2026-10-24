# CORREÇÃO DE RUMO — PRESERVAR O HUB ORIGINAL E INCORPORAR O ENSINO NOVO

ATENÇÃO: a estratégia anterior de reconstruir livremente a navegação foi revista.

O Hub Jornada InfraSec original já possuía uma estrutura de produto organizada e aprovada pelo proprietário. O objetivo nunca foi substituir essa organização por uma aplicação limitada a um curso de fundamentos.

O problema principal do Hub original era pedagógico: seus conteúdos frequentemente apresentavam tarefas, referências e exercícios sem oferecer aulas completas dentro da plataforma.

A nova NET-R01 começou a resolver esse problema.

**A missão agora é unir o melhor dos dois projetos, preservando a identidade, a navegação e a direção curricular do Hub original.**

## 1. Fonte de verdade para a experiência global

Use a aplicação original como referência funcional e visual obrigatória.

Examine especialmente:

- `hub-estudos-infrasec.html`
- `hub-jornada-guiada.css`
- `hub-modulos.css`
- `src/core/navigation.js`
- `src/data/journey/catalog.js`
- Controllers relacionados à navegação e à jornada.

A estrutura original possui 29 páginas agrupadas em Começar, Redes, Operação e segurança, Cloud e arquitetura, Carreira e Recursos.

Preserve essa organização como estrutura principal do produto.

Preserve, salvo justificativa concreta:

- Identidade InfraSec.
- Sidebar agrupada.
- Hierarquia de navegação.
- Página Hoje.
- Meu nível.
- Plano de 12 semanas.
- Visão de progresso.
- Estrutura de Redes.
- Operação e segurança.
- Cloud e arquitetura.
- Carreira e certificações.
- Recursos.
- Barra contextual.
- Navegação entre módulos.
- URLs e aliases anteriores.
- Acesso às funcionalidades já existentes.

Não confunda preservar a organização com manter regras pedagógicas incorretas.

## 2. Não redesenhar a plataforma

Não crie outra identidade visual.

Não substitua o menu original por uma navegação genérica de plataformas educacionais.

Não crie uma nova homepage só porque o projeto usa React.

Não elimine recursos antigos para simplificar artificialmente o produto.

Não recrie páginas antigas sem necessidade.

Não introduza um novo sistema de navegação se for possível reaproveitar o existente.

Não faça uma migração de framework sem necessidade técnica demonstrada.

Não altere indiscriminadamente o CSS global.

## 3. O que deve ser aproveitado da nova NET-R01

Preserve seu trabalho didático:

- 11 lições de redes.
- Explicações em português.
- Exemplos resolvidos.
- Diagramas.
- Exercícios com feedback.
- Simulador de diagnóstico.
- Prática guiada.
- Avaliação independente.
- Recuperação.
- Revisões.
- Persistência.
- Testes.

Esses componentes constituem o novo padrão de ensino.

Eles não precisam determinar a organização global da plataforma.

A R01 deve ser uma unidade acessível dentro do percurso de Redes do Hub, não a estrutura principal de todo o produto.

## 4. Integração arquitetural

Antes de alterar código, compare duas alternativas:

A. Manter o Hub original como aplicação principal e incorporar o player didático da NET-R01 como módulo integrado.

B. Reproduzir fielmente a navegação e os fluxos globais originais na nova aplicação, preservando os módulos antigos e evitando uma reimplementação desnecessária.

Escolha a alternativa com menor risco de regressão, menor duplicação e melhor preservação das funcionalidades existentes.

Não escolha com base apenas na preferência de framework.

Se houver conflito entre roteadores, estilos ou persistências, resolva-o explicitamente.

Não use iframe como integração definitiva sem justificar limitações de navegação, acessibilidade e estado.

Registre brevemente a decisão e execute a integração.

## 5. Navegação desejada

A sidebar global deve continuar mostrando as áreas principais do Hub.

Ao entrar em Redes, o estudante deve encontrar a formação de redes e suas unidades.

Ao entrar na NET-R01, a interface pode apresentar um sumário contextual das 11 lições.

**Esse sumário contextual não deve substituir a sidebar principal da plataforma.**

O usuário deve conseguir navegar entre as duas escalas sem perder sua posição.

A experiência de leitura da R01 deve continuar limpa, com conteúdo centralizado e pouco ruído visual.

## 6. Preservação funcional

Antes da integração, estabeleça uma linha de base das rotas e funcionalidades existentes.

Após integrar, verifique que:

- As páginas antigas continuam acessíveis.
- A navegação principal preserva seus grupos.
- A página Hoje continua funcional.
- O plano de 12 semanas continua acessível.
- As áreas de segurança, cloud e carreira não desapareceram.
- Os laboratórios e simuladores antigos continuam acessíveis.
- Os links anteriores não foram quebrados.
- O player NET-R01 continua funcionando.
- A persistência da R01 não foi perdida.
- O progresso legado não é apagado.
- Evidências fracas do Hub antigo não são convertidas automaticamente em domínio validado.

Não desative ou remova funcionalidades anteriores apenas para facilitar a integração.

## 7. Testes de fidelidade visual

Capture, quando o ambiente permitir, telas reais do Hub original e da versão integrada para comparação.

Compare:

- Desktop.
- Mobile.
- Sidebar.
- Cabeçalho.
- Grupos de navegação.
- Identidade visual.
- Larguras e espaçamento.
- Estado ativo.
- Página Hoje.
- Página Redes.
- Player da NET-R01.

Documente mudanças intencionais e regressões.

Não apresente imagens geradas ou mockups como capturas reais.

Melhore problemas responsivos demonstrados, mas não use isso como justificativa para redesenhar tudo.

## 8. Conteúdo continua sendo a prioridade

Depois de corrigir a integração, não fique reconstruindo o frontend indefinidamente.

A arquitetura deve permitir continuar adicionando aulas completas aos percursos existentes.

A próxima evolução deve aproveitar os mesmos componentes didáticos para desenvolver novas unidades, sem exigir reorganizar a navegação a cada curso.

O Hub original fornece a organização.

A NET-R01 fornece o novo padrão de ensino.

## 9. Entrega exigida

Implemente efetivamente a integração, execute os testes disponíveis e apresente:

1. Qual alternativa arquitetural foi escolhida.
2. Quais partes originais foram preservadas.
3. Quais componentes da NET-R01 foram integrados.
4. Quais rotas antigas continuam disponíveis.
5. Quais alterações visuais foram necessárias.
6. Como acessar e estudar a R01.
7. Como o progresso foi preservado.
8. Resultados reais dos testes.
9. Regressões ou limitações restantes.

Não entregue apenas mais um planejamento.

Não comece outra reconstrução do zero.

**Critério de sucesso: abrir o Hub Jornada InfraSec, reconhecer a organização original e conseguir entrar numa aula NET-R01 com a profundidade didática da nova implementação.**

A partir daí, a prioridade deverá voltar à expansão do conteúdo real, não à invenção de outro frontend.