# NET-R01 — Como um computador acessa um site

Atualização: especificação preliminar preservada. A implementação com onze lições, novos conjuntos de oito decisões e suas evidências está no [relatório NET-R01](../quality/IMPLEMENTATION_R01.md); o conteúdo efetivo está em [`lessons.ts`](../../apps/learn/src/content/lessons.ts).

Status: **especificação preliminar detalhada da Fase 0**. A redação integral das aulas e a implementação são as Fases 2 e 3 do macroprompt. Os trechos abaixo fixam mecanismo, profundidade e exemplos; não são um curso publicado.

Subtítulo: “Entenda o caminho da comunicação e aprenda a investigar falhas básicas de conectividade.” Curso: Redes de Computadores — Do Zero à Base para CCNA. Módulo: Comunicação e conectividade. Versão proposta 1.0, idioma PT-BR. Pré-requisito: uso básico de computador. Objetivos em [OBJECTIVES](NET-R01-OBJECTIVES.md).

## Primeiro percurso do aluno

Ao abrir, ver contexto, objetivo, limites e ação “Começar a aprender” ou “Continuar de onde parei”. Entrar na lição atual, sem criar perfil, selecionar certificações ou passar por dashboard. O sumário mostra apenas as partes reais da unidade. A pessoa pode consultar qualquer explicação anterior sem perder rascunho.

Problema inicial: você digita um endereço no navegador e a página aparece. Outra pessoa diz “a internet caiu” porque um único site falhou. O que precisa funcionar? Que observações permitem separar uma falha local, de nome ou de serviço? A unidade desenvolve as ferramentas para responder, antes de pedir diagnóstico.

Um ciclo de estudo pode ser interrompido e retomado. Não obrigar dez lições numa sessão. Pontos naturais de pausa: comunicação/identificação (L01–L03), local/remoto e DNS (L04–L06), transporte/aplicação (L07–L09), diagnóstico e prática (L10). Esses blocos não são metas de tempo inventadas.

## L01 — O que é uma rede

Ensinar rede como dispositivos capazes de trocar dados por conexões e protocolos, explicando dispositivo, conexão e mensagem antes de abstrair. Uma LAN liga equipamentos num contexto local; internet conecta redes, não é sinônimo de Wi-Fi. Wi-Fi é forma de acesso local: seu ícone conectado não prova que um serviço remoto funciona.

Exemplo: computador e impressora no mesmo ambiente podem conversar enquanto a saída externa está indisponível. Mostrar dois estados, sem concluir que toda LAN corresponde obrigatoriamente a um prédio ou a um único equipamento. Uma figura identifica dispositivos e ligações; texto equivalente explica quem consegue conversar em cada estado. C01 verifica papéis, sem exigir decorar siglas.

## L02 — Cliente, servidor e serviço

Cliente inicia uma solicitação; servidor disponibiliza um serviço e responde conforme esse serviço. Esses nomes descrevem papéis na interação, não tamanhos de computadores. Um computador pode atuar como cliente de um serviço e servidor de outro. Uma página depende de software e do caminho até ele, não apenas de “internet presente”.

Exemplo resolvido curto: navegador solicita recurso; aplicação web retorna resposta; impressora compartilhada oferece outro serviço. Comparar “máquina alcançável” com “serviço disponível”. Introduzir porta como identificador de endpoint de transporte para alcançar o processo/serviço adequado, não como conector físico. A explicação de TCP será desenvolvida em L07.

## L03 — IP, nome e MAC têm funções diferentes

Endereço IP identifica uma interface no contexto de comunicação IP; nome como `portal.example` é uma identificação usada pela aplicação que pode ser resolvida em registros com endereços. Um nome pode resultar em mais de um endereço e um servidor pode atender vários nomes. Não ensinar relação um-para-um obrigatória.

No enlace Ethernet local, quadros usam endereços MAC. Para entregar um pacote remoto, o computador precisa alcançar o próximo salto local; não aprende por ARP o MAC do servidor que está do outro lado da internet. IP de destino remoto e MAC de destino do quadro local têm escopos diferentes. Exemplo: carta com destino final e entrega ao próximo transportador, explicitando que a analogia não descreve os protocolos. C02 e o diagrama destacam as duas identificações separadamente.

## L04 — Como decidir se o destino é local

Introduzir IPv4 como 32 bits apresentados em quatro números e máscara como marcação dos bits de rede. No exemplo /24, `255.255.255.0` preserva os primeiros 24 bits no cálculo da rede. `192.168.10.25/24` e `192.168.10.80/24` pertencem à rede `192.168.10.0/24`; `192.168.20.80` não. A semelhança visual dos números sem máscara não basta.

