# Recuperação direcionada proposta

Entrada: erro verificável numa decisão estruturada, com exercício/versão, objetivo e resultado de apoio. Não inferir causa humana como falta de atenção, ansiedade ou desconhecimento geral a partir de uma alternativa.

| Código / observação | Reensino e contraste | Nova situação de verificação |
| --- | --- | --- |
| R-DNS-GW: escolheu DNS para resolver ausência de rota | L05/L06: gateway encaminha pacotes remotos; DNS fornece registros. Computador pode conhecer IP e ainda não ter rota | Impressora local funciona, nome externo já resolvido, rota ausente; escolher ação investigativa |
| R-NAME-SERVICE: nome resolveu, mas aluno afirma falha DNS comprovada | L06/L08: obter endereço não abre TCP/TLS/HTTP; ver resposta de nome e conexão recusada | Porta 443 responde em um servidor e é recusada em outro; distinguir serviço de resolução |
| R-IP-MASK: decide local/remoto olhando só últimos números | L03/L04: aplicar a máscara aos dois endereços; começar com /24 explícito, sem generalizar primeiro octeto | 192.168.20.8/24 e 192.168.21.8; depois comparar destino local |
| R-ICMP: timeout de ping virou certeza de host desligado | L10: ICMP pode ser filtrado; mostrar HTTPS funcionando junto do timeout | Serviço permitido com ICMP negado; pedir limite da conclusão |
| R-MAC: manda quadro para MAC do servidor remoto | L03/L05: IP de destino continua remoto, quadro local usa próximo salto | Cliente alcança servidor fora da LAN; identificar vizinho Ethernet sem trocar IP final |
| R-LAYERS: DNS interpretado como criptografia ou HTTP como transporte | L07/L08: resolução encontra endereço, TCP entrega fluxo, TLS protege, HTTP expressa mensagens | Identificar estágio após conexão estabelecida com erro de certificado |

Cada intervenção contém explicação própria, exemplo contrastivo e exercício alternativo. Link para a lição original é complemento, não a recuperação inteira. Mostrar qual resposta motivou a sugestão. O aluno pode ignorar a sugestão, consultar conteúdo e retornar.

Tentativas de recuperação têm modo próprio e ajuda registrada; completá-las não aprova automaticamente o caso independente original. Após resolução, selecionar cenário de família diferente; se não houver, informar que a confirmação independente ainda está pendente. O sistema não promete “lacuna corrigida” apenas por abrir o material.

Na Fase 2, redigir os seis reensinos integralmente. Nesta fase estão especificados seus mecanismos e destino; nenhum material foi publicado no player.
