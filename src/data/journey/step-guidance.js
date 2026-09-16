const commandRules = [
  [/Use ping e ARP/i, ['ping <IP-do-outro-host>', 'arp -a']],
  [/Observe arp -a/i, ['arp -a']],
  [/Crie VLAN 10/i, ['enable', 'configure terminal', 'vlan 10', 'name USERS', 'vlan 20', 'name SUPPORT']],
  [/Associe portas access/i, ['interface range fastEthernet 0/1-10', 'switchport mode access', 'switchport access vlan 10']],
  [/show vlan brief/i, ['show vlan brief']],
  [/Configure o trunk/i, ['interface gigabitEthernet 0/1', 'switchport mode trunk']],
  [/VLANs permitidas e ativas/i, ['show interfaces trunk']],
  [/hosts da mesma VLAN/i, ['show interfaces trunk', 'ping <IP-do-host-remoto>']],
  [/estado das VLANs e do trunk/i, ['show vlan brief', 'show interfaces trunk']],
  [/allowed list/i, ['show interfaces trunk', 'switchport trunk allowed vlan <lista>']],
  [/show ip route/i, ['show ip route']],
  [/rotas de ida e retorno/i, ['ip route <rede> <mascara> <next-hop>', 'show ip route static']],
  [/partir dos hosts/i, ['ping <IP-remoto>', 'tracert <IP-remoto>']],
  [/saida padrao/i, ['ip route 0.0.0.0 0.0.0.0 <next-hop>', 'show ip route']],
  [/next hop errado/i, ['show ip route', 'traceroute <IP-remoto>']],
  [/traceroute e show ip route/i, ['traceroute <IP-remoto>', 'show ip route']],
  [/router IDs/i, ['router ospf 1', 'router-id <ID-unico>']],
  [/Anuncie as redes/i, ['router ospf 1', 'network <rede> <wildcard> area 0']],
  [/passive-interface/i, ['router ospf 1', 'passive-interface <interface-LAN>']],
  [/show ip ospf neighbor/i, ['show ip ospf neighbor']],
  [/show ip route ospf/i, ['show ip route ospf']],
  [/ping entre hosts das extremidades/i, ['ping <IP-do-host-remoto>']],
  [/Compare area dos dois lados/i, ['show ip ospf interface brief', 'show running-config | section router ospf']],
  [/interface e ping do enlace/i, ['show ip interface brief', 'ping <IP-do-vizinho>']],
  [/Restaure area/i, ['router ospf 1', 'network <rede> <wildcard> area 0', 'show ip ospf neighbor']],
  [/permit especifico/i, ['ip access-list extended APP-FLOW', 'permit tcp <origem> <destino> eq <porta>']],
  [/teste positivo e negativo/i, ['ping <destino-permitido>', 'telnet <destino> <porta>']],
  [/counters da ACL/i, ['show access-lists']],
  [/interfaces inside\/outside/i, ['show ip interface brief', 'ip nat inside', 'ip nat outside']],
  [/Configure PAT/i, ['access-list 1 permit <rede-interna> <wildcard>', 'ip nat inside source list 1 interface <WAN> overload']],
  [/show ip nat translations/i, ['show ip nat translations', 'show ip nat statistics']],
  [/show access-lists/i, ['show access-lists']],
  [/pwd, ls -la e man/i, ['pwd', 'ls -la', 'man ls']],
  [/find para localizar/i, ['find /etc -type f -name "*.conf" 2>/dev/null | head']],
  [/head e tail/i, ['head -n 10 <arquivo>', 'tail -n 10 <arquivo>']],
  [/chmod numerico e simbolico/i, ['chmod 640 <arquivo>', 'chmod u+x <arquivo>']],
  [/ls -l\/stat/i, ['ls -l <arquivo>', 'stat <arquivo>']],
  [/ps\/top/i, ['ps aux', 'top']],
  [/systemctl status/i, ['systemctl status <servico>']],
  [/journalctl/i, ['journalctl -u <servico> --since "30 minutes ago"']],
  [/ip a e ip route/i, ['ip address', 'ip route']],
  [/portas com ss/i, ['ss -tulpn']],
  [/ssh\/sshd/i, ['systemctl status ssh', 'ss -tlnp | grep :22', 'ssh <usuario>@<host>']],
  [/falhas de autenticacao/i, ['grep -i "failed\|failure" <arquivo-de-log>']],
  [/IPs e conte recorrencias/i, ["grep -Eo '([0-9]{1,3}\\.){3}[0-9]{1,3}' <arquivo-de-log> | sort | uniq -c | sort -nr"]],
  [/Teste IP externo e nome/i, ['ping 1.1.1.1', 'nslookup example.com']],
  [/porta 53/i, ['nslookup example.com <servidor-DNS>', 'Test-NetConnection <servidor-DNS> -Port 53']],
  [/Crie branch/i, ['git switch -c melhora-readme']],
  [/Revise o diff/i, ['git status', 'git diff']],
  [/git revert/i, ['git log --oneline -5', 'git revert <hash-do-commit>']]
];

