# Hub Jornada InfraSec

Hub de estudos em formato de jornada para quem quer entrar em Help Desk, NOC, SOC junior, suporte N2 ou infraestrutura/cloud sem se perder em excesso de ferramenta.

O projeto organiza o estudo por semana, dependencias e entregaveis. Em vez de mostrar uma vitrine de links, ele mostra a tarefa atual, a ferramenta certa para aquela tarefa e o artefato que deve virar evidencia de portfolio.

Versao publicada: [Hub Jornada InfraSec no GitHub Pages](https://guilhermegms3.github.io/hub-jornada-infrasec/)

## Como usar

Abra `index.html` ou `hub-estudos-infrasec.html` no navegador.

O hub abre em `Hoje`, mostrando somente a missao atual. Comece pela Semana 1 e siga este ciclo:

1. Leia o objetivo, os tres passos e a evidencia exigida.
2. Clique em `Abrir atividade` para ir diretamente ao lab, chamado, terminal ou material correto.
3. Produza a evidencia e marque `Concluir hoje`; use `Nao entendi` quando precisar de uma rota de recuperacao.
4. Avance para a proxima missao somente quando a atual estiver concluida.
5. Abra `Minha jornada` para enxergar a semana inteira e os criterios que liberam a proxima.

A navegacao principal possui 29 paginas internas agrupadas em `Comecar`, `Redes`, `Operacao e seguranca`, `Cloud e arquitetura`, `Carreira` e `Recursos`. Cada rota mostra somente um modulo; os botoes de seta percorrem o curso na ordem. O conteudo antigo continua no projeto em paginas proprias, incluindo visao semanal, tarefas da jornada e Semana 1 detalhada.

As paginas usam hashes compartilháveis, como `#hoje`, `#soc`, `#cloud`, `#portfolio` e `#biblioteca`. Links antigos como `#semana1`, `#academia-pratica` e `#central-carreira` continuam funcionando por meio de aliases.

## Nivel adaptativo

A pagina `Meu nivel` mede oito competencias separadamente: Redes, Help Desk/NOC, Linux/Git, Seguranca/SOC, Cloud, Arquitetura, Carreira/portfolio e Ingles tecnico.

A experiencia usa quatro estados separados para reduzir carga cognitiva:

1. `Visao geral`: uma recomendacao principal e as oito competencias em uma lista comparavel.
2. `Competencia`: nivel atual, caminho N0-N3, requisito seguinte e evidencia encontrada.
3. `Prova`: uma pergunta por vez, sem sidebar ou correcao antecipada.
4. `Resultado`: nota, uma proxima acao, erros abertos e acertos recolhidos.

Diagnostico, preferencias, fila equilibrada e historico continuam disponiveis por divulgacao progressiva, sem competir com a tarefa principal.

- O diagnostico possui 16 perguntas basicas e aceita `Nao sei ainda` sem penalidade artificial.
- Os niveis sao `Comecando`, `Base em formacao`, `Pratica guiada` e `Competencia demonstrada`.
- O diagnostico estima lacunas, mas nao aumenta sozinho um nivel verificado.
- A passagem de N0 para N1 exige prova de fundamentos com pelo menos 75%.
- A passagem de N1 para N2 exige prova aplicada com cenarios e pelo menos 75%.
- A passagem de N2 para N3 exige as duas provas e uma atividade pratica aprovada com evidencia.
- O banco possui 64 questoes autorais, com correcao comentada, melhor nota e historico de tentativas.
- Labs, incidentes, entregaveis e atividades com nota atualizam a competencia correspondente.
- O recomendador escolhe tres areas mais fracas e respeita a ordem de pre-requisitos em caso de empate.
- Telas acima do nivel atual mostram preparacao, glossario e rota anterior antes do conteudo tecnico.
- Nenhum conteudo e removido: o aluno pode liberar a pagina atual ou ativar `Sempre mostrar o conteudo completo`.

As questoes nao sao dumps nem copias de itens sigilosos. O estilo e o escopo foram alinhados a referencias publicas como [CCNA 200-301 v1.1](https://learningcontent.cisco.com/documents/marketing/exam-topics/200-301-CCNA-v1.1.pdf), [LPI Linux Essentials](https://www.lpi.org/our-certifications/linux-essentials-overview/), [AWS CLF-C02](https://docs.aws.amazon.com/aws-certification/latest/cloud-practitioner-02/cloud-practitioner-02.html) e [Microsoft Practice Assessments](https://learn.microsoft.com/en-us/credentials/certifications/practice-assessments-for-microsoft-certifications). Os links oficiais aparecem tambem na prova da competencia correspondente.

## Jornada guiada

A rota principal possui 12 semanas, 60 missoes diarias e uma progressao do zero ao intermediario:

1. Fundamentos de rede: conectividade, IPv4, subnetting, switching, VLAN, roteamento, OSPF, ACL e NAT.
2. Operacao: Linux, troubleshooting, monitoramento, tickets, SLA e comunicacao de incidentes.
3. Seguranca: identidade, menor privilegio, logs, triagem SOC, IOCs e contencao inicial.
4. Cloud: responsabilidade compartilhada, VPC/VNet, security groups/NSG, IAM/RBAC e custos basicos.
5. Integracao profissional: arquitetura operacional, Git, automacao segura, portfolio e entrevista.

Cada semana declara pre-requisitos, resultado esperado, ferramentas, criterio de saida e assuntos que ainda nao devem ser estudados. Cada dia termina em uma evidencia concreta, como diagnostico, tabela, configuracao, ticket, runbook, diagrama ou README.

A ordem foi alinhada a objetivos publicados pela [Cisco Networking Academy](https://www.netacad.com/sites/default/files/course-catalog.pdf), [LPI Linux Essentials](https://www.lpi.org/our-certifications/linux-essentials-overview/), [AWS Cloud Practitioner](https://docs.aws.amazon.com/pt_br/aws-certification/latest/cloud-practitioner-02/cloud-practitioner-02.html), [Microsoft AZ-900](https://learn.microsoft.com/pt-br/credentials/certifications/resources/study-guides/az-900) e [Microsoft SC-900](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-900). A interface segue principios de visibilidade de estado, reconhecimento em vez de memorizacao, prevencao de erro e ajuda contextual das [heuristicas de Nielsen](https://www.nngroup.com/articles/ten-usability-heuristics/).

## O que tem no hub

- Jornada guiada de 12 semanas e 60 missoes diarias.
- Tela `O que estudar hoje` com uma unica missao, passos, evidencia, progresso e rota de recuperacao.
- Mapa completo por fases, dependencias e criterios de saida.
- 29 paginas internas com um unico modulo visivel por rota e navegacao anterior/proximo.
- Menu lateral agrupado por etapa, sem paineis agregadores expostos durante o estudo.
- Sistema de progresso por tarefa com estados `feito`, `revisar` e `nao entendi`, salvo no navegador.
- Arvore clicavel por dependencia: IP/DNS/DHCP, VLAN, Inter-VLAN, OSPF, ACL/NAT e cloud/firewall.
- Templates de README de lab, ticket NOC, investigacao SOC e relatorio cloud.
- Exportacao de templates como arquivo `.md`.
- Mapa rapido de decisao de certificacao por foco: NOC, SOC, Cloud ou DevSecOps.
- Trilhas de Linux e Git/GitHub para suporte, SOC, DevOps e portfolio.
- Secao "Nao estudar ainda" para reduzir dispersao.
- Guia de certificacoes para Fortinet NSE 1-3, AZ-900, AWS Cloud Practitioner, SC-900, SC-200, SC-300, CCNA, KCNA, Linux Essentials e Security+.
- Biblioteca categorizada em oficial, comunidade, simulados, labs e cuidado anti-dumps.
- Estante dinamica sincronizada com a semana atual e materiais separados por certificacao.
- Integracao local com Calibre para gerar EPUB ou AZW3 a partir das notas.
- Central de entregaveis com criacao automatica de rascunhos a partir das tarefas concluidas.
- Gerador de portfolio HTML independente e pronto para GitHub Pages.
- Simulador de chamados Help Desk, NOC e SOC com avaliacao e correcao comentada.
- Laboratorios Packet Tracer com objetivo, topologia, comandos, checklist e validacao.
- Matriz de prontidao para Help Desk, N2, NOC, SOC e Cloud junior.
- Historico de simulados com grafico de evolucao e retorno do assunto fraco para a jornada.
- Fila Kindle com estados de leitura e pacote automatico da semana.
- Modo entrevista limitado aos assuntos ja estudados.
- Ingles tecnico semanal com termos, leitura, traducao, ticket e resposta de entrevista.
- Labs e simuladores plugados localmente.
- Academia Pratica com avaliacao por competencia, nota minima de 80% e geracao de artefato.
- Arquitetura de Sistemas na Pratica com mapas operacionais clicaveis e troubleshooting avaliado.

## Academia Pratica

A Academia Pratica aprofunda as partes que antes funcionavam apenas como introducao:

- seis missoes fechadas para as Semanas 1-6, com pre-requisitos, modelo mental, construcao, falha induzida, checkpoint, rubrica e criterio de saida;
- seis incidentes Help Desk/NOC com SLA, escolha de evidencias, outputs realistas, causa raiz, acao, escalonamento e ticket avaliado;
- quatro casos SOC com logs sinteticos, classificacao, severidade, IOCs, linha do tempo, contencao e mapeamento MITRE ATT&CK;
- quatro analises AWS/Azure sobre IAM, RBAC, VPC/VNet, SG/NSG, auditoria, custo e menor privilegio;
- oito desafios sequenciais de terminal para arquivos, permissoes, services, logs, rede, Git, branches e reversao;
- planos por dominio para CCNA v1.1, AWS CLF-C02, AZ-900, SC-900, SC-200, SC-300, Security+, Fortinet NSE 1-3 e Linux Essentials.
- seis mapas de arquitetura: cliente-servidor, camadas, monolito/microsservicos, sistemas distribuidos, cloud e Zero Trust.

Uma atividade aprovada gera um entregavel na Central de Evidencias. Os desafios de terminal sao simulados e devem ser repetidos em WSL ou VM antes de o output ser usado como evidencia real de portfolio.

### Arquitetura de Sistemas na Pratica

Cada mapa apresenta os componentes na ordem do fluxo. Ao selecionar um componente, o hub mostra responsabilidade, entradas e saidas, dependencias, telemetria e pontos de falha. O exercicio associado exige escolher evidencias, localizar o dominio da falha, responder checkpoints e produzir um relatorio com diagrama textual.

Uma nota de pelo menos 80% gera automaticamente um artefato Markdown com diagrama Mermaid para o portfolio. O progresso tambem alimenta os portoes de prontidao de N2, NOC, SOC, Cloud e DevSecOps junior.

## Central de Carreira

A Central de Carreira concentra oito modulos em abas para nao sobrecarregar a navegacao principal:

1. `Portfolio`: tarefas marcadas como `feito` geram rascunhos de README, ticket, relatorio, print ou diagrama. Tambem permite criar, editar, concluir e baixar entregaveis em Markdown.
2. `Chamados`: quatro incidentes introdutorios; a Academia Pratica adiciona seis casos completos de Help Desk/NOC.
3. `Labs`: quatro laboratorios Packet Tracer possuem topologia real, comandos esperados e testes manuais de validacao.
4. `Prontidao por evidencias`: exige portoes especificos por cargo e limita a nota quando uma competencia critica esta ausente.
5. `Simulados`: guarda pontuacoes, exibe evolucao e identifica o assunto que precisa voltar para a jornada.
6. `Fila Kindle`: acompanha materiais nos estados `quero ler`, `enviado`, `lendo` e `finalizado`.
7. `Entrevista`: libera perguntas conforme o estudo, pontua conceitos e estrutura e faz uma pergunta de aprofundamento.
8. `English`: oferece cinco termos por semana, documentacao curta, traducao, ticket e resposta de entrevista com rubrica.

Os dados ficam no `localStorage` do navegador e sobrevivem a recarregamentos.

### Publicar o portfolio

Na aba `Portfolio`, clique em `Gerar meu portfolio`. O hub baixa um arquivo independente chamado `portfolio-infrasec.html`.

Esse arquivo pode ser colocado em qualquer repositorio publicado pelo GitHub Pages. Ele ja inclui os entregaveis, quantidade de tarefas feitas, labs validados e media dos simulados existentes no momento da exportacao.

## Estante Kindle e Calibre

O GitHub Pages nao consegue acessar um Kindle conectado por USB. Por isso, o hub monta o comando e o script local faz a integracao com o Calibre.

Ao trocar a semana da jornada ou o seletor da estante, os dois primeiros livros mudam automaticamente para as leituras correspondentes. Os guias de certificacao permanecem disponiveis na mesma prateleira para consulta.

Com o Calibre instalado, execute na raiz do projeto:

```powershell
.\scripts\preparar-kindle.ps1 -Week 1 -Format epub
```

O resultado fica em `dist/kindle/`. As notas da semana viram EPUB ou AZW3 e os PDFs oficiais sao preservados como PDF, pois documentos com tabelas e diagramas frequentemente perdem qualidade na conversao.

Para copiar diretamente para uma pasta do Kindle montada no Windows:

```powershell
.\scripts\preparar-kindle.ps1 -Week 1 -Format azw3 -KindlePath "E:\documents"
```

Use `epub` para enviar pelo Send to Kindle e `azw3` para enviar pelo Calibre ou por USB.

Quem estiver usando apenas o GitHub Pages deve baixar o projeto completo, extrair o ZIP e executar o comando dentro da pasta extraida. Um navegador nao recebe permissao para chamar programas locais ou gravar diretamente em um dispositivo USB.

## Biblioteca CCNA

Materiais incluidos ou referenciados:

- Cisco CCNA 200-301 v1.1 Exam Topics PDF, documento Cisco Public.
- Amostra oficial gratuita do Cisco Press Official Cert Guide.
- CCNA Simplified, guia online gratuito.
- Notas comunitarias baseadas no curso gratuito Jeremy's IT Lab.

Eu evitei incluir PDFs completos de livros pagos encontrados em sites aleatorios, porque isso normalmente envolve distribuicao nao autorizada.

## Certificacoes

A secao de certificacoes organiza:

- prioridade para quem mira Help Desk, NOC, SOC junior, suporte N2 e base DevSecOps;
- custo aproximado/status de gratuidade quando indicado por fonte oficial;
- worktree de estudo reutilizavel: blueprint, base, lab, simulado e decisao;
- antenas locais para AWS CLF-C02, AZ-900, SC-900 e Fortinet fundamentals;
- PDFs oficiais/seguros quando disponiveis.

Materiais locais adicionados:

- AWS Cloud Practitioner CLF-C02 official exam guide.
- SC-900 Exam Ref sample PDF da Pearson/Microsoft Press.
- AWS Cloud Practitioner Notes e practice exam local.
- AZ-900 community study guide.
- SC-900 static study prep.
- Security+ SY0-701 Exam90 local, com timer, PBQs, questoes autorais e revisao por dominio.
- SC-200 e SC-300 com blueprint oficial vivo e plano pratico acompanhado pelo hub.
- Fortinet Certified Fundamentals Cybersecurity learning journey.

## Projetos e ferramentas locais

Alguns projetos de terceiros foram copiados para a pasta `projetos/` para uso offline/local. As licencas e creditos originais permanecem nos respectivos diretorios quando fornecidos pelos autores.

Principais ferramentas:

- `CCNA-1-Study-Hub`
- `CCNA-Exam-Simulator`
- `CCNA-Labs`
- `CCNA_Course_Notes`
- `cert-antenas/security-plus-sy0-701`
- `soc-roadmap-2026`
- `cybersecurity-career-roadmap`
- `Cloud-Security-Projects-For-Beginners`
- `Awesome-CloudSec-Labs`
- `awesome-soc`
- `awesome-soc-analyst`

## Observacoes

Os arquivos `.pkt` precisam do Cisco Packet Tracer instalado.

O hub salva algumas preferencias no `localStorage` do navegador, como a semana atual.

## Estrutura

```text
.
|-- index.html
|-- hub-estudos-infrasec.html
|-- hub-modulos.css
|-- hub-modulos.js
|-- hub-aprofundamento.css
|-- hub-aprofundamento.js
|-- hub-arquitetura.css
|-- hub-arquitetura.js
|-- hub-jornada-guiada.css
|-- hub-jornada-guiada.js
|-- hub-nivel-adaptativo.js
|-- hub-provas-nivel.js
|-- scripts/
|-- biblioteca/
`-- projetos/
```

## Licenca

O codigo do hub criado neste repositório pode ser usado livremente para estudo pessoal. Conteudos de terceiros mantem suas proprias licencas, marcas e termos.