Mostrar uma tabela com endereço, máscara, rede resultante e decisão. Desenvolver uma operação visual de AND com um octeto para explicar o mecanismo, sem transformar este recorte em curso inteiro de subnetting. No modelo IPv4 simples da unidade, destino local pode ser alcançado diretamente; destino remoto depende de rota. Sistemas reais usam tabela de rotas e podem conter rotas mais específicas, VPNs e múltiplas interfaces: esse aprofundamento virá depois. Não universalizar “primeiros três números iguais” para qualquer máscara.

## L05 — Gateway e próximo salto

Se o destino não está na rede diretamente conectada e não existe rota mais específica, uma rota default pode apontar para o gateway. O computador entrega o quadro local ao próximo salto, mantendo o IP do destino final no pacote. O gateway encaminha entre redes. A interface do próximo salto precisa ser alcançável segundo as rotas e o enlace usados; no exemplo residencial há um único gateway na LAN.

Desenvolver dois contrastes: sem rota default, impressora local continua alcançável; DNS pode fornecer um IP remoto e ainda assim faltar caminho até ele. Gateway não resolve nomes por definição, embora um equipamento doméstico possa hospedar também DNS/DHCP. Explicar ARP como descoberta do endereço de enlace do vizinho IPv4, quando necessário, com cache. Prever a falha antes de mostrar o teste, e comparar com gateway configurado incorretamente.

## L06 — DNS encontra informações sobre nomes

DNS é um sistema distribuído de nomes. Na unidade, uma consulta busca endereço de um nome: o cliente consulta um resolvedor e pode aproveitar caches. Não é necessário consultar toda a hierarquia em toda abertura de página. O resolvedor pode ser local ou remoto; se for remoto, o caminho até ele já pode exigir gateway. Logo DNS e gateway não são duas etapas fixas universais em sequência.

Comparar três resultados: resposta com endereço, resposta negativa de nome e timeout. Timeout não comprova sozinho “registro não existe”: pode ser resolvedor indisponível, caminho ou filtro. Explicar `nslookup` com outputs anotados e o fato de que o navegador pode usar cache/resolvedor próprio, incluindo DNS sobre HTTPS. A consulta explícita é evidência daquele caminho, não prova perfeita de todo comportamento do browser.

## L07 — TCP e o significado de uma conexão

Ensinar transporte como comunicação entre endpoints de aplicações. No exemplo adotado, TCP estabelece conexão e oferece fluxo de bytes ordenado com mecanismos de retransmissão; isso não garante que a aplicação devolverá conteúdo correto ou estará saudável. Apresentar SYN, SYN-ACK e ACK como negociação simplificada, explicando a finalidade antes da sigla. Portas distinguem serviços e conexões; normalmente o cliente usa porta de origem temporária e o HTTPS tradicional usa destino 443.

Contrastar resposta de ICMP com conexão TCP: são verificações diferentes. Não afirmar que todo acesso web usa TCP: HTTP/3 opera sobre QUIC, que usa UDP. A demonstração desta unidade escolhe explicitamente HTTPS com HTTP/1.1 ou HTTP/2 sobre TCP; QUIC e UDP serão aprofundados em unidade posterior.

## L08 — HTTP, HTTPS e TLS

HTTP organiza mensagens de solicitação e resposta. HTTPS aplica proteção TLS à comunicação HTTP no transporte pertinente. No exemplo TCP, a conexão existe antes da negociação TLS; o navegador verifica informações do certificado e da negociação. Depois pode trocar mensagens como método/caminho e resposta com status. Não ensinar TLS como algo que “resolve DNS” ou garante ausência de conteúdo malicioso.

Comparar nome resolvido com conexão recusada, conexão estabelecida com erro de certificado e resposta HTTP de erro. São pontos de observação diferentes. Não pedir acesso HTTPS por IP como substituto equivalente a nome: hospedagem virtual, SNI e validação de certificado podem alterar o resultado. O exemplo explica por que o teste por IP tem limites.

## L09 — Juntar o caminho sem criar uma sequência falsa

Demonstração controlável: URL → nome/endereço e decisão de cache → consulta DNS se necessária → decisão de rota/próximo salto por destino → entrega de enlace e encaminhamento → conexão TCP do exemplo → TLS → HTTP → processamento da resposta. A consulta DNS remota pode demandar sua própria sequência de rota/enlace antes da conexão com o servidor web. O diagrama permite ver esse ramo, e caches podem evitar consultas/ARP adicionais.

