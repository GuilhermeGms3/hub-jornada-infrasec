# Certificações nativas e aprofundamento inicial — 02/11/2026

O catálogo anterior voltou ao frontend React como ensino interno e roteiros
específicos, com prioridade CCNA v2.0/Fortinet. Não houve redesign ou criação de
outro app. Branch `codex/infrasec-certificacoes-ccna2-fortinet`, base `ca95500`.

## Resultado verificável

| Entrega | Quantidade e alcance |
| --- | --- |
| Certificações | 16 percursos: CCNA; NSE 1–7; AWS CLF-C02; AZ-900; SC-900; SC-200; SC-300; Security+; Linux Essentials; KCNA |
| Roteiros | 12 semanas próprias por percurso, 192 semanas no total |
| Ensino novo | 60 aulas-base autorais, compartilhadas entre percursos sem duplicar contagem |
| Estrutura didática | Cada aula tem três parágrafos explicativos, exemplo com três passos de raciocínio, aplicação, recuperação e referência |
| Casos | 60 decisões de compreensão, três opções cada, 180 explicações por alternativa |
| Semana | Objetivo, aulas internas, prática específica, evidência proposta, caderno e lacuna explícita; distribuição opcional em sete dias |
| Continuidade | R01–R04 preservadas: 23 lições e avaliações anteriores permanecem com critérios próprios |
| Progresso | Leitura, caderno, resposta com contexto/versão/data e retomada na mesma cópia |

**192 semanas de roteiro não são 192 unidades completas.** As 60 aulas são base
compartilhada, não um curso integral por exame. Os casos novos têm consulta aberta,
não são simulados calibrados ou provas independentes. Não há transição automática
de nível, nota de prontidão, conclusão de semana por texto nem aprovação por tempo
de leitura. A eficácia com iniciantes ainda não foi medida.

## Abrir

Execute `npm run dev` na raiz e acesse:

- `http://127.0.0.1:4173/platform/index.html#/certificacoes`
- `#/certificacao/ccna` para o roteiro CCNA v2.0.
- `#/certificacao/nse1` até `#/certificacao/nse7` para Fortinet.
- `#/certificacao/nse4/semana/3/aula/fort-policy` para exemplo de ensino interno.

Hoje, Formação de redes e a jornada geral apontam aos roteiros; SOC, Cloud,
Linux/Git, arquitetura e biblioteca também exibem acesso interno pertinente.
As seis seções de navegação e 29 responsabilidades continuam existentes.

## Reuso editorial do Hub

Fonte local examinada: `src/data/academy/catalog.js`, catálogo legado e README.
O catálogo antigo tinha planos por domínio com durações diferentes, além de uma
jornada geral de 12 semanas. Não havia 12 cursos completos de cada certificação
para simplesmente copiar. Os novos roteiros específicos foram escritos nesta etapa.

| Material anterior | Decisão no ensino novo |
| --- | --- |
| w2 VLSM 100/50/20/10 hosts | Preservado e explicado com capacidade, alinhamento, intervalos e erro de máscara |
| w3/noc-vlan | Preservado como caso de VLAN ausente no trunk, com escopo e teste de caminho |
| w4 seleção de rota | Aprofundado com prefixo mais específico e retorno; ping de roteador não substitui teste de host |
| w5/noc-ospf | Preservado com área divergente; acrescentada distinção FULL/2-WAY em topologias broadcast |
| w6/noc-acl | Preservado como ordem de ACL e teste positivo/negativo, sem liberação any/any |
| aws-iam/aws-vpc | Preservados com distinção de bucket/objeto, permissão efetiva, exposição administrativa e auditoria |
| azure-rbac | Corrigido: VM Contributor num escopo menor ainda permite mais ações que apenas iniciar/reiniciar; não é chamado de mínimo |
| azure-nsg | Preservado com distinção Activity Log/telemetria de recurso e acesso recuperável |
| socCases | Padrões e logs sintéticos aproveitados para raciocínio; mudança operacional não vira falso positivo definitivo sem validação |
| Terminal Linux | Intenção dos exercícios preservada; explicação de caminho, pipeline, processo e permissões; sem fingir shell real |
| Rubricas por palavras, tamanho de texto e checks | Não migradas como validação de competência |
| Referências a MD/TXT e listas rasas | Não são o ensino das novas aulas; referências oficiais ficam complementares |
| Bancos de terceiros e imagens externas | Não importados; continuam sujeitos às decisões de `docs/content/ASSET_REUSE.md` |