function commandsFor(title) {
  return commandRules.find(([pattern]) => pattern.test(title))?.[1] || [];
}

function classifyStep(title, target, commands) {
  if (target.includes('.pkt')) return 'Lab Packet Tracer';
  if (target.startsWith('practice:terminal:')) return 'Terminal guiado';
  if (target.startsWith('practice:incidents:')) return 'Incidente interativo';
  if (target.startsWith('practice:soc:')) return 'Investigacao SOC';
  if (target.startsWith('practice:cloud:')) return 'Lab cloud guiado';
  if (target.startsWith('practice:architecture:')) return 'Arquitetura interativa';
  if (target.startsWith('career:interview')) return 'Treino de entrevista';
  if (target.startsWith('template:')) return 'Producao de evidencia';
  if (/questoes|simulado|checkpoint|rubrica/i.test(title)) return 'Avaliacao';
  if (/desenhe|diagrama|mapa|matriz|tabela|plano|linha do tempo/i.test(title)) return 'Construcao de artefato';
  if (/documente|registre|escreva|inclua|anote/i.test(title)) return 'Producao de evidencia';
  if (commands.length || /execute|use |confira|consulte|teste |configure|aplique|filtre|extraia/i.test(title)) return 'Pratica orientada';
  if (/compare|diferencie|explique|revise|entenda|identifique|classifique/i.test(title)) return 'Estudo ativo';
  return 'Exercicio guiado';
}

function instructionFor(kind, title, objective) {
  const context = `O objetivo da missao e ${objective.charAt(0).toLowerCase()}${objective.slice(1)}`;
  const instructions = {
    'Lab Packet Tracer': `Abra o arquivo .pkt e trabalhe somente nesta etapa: ${title} Antes de alterar algo, observe o estado atual; depois valide a mudanca com comando show e um teste de conectividade.`,
    'Terminal guiado': `Abra o terminal guiado e resolva somente esta etapa: ${title} Digite os comandos conscientemente, leia a saida e registre o que ela comprova.`,
    'Incidente interativo': `Abra o caso e trate somente esta decisao: ${title} Leia impacto e evidencias antes de escolher causa ou correcao.`,
    'Investigacao SOC': `Abra a investigacao e execute esta etapa: ${title} Preserve horario, host, usuario e origem; diferencie fato observado de hipotese.`,
    'Lab cloud guiado': `Abra o lab cloud e realize esta etapa: ${title} Verifique identidade, escopo, exposicao, logs e custo antes de confirmar a decisao.`,
    'Arquitetura interativa': `Abra o mapa operacional e resolva esta etapa: ${title} Siga o fluxo da requisicao e ligue cada conclusao a um componente ou evidencia.`,
    'Treino de entrevista': `Abra o modo entrevista e responda esta etapa sem consultar: ${title} Compare com a rubrica somente depois e registre o ponto que faltou.`,
    'Avaliacao': `Execute esta etapa em uma tentativa limpa: ${title} Corrija os erros por assunto e transforme cada erro em uma frase explicativa.`,
    'Construcao de artefato': `Produza somente este artefato: ${title} Use nomes, setas ou colunas legiveis e relacione cada elemento ao comportamento real do sistema.`,
    'Producao de evidencia': `Registre esta etapa no artefato indicado: ${title} Inclua contexto, resultado observavel e interpretacao; nao declare algo que nao foi testado.`,
    'Pratica orientada': `Execute esta etapa no ambiente indicado: ${title} Preveja o resultado antes, colete a saida e explique o que mudou.`,
    'Estudo ativo': `Estude apenas esta pergunta: ${title} Depois feche o material e explique com suas palavras, incluindo um exemplo e um contraexemplo.`,
    'Exercicio guiado': `Conclua uma acao por vez: ${title} Registre o resultado antes de seguir para o proximo passo.`
  };
  return `${instructions[kind]} ${context}.`;
}

