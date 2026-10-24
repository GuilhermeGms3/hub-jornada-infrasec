# NET-R01 — objetivos e rastreabilidade preliminar

Versão proposta: 1.0. Público: iniciante absoluto. Pré-requisito: uso básico de computador/navegador. Nenhum termo de rede é presumido. Tempo estimado só será publicado após observação do piloto.

| ID | Ao final, o aluno consegue | Ensino / demonstração | Verificação proposta | Essencial |
| --- | --- | --- | --- | --- |
| O01 | Distinguir dispositivo, rede local, internet, cliente e serviço servidor num contexto | L01/L02; pedido e resposta entre cliente e servidor | C01 e papel dos componentes no caso integrado; família alternativa de compartilhamento local | Sim |
| O02 | Relacionar IP, nome e MAC sem atribuir a um o papel do outro | L03; quadro do próximo salto e pacote de destino | C02 e A5; variante remota com resolução em cache | Sim |
| O03 | Interpretar endereço e máscara /24 e decidir se destino é local no modelo ensinado | L04; tabela de duas redes e cálculo visual dos bits de rede | C03, B1 e caso alternativo com destino local | Sim |
| O04 | Explicar quando a rota default é usada e prever efeito de sua ausência | L05; comunicação local preservada sem saída remota | C04, B2 e B3 | Sim |
| O05 | Distinguir resolução DNS de encaminhamento e disponibilidade do serviço | L06; consultar nome não abre sessão HTTPS | C05, A1 e A2; contraste com falha DNS guiada | Sim |
| O06 | Relacionar TCP, TLS e HTTP ao exemplo HTTPS sem afirmar que todo acesso usa TCP | L07/L08; handshake simplificado e HTTP/3 explicitamente fora do caso | C06, C07 e A4; variante de erro TLS | Sim |
| O07 | Selecionar e interpretar testes que discriminem hipóteses sem mudança arbitrária de configuração | L10 e exemplo resolvido | G01/G02/G03 para treino; A2/A3 e B3 para observação independente | Sim |
| O08 | Delimitar uma conclusão: timeout de ICMP ou DNS resolvido isolados não provam disponibilidade/causa completa | L09/L10; protocolos diferentes e evidência insuficiente | C08, A3 e B4; variantes de revisão | Sim |

IDs completos serão prefixados `NET-R01-O01`, etc.; formas curtas neste conjunto de documentos mantêm leitura simples. C/G/A/B/R são IDs definidos em [ASSESSMENT](NET-R01-ASSESSMENT.md). Exemplos são especificações, não itens já presentes no app.

## Regra de cobertura

Cada objetivo exige ensino, demonstração e observação independente. Um único item não demonstra objetivo inteiro. A matriz acima indica famílias candidatas; não prova que todos os itens e variantes já estejam redigidos. Na redação integral, preencher cada família alternativa com enunciado, dados, opções e feedback antes de habilitar a demonstração desse objetivo.

A R01 introduz máscara por /24, com explicação binária suficiente para o exemplo. Não afirma ensinar VLSM, IPv6 completo, exceções de roteamento de sistemas reais ou todo o blueprint CCNA. Não mapear números de objetivos oficiais sem conferência específica da versão vigente.