O acervo anterior não foi excluído fisicamente; ele conserva histórico e ferramentas.
O corte é editorial: material fraco não foi promovido como ensino novo. A exportação
Markdown serve apenas ao caderno produzido pelo aluno, não à leitura obrigatória.

## CCNA e Fortinet

CCNA foi organizada pela matriz **v2.0**, com início do exame em **03/02/2027**:
infraestrutura/conectividade, switching/acesso, roteamento, serviços/segurança e
IA/operações. Cada semana liga objetivos numerados ao roteiro, sem afirmar
cobertura integral. IPv6, OSPFv3, L2 security e recomendações de IA aparecem no plano.

Fortinet segue o programa vigente desde julho de 2026. NSE 5 e 6 são opções de
especialização; não foi inventado requisito de concluir NSE 5 antes de NSE 6.
NSE 7 Secure Networking declara NSE 4 e NSE 5 **ou** NSE 6 na mesma trilha como
pré-requisitos da credencial. NSE 1/2 não são apresentados como cursos que exigem
obrigatoriamente 12 semanas, e NSE 7 não promete formação do zero em 12 semanas.

| Percurso avançado escolhido | O que não está implicitamente coberto |
| --- | --- |
| NSE 5 SD-WAN Core | FortiSwitch, Wireless e os demais caminhos NSE 5 |
| NSE 6 FortiManager | FortiAnalyzer Administrator, FortiNAC e os demais caminhos NSE 6 |
| NSE 7 Secure Networking Architect | SASE, Cloud Security e Security Operations Architect |

Disponibilidade, versão de FortiOS/FortiManager, recursos de VM e licenças devem ser
confirmados antes de executar os labs. Nenhuma imagem ou licença é fornecida.

Referências primárias consultadas:

