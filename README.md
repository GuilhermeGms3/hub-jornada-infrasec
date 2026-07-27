# Hub Jornada InfraSec

Hub de estudos em formato de jornada para quem quer entrar em Help Desk, NOC, SOC junior, suporte N2 ou infraestrutura/cloud sem se perder em excesso de ferramenta.

O projeto organiza o estudo por semana, dependencias e entregaveis. Em vez de mostrar uma vitrine de links, ele mostra a tarefa atual, a ferramenta certa para aquela tarefa e o artefato que deve virar evidencia de portfolio.

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
- Arvore clicavel por dependencia: IP/DNS/DHCP, VLAN, Inter-VLAN, OSPF, ACL/NAT e cloud/firewall.
- Templates de README de lab, ticket NOC, investigacao SOC e relatorio cloud.
- Secao "Nao estudar ainda" para reduzir dispersao.
- Biblioteca local com materiais CCNA legais/seguros.
- Labs e simuladores plugados localmente.

## Biblioteca CCNA

Materiais incluidos ou referenciados:

- Cisco CCNA 200-301 Exam Topics PDF, documento Cisco Public.
- Amostra oficial gratuita do Cisco Press Official Cert Guide.
- CCNA Simplified, guia online gratuito.
- Notas comunitarias baseadas no curso gratuito Jeremy's IT Lab.

Eu evitei incluir PDFs completos de livros pagos encontrados em sites aleatorios, porque isso normalmente envolve distribuicao nao autorizada.

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
