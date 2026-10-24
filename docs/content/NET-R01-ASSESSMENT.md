# NET-R01 — especificação preliminar de avaliação

Status: itens e rubricas propostos para autoria/revisão na Fase 2. Não implementados, não calibrados e sem resultados de alunos. IDs curtos abaixo receberão prefixo `NET-R01-` e versão 1.0.

## Checagens conceituais C01–C08

Os distratores são descritos com suas correções para orientar a redação completa; ainda não constituem o banco integral de publicação. A ordem das opções não será identidade do gabarito.

| Item / objetivo | Enunciado e resposta sustentada | Distratores / feedback necessário |
| --- | --- | --- |
| C01 / O01 | Computador usa impressora local enquanto o site externo falha. Isso permite afirmar que alguma comunicação local funciona, não que todo serviço/internet funciona | “Wi-Fi garante internet” confunde acesso com serviço; “servidor só existe na internet” confunde papel com localização |
| C02 / O02 | Pacote vai a servidor remoto por gateway Ethernet. IP final é do servidor, MAC do quadro local é do próximo salto | “MAC do servidor remoto por ARP local” ignora escopo; “IP do gateway substitui o IP remoto” confunde quadro e pacote |
| C03 / O03 | Host 192.168.10.25/24 envia para 192.168.10.80, sem outras rotas no modelo. Destino é da rede diretamente conectada | “Sempre gateway” ignora comunicação local; “depende só do nome” confunde endereço com resolução |
| C04 / O04 | Há rota conectada e falta default/rota remota. Compartilhamento local pode funcionar; destino remoto fica sem rota | “DNS cria rota” atribui função errada; “nenhuma comunicação é possível” desconsidera rede conectada |
| C05 / O05 | Consulta DNS retorna endereço. Nome foi resolvido nessa consulta; HTTPS não está comprovado | “Página certamente abre” extrapola; “gateway foi testado por completo” confunde prova parcial com disponibilidade geral |
| C06 / O06 | No exemplo HTTP/2 sobre TLS/TCP, TCP conecta endpoints, TLS protege e HTTP expressa mensagens | “TCP cifra por definição” mistura transporte e proteção; “DNS estabelece TLS” mistura resolução e sessão |
| C07 / O06 | Um site usa HTTP/3. Não é correto afirmar que toda web depende de conexão TCP; HTTP/3 usa QUIC sobre UDP | “HTTP exige TCP sempre” universaliza o exemplo; “UDP significa ausência de qualquer confiabilidade na aplicação” ignora mecanismos de QUIC |
| C08 / O08 | Ping expira, mas teste HTTPS completa com sucesso. ICMP pode estar filtrado; host não está comprovadamente desligado | “Ping é autoridade sobre qualquer serviço” extrapola; “DNS sempre falhou” ignora consulta/conexão observadas |

Checagens dão feedback imediato e retorno à explicação, sem conceder domínio amplo por acerto. “Não sei ainda” é resposta válida de estudo e não pontua como acerto.

## Ajuda e prática guiada

G01 (O03/O04): host `192.168.40.12/24`, impressora `192.168.40.30`, destino remoto `203.0.113.40`, tabela com rota conectada e sem default. LAN funciona; tentativa remota indica ausência de rota. O aluno identifica local/remoto e a próxima coleta, sem alterar firewall. Dicas: lembrar máscara → examinar rota → localizar ausência de rota remota → solução completa. No nível 4, conclusão é guiada.

G02 (O05/O07): usar W01 com consulta ao DNS local expirando. Próximo teste aceito compara resolvedor autorizado ou verifica caminho/serviço DNS com dados disponíveis; não exigir uma única ferramenta quando outra responde à mesma hipótese. Outputs são tabelados e coerentes com o cenário, inclusive timeout de DNS sobre UDP sem concluir a partir de teste TCP 53 isolado.

G03 (O07/O08): DNS responde, ICMP expira, conexão TCP 443 e troca HTTPS simulada funcionam. Pedir a conclusão limitada; não forçar correção de problema inexistente. Ajuda contrasta protocolos. O modo nunca diz que o comando foi executado no computador do aluno.

## Caso independente A — o portal resolveu, mas não abriu

Família: `name-resolved-service-refused`. Contexto diferente de W01: equipe acessa serviços internos, cliente alcança gateway e resolve `portal.example` para `203.0.113.40`; TCP 443 ao portal retorna conexão recusada no cenário; outro serviço HTTPS permitido funciona. O caminho é IPv4 Ethernet simplificado, sem proxy/VPN. A recusa é evidência de endpoint/filtro respondendo, não identificação garantida de processo causador.

