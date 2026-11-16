# CCNA v2.0 e sala de servidores — 16/11/2026

## Entrega
Branch codex/ccna-intensive-monitoring. Arquitetura estática React 19/TS/Vite preservada, sem backend novo ou alteração do envelope de progresso. 66 aulas-base totais; seis novas aulas autorais: vida do pacote, /28/VLSM, rotas estáticas, Rapid PVST+, OSPF e monitoramento. IDs anteriores preservados.

Guia CCNA com Jeremy por semana, playlist oficial sob demanda (YouTube privacy-enhanced), obtenção de labs pelo próprio autor e complementos específicos v2.0. Vídeos/labs/flashcards do Jeremy não foram copiados nem traduzidos. Explicações próprias continuam internas. A incorporação de vídeos depende do provedor.

Receitas IOS para semanas 2/3/5/6 com topologia, comandos, verificações e falhas controladas. Treinador IPv4 /24–/30, com cálculo de máscara, rede, broadcast e capacidade. Ensaio curto de 20 questões autorais existentes, 30 minutos, correção após encerramento, brancos como erro, explicação de cada alternativa e retomada por aula. Distribuição 5/5/4/4/2 entre domínios. Não possui CLI nem questões de múltipla seleção; não equivale ao exame de 120 minutos. Não é banco novo de 20 itens independentes: reutiliza casos de compreensão. Respostas/cronômetro e painel ambiental são transitórios, sem pontuação persistida ou prontidão inferida.

## Monitoramento incluído
projetos/monitoramento-sala-servidores: cópia do upstream https://github.com/BrendoNyre/monitoramento-sala-servidores, commit 05706cf4a993b447117edb34cb6e53cb25ea6566, MIT, Brendo Nery. LICENSE original preservada. Sem mudanças funcionais na cópia. Grafana/Zabbix/PostgreSQL/ESP32 executam separadamente, sem credenciais no Hub. Guia interno na semana 10, com painel autoral de temperatura, água e ausência de dados. Histerese simplificada (32/30) explicitamente diferente dos gatilhos originais.

Não iniciado automaticamente. Agente original acessa docker.sock; portas são publicadas; firmware usa HTTP. Usar bancada isolada. Não existe autenticação compartilhada nem coleta física pelo frontend estático. O servidor Node passa a negar segmentos ocultos para não entregar o .env criado pelo aluno no laboratório.

## Pesquisa e decisões
- Matriz oficial v2.0: https://learningcontent.cisco.com/documents/marketing/exam-topics/200-301_CCNA_v2.0_Exam_Topics_PDF.pdf
- Data de estreia 03/02/2027: https://www.cisco.com/web/go/ccna/
- Jeremy e materiais: https://courses.jeremysitlab.com/p/ccna e https://sendfox.com/jeremysitlab
- Discussão sobre atualização: https://www.reddit.com/r/ccna/comments/1ubmhwq/when_will_the_resources_such_as_jitl_and_boson_be/
- Discussão sobre reaproveitamento de fundamentos: https://www.reddit.com/r/ccna/comments/1xarlw4/can_i_still_use_jeremys_it_lab_to_study_for_the/
- Subnetting: https://www.reddit.com/r/ccna/comments/1qqepj6/what_finally_helped_subnetting_click_for_me_while/
- GitHub complementar: https://github.com/moner50/CCNA-LABS ; https://github.com/wilsonab-networking/ccna-labs

Reddit é opinião/anecdota; não confirma distribuição real da v2.0 ainda não lançada. GitHub pesquisado como referência de prática; nenhum banco de provas ou solução de Jeremy publicado por terceiros foi importado. Seleção editorial: explicar mecanismos, montar do zero e injetar uma falha por vez. Não há promessa de aprovação nem reprodução de questões confidenciais.

## Limites
Curso intensivo ainda requer expansão dos outros objetivos, especialmente práticas executáveis de OSPFv3, IPv6, wireless, AAA e Ansible. Receitas não são arquivos .pkt novos nem emulação IOS. Validação humana do conteúdo e calibração psicométrica não realizadas. Não anunciar curso integral nem similitude comprovada com prova v2.0.

## Validação executada
- Typecheck e ESLint: passaram. Prettier dos arquivos novos: passou.
- Vitest: 159/159; Playwright frontend: 44/44; regressão raiz: 149/149.
- Três fluxos novos repetidos com capturas desktop/mobile, inspecionadas visualmente.
- Builds Vite e platform passaram; aviso já existente de chunk principal acima de 500 kB permanece.
- Docker compose --env-file .env.example config --quiet: passou; stack não iniciada, hardware e notificações não testados.
- HTTP local: .env.example retorna 404; LICENSE retorna 200.
- Whitespace normalizado em dois arquivos vendor para diff --check; nenhuma mudança funcional no upstream.
