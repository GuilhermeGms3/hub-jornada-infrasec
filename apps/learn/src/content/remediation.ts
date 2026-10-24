export const remediation = [
  {
    id: 'ip-dns',
    title: 'IP não é DNS',
    lesson: 'ipv4',
    question: 'm-ip-dns',
    paragraphs: [
      'Imagine que você já tem o endereço da biblioteca. Isso é diferente de perguntar a um serviço de consulta onde a biblioteca fica. No host, o IPv4 da interface é parte da identificação/configuração local. O endereço no campo DNS indica um resolvedor usado para consultas. Ambos podem ter formato IPv4, mas não representam a mesma função.',
      'No caso de configuração link-local inesperada, consultar outro nome não fornece automaticamente o endereço correto ao cliente. Comece pela obtenção da configuração. No caso de cliente bem configurado que só falha ao resolver nomes, investigue a consulta e seu caminho. O contraste é entre configurar a origem e descobrir informações do destino.',
    ],
  },
  {
    id: 'gateway-dns',
    title: 'Conhecer o endereço não cria uma saída',
    lesson: 'gateway',
    question: 'm-gateway-dns',
    paragraphs: [
      'DNS fornece informações associadas a um nome. Gateway é um próximo salto usado por uma rota. Pense em dois problemas: descobrir onde fica um destino e ter um caminho para chegar até lá. Uma resposta DNS positiva resolve parte do primeiro; não demonstra que existe rota para o endereço retornado.',
      'Compare: se o nome já está em cache e falta rota remota, trocar DNS não cria caminho. Se a rota funciona e a consulta DNS expira, investigar somente o gateway pode não discriminar o problema. Um roteador doméstico pode exercer as duas funções no mesmo IP; separar funções permite testar cada serviço.',
    ],
  },
  {
    id: 'local-remoto',
    title: 'Um teste local não cobre o caminho remoto',
    lesson: 'redes',
    question: 'm-local-remoto',
    paragraphs: [
      'Uma impressora na mesma rede conectada pode ser alcançada sem a rota default do exemplo. Um serviço remoto precisa de rota aplicável e de todo o caminho de ida/retorno. Portanto impressão local bem-sucedida reduz algumas hipóteses, mas não prova que a saída externa está disponível.',
      'Faça uma comparação controlada: leia a interface e a máscara, classifique o destino, examine a rota e escolha um teste do serviço. Não altere vários componentes ao mesmo tempo. Se o destino é local, começar culpando a internet não explica o caminho; se é remoto, um teste local sozinho é insuficiente.',
    ],
  },
  {
    id: 'icmp-servico',
    title: 'Silêncio ao ping não é silêncio de todo serviço',
    lesson: 'diagnostico',
    question: 'm-icmp-servico',
    paragraphs: [
      'Ping pede uma resposta ICMP. Um acesso HTTPS usa outra conversa. Políticas podem bloquear ICMP e permitir o serviço web; um equipamento também pode deixar de responder a sondagens sem parar todo encaminhamento. A ausência de resposta tem explicações concorrentes.',
      'Se HTTPS funcionou, registre esse sucesso mesmo se o ping expirou. Se você só executou ping, ainda não sabe se HTTPS funciona: escolha um teste da porta/aplicação. A correção do raciocínio não é substituir “tudo caiu” por “tudo funciona”, mas restringir a conclusão ao teste realmente observado.',
    ],
  },
  {
    id: 'mascara-ip',
    title: 'O endereço precisa da máscara para descrever a rede',
    lesson: 'mascara',
    question: 'm-mascara-ip',
    paragraphs: [
      'IPv4 identifica uma interface naquele contexto; máscara indica quais bits formam o prefixo. Aplicar AND permite comparar a rede da origem com a do destino. Em /24 os primeiros três octetos são mantidos; em /26 dois bits do último octeto também participam. Por isso uma regra visual de três números iguais não serve sempre.',
      'Compare 192.168.10.25 e 192.168.10.80: com /24 pertencem a .0/24; com /26 pertencem a .0/26 e .64/26. A troca da máscara, sem mudar os endereços, alterou a classificação. No sistema real, consulte também as rotas. Não invente máscara para forçar um resultado sem verificar o plano da rede.',
    ],
  },
  {
    id: 'web-ip',
    title: 'Resolução, transporte e aplicação são observações diferentes',
    lesson: 'https',
    question: 'm-web-ip',
    paragraphs: [
      'Obter o endereço de um serviço não estabelece conexão, e conectar não comprova certificado nem resposta HTTP adequada. Separe as perguntas: DNS retornou? TCP conectou no exemplo? TLS validou? HTTP retornou qual status? Cada observação desloca o foco da investigação.',
      'Se o nome resolveu e TCP foi recusado, investigar listener/política é mais direcionado que declarar falha DNS. Se TCP conectou e o certificado foi rejeitado, examine o contexto TLS. Se chegou HTTP 503, existe uma resposta de aplicação ou intermediário HTTP; a disponibilidade do serviço precisa ser tratada nesse nível, sem apagar os fatos anteriores.',
    ],
  },
];
