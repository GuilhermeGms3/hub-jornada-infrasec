# Acervo, procedência e decisões de uso — 24/10/2026

Inspeção do checkout completo na branch `codex/infrasec-expansao-semana-1`, base `91538e2`.
Contagens e manifestos de metadados em [ASSET_AUDIT.json](ASSET_AUDIT.json), reproduzíveis com
`node scripts/audit-learning-assets.cjs`. O script não republica enunciados; fingerprints e linha
de origem permitem investigação sem utilizar posição no array como identidade do conteúdo novo.
Nenhuma exclusão do antigo ZIP foi tratada como ausência no repositório.

## Classificação por componente

A = instrução aproveitável; B = referência; C = exercício/banco; D = ferramenta; E = laboratório;
F = currículo; G = retido para reutilização por insuficiência, incompatibilidade ou direitos incertos.
Uma origem pode conter componentes distintos, classificados separadamente abaixo. A classe G de
importação não afirma que todo o projeto seja tecnicamente ruim.

| Origem/componente | Classe | Inspeção real e valor | Decisão nesta rodada |
|---|---|---|---|
| InfraSec `apps/learn/src/content/lessons.ts` | A | 11 aulas R01 com explicações, exemplos, exercícios e limites já funcionais | Conteúdo preservado; padrão didático e componentes reutilizados |
| Hub `src/data/journey/catalog.js` | F | 12 semanas, 84 missões, objetivos, pré-requisitos, entregáveis, consolidação/revisão | Organização preservada; sete missões relacionadas a aulas internas R01–R04 |
| Hub `step-guidance.js` e `src/journey/session.js` | F | Passos, perguntas, outputs, evidência e estados; 252 passos | Sequência útil, sem importar aprovação por texto/checkbox como evidência independente |
| Hub `src/data/academy/catalog.js` | E | Construção, falha induzida, checkpoints e rubricas; casos DHCP/DNS | Cenários e perguntas operacionais inspiram material autoral; não copiar avaliador por termos |
| Hub adaptive/learning/readiness/exams | F | Oito competências, N0–N3, notas, thresholds e recomendação | Contraste conceitual para separar estudo, atividade e domínio; notas antigas não importadas |
| Hub `src/data/architecture/catalog.js` | D | Mapas de componentes, fluxo, falha e resolução | Manter acesso anterior; não converter mapa/quiz em curso concluído |
| ConcursoOS `LearningCycleService`, `ReviewService`, ADR 0025 | F | Separar orquestração, conteúdo, tentativas, revisão e hipóteses de recuperação | Referência de comportamento; nenhum código Java, banco ou migration copiado/executado |
| CCNA Exam Simulator, aplicativo | D | Prática por categoria, configuração de exame, seleção/embaralhamento, temporizador, revisão, pesos por tipo | Inspeção estática em `src/features`, `src/utils`, `AppContext`; aplicativo não incorporado |
| CCNA Exam Simulator, `questions.js` | G | 628 registros, 625 IDs; colisões 290/291/292, sete registros redundantes por prompt normalizado; 295 explicações vazias | Manifesto retido, zero importação; corrigir identidade e revisar direitos/gabaritos antes de liberar |
| CCNA-1 `quiz.html`, motor | D | POOL, modos study/exam/wrong, EXAM_SIZE=60, TIMER_SECS=4500, grupos e embaralhamento; `ccna1_wrongs_v2` | Função shuffle adaptada para TypeScript com licença/aviso completos; nenhum app duplicado |
| CCNA-1 `POOL`, 143 questões | G | Gabaritos e explicações presentes; README associa material a Practice Final/Final Exam; amostras com inferência excessiva | Zero questões copiadas: procedência individual e revisão semântica pendentes |
| CCNA-1 `trainer.html` | D | Cenários CLI, reconhecimento de prefixos, tabelas VLSM e fluxo PTSA | Referência para futuro treino; simulação não é IOS/equipamento real; não integrada nesta rodada |
| CCNA_Course_Notes | B | 67 arquivos MD; DHCP, DNS, IP e switching com tópicos e imagens externas de curso | Usar temas como referência; aulas novas são redação original, não tradução/copypaste de slides |
| CCNA-Labs | E | 27 `.pkt`, um PDF e 46 imagens reais no checkout; README credita curso de eng. Hussian Almalki | Acervo preservado; não declarar ausência nem execução. Direitos de material subjacente exigem revisão |
| Security+ `assets/quiz.js` | D | Seleção por domínio, fracos 50/50, log de erros, presets, timer/sem timer, 1 ou 2 chances, PBQs substituem MCQs no total | Inspeção de funções de pool, submissão, score, misses e timer; nenhuma pontuação 0,5 vira desempenho independente |
| Security+ `quiz-data.js` | C | 145 MCQs, 12 PBQs, domínio, gabarito, explicações e dicas; README antigo ainda menciona 90 em tabela | Manifesto de importação retido; primeiro ensinar fundamentos de segurança e revisar itens/procedência |
| AWS Cloud Practitioner notes | B | Arquivos por serviços/domínios e notas rápidas de revisão | Base temática para lote Cloud, sem alegação de atualização oficial automática |
| AWS `practice-exam/` | C | 23 arquivos `practice-exam-N.md`, mais índice `exams.md` | Não confundir 24 arquivos MD com 24 provas; nenhum item importado |
| AZ-900 `README.md` e imagens | B | Conceitos Azure, serviços, redes, identidade, SLA e governança | Referência para redação original; sem copiar imagens sem procedência |
| SC-900 hub, interface temática | D | Aplicação temática com navegação e estudo de conceitos | Referência de organização, não copiada |
| SC-900 `data/flashcards.json` | C | 365 cartões em seções | Possível revisão de recordação futura; não substituir aulas por cartões |
| Fortinet FCF, notas NSE 1/2/3 | B | 22 arquivos MD e organização pessoal de fundamentos/segurança | Nomenclaturas arquivadas; aderência atual não verificada, sem afirmar curso/exame vigente |
| Cloud-Security-Projects-For-Beginners | E | Cinco roteiros AWS/Azure/GCP; EC2, NSG, IAM, S3 e monitoramento | Referência para laboratório com custos, preparação/limpeza e segurança a revisar; não executado |
| awesome-soc | B | Handbook, SOP, métricas, detecção, resposta e referências, inclusive PDFs de terceiros | Conceitos úteis; verificar direitos por material incorporado, não estender CC0 a PDFs externos |
| soc-roadmap-2026 | F | Progressão por funções e projetos, templates e metas de carreira | Aproveitar organização após revisão; não tratar promessa de roadmap como competência |
| cybersecurity-career-roadmap | F | Percursos por função e dependências | Referência de carreira; sem copiar biblioteca/link como formação pronta |
| Awesome-CloudSec-Labs | B | Lista de labs de outros autores, inclusive plataformas comerciais e CTFs | Curadoria complementar; cada destino tem condições próprias |
| awesome-soc-analyst | B | Lista LetsDefend de recursos por tema | Consulta complementar; licença da lista não licencia destinos externos |

