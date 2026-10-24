# Expansão pedagógica — primeira rodada (24/10/2026)

## Conteúdo produzido e acesso

Branch `codex/infrasec-expansao-semana-1`, baseada em `91538e2` da plataforma React. O frontend
aprovado é preservado: mesmas áreas, sidebar, player contextual e componentes de leitura/exercício.
Sem novas dependências, backend ou reconstrução visual. Pedido: `requirements/PEDAGOGICAL_EXPANSION_REQUEST.md`.

Abra `npm run dev` na raiz, porta 4173. Em **Redes → Formação de redes**, estão R01, R02, R03 e R04.
Hoje oferece retomada da nova unidade/tentativa/revisão; **Semana 1 detalhada** liga cada missão
às explicações, exemplos, prática, laboratório, avaliação e recuperação. **Mapa de dependências**
agora abre conhecimentos e seus objetivos/pré-requisitos, sem bloquear a própria explicação.

- **R02:** interfaces, IPv4/máscara/gateway/DNS, leitura de ipconfig, DORA/relay, lease/T1/T2,
  renovação/expiração, APIPA e configurações inesperadas.
- **R03:** sintoma/escopo/hipótese, escolha e ordem de testes, loopback/gateway/remoto, DNS,
  ICMP versus TCP/TLS/HTTP, tracert/TTL/RTT, limites e registro da investigação.
- **R04:** registro de incidentes, origem dos dados, runbooks condicionais, validação antes/depois,
  rollback, autorização, escalonamento, comunicação e entregável profissional.

São 12 novas lições com 12 exemplos resolvidos, 12 recuperações alternativas, três casos guiados e
51 itens originais comentados: 12 checagens, 12 decisões independentes, 12 de revisão, 12 de recuperação
e três decisões de laboratório. O modelo R04 é editável, persistido e exportável em Markdown;
seu texto nunca aprova a avaliação por tamanho, preenchimento ou palavras-chave.

Cobertura objetivo → aula/exemplo → prática → avaliação → recuperação → revisão:
[WEEK1_COVERAGE.md](../content/WEEK1_COVERAGE.md). Isso não é certificação integral, prova
supervisionada ou validação da eficácia pedagógica com iniciantes.

## Material e simuladores reaproveitados

O inventário completo por origem/componente, licença e decisão está em
[ASSET_REUSE.md](../content/ASSET_REUSE.md); metadados e manifesto em
[ASSET_AUDIT.json](../content/ASSET_AUDIT.json). Reproduzir com `node scripts/audit-learning-assets.cjs`.

Reusos efetivos: organização das missões/objetivos do Hub, motores/componentes R01 e sua geração
de outputs para um novo problema de escopo na R03, função shuffle do CCNA-1 (MIT) adaptada com
copyright e texto integral da licença em `public/THIRD_PARTY_NOTICES.txt`. A nova avaliação usa
IDs/gabaritos congelados e embaralha a ordem, sem importar apps inteiros ou dados de provas.
ConcursoOS foi referência de separação entre estudo, evidência e hipótese de recuperação; código
Java, bancos e migrations não foram copiados, executados ou alterados.

CCNA Exam: 628 registros/625 IDs, colisões 290–292, 621 prompts normalizados e 295 explicações
vazias. CCNA-1: 143 questões. Security+: 145 MCQs e 12 PBQs. AWS: 23 provas em arquivos MD mais
índice. SC-900: 365 flashcards. Nenhum desses números equivale a cobertura ou publicação.

**Questões de terceiros importadas: zero.** A primeira integração de dados CCNA ficou pendente
pela procedência/direitos e por problemas semânticos em amostras. Security+ possui declaração MIT
no README, registrada sem inventar ausência total de licença; seu banco também não foi publicado
antes de ensino e revisão correspondentes. Os casos/questões novos são autorais.

## Contrato de progresso e evidência

Uma chave continua sendo usada: `infrasec-learn:v1`. `progress` conserva integralmente o schema
R01. O envelope recebe **opcionalmente** `coursework`, com `version: 1`, criado ao entrar em nova
unidade. Não existe uma chave por unidade ou um histórico por certificação. Backups R01 anteriores
continuam aceitos sem criar dados novos automaticamente.