function checksFor(kind, evidence) {
  const checks = {
    'Lab Packet Tracer': ['A configuracao solicitada aparece no running-config ou comando show.', 'Existe teste antes/depois e o arquivo .pkt foi salvo com outro nome.'],
    'Terminal guiado': ['O comando foi executado, nao apenas copiado.', 'Guardei output e interpretacao no transcript.'],
    'Incidente interativo': ['Minha decisao usa evidencias do caso.', 'Registrei impacto, causa, validacao e criterio de escalonamento.'],
    'Investigacao SOC': ['Separei evento, entidade, indicador e hipotese.', 'Registrei timeline, contencao proporcional e evidencias a preservar.'],
    'Lab cloud guiado': ['A permissao ou exposicao ficou no menor escopo necessario.', 'Inclui teste permitido/negado, log de auditoria e observacao de custo.'],
    'Arquitetura interativa': ['O fluxo possui dependencias e ponto de falha identificados.', 'A hipotese esta ligada a log, metrica ou teste verificavel.'],
    'Treino de entrevista': ['Respondi sem ler a resposta esperada.', 'Registrei o conceito ausente para revisar.'],
    'Avaliacao': ['Conclui a quantidade solicitada sem consultar respostas.', 'Classifiquei os erros por assunto e escrevi a correcao.'],
    'Construcao de artefato': ['Outra pessoa consegue seguir o artefato sem explicacao oral.', 'Os elementos possuem nomes, relacoes e resultado esperado.'],
    'Producao de evidencia': ['O registro separa fato, hipotese e conclusao.', 'O artefato possui resultado e validacao reproduziveis.'],
    'Pratica orientada': ['Executei no ambiente correto e guardei o resultado.', 'Consigo explicar o que o teste confirma e o que nao confirma.'],
    'Estudo ativo': ['Consigo explicar sem consultar o material.', 'Consigo aplicar o conceito a um exemplo operacional.'],
    'Exercicio guiado': ['Conclui a acao proposta.', 'Registrei resultado e dificuldade encontrada.']
  };
  const result = [...checks[kind]];
  result.push(`Este passo contribui para: ${evidence}`);
  return result;
}

function actionFor(kind, target) {
  if (target.includes('.pkt')) return 'Baixar ou abrir este lab .pkt';
  if (target.startsWith('practice:terminal:')) return 'Abrir terminal guiado deste passo';
  if (target.startsWith('practice:incidents:')) return 'Abrir incidente deste passo';
  if (target.startsWith('practice:soc:')) return 'Abrir investigacao deste passo';
  if (target.startsWith('practice:cloud:')) return 'Abrir lab cloud deste passo';
  if (target.startsWith('practice:architecture:')) return 'Abrir arquitetura deste passo';
  if (target.startsWith('practice:journey:')) return 'Abrir bancada desta semana';
  if (target.startsWith('practice:certs:')) return 'Abrir pratica da certificacao';
  if (target.startsWith('career:interview')) return 'Abrir treino de entrevista';
  if (target.startsWith('career:')) return 'Abrir ferramenta desta etapa';
  if (target.startsWith('template:')) return 'Abrir template deste passo';
  if (target.startsWith('#')) return 'Abrir modulo relacionado';
  if (/quiz\.html$/i.test(target)) return 'Abrir quiz deste passo';
  return kind === 'Estudo ativo' ? 'Abrir material deste passo' : 'Abrir recurso deste passo';
}

function questionFor(kind, title) {
  if (/leitura|estudo|explicacao|hipotese/i.test(kind)) {
    return `Explique com suas palavras o que aprendeu em "${title}" e cite uma situacao em que isso muda o diagnostico.`;
  }
  if (/Packet Tracer/i.test(kind)) {
    return `Qual era o estado antes, qual alteracao voce fez e qual comando ou teste prova que "${title}" funcionou?`;
  }
  if (/Terminal|Pratica/i.test(kind)) {
    return `O que a saida desta etapa comprova e o que ela ainda nao permite concluir?`;
  }
  if (/Incidente|SOC|Tomada de decisao|Diagnostico/i.test(kind)) {
    return `Qual evidencia sustenta sua decisao nesta etapa e qual hipotese concorrente foi eliminada?`;
  }
  if (/Avaliacao|Checkpoint/i.test(kind)) {
    return `Qual foi seu principal erro nesta etapa e como voce explicaria agora a resposta correta?`;
  }
  return `Descreva o resultado de "${title}" e explique como outra pessoa poderia verifica-lo.`;
}

function completionFor(kind, target, structured) {
  if (/^practice:(incidents|soc|cloud|terminal|certs|architecture):/.test(target)) return 'activity';
  if (target.startsWith('practice:journey:')) {
    return /avaliacao|checkpoint|simulado/i.test(kind) ? 'activity' : 'manual';
  }
  if (/CCNA-1-Study-Hub\/quiz\.html$/i.test(target) && /Avaliacao/i.test(kind)) return 'quiz';
  return 'manual';
}

export function enrichMissionSteps(steps, mission) {
  return steps.map((item) => {
    const structured = typeof item !== 'string';
    const title = structured ? item.title : item;
    const target = structured ? item.target || mission.target : mission.target;
    const commands = structured ? item.commands || commandsFor(title) : commandsFor(title);
    const kind = structured ? item.kind : classifyStep(title, target, commands);
    return {
      ...(structured ? item : {}),
      title,
      kind,
      instruction: structured ? item.instruction : instructionFor(kind, title, mission.objective),
      action: structured ? item.action : actionFor(kind, target),
      target,
      commands,
      checks: structured && item.checks?.length ? item.checks : checksFor(kind, mission.evidence),
      question: structured && item.question ? item.question : questionFor(kind, title),
      completion: structured && item.completion ? item.completion : completionFor(kind, target, structured),
      requiresOutput: structured && item.requiresOutput != null
        ? item.requiresOutput
        : commands.length > 0 || /Packet Tracer/i.test(kind)
    };
  });
}