As cópias ignoradas pelo Git em `projetos/certificacoes/` também foram enumeradas. Não foram
tratadas como uma segunda fonte ou duplicadas na plataforma; a origem auditada é `cert-antenas/`.

## Licenças e atribuições por origem

| Origem / mantenedor identificado localmente | Evidência de licença | Possibilidade/condições e decisão |
|---|---|---|
| CCNA Exam Simulator / MrVardanyan777 (link README) | Nenhum LICENSE e nenhuma declaração permissiva identificada em README/package | Direitos de app, banco e imagens não comprovados; referência conceitual apenas |
| CCNA-1 / Bastiaan van Oorde | `projetos/CCNA-1-Study-Hub/LICENSE`, MIT, copyright 2026 | Código adaptado com aviso completo. Não estender licença de software automaticamente a questões de final de curso |
| CCNA_Course_Notes / psaumur | Sem licença local; README remete a curso/imagens externas | Não copiar texto/diagramas; redação original apoiada em fontes técnicas primárias |
| CCNA-Labs / Osama Mabkhot | `projetos/CCNA-Labs/LICENSE`, MIT, copyright 2025; README credita instrutor | Reuso exige manter aviso e revisar direitos do material de curso incorporado. Nenhum binário/imagem novo distribuído nesta rodada |
| Security+ / autoria pessoal não identificada nos arquivos inspecionados | README seção License declara MIT; não há arquivo LICENSE com texto completo/titular | Não registrar falsamente “sem qualquer licença”: existe declaração. Importação de dados e código adiada para revisão e lote de segurança |
| AWS notes / kananinirav | `LICENSE`, MIT, copyright 2022 | Possível adaptar material coberto, preservando aviso; imagens/questões/comercialização de PDFs exigem avaliação própria. Nada copiado |
| AZ-900 / autor não identificado no README inspecionado | Sem licença local identificada | Referência conceitual, sem copiar texto ou imagens |
| SC-900 / nowaxial (README/site) | `LICENSE.md`, CC BY 4.0 | Possível adaptar material coberto com atribuição, link à licença e indicação de mudanças; verificar elementos de terceiros. Nada copiado |
| Fortinet notes / autor não identificado no trecho/arquivos de licença | Sem licença local identificada | Sem adaptação de texto/imagens; conferir origem e certificação antes do lote |
| Cloud projects / 0xrajneesh (URLs README) | README declara MIT e aponta LICENSE ausente neste checkout | Registrar a declaração e a ausência do arquivo; não presumir cadeia completa de permissões. Nenhuma cópia |
| awesome-soc / cyb3rxp | `LICENSE`, CC0 1.0 | Declaração para material coberto; PDFs/obras citadas têm direitos próprios. Só referência nesta rodada |
| soc-roadmap-2026 / SOC Roadmap 2026 Contributors | `LICENSE`, MIT, copyright 2026 | Preservar aviso em eventual adaptação; conteúdo copiado nesta rodada: zero |
| cybersecurity-career-roadmap / Naem Azam | `LICENSE`, MIT, copyright 2026 | Mesmas condições; organização referenciada sem copiar materiais |
| Awesome-CloudSec-Labs / lista com múltiplos autores/destinos | Sem licença local identificada | Links não concedem direito sobre os laboratórios; não copiar |
| awesome-soc-analyst / LetsDefend | `LICENSE`, MIT, copyright 2023 | Aviso exigido para cópias substanciais; não licencia recursos externos. Nada copiado |