`coursework` registra leitura com ID de unidade/lição, ponto de retomada, rascunhos, coleta de casos,
artefatos textuais e tentativas/runs com IDs estáveis, unidade/versão, questão/versão, objetivo,
resposta, modo, ajuda, origem, horário e avaliação relacionada. O histórico unificado projeta
R01 e unidades novas sem duplicar nem converter eventos antigos. Exibe os últimos cem eventos;
a cópia conserva o histórico completo dentro dos limites do codec.

Limites: até 5 MiB por envelope/cópia, 10.000 tentativas de unidades, 2.000 runs; campos do artefato
até 8.192 caracteres. Campos extras, respostas inválidas, IDs duplicados, vínculo órfão e versão de
extensão desconhecida são recusados. Dados corrompidos/futuros permanecem no dispositivo; a sessão
pode continuar em memória com aviso, exportação e acesso ao original bruto.

A extensão é compatível com os backups antigos no leitor atual; **builds antigos da plataforma
não conhecem o campo novo** e podem recusar sua leitura. Não rodar uma versão antiga para editar
esse mesmo armazenamento. Antes de trocar versões, exportar cópia completa.

Importação exige resumo e confirmação e substitui **todas** as unidades, sem mescla. Uma cópia
antiga sem extensão remove os dados novos somente após essa confirmação explícita; a interface
avisa isso e baixa o estado anterior. A cópia anterior válida agora também usa o wrapper com checksum,
podendo ser importada normalmente. O original inválido é baixado como bruto para preservação.
Checksum detecta corrupção, não autentica desempenho. Origem/porta diferente continua exigindo
exportação/importação manual. As 26 chaves legadas não são lidas como domínio ou apagadas.

Um único store aplica navegação e marca consulta em avaliações de qualquer unidade. Há no máximo
uma avaliação ativa entre R01 e novas unidades. Todos os quatro objetivos são essenciais no
conjunto novo: 4/4 atende ao critério local; consulta transforma o resultado em prática assistida.
Leituras e texto do runbook nunca aumentam a aprovação. Versão incompatível ou resultado futuro
não sustentam evidência. Repetir a mesma família não apaga um erro independente sem outra observação
correta em família nova; o resultado segue restrito ao banco finito.

Revisão: quatro itens diferentes da avaliação, agenda heurística 1/3/7 dias após conjunto independente
que atende ao critério. Antecipação não avança o intervalo. A agenda não é estimativa de memória.
Prática guiada exige coleta mínima no motor, além da UI; correção do cenário não valida equipamento real.

## Verificação executada

- `npm --prefix apps/learn run format:check`: aprovado.
- `npm --prefix apps/learn run lint`: aprovado.
- `npm --prefix apps/learn test`: 140 aprovados (incluem os 109 anteriores; 31 novos).
- `npm --prefix apps/learn run build` e `npm run build:platform`: aprovados; ambos incluem TypeScript.
- `npm --prefix apps/learn run test:e2e`: 28 aprovados (incluem os 19 anteriores; nove novos).
- `npm test` na raiz: 149 aprovados; cobre a versão anterior e entrada React.
- Auditoria de acervo executada e JSON inspecionado; contagens não foram inferidas do README ou ZIP.
- Comparação de diff confirma aulas/banco/motor R01 e fontes originais de `projetos` sem alteração.
- Capturas reais das novas aulas/casos/editor e da Semana 1 em `evidence/week1-*`; responsividade
  de novas rotas verificada em 320, 390, 768 e 1440 px, além da regressão existente.

Build emite aviso de chunk acima de 500 kB (aprox. 521 kB, gzip 162 kB) após incorporar o conteúdo.
Não foi ocultado aumentando o limite. É uma limitação de empacotamento a observar; não houve falha
de build ou de fluxo por isso. Sem implantação remota, teste físico de Windows/Packet Tracer,
auditoria WCAG, Firefox/Safari, revisão humana independente ou ensaio com iniciantes.

## Lacunas e próximo lote

Esta entrega conclui o recorte de ensino R02–R04 em código e o conecta à Semana 1. Não conclui
toda a visão curricular do macroprompt. Laboratórios reais, implementação nativa de CLI/VLSM,
simulados cronometrados e bancos CCNA/Security+/Cloud revisados continuam pendentes; flashcards
não foram importados. O status das áreas futuras permanece explícito.

Próximo lote: IPv4/subnetting/cálculo de redes/VLSM, apoiado no pré-requisito de máscara R01,
com casos novos, avaliação e recuperação. Em paralelo editorial, resolver procedência de bancos
e revisar itens antes de qualquer publicação. Não requer nova sidebar ou redesign.
