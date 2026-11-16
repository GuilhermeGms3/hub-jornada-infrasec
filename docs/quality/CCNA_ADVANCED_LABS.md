# CCNA — práticas avançadas (16/11/2026)

## O que mudou
Cinco aulas autorais adicionais: ipv6-deep, ospfv3-lab, wireless-deep, aaa-deep e ansible-deep. Total 71 aulas-base no catálogo. Semanas 3/6/8/9/10 exibem prática contextual, cálculo /60→/64, modelo AAA reject/timeout/accept, roteiro wireless Packet Tracer, receita IOS XE de AAA com parâmetros do aluno e instruções do lab Docker. Mesmo store/backup, sem novas dependências frontend ou execução pelo navegador.

`labs/ccna-advanced` entrega compose/configurações FRR, verificador Python, inventário e playbook Ansible, mais runner Docker opcional. R1/R2 anunciam loopbacks /128, usam trânsito IPv6 interno e OSPFv3 ponto a ponto. Não são imagens IOS ou arquivos .pkt novos. Há configuração executável aberta em alternativa ao emulador proprietário.

## Evidência de execução real
Docker Linux iniciado neste trabalho. FRR 10.3.1 executado: vizinhança Full, rota OSPF /128 remota, ping bidirecional com origem nas loopbacks e 0% de perda. Divergência de área em R2 retirou vizinhança e rota; recuperação devolveu ambas e o tráfego.

Runner Ansible core 2.19.4 executado com r1/r2. Playbook saudável: failed=0, changed=0. Após falha: saída 2 esperada, assert de Full falhou. Após recuperação: saída 0, ambos saudáveis. Verificação adicional de identidade do vizinho e prefixo remoto passou em ambos. Logs em `evidence/ccna-advanced-runtime.txt` e `evidence/ccna-advanced-ansible-routes.txt`.

A configuração inicial falhou por CRLF nos argumentos Linux; arquivos LF e .gitattributes corrigiram. Caminho fixo /usr/bin/python3 no runner foi trocado por descoberta automática do interpretador. Falhas iniciais não foram contadas como sucesso. Serviços da bancada encerrados após validação, sem apagar dados de outros projetos.

## Segurança e operação
Sem portas publicadas no lab FRR, rede de trânsito interna, sem credenciais. Roteadores precisam de capacidades Linux NET_ADMIN/NET_RAW/SYS_ADMIN. Runner opcional monta socket Docker: tem controle sobre o engine; só executar código confiável em bancada pessoal. Não é serviço web nem executor remoto. O Hub não recebe credenciais e não inicia containers. Artefatos e execução em [labs/ccna-advanced/README.md](../../labs/ccna-advanced/README.md).

## Limites que permanecem
Não houve revisão humana independente, piloto com alunos ou calibração psicométrica. Protocolo explícito e matriz de revisão em [CCNA_REVIEW_PROTOCOL.md](CCNA_REVIEW_PROTOCOL.md), todos pendentes. Não anunciar prontidão, curso integral ou similitude comprovada com a prova.

Wireless e AAA têm aulas, decisões e receitas aplicáveis a bancadas compatíveis; não foram executados em Packet Tracer/IOS ou hardware neste trabalho. RF real, RADIUS/TACACS+ real, RA/SLAAC/ND com clientes e escrita Ansible idempotente ainda precisam desses ambientes. FRR valida protocolo OSPFv3 e roteamento IPv6; não valida sintaxe IOS. O playbook é coleta/verificação via Docker, não conexão SSH IOS.

## Fontes técnicas consultadas
- OSPFv3 FRR: https://docs.frrouting.org/en/latest/ospf6d.html
- Release/imagem FRR: https://frrouting.org/release/10.3.1/
- OSPFv3 IOS XE: https://www.cisco.com/c/en/us/td/docs/routers/ios/config/17-x/ip-routing/b-ip-routing/m_ip6-route-ospfv3-xe.html
- ND: https://www.rfc-editor.org/rfc/rfc4861
- Ansible command/argv: https://docs.ansible.com/projects/ansible/latest/collections/ansible/builtin/command_module.html
- AAA: https://www.cisco.com/c/en/us/support/docs/security-vpn/terminal-access-controller-access-control-system-tacacs-/200606-aaa-authentication-login-default-local.html
- Wireless: https://www.cisco.com/c/en/us/support/docs/collaboration-endpoints/wireless-ip-phone-8821/217219-troubleshoot-cp-8821-wireless-phones.pdf

## Validação do Hub
Typecheck, ESLint e Prettier dos arquivos alterados passaram. Vitest 159/159 e Playwright frontend 48/48, incluindo quatro testes novos para prefixo IPv6, decisão AAA, navegação e layout mobile. Builds normal e platform passaram; aviso conhecido de chunk principal acima de 500 kB permanece. Compose config e diff --check passaram. Não foi necessário repetir a suíte legada da raiz: não houve mudança no servidor ou no código legado neste lote.