Aviso efetivamente distribuído: `apps/learn/public/THIRD_PARTY_NOTICES.txt` com licença MIT integral
do CCNA-1, origem e mudança. A função adaptada em `coursework/shuffle.ts` mantém comentário de
copyright/licença e apenas muda tipagem/nomes. O arquivo segue para o bundle estático. O padrão
de ordem aleatória é usado nos conjuntos autorais, sem copiar questões.

## Bancos: números e limites

| Banco | Encontrados | IDs distintos | Registros com formato MCQ/explicação aceitos pela regra do auditor | Importados/liberados no novo app | Pendente |
|---|---:|---:|---:|---:|---:|
| CCNA Exam | 628 | 625 | 313 | 0 | 628 |
| CCNA-1 | 143 | 143 | 143 | 0 | 143 |
| Security+ MCQ | 145 | 145 | 145 | 0 | 145 |
| Security+ PBQ | 12 | Contagem de estruturas, sem adaptação PBQ nesta rodada | Não avaliado pelo adaptador MCQ | 0 | 12 |

A regra estrutural exige alternativas distintas, gabarito apontando alternativa existente e
explicação não vazia. Ela não verifica semântica, direitos ou suporte a drag/drop. Não chamar
os demais registros de “gabaritos errados”: alguns formatos não passam por esse adaptador.
Colisões 290/291/292 representam seis registros em conflito, três excedentes por ID; foram
marcadas no manifesto e nenhuma escolha arbitrária foi importada. O banco original não foi apagado.
Duplicatas de prompt normalizado também são candidatas a revisão, não exclusão cega.

Revisão integral para publicação: zero itens de terceiros. Amostras inspecionadas revelaram,
no CCNA-1, explicações que localizam lentidão em salto do tracert sem limitar a inferência e
que concluem configuração incorreta de gateway apesar de alcance externo sem informar rotas,
interfaces ou política ICMP. Essas amostras foram retidas, não reutilizadas como gabarito.
Os 51 itens novos são originais e foram revisados pelo agente contra as aulas/cenários; isso
não é revisão humana independente ou aferição com alunos.

## Mapa curricular unificado e lotes pendentes

| Área | Sequência de conhecimentos / material útil | Disponibilidade nova nesta rodada |
|---|---|---|
| Fundamentos e Redes | R01 → configuração/DHCP → troubleshooting → runbooks; depois IPv4/subnetting/VLSM, Ethernet/switching/VLAN/trunk, rotas/OSPF/ACL/NAT, segurança e automação introdutória | R01–R04 implementadas; demais blocos planejados |
| Sistemas e Operação | Windows/diagnóstico, Help Desk/NOC, Linux/terminal/Git, monitoramento/logs, SLA/tickets/escalonamento | Windows conceitual, diagnóstico e runbooks nos recortes R02–R04; restante pendente |
| Segurança | Fundamentos, ameaças/vulnerabilidades/controles, redes seguras, criptografia, identidade/autenticação/autorização, SOC/IOC/resposta | Acervo classificado, sem novo curso ou banco Security+ liberado |
| Cloud | Responsabilidade compartilhada, AWS/Azure, redes, identidade, armazenamento/compute, logs/custos/governança/arquitetura | Acervo classificado; aulas nativas pendentes |
| Certificações | CCNA, Security+, CLF, AZ-900, SC-900, Linux Essentials, SC-200/300, Fortinet e KCNA | Sem alegação de cobertura integral ou adesão a versão oficial atual; itens arquivados não validam certificação |
| Formação profissional | Evidência, documentação, entregável, comunicação, entrevistas, inglês e prontidão | Documentação/runbooks no recorte R04; restantes pendentes |

Nenhuma versão atual de exame foi inferida de nomes de pastas ou README. Conferir documentos
oficiais vigentes antes de publicar um mapeamento de certificação em lote posterior.
