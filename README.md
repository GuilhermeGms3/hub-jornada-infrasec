# Hub Jornada InfraSec

Hub de estudos em formato de jornada para quem quer entrar em Help Desk, NOC, SOC junior, suporte N2 ou infraestrutura/cloud sem se perder em excesso de ferramenta.

O projeto organiza o estudo por semana, dependencias e entregaveis. Em vez de mostrar uma vitrine de links, ele mostra a tarefa atual, a ferramenta certa para aquela tarefa e o artefato que deve virar evidencia de portfolio.

Versao publicada: [Hub Jornada InfraSec no GitHub Pages](https://guilhermegms3.github.io/hub-jornada-infrasec/)

## Como usar

Abra `index.html` ou `hub-estudos-infrasec.html` no navegador.

Comece pela Semana 1 e siga a ordem:

1. Leia a missao do dia.
2. Execute as tarefas da semana.
3. Use a ferramenta indicada pela tarefa.
4. Preencha um template de entregavel.
5. So avance quando conseguir explicar o que fez.

## O que tem no hub

- Jornada de 12 semanas.
- Semana 1 detalhada por dia: segunda a fim de semana.
- Sistema de progresso por tarefa com estados `feito`, `revisar` e `nao entendi`, salvo no navegador.
- Arvore clicavel por dependencia: IP/DNS/DHCP, VLAN, Inter-VLAN, OSPF, ACL/NAT e cloud/firewall.
- Templates de README de lab, ticket NOC, investigacao SOC e relatorio cloud.
- Exportacao de templates como arquivo `.md`.
- Mapa rapido de decisao de certificacao por foco: NOC, SOC, Cloud ou DevSecOps.
- Trilhas de Linux e Git/GitHub para suporte, SOC, DevOps e portfolio.
- Secao "Nao estudar ainda" para reduzir dispersao.
- Guia de certificacoes para Fortinet NSE 1-3, AZ-900, AWS Cloud Practitioner, SC-900, CCNA, KCNA, Linux Essentials e Security+.
- Biblioteca categorizada em oficial, comunidade, simulados, labs e cuidado anti-dumps.
- Estante dinamica sincronizada com a semana atual e materiais separados por certificacao.
- Integracao local com Calibre para gerar EPUB ou AZW3 a partir das notas.
- Labs e simuladores plugados localmente.

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

- Cisco CCNA 200-301 Exam Topics PDF, documento Cisco Public.
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
- Fortinet Certified Fundamentals Cybersecurity learning journey.

## Projetos e ferramentas locais

Alguns projetos de terceiros foram copiados para a pasta `projetos/` para uso offline/local. As licencas e creditos originais permanecem nos respectivos diretorios quando fornecidos pelos autores.

Principais ferramentas:

- `CCNA-1-Study-Hub`
- `CCNA-Exam-Simulator`
- `CCNA-Labs`
- `CCNA_Course_Notes`
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
├── index.html
├── hub-estudos-infrasec.html
├── biblioteca/
└── projetos/
```

## Licenca

O codigo do hub criado neste repositório pode ser usado livremente para estudo pessoal. Conteudos de terceiros mantem suas proprias licencas, marcas e termos.

