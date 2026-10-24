# Revisão preliminar NET-R01

Data: 23/10/2026. Revisor desta fase: assistente de desenvolvimento, sem revisão humana independente. Escopo: coerência da especificação e cenários propostos, não aulas integralmente redigidas nem eficácia medida.

## Pontos técnicos a preservar

| Afirmação/risco | Decisão editorial |
| --- | --- |
| DNS como bloco físico sempre anterior ao gateway | Mostrar consulta condicional/cache e possível rota até o próprio resolvedor |
| Máscara reduzida a “três primeiros números” | Explicar bits e usar /24 como caso delimitado, sem generalizar |
| ARP do servidor remoto | ARP resolve vizinho IPv4 no enlace; separar IP final de MAC do próximo salto |
| Campo de gateway ausente prova ausência de qualquer rota | Exibir tabela de rotas e escopo simples; reconhecer rotas específicas/VPN |
| Timeout ICMP significa máquina desligada | Usar evidências de outro protocolo e conclusão limitada |
| TCP conectado significa site saudável | Separar TCP, TLS e HTTP; conexão recusada não prova processo específico parado |
| Todo HTTPS usa TCP | Delimitar exemplo TCP e explicar existência de HTTP/3/QUIC/UDP |
| Usar IP no navegador equivale ao nome | Explicar hospedagem virtual, SNI/certificado e limites do teste |
| APIPA prova serviço DHCP parado | No contexto proposto indica falta de configuração esperada, com causas alternativas |
| Teste TCP 53 prova consulta DNS inteira | Não confundir portas/protocolos e resolver; mostrar a consulta efetiva |
| Repetição numérica prova transferência | Classificar famílias por mecanismo, não por IP diferente |
| Resposta certa revela causa humana do erro anterior | Apenas observação de desempenho e hipótese instrucional |

## Fontes técnicas consultadas

Fontes primárias/documentação técnica abertas nesta fase, usadas como referência conceitual, sem copiar material para as aulas:

- [RFC 1122 — requisitos de hosts](https://www.rfc-editor.org/rfc/rfc1122.html): camadas e encaminhamento no host; referência histórica, não documento único de toda rede moderna.
- [RFC 1034 — conceitos DNS](https://www.rfc-editor.org/rfc/rfc1034.html): nomes, resolução e caches; não cobre sozinho todas as extensões atuais.
- [MDN — visão geral de HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview): papéis cliente/servidor e mensagens na web.

Antes da publicação: conferir fontes específicas de TCP/TLS/HTTP/3, comandos Windows e endereços de documentação; registrar seções exatas e eventuais atualizações. A conferência inicial não autoriza afirmar revisão exaustiva de protocolos ou aderência certificatória. A R01 não possui matriz oficial CCNA fechada.

## Direitos

R01 será autoria original de explicações, diagramas e itens sintéticos. Não copiar questões comerciais, textos comunitários sem permissão ou imagens remotas do arquivo antigo. Licença de cada ativo incorporado precisa ser registrada; referências conceituais não são incorporação de texto.

## Pendências de revisão

1. Redigir integralmente as dez lições sem conteúdo essencial implícito.
2. Completar famílias alternativas e feedback individual do banco; matriz O01–O08 ainda preliminar.
3. Revisor técnico independente conferir consistência de cada output com seu cenário.
4. Verificar carga cognitiva: dez lições podem exigir divisão em sessões, sem transformar em telas vazias.
5. Testar diagrama com iniciante e teclado/leitor de tela.
6. Validar diferença entre “demonstrado neste conjunto” e objetivos ainda não cobertos.
7. Executar protocolo de aprendizagem com iniciantes; não afirmar eficácia antes disso.

Decisão atual: especificação apta a orientar a redação/implementação, com pendências explícitas; **não é conteúdo aprovado para publicação como curso completo**.