Componentes clicáveis mostram função, dados usados e limites; a mesma informação existe em tabela e botões anterior/próxima etapa. Não transmitir DNS como “um aparelho obrigatório entre navegador e gateway”. Proxy, VPN, múltiplas interfaces e HTTP/3 são variações reconhecidas, sem exigir toda sua implementação no modelo inicial. Uma tabela de previsão pergunta qual parte pode falhar mesmo se a anterior respondeu.

## L10 — Testar hipóteses com evidências

Desenvolver leitura de `ipconfig /all`: adaptador ativo, IPv4, máscara, gateway e DNS. Explicar DHCP como obtenção automática de configuração e introduzir APIPA como endereçamento link-local IPv4 que, no contexto Windows típico, sugere falha em obter configuração esperada; não comprova a causa específica do DHCP. Diferenciar adaptador desconectado de interface ativa antes de pedir diagnóstico.

Mostrar `ping`, `nslookup`, `tracert` e um teste TCP (`Test-NetConnection` no Windows) com pergunta, output e interpretação. Ping verifica respostas ICMP naquele momento; timeout pode ser filtragem. Asteriscos em tracert não provam queda geral. Uma porta TCP acessível não confirma TLS/HTTP correto. Loopback não comprova placa/cabo/gateway saudáveis. A unidade começa pela coleta sem alterar configurações ou desativar firewall.

## Exemplo resolvido W01 — IP funciona, nome não responde

Dados sintéticos: cliente `192.168.10.25/24`, gateway `192.168.10.1`, DNS `192.168.10.10`. Interface ativa; gateway responde; alvo de teste IP `198.51.100.20` responde a ICMP; `nslookup portal.example 192.168.10.10` retorna timeout. Nomes `.example` e endereços de documentação descrevem simulação, não comandos para execução pública literal.

1. Objetivo: localizar o próximo domínio de investigação, sem afirmar causa raiz completa.
2. Hipóteses: falha IP geral, problema na consulta ao resolvedor, serviço web indisponível.
3. Evidências IP tornam menos sustentada a primeira hipótese para os caminhos testados; não comprovam todos os serviços.
4. Timeout de consulta sustenta investigar resolvedor/caminho DNS. Comparar com outro resolvedor **permitido no ambiente simulado** fornece discriminação; não orientar violar política de rede usando DNS público arbitrário.
5. Resultado adicional simulado: outro cliente também falha no mesmo resolvedor; resolvedor alternativo autorizado responde. Isso reforça suspeita do serviço/caminho até o resolvedor original, ainda sem provar qual componente interno falhou.
6. Próxima ação: registrar escopo e encaminhar/verificar serviço DNS e conectividade relevante; não desativar firewall ou trocar todas as configurações.
7. Limites: não foi estabelecido que o site está saudável, que a internet inteira funciona ou que toda consulta do browser segue o mesmo resolvedor. Erro comum: dizer que gateway e DNS são intercambiáveis.

## Prática e avaliação

Prática G01: identificar configuração e ausência de rota. G02: consulta DNS com timeout e comparação de evidências. G03: serviço acessível com ICMP bloqueado. Cada uma recebe ajuda progressiva e output coerente; nenhuma afirma execução real.

Depois: checagens C01–C08 e casos A/B descritos em [ASSESSMENT](NET-R01-ASSESSMENT.md). A redação final incluirá famílias alternativas suficientes para O01–O08, sem reciclar os gabaritos do treino como caso inédito. Revisão e recuperação são políticas separadas, com data e tentativas rastreáveis.

Síntese final deve conectar nome, endereço, próximo salto, transporte e serviço, e terminar com a pergunta “o que minhas evidências permitem concluir?”. Laboratório externo opcional: coletar configuração e interpretar sem modificar rede; não usar output real com dados sensíveis em portfólio automático.

## Saída e publicação

Aulas percorridas, prática guiada e demonstração independente aparecem separadamente. O aluno recebe próximos conceitos a estudar e lacunas observadas, nunca “pronto para CCNA”. Não exibir duração inventada, taxa de retenção ou selo de eficácia pedagógica.

Antes do piloto: redigir cada lição integralmente, implementar demonstração, completar alternativas/feedback, revisar tecnicamente os cenários e validar o fluxo. Esta especificação preliminar não satisfaz sozinha esse aceite. [CONTENT-REVIEW](NET-R01-CONTENT-REVIEW.md) registra fontes e pontos de atenção.