- [Cisco CCNA v2.0](https://learningcontent.cisco.com/documents/marketing/exam-topics/200-301_CCNA_v2.0_Exam_Topics_PDF.pdf).
- [Programa Fortinet](https://www.fortinet.com/nse-training-update),
  [NSE 5](https://training.fortinet.com/local/staticpage/view.php?page=nse_5_secure_networking),
  [NSE 6](https://training.fortinet.com/local/staticpage/view.php?page=nse_6_secure_networking),
  [NSE 7](https://training.fortinet.com/local/staticpage/view.php?page=nse_7_secure_networking).
- Guias Microsoft [AZ-900](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-900),
  [SC-900](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-900),
  [SC-200](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-200),
  [SC-300](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-300).
- [AWS CLF-C02](https://docs.aws.amazon.com/aws-certification/latest/cloud-practitioner-02/cloud-practitioner-02.html),
  [LPI 010](https://www.lpi.org/our-certifications/exam-010-objectives/),
  [CNCF KCNA](https://www.cncf.io/training/certification/KCNA/).
- [Azure compute roles](https://learn.microsoft.com/en-us/azure/role-based-access-control/built-in-roles/compute)
  e [KQL](https://learn.microsoft.com/en-us/kusto/query/best-practices) para correções técnicas.

As páginas CompTIA V7/V8 retornaram erro no navegador de pesquisa nesta execução.
Por isso Security+ está identificada como **base recuperada SY0-701 com transição a
conferir**, sem datas de lançamento/aposentadoria inventadas nem cobertura V8 alegada.
Não foi realizada comparação exaustiva linha a linha de todos os guias oficiais;
os vínculos semanais não são uma certificação de cobertura.

## Arquitetura e persistência

`certifications/` contém dados tipados de roteiro, conteúdo autoral e a apresentação.
`Options`/`Correction` existentes foram reutilizados. Um alvo opcional de recuperação
permite foco/scroll contextual sem criar hash inválido. As aulas são carregadas em
chunk separado com loading e estado de erro/recarga; nenhuma dependência nova.

O store `useLearning` continua único. Extensão opcional `certifications` versão 1
no envelope `infrasec-learn:v1`: `route`, `read`, `notes`, `attempts`. Cada tentativa
registra certificação, semana, aula, versão, alternativa, modo comprehension e data.
Respostas não são misturadas com avaliação independente. Consulta a essas páginas
durante avaliações R01/R02–R04 mantém o comportamento de marcar assistência.

Backup antigo sem extensão continua válido. Importação substitui todas as áreas e
avisa sobre dados ausentes em cópia antiga, com download do anterior. Builds antigas
com decoder estrito não entendem o campo novo: exporte antes de voltar a elas.
Notas são texto escapado, até 8192 caracteres por semana; até 10 mil respostas,
mesmo limite de 5 MiB do envelope e proteções existentes de corrupção/quota/conflito.
Não há backend, sincronização de conta, banco servidor ou execução remota.

O índice leve de aulas/opções usado na validação é gerado a partir dos dados locais
confiáveis com `node scripts/build-certification-index.cjs`. Testes confrontam o
índice com as aulas publicadas; ao editar IDs, opções ou versão, regenere-o.

## Validação

Os resultados finais são registrados ao encerrar a execução. Os testes cobrem:
rotas/links das 192 semanas; conteúdo e índice; backups antigos/novos; dados malformados;
submissão idempotente; contexto da resposta; ausência de aprovação por leitura/texto;
renderização dos 16 percursos; caderno/exportação; consulta durante avaliação;
layouts 320/390/768/1440 e carregamento do chunk em subdiretório.

Resultados executados:

- `node scripts/build-certification-index.cjs`: 16 certificações, 192 semanas, 60 aulas.
- `npm --prefix apps/learn run format:check` e `lint`: aprovados na revisão final.
- `npm --prefix apps/learn test`: **157 aprovados**, oito arquivos.
- `npm --prefix apps/learn run build` e `build:platform`: aprovados, incluindo TypeScript.
- `npm --prefix apps/learn run test:e2e`: **41 aprovados**, Chromium, bundle de produção.
- `npm test` na raiz: **149 aprovados**; entrada principal conferida novamente após o último bundle.
- `node scripts/capture-certifications.cjs`: oito capturas desktop/mobile, sem overflow ou pageerror.
- `git diff --check`: revisão final sem erros de whitespace.

Capturas em `docs/quality/evidence/certifications-*.png`; inspecionadas visualmente
as telas de catálogo desktop e modelo de políticas mobile. As demonstrações de máscara
e percurso R01 são reutilizadas; o modelo de política é interativo e explicitamente
não emula FortiOS completo. Não concede nota nem tenta executar firewall real.

O build mantém aviso de chunk acima de 500 kB: principal ~599 kB (gzip ~187 kB),
aulas sob demanda ~137 kB (gzip ~48 kB). O aviso não foi ocultado; não foi feito
benchmark de desempenho em rede lenta.

Browser plugin not available: usado Chromium/Playwright do próprio projeto.
Uma primeira execução falhou no import JSON sem atributo e depois na associação de
rótulo do select; ambos foram corrigidos, sem desativar testes.

## O que ainda falta para cursos completos

Prioridade de aprofundamento: laboratórios e unidades independentes de subnetting/
IPv6/OSPFv3/segurança L2 para CCNA; depois FortiOS por versão, SD-WAN Core, FortiManager
e capstone multi-site. Os casos-base compartilhados não substituem aulas específicas
de todos os tópicos desses exames. BGP/ADVPN/recursos enterprise no NSE 7 ainda pedem
unidades dedicadas, como indicado no roteiro.

Demais formações precisam expandir práticas por serviço/produto e avaliações com
situações novas. Faltam piloto com iniciantes, revisão técnica humana independente,
execução dos labs reais e calibração dos bancos. Testes de software não comprovam
eficácia pedagógica nem previsão de aprovação. Sem deploy ou alteração em produção.