| Item | Decisão / opções previstas | Gabarito e justificativa | Essencial |
| --- | --- | --- | --- |
| A1 / O05 | (a) Falha DNS comprovada; (b) investigar serviço/porta ou política do portal; (c) cabo do cliente certamente rompido | b: nome retornou e outro serviço responde; recusa direciona investigação. a ignora resolução observada; c não explica as evidências | Sim |
| A2 / O07 | (a) desativar firewall; (b) verificar listener/política/logs no destino autorizado ou comparar outra origem; (c) mudar DNS sem testar | b: coleta discrimina serviço/política. Não aprovar mudança ampla sem evidência | Sim |
| A3 / O08 | (a) processo web está definitivamente parado; (b) há recusa da conexão testada, causa exata ainda exige evidência; (c) toda internet caiu | b: distingue observação de causa. a é hipótese possível, não conclusão; c excede escopo | Sim |
| A4 / O06 | Neste acesso TCP recusado, foi comprovada negociação TLS bem-sucedida? (a) sim; (b) não; (c) DNS já prova TLS | b: TCP não estabeleceu o caminho para TLS do exemplo. HTTP/3 é variação fora deste cenário, declarada no enunciado | Não |
| A5 / O02 | Para enviar o pacote remoto no enlace local, selecionar IP de destino e vizinho Ethernet | IP final `203.0.113.40`, próximo salto da rota local; não MAC remoto obtido por ARP na LAN | Sim |

Todos os campos exigem resposta estruturada; justificativa livre opcional serve como reflexão. Não usar tamanho de texto para conceder os pontos de A3.

## Caso independente B — a impressora funciona, o destino remoto não

Família: `local-ok-no-remote-route`. Cliente `192.168.60.24/24`, impressora `192.168.60.80`, serviço remoto `198.51.100.70`; endereço remoto já conhecido em cache no cenário. Tabela exibe rede conectada e não tem default nem rota específica para destino. Não afirmar ausência de gateway olhando apenas campo de configuração: o dado decisivo inclui tabela de rotas.

| Item | Pergunta e opções previstas | Correção | Essencial |
| --- | --- | --- | --- |
| B1 / O03 | Impressora exige roteamento remoto? (a) sim sempre; (b) não, no modelo/rotas informados; (c) só DNS decide | b: máscara e rota conectada sustentam entrega local | Sim |
| B2 / O04 | (a) o nome necessariamente está errado; (b) falta rota que alcance o destino remoto; (c) desligamento da impressora explica tudo | b: dados já incluem endereço e tabela sem rota remota | Sim |
| B3 / O07/O04 | (a) inventar gateway; (b) conferir configuração esperada e rota/default autorizada com responsável; (c) trocar cabo e apagar logs | b: investigar intenção/configuração correta antes de modificar; não digitar endereço arbitrário | Sim |
| B4 / O08 | (a) acesso ao portal está comprovado; (b) ainda não sabemos a saúde do portal, pois falta caminho no cliente; (c) DNS é certamente a causa raiz | b: conclusão limitada pela evidência local | Sim |

B1 também é essencial para O03. Sua marcação é requisito do caso, independentemente de uma coluna de apresentação.

## Pontuação e resultado

Conjunto preliminar A+B: 9 decisões, 1 ponto por item. Exigir pelo menos 8/9 (≥80%) **e todos os itens essenciais**, sem ajuda/consulta e com run finalizado. Arredondamento não deve promover 7/9. Com os critérios essenciais descritos, errar A4 pode manter aprovação do conjunto; isso **não demonstra O06**, que continua pendente se não houver outras observações independentes válidas. O leitor deve ver essa diferença.

Estes dois casos ainda não fornecem todas as observações diversas exigidas por O01–O08 em [MASTERY_POLICY](../pedagogy/MASTERY_POLICY.md). Portanto a unidade não pode ganhar estado global de objetivos demonstrados apenas com 8/9. Na Fase 2, redigir a avaliação conceitual independente e as variantes citadas em OBJECTIVES, incluindo O01/O06, e fechar a matriz. Esta é uma pendência explícita, não um banco fictício já entregue.

Se A/B tiver sido estudado com solução aberta ou já usado, reutilizá-lo é treino identificado, sem novidade. Não há infinitas variantes. Reavaliação pede família alternativa previamente revisada; enquanto não existir, informar insuficiência em vez de reutilizar score antigo como domínio.

## Revisões propostas R01–R03

- R01: nome resolvido e erro de certificado, TCP conectado. Distinguir TLS de DNS, sem recomendar ignorar certificado. O05/O06/O08.
- R02: impressora e serviço local em uma sub-rede, destino remoto bloqueado por política documentada. Distinguir rota de autorização e definir alcance da conclusão. O03/O04/O07/O08.
- R03: serviço HTTPS funciona enquanto ICMP é filtrado e tracert tem saltos sem resposta. Não diagnosticar queda por timeout isolado. O07/O08.

São famílias planejadas; redação completa, opções e rubricas ficam na Fase 2. A agenda não pode selecionar itens inexistentes. Resultado posterior em item repetido continua marcado como repetição.

## Testes obrigatórios do corretor futuro

Resposta ausente não pontua; campo desconhecido é rejeitado; alternativa de outra versão não corrige; `score:100` do cliente não afeta resultado; erro essencial impede aprovação mesmo com média suficiente; ajuda reclassifica tentativa; leitura/nota livre não aprova; resultado válido sem diversidade não demonstra objetivo inteiro; conclusão errada com palavras corretas continua errada; família repetida não aumenta diversidade; caso interrompido não aprova conjunto.
