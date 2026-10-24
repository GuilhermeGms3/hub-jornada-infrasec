# Cobertura implementada da primeira rodada

Estado de todas as linhas: **implementado + exercícios integrados**; integridade/gabaritos/fluxos
verificados pelos testes registrados no relatório. Revisão técnica realizada pelo agente autor,
com fontes primárias; **revisão humana independente e validação com estudantes pendentes**.
Não são porcentagens de certificação, nem prova de execução em ambiente real.

IDs nas colunas de questões usam o prefixo da unidade, por exemplo `net-r02:i-mask`.
Cada aula possui três seções de explicação, vocabulário, fluxo, exemplo resolvido, confusão comum,
síntese e recuperação alternativa. A recuperação inclui nova questão, não apenas repetição do erro.

| Objetivo observável | Aula / exemplo | Checagem | Avaliação | Recuperação | Revisão |
|---|---|---|---|---|---|
| NET-CONFIG: ler adaptador e campos em contexto | R02/interfaces | c-interface | i-mask | m-fields | r-route |
| NET-DHCP-DORA: distinguir proposta, solicitação e confirmação | R02/dora | c-dora | i-offers | m-ack | r-relay |
| NET-DHCP-LEASE: interpretar renovação, validade e expiração | R02/lease | c-lease | i-t1 | m-renew | r-expired |
| NET-APIPA: investigar configuração sem causa inventada | R02/apipa | c-apipa | i-scope | m-cause | r-ipv6 |
| NET-SCOPE: delimitar operação, tempo e abrangência | R03/escopo | c-scope | i-upload | m-observation | r-vpn |
| NET-TEST-ORDER: escolher testes que reduzam hipóteses | R03/ordem | c-loopback | i-apipa-first | m-gateway | r-local |
| NET-TEST-LIMITS: separar nomes, ICMP, TCP e aplicação | R03/protocolos | c-dns | i-tcp | m-icmp | r-refused |
| NET-TRACE: interpretar sondas, TTL, tempos e asteriscos | R03/tracert | c-stars | i-trace-service | m-ttl | r-rtt |
| OPS-EVIDENCE: distinguir relato, observação e hipótese | R04/registro | c-fact | i-source | m-proof | r-time |
| OPS-RUNBOOK: definir pré-condições, ramos e parada | R04/runbook | c-branch | i-stop | m-safe | r-condition |
| OPS-VALIDATION: planejar retorno e validar a operação afetada | R04/mudanca | c-after | i-rollback | m-service | r-validate |
| OPS-HANDOFF: encaminhar contexto sem inventar causa ou prazo | R04/escalonar | c-handoff | i-sla | m-message | r-portfolio |

## Prática guiada e laboratórios

| Unidade | Caso e coleta | Decisão avaliada | Limite |
|---|---|---|---|
| R02 | Notebook mudou de SSID e mantém configuração manual; comparar cliente, plano e eventos | `net-r02:lab-manual` | Configuração e conclusão sintéticas, não execução Windows |
| R03 | ICMP silencioso, HTTPS inicial funciona, exportação autenticada ainda não reproduzida; motor de outputs R01 reutilizado | `net-r03:lab-scope` | O aluno deve escolher teste da operação, sem encerrar por um único sucesso/falha |
| R04 | Registro anterior e validação que usa ping para uma falha de exportação | `net-r04:lab-validation` | Decisão estruturada separada de runbook editável e exportável autodeclarado |

Critério dos três casos: coleta mínima de evidências + decisão correta; registro como **guided**,
sem promoção a execução real ou domínio independente. O modelo exportado conserva a declaração
de que sua execução externa não foi verificada.

## Jornada

| Missão original da Semana 1 | Ensino interno e sequência nova |
|---|---|
| Caminho da requisição | R01, caminho/IP/gateway/DNS → laboratório R01 → avaliação R01 |
| Ler configuração | R02/interfaces/dora/lease → caso de configuração → avaliação/correção |
| Testar por camadas | R03/escopo/ordem/protocolos/tracert → laboratório → avaliação |
| Investigar APIPA | R02/apipa/dora + R03/ordem → caso guiado e retorno à explicação |
| Runbook | R04 completa → modelo editável → decisões de validação/rollback/encaminhamento |
| Consolidação | Retomar configuração, confrontar resultados e validar operação; resultados locais das quatro unidades |
| Revisão e planejamento | Recuperação por objetivo e revisão posterior R02/R03/R04, com sugestão temporal |

O vínculo nativo está em `coursework/Journey.tsx`. As 12 semanas e 84 missões originais continuam
visíveis; o novo painel distingue o que foi avaliado no recorte local. Nem a conclusão de conjuntos
nem o preenchimento do modelo confirma um lab físico/Packet Tracer ou uma atividade profissional.

## Demais formações

Redes após a Semana 1: **mapeado/planejado**, aulas de subnetting/VLSM, switching/VLAN/trunk,
roteamento/OSPF/ACL/NAT ainda não implementadas no novo padrão. Operação/Linux, Segurança,
Cloud e preparação específica de certificações: **acervo classificado**, produção pedagógica
ainda pendente. Flashcards e bancos de terceiros não estão liberados no novo motor.
