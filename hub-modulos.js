(function () {
  'use strict';

  const storageKeys = {
    deliverables: 'infrasec-deliverables',
    ticketAttempts: 'infrasec-ticket-attempts',
    labProgress: 'infrasec-lab-progress',
    examHistory: 'infrasec-exam-history',
    readingQueue: 'infrasec-reading-queue',
    interviewHistory: 'infrasec-interview-history',
    englishPractice: 'infrasec-english-practice',
    activeTab: 'infrasec-career-tab'
  };

  function readState(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value ?? fallback;
    } catch {
      return fallback;
    }
  }

  function saveState(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function createId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function downloadFile(filename, content, type) {
    const blob = new Blob([content], { type });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  }

  function formatDate(value) {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(value));
  }

  function getCurrentWeekNumber() {
    return Number(weekSelect.value) + 1;
  }

  function getTaskProgress() {
    return readState('infrasec-task-progress', {});
  }

  function getCompletedTaskCount(maxWeek = 12) {
    const state = getTaskProgress();
    return Object.entries(state).filter(([key, value]) => {
      const weekIndex = Number(key.split('-')[0]);
      return value === 'feito' && weekIndex < maxWeek;
    }).length;
  }

  function getHighestStudiedWeek() {
    const state = getTaskProgress();
    let unlockedWeek = 1;
    for (let weekIndex = 0; weekIndex < 12; weekIndex += 1) {
      const studied = Object.entries(state).some(([key, value]) => {
        return Number(key.split('-')[0]) === weekIndex && value === 'feito';
      });
      if (!studied && weekIndex > 0) break;
      if (studied) unlockedWeek = weekIndex + 1;
    }
    return unlockedWeek;
  }

  const tabs = Array.from(document.querySelectorAll('[data-career-tab]'));
  const panels = Array.from(document.querySelectorAll('.career-panel'));

  function activateTab(name, focusTab = false) {
    tabs.forEach((tab) => {
      const active = tab.dataset.careerTab === name;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focusTab) tab.focus();
    });
    panels.forEach((panel) => {
      panel.hidden = panel.id !== `career-${name}`;
    });
    saveState(storageKeys.activeTab, name);
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(tab.dataset.careerTab));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      const nextIndex = (index + direction + tabs.length) % tabs.length;
      activateTab(tabs[nextIndex].dataset.careerTab, true);
    });
  });

  const savedTab = readState(storageKeys.activeTab, 'portfolio');
  activateTab(tabs.some((tab) => tab.dataset.careerTab === savedTab) ? savedTab : 'portfolio');

  let deliverables = readState(storageKeys.deliverables, []);
  let editingDeliverableId = null;
  const deliverableForm = document.getElementById('deliverableForm');
  const deliverableType = document.getElementById('deliverableType');
  const deliverableWeek = document.getElementById('deliverableWeek');
  const deliverableTitle = document.getElementById('deliverableTitle');
  const deliverableEvidence = document.getElementById('deliverableEvidence');
  const deliverableBody = document.getElementById('deliverableBody');
  const deliverableStatus = document.getElementById('deliverableStatus');

  for (let weekNumber = 1; weekNumber <= 12; weekNumber += 1) {
    const option = document.createElement('option');
    option.value = String(weekNumber);
    option.textContent = `Semana ${weekNumber}`;
    deliverableWeek.appendChild(option);
  }
  deliverableWeek.value = String(getCurrentWeekNumber());

  function deliverableMarkdown(item) {
    return `# ${item.title}

## Contexto

- Tipo: ${item.type}
- Semana: ${item.week}
- Data: ${formatDate(item.createdAt)}

## Evidencia

${item.evidence || 'Adicionar print, diagrama, arquivo ou link.'}

## Registro

${item.body}

## Aprendizado

- O que funcionou:
- O que eu revisaria:
- Como eu explicaria isto em uma entrevista:
`;
  }

  function syncCompletedTasks() {
    const state = getTaskProgress();
    const types = ['README de lab', 'Ticket', 'Relatorio', 'Print', 'Diagrama'];
    let changed = false;

    Object.entries(state).forEach(([key, value]) => {
      if (value !== 'feito') return;
      const [weekIndex, taskIndex] = key.split('-').map(Number);
      const task = weeks[weekIndex]?.tasks?.[taskIndex];
      const sourceId = `task-${weekIndex}-${taskIndex}`;
      if (!task || deliverables.some((item) => item.sourceId === sourceId)) return;

      deliverables.unshift({
        id: createId('deliverable'),
        sourceId,
        type: types[taskIndex % types.length],
        week: weekIndex + 1,
        title: task[0],
        evidence: '',
        body: `Tarefa concluida: ${task[1]}\n\nComandos ou ferramentas utilizados:\n\nResultado observado:\n\nConclusao:`,
        status: 'rascunho',
        createdAt: new Date().toISOString()
      });
      changed = true;
    });

    if (changed) saveState(storageKeys.deliverables, deliverables);
  }

  function renderDeliverables() {
    const list = document.getElementById('deliverableList');
    const completed = deliverables.filter((item) => item.status === 'concluido').length;
    const types = new Set(deliverables.map((item) => item.type)).size;
    document.getElementById('deliverableSummary').innerHTML = `
      <div class="summary-metric"><strong>${deliverables.length}</strong><span>entregaveis registrados</span></div>
      <div class="summary-metric"><strong>${completed}</strong><span>prontos para publicar</span></div>
      <div class="summary-metric"><strong>${types}</strong><span>tipos de evidencia</span></div>
      <div class="summary-metric"><strong>${getCompletedTaskCount()}</strong><span>tarefas concluidas</span></div>
    `;

    if (!deliverables.length) {
      list.innerHTML = '<div class="record-empty">Marque uma tarefa como feita ou crie seu primeiro entregavel.</div>';
      return;
    }

    list.innerHTML = deliverables.map((item) => `
      <article class="record-item">
        <div>
          <span class="status-label">${escapeHtml(item.status)}</span>
          <h5>${escapeHtml(item.title)}</h5>
          <p>${escapeHtml(item.type)} · Semana ${item.week} · ${formatDate(item.createdAt)}</p>
        </div>
        <div class="record-actions">
          <button type="button" data-deliverable-action="toggle" data-deliverable-id="${item.id}">${item.status === 'concluido' ? 'Reabrir' : 'Concluir'}</button>
          <button type="button" data-deliverable-action="edit" data-deliverable-id="${item.id}">Editar</button>
          <button type="button" data-deliverable-action="download" data-deliverable-id="${item.id}">Baixar .md</button>
          <button class="danger-button" type="button" data-deliverable-action="delete" data-deliverable-id="${item.id}">Remover</button>
        </div>
      </article>
    `).join('');
  }

  function resetDeliverableForm() {
    editingDeliverableId = null;
    deliverableForm.reset();
    deliverableWeek.value = String(getCurrentWeekNumber());
    document.getElementById('saveDeliverable').textContent = 'Salvar entregavel';
    deliverableStatus.textContent = '';
  }

  deliverableForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const payload = {
      type: deliverableType.value,
      week: Number(deliverableWeek.value),
      title: deliverableTitle.value.trim(),
      evidence: deliverableEvidence.value.trim(),
      body: deliverableBody.value.trim()
    };

    if (editingDeliverableId) {
      const item = deliverables.find((record) => record.id === editingDeliverableId);
      Object.assign(item, payload);
      deliverableStatus.textContent = 'Entregavel atualizado.';
    } else {
      deliverables.unshift({
        id: createId('deliverable'),
        ...payload,
        status: 'rascunho',
        createdAt: new Date().toISOString()
      });
      deliverableStatus.textContent = 'Entregavel salvo.';
    }

    saveState(storageKeys.deliverables, deliverables);
    renderDeliverables();
    renderReadiness();
    const message = deliverableStatus.textContent;
    resetDeliverableForm();
    deliverableStatus.textContent = message;
  });

  document.getElementById('clearDeliverable').addEventListener('click', resetDeliverableForm);

  document.getElementById('deliverableList').addEventListener('click', (event) => {
    const button = event.target.closest('[data-deliverable-action]');
    if (!button) return;
    const item = deliverables.find((record) => record.id === button.dataset.deliverableId);
    if (!item) return;

    if (button.dataset.deliverableAction === 'toggle') {
      item.status = item.status === 'concluido' ? 'rascunho' : 'concluido';
    }

    if (button.dataset.deliverableAction === 'edit') {
      editingDeliverableId = item.id;
      deliverableType.value = item.type;
      deliverableWeek.value = String(item.week);
      deliverableTitle.value = item.title;
      deliverableEvidence.value = item.evidence;
      deliverableBody.value = item.body;
      document.getElementById('saveDeliverable').textContent = 'Atualizar entregavel';
      deliverableTitle.focus();
      return;
    }

    if (button.dataset.deliverableAction === 'download') {
      const filename = item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      downloadFile(`${filename || 'entregavel'}.md`, deliverableMarkdown(item), 'text/markdown;charset=utf-8');
      return;
    }

    if (button.dataset.deliverableAction === 'delete') {
      if (!window.confirm(`Remover o entregavel "${item.title}"?`)) return;
      deliverables = deliverables.filter((record) => record.id !== item.id);
    }

    saveState(storageKeys.deliverables, deliverables);
    renderDeliverables();
    renderReadiness();
  });

  function buildPortfolioHtml() {
    const completedTasks = getCompletedTaskCount();
    const labsCompleted = Object.values(labProgress).filter((item) => item.completed).length;
    const averageExam = examHistory.length
      ? Math.round(examHistory.reduce((total, item) => total + item.score, 0) / examHistory.length)
      : 0;
    const items = deliverables.map((item) => `
      <article>
        <span>${escapeHtml(item.type)} · Semana ${item.week}</span>
        <h2>${escapeHtml(item.title)}</h2>
        <p>${escapeHtml(item.body).replaceAll('\n', '<br>')}</p>
        ${item.evidence ? `<p><strong>Evidencia:</strong> ${escapeHtml(item.evidence)}</p>` : ''}
      </article>
    `).join('');

    return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Portfolio InfraSec</title>
  <style>
    :root{--ink:#142126;--muted:#607078;--line:#d7e1e5;--primary:#0d6b75;--bg:#f5f7f8}
    *{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.6 Arial,sans-serif}
    header,main{width:min(960px,calc(100% - 32px));margin:auto}header{padding:64px 0 32px;border-bottom:1px solid var(--line)}
    h1{font-size:clamp(36px,8vw,68px);line-height:1;margin:0 0 16px}header p{max-width:68ch;color:var(--muted)}
    .metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:24px 0}.metrics div{padding:16px;border-top:4px solid var(--primary);background:#fff}
    .metrics strong{display:block;font-size:28px}main{padding:32px 0 64px}article{padding:24px 0;border-bottom:1px solid var(--line)}
    article span{color:var(--primary);font-weight:700}article h2{margin:6px 0;font-size:24px}footer{padding:32px;color:var(--muted);text-align:center}
    @media(max-width:640px){.metrics{grid-template-columns:1fr 1fr}}
  </style>
</head>
<body>
  <header>
    <h1>Portfolio InfraSec</h1>
    <p>Labs, tickets e documentacao produzidos durante uma jornada pratica de redes, suporte, NOC, SOC e cloud.</p>
    <div class="metrics">
      <div><strong>${completedTasks}</strong>tarefas feitas</div>
      <div><strong>${labsCompleted}</strong>labs validados</div>
      <div><strong>${deliverables.length}</strong>entregaveis</div>
      <div><strong>${averageExam}%</strong>media em simulados</div>
    </div>
  </header>
  <main>
    ${items || '<p>Adicione entregaveis no Hub Jornada InfraSec.</p>'}
  </main>
  <footer>Gerado pelo Hub Jornada InfraSec em ${new Date().toLocaleDateString('pt-BR')}.</footer>
</body>
</html>`;
  }

  document.getElementById('generatePortfolio').addEventListener('click', () => {
    if (!deliverables.length) {
      document.getElementById('portfolioStatus').textContent = 'Crie pelo menos um entregavel antes de gerar o portfolio.';
      return;
    }
    downloadFile('portfolio-infrasec.html', buildPortfolioHtml(), 'text/html;charset=utf-8');
    document.getElementById('portfolioStatus').textContent = 'Portfolio gerado. Publique o arquivo como portfolio.html no GitHub Pages.';
  });

  const incidents = [
    {
      id: 'helpdesk-internet',
      area: 'Help Desk',
      title: 'Usuario sem internet',
      scenario: 'O computador mostra Wi-Fi conectado, mas nenhum site abre. Outros usuarios da mesma rede navegam normalmente.',
      commands: ['ipconfig /all', 'ping 127.0.0.1', 'ping no gateway', 'nslookup example.com', 'format C:', 'show ip ospf neighbor'],
      correctCommands: [0, 1, 2, 3],
      causes: ['Gateway incorreto ou DHCP incompleto', 'Falha de OSPF na internet', 'VLAN nativa divergente', 'Conta comprometida'],
      correctCause: 0,
      correction: 'Comece pela configuracao local: endereco, mascara, gateway e DNS. Teste a pilha TCP/IP, depois o gateway e por fim a resolucao de nomes.'
    },
    {
      id: 'noc-dns',
      area: 'NOC',
      title: 'DNS nao resolve',
      scenario: 'O ping para 1.1.1.1 funciona, mas ping para nomes e acesso por dominio falham em varios computadores.',
      commands: ['nslookup example.com', 'ipconfig /displaydns', 'ipconfig /flushdns', 'ping 1.1.1.1', 'show vlan brief', 'net user'],
      correctCommands: [0, 1, 2, 3],
      causes: ['Servidor DNS indisponivel ou configurado incorretamente', 'Cabo desconectado', 'Loop de camada 2', 'Senha expirada'],
      correctCause: 0,
      correction: 'Conectividade IP existe, entao isole a resolucao de nomes. Verifique qual DNS respondeu, teste outro servidor e limpe cache somente depois de registrar o estado.'
    },
    {
      id: 'noc-vlan',
      area: 'NOC',
      title: 'VLAN sem comunicacao',
      scenario: 'Hosts da VLAN 20 comunicam entre si, mas nao acessam a VLAN 10 depois de uma alteracao no switch.',
      commands: ['show vlan brief', 'show interfaces trunk', 'show ip interface brief', 'show running-config', 'nslookup example.com', 'whoami'],
      correctCommands: [0, 1, 2, 3],
      causes: ['Trunk ou roteamento inter-VLAN incorreto', 'Problema exclusivo de DNS', 'Conta bloqueada', 'Disco cheio'],
      correctCause: 0,
      correction: 'Como a comunicacao dentro da VLAN funciona, valide trunk, VLAN permitida, subinterfaces/SVIs e gateways antes de investigar aplicacao.'
    },
    {
      id: 'soc-logins',
      area: 'SOC',
      title: 'Tentativas suspeitas de login',
      scenario: 'O SIEM mostra dezenas de falhas de autenticacao para a mesma conta, vindas de varios enderecos em poucos minutos.',
      commands: ['Consultar IPs de origem no SIEM', 'Verificar sucesso apos as falhas', 'Revisar MFA e risco da conta', 'Preservar horario e evidencias', 'Reiniciar todos os switches', 'Desativar o firewall'],
      correctCommands: [0, 1, 2, 3],
      causes: ['Password spraying ou credencial comprometida', 'Falha de DHCP', 'Erro de VLAN', 'Problema no cabo'],
      correctCause: 0,
      correction: 'Correlacione origem, volume, janela de tempo e eventual login bem-sucedido. Preserve evidencias, contenha a conta conforme playbook e escale com contexto.'
    }
  ];

  let ticketAttempts = readState(storageKeys.ticketAttempts, []);
  const incidentSelect = document.getElementById('incidentSelect');
  const incidentCause = document.getElementById('incidentCause');
  incidents.forEach((incident) => {
    const option = document.createElement('option');
    option.value = incident.id;
    option.textContent = `${incident.area} · ${incident.title}`;
    incidentSelect.appendChild(option);
  });

  function renderIncident() {
    const incident = incidents.find((item) => item.id === incidentSelect.value) || incidents[0];
    document.getElementById('incidentScenario').innerHTML = `
      <span class="module-kicker">${incident.area}</span>
      <h4>${incident.title}</h4>
      <p>${incident.scenario}</p>
    `;
    document.getElementById('incidentCommands').innerHTML = `
      <legend>Quais comandos ou verificacoes voce faria?</legend>
      ${incident.commands.map((command, index) => `
        <label><input type="checkbox" value="${index}"><span>${escapeHtml(command)}</span></label>
      `).join('')}
    `;
    incidentCause.innerHTML = incident.causes.map((cause, index) => `
      <option value="${index}">${escapeHtml(cause)}</option>
    `).join('');
    document.getElementById('incidentTicket').value = '';
    document.getElementById('incidentFeedback').innerHTML = '';
  }

  incidentSelect.addEventListener('change', renderIncident);
  renderIncident();

  document.getElementById('ticketSimulatorForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const incident = incidents.find((item) => item.id === incidentSelect.value);
    const selected = Array.from(document.querySelectorAll('#incidentCommands input:checked')).map((input) => Number(input.value));
    const hits = selected.filter((index) => incident.correctCommands.includes(index)).length;
    const wrong = selected.filter((index) => !incident.correctCommands.includes(index)).length;
    const commandScore = Math.max(0, Math.round((hits / incident.correctCommands.length) * 60) - wrong * 8);
    const causeScore = Number(incidentCause.value) === incident.correctCause ? 25 : 0;
    const ticketText = document.getElementById('incidentTicket').value.trim();
    const ticketScore = ticketText.length >= 80 ? 15 : ticketText.length >= 35 ? 8 : 0;
    const score = Math.min(100, commandScore + causeScore + ticketScore);
    const missing = incident.correctCommands.filter((index) => !selected.includes(index)).map((index) => incident.commands[index]);

    ticketAttempts.unshift({
      id: createId('ticket-attempt'),
      incidentId: incident.id,
      area: incident.area,
      title: incident.title,
      score,
      createdAt: new Date().toISOString()
    });
    saveState(storageKeys.ticketAttempts, ticketAttempts);

    const sourceId = `ticket-${ticketAttempts[0].id}`;
    deliverables.unshift({
      id: createId('deliverable'),
      sourceId,
      type: 'Ticket',
      week: getCurrentWeekNumber(),
      title: `${incident.title} · ${score}%`,
      evidence: '',
      body: `${ticketText}\n\nCorrecao comentada:\n${incident.correction}`,
      status: score >= 70 ? 'concluido' : 'rascunho',
      createdAt: new Date().toISOString()
    });
    saveState(storageKeys.deliverables, deliverables);

    document.getElementById('incidentFeedback').innerHTML = `
      <strong>Resultado: ${score}%</strong>
      <p>${incident.correction}</p>
      ${missing.length ? `<p><strong>Faltou verificar:</strong> ${missing.map(escapeHtml).join(', ')}.</p>` : '<p>Voce cobriu as verificacoes essenciais.</p>'}
      <p>O ticket foi salvo na Central de Evidencias.</p>
    `;
    renderDeliverables();
    renderReadiness();
  });

  const labs = [
    {
      id: 'dhcp',
      title: 'DHCP: cliente recebe configuracao',
      image: 'projetos/CCNA-Labs/imgs/DHCP.png',
      file: 'projetos/CCNA-Labs/labs/Dynamic-Host-Configuration-Protocol(DHCP).pkt',
      objective: 'Configurar um pool DHCP e provar que o cliente recebeu IP, mascara, gateway e DNS corretos.',
      topology: '1 roteador ou servidor DHCP, 1 switch e pelo menos 2 clientes.',
      commands: 'show ip dhcp binding\nshow ip dhcp pool\nipconfig /all\nping <gateway>',
      checks: ['Pool DHCP criado com rede correta', 'Gateway e DNS distribuidos', 'Cliente recebeu endereco da faixa esperada', 'Ping para o gateway funciona'],
      deliverable: 'README com pool, exclusoes, configuracao recebida e testes de ping.'
    },
    {
      id: 'vlan',
      title: 'VLAN e trunk entre switches',
      image: 'projetos/CCNA-Labs/imgs/VLAN-2.png',
      file: 'projetos/CCNA-Labs/labs/VLAN-2(With Trunk).pkt',
      objective: 'Separar hosts em VLANs e transportar as VLANs por um enlace trunk.',
      topology: '2 switches, hosts nas VLANs 10 e 20 e um enlace trunk.',
      commands: 'show vlan brief\nshow interfaces trunk\nshow interfaces switchport\nping <host-da-mesma-vlan>',
      checks: ['VLANs 10 e 20 existem nos switches', 'Portas access estao na VLAN correta', 'Enlace entre switches esta em trunk', 'Hosts da mesma VLAN comunicam entre switches'],
      deliverable: 'Diagrama da topologia e tabela porta, modo, VLAN e resultado.'
    },
    {
      id: 'ospf',
      title: 'OSPF: vizinhanca e rotas',
      image: 'projetos/CCNA-Labs/imgs/OSPF-Protocol.png',
      file: 'projetos/CCNA-Labs/labs/Routing(OSPF Protocol).pkt',
      objective: 'Formar vizinhanca OSPF e anunciar redes para obter conectividade fim a fim.',
      topology: '3 roteadores com redes LAN nas extremidades.',
      commands: 'show ip ospf neighbor\nshow ip route ospf\nshow ip protocols\nping <rede-remota>',
      checks: ['Router IDs identificados', 'Vizinhos OSPF em estado FULL', 'Rotas OSPF aparecem na tabela', 'Ping entre redes remotas funciona'],
      deliverable: 'Relatorio com vizinhos, rotas aprendidas e teste fim a fim.'
    },
    {
      id: 'acl',
      title: 'ACL: permitir e bloquear trafego',
      image: 'projetos/CCNA-Labs/imgs/ACL(Standared).png',
      file: 'projetos/CCNA-Labs/labs/AccessControlList(Standard).pkt',
      objective: 'Aplicar uma ACL e demonstrar exatamente qual trafego foi permitido ou negado.',
      topology: '2 redes ligadas por roteador, com ACL aplicada na interface adequada.',
      commands: 'show access-lists\nshow ip interface\nshow running-config | section access-list\nping <destino>',
      checks: ['Regra possui origem e wildcard corretos', 'ACL esta aplicada na interface e direcao corretas', 'Trafego permitido passa', 'Trafego proibido falha e incrementa contador'],
      deliverable: 'Ticket de mudanca com regra, justificativa, testes antes/depois e rollback.'
    }
  ];

  let labProgress = readState(storageKeys.labProgress, {});
  const validatedLabSelect = document.getElementById('validatedLabSelect');
  labs.forEach((lab) => {
    const option = document.createElement('option');
    option.value = lab.id;
    option.textContent = lab.title;
    validatedLabSelect.appendChild(option);
  });

  function renderValidatedLab() {
    const lab = labs.find((item) => item.id === validatedLabSelect.value) || labs[0];
    const state = labProgress[lab.id] || { checks: [], completed: false };
    const image = document.getElementById('validatedLabImage');
    image.src = lab.image;
    image.alt = `Topologia do laboratorio ${lab.title}`;
    const fileLink = document.getElementById('validatedLabFile');
    fileLink.href = lab.file;
    fileLink.setAttribute('download', '');
    document.getElementById('validatedLabDetails').innerHTML = `
      <span class="module-kicker">${state.completed ? 'Validado' : 'Em andamento'}</span>
      <h4>${lab.title}</h4>
      <div class="lab-detail-grid">
        <div><h5>Objetivo</h5><p>${lab.objective}</p></div>
        <div><h5>Topologia</h5><p>${lab.topology}</p></div>
        <div><h5>Comandos esperados</h5><pre>${lab.commands}</pre></div>
        <div><h5>Entregavel final</h5><p>${lab.deliverable}</p></div>
      </div>
    `;
    document.getElementById('validatedLabChecks').innerHTML = `
      <legend>Checklist e testes de validacao</legend>
      ${lab.checks.map((check, index) => `
        <label><input type="checkbox" value="${index}" ${state.checks[index] ? 'checked' : ''}><span>${check}</span></label>
      `).join('')}
    `;
    document.getElementById('labStatus').textContent = '';
  }

  validatedLabSelect.addEventListener('change', renderValidatedLab);
  document.getElementById('validatedLabChecks').addEventListener('change', () => {
    const lab = labs.find((item) => item.id === validatedLabSelect.value);
    const checks = Array.from(document.querySelectorAll('#validatedLabChecks input')).map((input) => input.checked);
    labProgress[lab.id] = { checks, completed: checks.every(Boolean) };
    saveState(storageKeys.labProgress, labProgress);
  });

  document.getElementById('validateLab').addEventListener('click', () => {
    const lab = labs.find((item) => item.id === validatedLabSelect.value);
    const state = labProgress[lab.id] || { checks: [] };
    const missing = lab.checks.filter((_, index) => !state.checks[index]);
    if (missing.length) {
      document.getElementById('labStatus').textContent = `Faltam ${missing.length} validacoes. O lab ainda nao esta concluido.`;
      return;
    }
    state.completed = true;
    labProgress[lab.id] = state;
    saveState(storageKeys.labProgress, labProgress);
    document.getElementById('labStatus').textContent = 'Laboratorio validado. Agora gere o entregavel final.';
    renderValidatedLab();
    document.getElementById('labStatus').textContent = 'Laboratorio validado. Agora gere o entregavel final.';
    renderReadiness();
  });

  document.getElementById('labDeliverable').addEventListener('click', () => {
    const lab = labs.find((item) => item.id === validatedLabSelect.value);
    const state = labProgress[lab.id] || {};
    if (!state.completed) {
      document.getElementById('labStatus').textContent = 'Conclua e valide todos os testes antes de gerar o entregavel.';
      return;
    }
    const sourceId = `lab-${lab.id}`;
    if (!deliverables.some((item) => item.sourceId === sourceId)) {
      deliverables.unshift({
        id: createId('deliverable'),
        sourceId,
        type: lab.id === 'vlan' ? 'Diagrama' : lab.id === 'acl' ? 'Ticket' : 'README de lab',
        week: getCurrentWeekNumber(),
        title: lab.title,
        evidence: lab.image,
        body: `${lab.objective}\n\nComandos utilizados:\n${lab.commands}\n\nValidacoes:\n- ${lab.checks.join('\n- ')}\n\nEntregavel esperado:\n${lab.deliverable}`,
        status: 'concluido',
        createdAt: new Date().toISOString()
      });
      saveState(storageKeys.deliverables, deliverables);
    }
    document.getElementById('labStatus').textContent = 'Entregavel criado na Central de Evidencias.';
    renderDeliverables();
    renderReadiness();
  });
  renderValidatedLab();

  function renderReadiness() {
    deliverables = readState(storageKeys.deliverables, []);
    const deepJourney = readState('infrasec-deep-journey', {});
    const deepIncidents = readState('infrasec-deep-incidents', []);
    const deepSoc = readState('infrasec-deep-soc', []);
    const deepCloud = readState('infrasec-deep-cloud', []);
    const deepTerminal = readState('infrasec-deep-terminal', {});
    const deepCerts = readState('infrasec-deep-certs', {});
    const completedLabs = labs.filter((lab) => labProgress[lab.id]?.completed);
    const labCount = completedLabs.length;
    const deliverableCount = deliverables.filter((item) => item.status === 'concluido').length;
    const uniquePassed = (items, predicate = () => true) => new Set(items.filter((item) => item.passed && predicate(item)).map((item) => item.id)).size;
    const journeyPassed = (ids) => ids.every((id) => deepJourney[id]?.passed);
    const terminalPassed = (ids) => ids.every((id) => deepTerminal[id]?.passed);
    const certScore = (ids) => Math.max(0, ...ids.map((id) => Number(deepCerts[id]?.score || 0)));
    const interviewScores = interviewHistory.map((item) => Number(item.score || 0)).filter(Boolean);
    const interviewAverage = interviewScores.length ? Math.round(interviewScores.reduce((sum, value) => sum + value, 0) / interviewScores.length) : 0;
    const gate = (label, passed, critical = false) => ({ label, passed, critical });
    const roles = [
      {
        role: 'Help Desk',
        cert: 'ITF+ opcional; Linux Essentials agrega mais',
        gates: [
          gate('Semanas 1 e 2 aprovadas', journeyPassed(['w1', 'w2']), true),
          gate('2 incidentes Help Desk com 80%+', uniquePassed(deepIncidents, (item) => item.area === 'Help Desk') >= 2, true),
          gate('2 desafios Linux aprovados', Object.values(deepTerminal).filter((item) => item.passed).length >= 2),
          gate('2 entregaveis concluidos', deliverableCount >= 2),
          gate('Entrevista tecnica media 70%+', interviewAverage >= 70)
        ]
      },
      {
        role: 'Suporte N2',
        cert: 'Linux Essentials; CCNA em andamento',
        gates: [
          gate('Semanas 1 a 4 aprovadas', journeyPassed(['w1', 'w2', 'w3', 'w4']), true),
          gate('4 incidentes com 80%+', uniquePassed(deepIncidents) >= 4, true),
          gate('2 labs Packet Tracer validados', labCount >= 2),
          gate('4 desafios Linux/Git aprovados', Object.values(deepTerminal).filter((item) => item.passed).length >= 4),
          gate('4 entregaveis concluidos', deliverableCount >= 4),
          gate('Entrevista tecnica media 70%+', interviewAverage >= 70)
        ]
      },
      {
        role: 'NOC',
        cert: 'CCNA; Fortinet NSE 1-3 complementa',
        gates: [
          gate('Semanas 1 a 6 aprovadas', journeyPassed(['w1', 'w2', 'w3', 'w4', 'w5', 'w6']), true),
          gate('3 incidentes NOC com 80%+', uniquePassed(deepIncidents, (item) => item.area === 'NOC') >= 3, true),
          gate('Labs VLAN, OSPF e ACL validados', ['vlan', 'ospf', 'acl'].every((id) => labProgress[id]?.completed), true),
          gate('Desafio Linux de rede aprovado', terminalPassed(['linux-network'])),
          gate('Plano CCNA em 60%+', certScore(['ccna']) >= 60),
          gate('5 entregaveis concluidos', deliverableCount >= 5)
        ]
      },
      {
        role: 'SOC',
        cert: 'SC-900 ou Fortinet NSE 1-3',
        gates: [
          gate('3 casos SOC distintos com 80%+', uniquePassed(deepSoc) >= 3, true),
          gate('Casos de spray e comprometimento aprovados', ['spray', 'bruteforce'].every((id) => deepSoc.some((item) => item.id === id && item.passed)), true),
          gate('Linux logs e services aprovados', terminalPassed(['linux-logs', 'linux-service'])),
          gate('Plano SC-900/Fortinet em 60%+', certScore(['sc900', 'fortinet']) >= 60),
          gate('5 entregaveis concluidos', deliverableCount >= 5),
          gate('Entrevista tecnica media 70%+', interviewAverage >= 70)
        ]
      },
      {
        role: 'Cloud junior',
        cert: 'AZ-900 ou AWS CLF-C02',
        gates: [
          gate('3 labs cloud distintos com 80%+', uniquePassed(deepCloud) >= 3, true),
          gate('IAM/RBAC e rede cloud aprovados', deepCloud.some((item) => ['aws-iam', 'azure-rbac'].includes(item.id) && item.passed) && deepCloud.some((item) => ['aws-vpc', 'azure-nsg'].includes(item.id) && item.passed), true),
          gate('4 desafios Linux/Git aprovados', Object.values(deepTerminal).filter((item) => item.passed).length >= 4),
          gate('Plano AWS/Azure em 60%+', certScore(['clf02', 'az900']) >= 60),
          gate('5 entregaveis concluidos', deliverableCount >= 5),
          gate('Entrevista tecnica media 70%+', interviewAverage >= 70)
        ]
      }
    ];
    document.getElementById('readinessBody').innerHTML = roles.map((requirement) => {
      const passedCount = requirement.gates.filter((item) => item.passed).length;
      const criticalMissing = requirement.gates.some((item) => item.critical && !item.passed);
      const rawScore = Math.round(passedCount / requirement.gates.length * 100);
      const score = criticalMissing ? Math.min(69, rawScore) : rawScore;
      const missing = requirement.gates.filter((item) => !item.passed);
      const gateList = requirement.gates.map((item) => `${item.passed ? 'OK' : 'FALTA'}: ${item.label}${item.critical ? ' *' : ''}`).join('<br>');
      return `
        <tr>
          <td><strong>${requirement.role}</strong></td>
          <td class="readiness-score"><strong>${score}%</strong><progress max="100" value="${score}">${score}%</progress></td>
          <td><details><summary>${passedCount}/${requirement.gates.length} portoes</summary><small>${gateList}</small></details></td>
          <td>${labCount} Packet Tracer<br><small>${uniquePassed(deepIncidents)} incidentes, ${uniquePassed(deepSoc)} SOC, ${uniquePassed(deepCloud)} cloud</small></td>
          <td>${deliverableCount}<br><small>Entrevista: ${interviewAverage || 0}%</small></td>
          <td>${missing.length ? `${missing[0].critical ? '<strong>Critica:</strong> ' : ''}${escapeHtml(missing[0].label)}` : 'Revisar portfolio e candidatar-se'}</td>
          <td>${requirement.cert}</td>
        </tr>
      `;
    }).join('');
  }
  document.getElementById('refreshReadiness').addEventListener('click', renderReadiness);
  window.addEventListener('infrasec:competency-changed', renderReadiness);
  window.addEventListener('infrasec:deliverables-changed', () => {
    deliverables = readState(storageKeys.deliverables, []);
    renderDeliverables();
    renderReadiness();
  });

  const examTopics = [
    ['IP, DNS e DHCP', 1],
    ['Subnetting', 2],
    ['Switching e VLAN', 3],
    ['Roteamento', 4],
    ['OSPF', 5],
    ['ACL e NAT', 6],
    ['NTP, SNMP e logs', 7],
    ['Seguranca', 8],
    ['Wireless', 9],
    ['Cloud', 10],
    ['Automacao', 11],
    ['Revisao geral', 12]
  ];
  let examHistory = readState(storageKeys.examHistory, []);
  const examTopic = document.getElementById('examTopic');
  examTopic.innerHTML = examTopics.map(([topic, week]) => `<option value="${week}">${topic}</option>`).join('');

  function renderExamHistory() {
    const list = document.getElementById('examHistoryList');
    if (!examHistory.length) {
      list.innerHTML = '<div class="record-empty">Nenhum simulado registrado ainda.</div>';
      document.getElementById('scoreChart').innerHTML = '';
      document.getElementById('weakTopic').innerHTML = '<strong>Proximo passo</strong><p>Faca um simulado curto e registre o assunto que mais errou.</p>';
      return;
    }

    const recent = examHistory.slice(0, 8).reverse();
    document.getElementById('scoreChart').innerHTML = recent.map((item) => `
      <div class="score-bar" style="--score-height:${Math.max(4, item.score)}%" title="${escapeHtml(item.source)}: ${item.score}%">
        <span>${item.score}%</span>
      </div>
    `).join('');

    const weakCounts = {};
    examHistory.filter((item) => item.score < 80).forEach((item) => {
      weakCounts[item.topicWeek] = (weakCounts[item.topicWeek] || 0) + (100 - item.score);
    });
    const weakWeek = Number(Object.entries(weakCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || examHistory[0].topicWeek);
    const weakName = examTopics.find(([, week]) => week === weakWeek)?.[0] || 'Revisao geral';
    document.getElementById('weakTopic').innerHTML = `
      <strong>Assunto que pede revisao: ${weakName}</strong>
      <p>O hub recomenda voltar este assunto para a jornada antes do proximo simulado.</p>
      <button type="button" data-review-week="${weakWeek}">Levar para a jornada</button>
    `;

    list.innerHTML = examHistory.map((item) => `
      <article class="record-item">
        <div>
          <h5>${escapeHtml(item.source)} · ${item.score}%</h5>
          <p>${escapeHtml(item.topic)} · ${formatDate(item.createdAt)}${item.notes ? ` · ${escapeHtml(item.notes)}` : ''}</p>
        </div>
        <div class="record-actions">
          <button class="danger-button" type="button" data-exam-delete="${item.id}">Remover</button>
        </div>
      </article>
    `).join('');
  }

  document.getElementById('examHistoryForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const topicWeek = Number(examTopic.value);
    examHistory.unshift({
      id: createId('exam'),
      score: Number(document.getElementById('examScore').value),
      topicWeek,
      topic: examTopics.find(([, week]) => week === topicWeek)[0],
      source: document.getElementById('examSource').value.trim(),
      notes: document.getElementById('examNotes').value.trim(),
      createdAt: new Date().toISOString()
    });
    saveState(storageKeys.examHistory, examHistory);
    event.target.reset();
    renderExamHistory();
    renderReadiness();
  });

  document.getElementById('examHistoryList').addEventListener('click', (event) => {
    const button = event.target.closest('[data-exam-delete]');
    if (!button || !window.confirm('Remover este resultado do historico?')) return;
    examHistory = examHistory.filter((item) => item.id !== button.dataset.examDelete);
    saveState(storageKeys.examHistory, examHistory);
    renderExamHistory();
    renderReadiness();
  });

  document.getElementById('weakTopic').addEventListener('click', (event) => {
    const button = event.target.closest('[data-review-week]');
    if (!button) return;
    weekSelect.value = String(Number(button.dataset.reviewWeek) - 1);
    weekSelect.dispatchEvent(new Event('change'));
    location.hash = '#jornada';
  });
  renderExamHistory();

  const readingStatuses = [
    ['quero-ler', 'Quero ler'],
    ['enviado', 'Enviado'],
    ['lendo', 'Lendo'],
    ['finalizado', 'Finalizado']
  ];
  let readingQueue = readState(storageKeys.readingQueue, [
    { id: 'cert-ccna-topics', title: 'CCNA 200-301 Exam Topics', kind: 'Certificacao', status: 'quero-ler', href: 'biblioteca/cisco-ccna-200-301-exam-topics-v1-0.pdf' },
    { id: 'cert-aws-clf', title: 'AWS CLF-C02 Exam Guide', kind: 'Certificacao', status: 'quero-ler', href: 'biblioteca/certificacoes/aws-cloud-practitioner-clf-c02-exam-guide.pdf' },
    { id: 'cert-sc900', title: 'SC-900 Exam Ref Sample', kind: 'Certificacao', status: 'quero-ler', href: 'biblioteca/certificacoes/sc-900-exam-ref-sample.pdf' }
  ]);

  function ensureWeekReading(weekNumber) {
    const id = `week-package-${weekNumber}`;
    if (readingQueue.some((item) => item.id === id)) return false;
    readingQueue.unshift({
      id,
      title: `Pacote de leitura · Semana ${weekNumber}`,
      kind: 'Jornada',
      status: 'quero-ler',
      href: '#estante'
    });
    saveState(storageKeys.readingQueue, readingQueue);
    return true;
  }

  function renderReadingQueue() {
    document.getElementById('readingQueue').innerHTML = readingStatuses.map(([status, label]) => {
      const items = readingQueue.filter((item) => item.status === status);
      return `
        <section class="reading-column">
          <h4>${label} · ${items.length}</h4>
          ${items.length ? items.map((item) => `
            <article class="reading-item">
              <strong>${escapeHtml(item.title)}</strong>
              <span class="module-kicker">${escapeHtml(item.kind)}</span>
              <select data-reading-id="${item.id}" aria-label="Estado de ${escapeHtml(item.title)}">
                ${readingStatuses.map(([value, statusLabel]) => `<option value="${value}" ${value === item.status ? 'selected' : ''}>${statusLabel}</option>`).join('')}
              </select>
              <div class="record-actions">
                <a class="button" href="${item.href}">Abrir</a>
                <button class="danger-button" type="button" data-reading-delete="${item.id}">Remover</button>
              </div>
            </article>
          `).join('') : '<p class="record-empty">Nenhum item.</p>'}
        </section>
      `;
    }).join('');
  }

  document.getElementById('queueCurrentWeek').addEventListener('click', () => {
    ensureWeekReading(getCurrentWeekNumber());
    renderReadingQueue();
  });

  document.getElementById('readingQueue').addEventListener('change', (event) => {
    const select = event.target.closest('[data-reading-id]');
    if (!select) return;
    const item = readingQueue.find((record) => record.id === select.dataset.readingId);
    item.status = select.value;
    saveState(storageKeys.readingQueue, readingQueue);
    renderReadingQueue();
  });

  document.getElementById('readingQueue').addEventListener('click', (event) => {
    const button = event.target.closest('[data-reading-delete]');
    if (!button || !window.confirm('Remover este item da fila de leitura?')) return;
    readingQueue = readingQueue.filter((item) => item.id !== button.dataset.readingDelete);
    saveState(storageKeys.readingQueue, readingQueue);
    renderReadingQueue();
  });
  ensureWeekReading(getCurrentWeekNumber());
  renderReadingQueue();

  const interviewQuestions = [
    { week: 1, topic: 'Redes basicas', question: 'Explique DNS para um usuario nao tecnico.', exercise: 'Use uma analogia, mas inclua o que acontece quando o DNS falha.', answer: 'DNS transforma nomes em enderecos IP. Eu explicaria como uma agenda de contatos: o usuario informa o nome do site, o computador consulta o DNS e recebe o endereco para iniciar a conexao. Se o DNS falhar, o acesso por IP pode funcionar enquanto o nome nao funciona.' },
    { week: 1, topic: 'Diagnostico', question: 'Qual a ordem basica para investigar um computador sem internet?', exercise: 'Responda em passos e diga o que cada teste prova.', answer: 'Verifico IP, mascara, gateway e DNS; testo loopback; testo o gateway; testo um IP externo; testo um nome. Essa ordem separa pilha local, rede local, roteamento externo e resolucao DNS.' },
    { week: 2, topic: 'Subnetting', question: 'Por que duas maquinas com IPs parecidos podem estar em redes diferentes?', exercise: 'Inclua o papel da mascara.', answer: 'A mascara determina quais bits representam rede e host. IPs visualmente parecidos podem produzir identificadores de rede diferentes quando a mascara e aplicada.' },
    { week: 3, topic: 'VLAN', question: 'O que uma VLAN resolve e o que ela nao resolve sozinha?', exercise: 'Diferencie segmentacao e roteamento.', answer: 'VLAN cria dominios de broadcast separados em camada 2. Ela segmenta, mas nao permite comunicacao entre VLANs sozinha; isso exige roteamento inter-VLAN.' },
    { week: 4, topic: 'Roteamento', question: 'Como um roteador decide para onde enviar um pacote?', exercise: 'Mencione tabela de rotas e melhor correspondencia.', answer: 'Ele consulta a tabela de roteamento e escolhe a rota com prefixo mais especifico. Depois encaminha ao proximo salto ou interface de saida.' },
    { week: 5, topic: 'OSPF', question: 'Quais sinais mostram que OSPF esta funcionando?', exercise: 'Cite comandos e estados.', answer: 'Vizinhos aparecem em estado FULL, redes OSPF aparecem na tabela de rotas e ha conectividade fim a fim. Eu verificaria show ip ospf neighbor, show ip route ospf e ping.' },
    { week: 6, topic: 'ACL e NAT', question: 'Qual a diferenca entre ACL e NAT?', exercise: 'Explique funcao, risco e um exemplo.', answer: 'ACL controla trafego permitido ou negado. NAT traduz enderecos. Uma ACL pode bloquear SSH de uma rede; NAT pode permitir que enderecos privados saiam usando um endereco publico.' },
    { week: 7, topic: 'Monitoramento', question: 'Por que horario correto importa em logs?', exercise: 'Relacione NTP e investigacao.', answer: 'Sem horario sincronizado, eventos de dispositivos diferentes nao podem ser correlacionados com confianca. NTP ajuda a construir uma linha do tempo coerente.' },
    { week: 8, topic: 'SOC', question: 'Como voce investigaria muitas falhas de login?', exercise: 'Fale de evidencia, correlacao e contencao.', answer: 'Eu verificaria origem, volume, horario, contas atingidas, sucesso depois das falhas e MFA. Preservaria evidencias e seguiria o playbook para conter e escalar.' },
    { week: 9, topic: 'Wireless', question: 'Quais causas comuns deixam um Wi-Fi lento?', exercise: 'Separe sinal, interferencia e capacidade.', answer: 'Sinal fraco, interferencia de canal, muitos clientes, largura de canal inadequada, obstaculos, uplink saturado e configuracao de seguranca podem reduzir desempenho.' },
    { week: 10, topic: 'Cloud', question: 'Security Group e firewall sao a mesma coisa?', exercise: 'Responda sem depender de um provedor especifico.', answer: 'Ambos aplicam regras de trafego, mas security groups normalmente sao controles virtuais ligados a recursos cloud e gerenciados pelo provedor. Firewalls podem oferecer inspecao e politicas mais amplas.' },
    { week: 11, topic: 'Automacao', question: 'Quando vale automatizar uma tarefa de rede?', exercise: 'Mencione repeticao, risco e validacao.', answer: 'Quando a tarefa e repetitiva, padronizavel e testavel. Automatizar reduz erro manual, mas exige validacao, controle de versao e plano de rollback.' },
    { week: 12, topic: 'Comunicacao', question: 'Conte sobre um incidente tecnico que voce resolveu.', exercise: 'Use situacao, acao, resultado e aprendizado.', answer: 'Estruture em contexto, impacto, hipoteses, testes, causa, correcao, resultado mensuravel e o que documentou para evitar recorrencia.' }
  ];
  const interviewRubrics = {
    'Redes basicas': { terms: ['nome', 'ip', 'consulta', 'dns', 'falha'], followUp: 'Como voce provaria que a falha e DNS e nao conectividade IP?' },
    'Diagnostico': { terms: ['ip', 'mascara', 'gateway', '1.1.1.1', 'dns'], followUp: 'Em qual resultado voce escalaria ao time de redes?' },
    'Subnetting': { terms: ['mascara', 'bits', 'rede', 'host'], followUp: 'Demonstre com dois enderecos e uma mascara /26.' },
    'VLAN': { terms: ['broadcast', 'camada 2', 'segment', 'roteamento'], followUp: 'Quais comandos provariam uma VLAN ausente no trunk?' },
    'Roteamento': { terms: ['tabela', 'prefixo', 'especific', 'next hop'], followUp: 'O que muda se faltar rota de retorno?' },
    'OSPF': { terms: ['full', 'neighbor', 'route', 'ping'], followUp: 'Que incompatibilidades impedem a adjacencia?' },
    'ACL e NAT': { terms: ['permit', 'deny', 'traduz', 'endereco'], followUp: 'Como faria testes positivo e negativo sem derrubar o servico?' },
    'Monitoramento': { terms: ['ntp', 'correl', 'linha do tempo', 'timestamp'], followUp: 'Como horario errado afeta a causa raiz?' },
    'SOC': { terms: ['origem', 'contas', 'sucesso', 'evidencia', 'conten'], followUp: 'O que diferencia brute force de password spray?' },
    'Wireless': { terms: ['sinal', 'interferencia', 'canal', 'clientes', 'uplink'], followUp: 'Que medicao separa interferencia de saturacao?' },
    'Cloud': { terms: ['responsabilidade', 'provedor', 'cliente', 'configur'], followUp: 'Quem responde por IAM mal configurado em IaaS?' },
    'Automacao': { terms: ['repet', 'valid', 'versao', 'rollback'], followUp: 'Qual seria seu teste antes de aplicar em massa?' },
    'Comunicacao': { terms: ['impacto', 'evidencia', 'causa', 'resultado', 'aprend'], followUp: 'Qual foi o resultado mensuravel e como evitou recorrencia?' }
  };
  let interviewHistory = readState(storageKeys.interviewHistory, []);
  let currentInterview = null;
  let currentInterviewScore = 0;

  function nextInterviewQuestion() {
    const unlockedWeek = getHighestStudiedWeek();
    const available = interviewQuestions.filter((item) => item.week <= unlockedWeek);
    const pool = available.length ? available : interviewQuestions.filter((item) => item.week === 1);
    const alternatives = pool.filter((item) => item !== currentInterview);
    currentInterview = alternatives[Math.floor(Math.random() * alternatives.length)] || pool[0];
    document.getElementById('interviewLevel').textContent = `Conteudo estudado ate a Semana ${unlockedWeek} · ${currentInterview.topic}`;
    document.getElementById('interviewQuestion').textContent = currentInterview.question;
    document.getElementById('interviewExercise').textContent = currentInterview.exercise;
    document.getElementById('interviewResponse').value = '';
    document.getElementById('interviewAnswer').innerHTML = '';
    document.getElementById('interviewRating').hidden = true;
    currentInterviewScore = 0;
    document.getElementById('interviewStatus').textContent = `${interviewHistory.length} pratica(s) registrada(s).`;
  }

  document.getElementById('nextInterviewQuestion').addEventListener('click', nextInterviewQuestion);
  document.getElementById('showInterviewAnswer').addEventListener('click', () => {
    const response = document.getElementById('interviewResponse').value.trim();
    if (response.length < 20) {
      document.getElementById('interviewStatus').textContent = 'Escreva uma resposta antes de comparar.';
      return;
    }
    const rubric = interviewRubrics[currentInterview.topic];
    const normalized = response.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const hits = rubric.terms.filter((term) => normalized.includes(term));
    const missing = rubric.terms.filter((term) => !hits.includes(term));
    const structure = ['primeiro', 'depois', 'entao', 'por fim', 'valid'].some((term) => normalized.includes(term));
    currentInterviewScore = Math.min(100, Math.round(hits.length / rubric.terms.length * 70 + (response.length >= 180 ? 20 : response.length >= 90 ? 10 : 5) + (structure ? 10 : 0)));
    document.getElementById('interviewAnswer').innerHTML = `
      <strong>Avaliacao tecnica: ${currentInterviewScore}%</strong>
      <p><strong>Conceitos presentes:</strong> ${hits.length ? hits.map(escapeHtml).join(', ') : 'nenhum dos essenciais'}.</p>
      <p><strong>Faltou demonstrar:</strong> ${missing.length ? missing.map(escapeHtml).join(', ') : 'nenhum conceito essencial'}.</p>
      <strong>Resposta esperada</strong><p>${currentInterview.answer}</p>
      <p><strong>Pergunta de aprofundamento:</strong> ${rubric.followUp}</p>`;
    document.getElementById('interviewRating').hidden = false;
  });

  document.getElementById('interviewRating').addEventListener('click', (event) => {
    const button = event.target.closest('[data-interview-rating]');
    if (!button) return;
    interviewHistory.unshift({
      id: createId('interview'),
      week: currentInterview.week,
      topic: currentInterview.topic,
      question: currentInterview.question,
      response: document.getElementById('interviewResponse').value.trim(),
      score: currentInterviewScore,
      rating: button.dataset.interviewRating,
      createdAt: new Date().toISOString()
    });
    saveState(storageKeys.interviewHistory, interviewHistory);
    document.getElementById('interviewStatus').textContent = `Pratica salva com ${currentInterviewScore}%. A proxima pergunta continuara respeitando o conteudo estudado.`;
    renderReadiness();
  });
  nextInterviewQuestion();

  const englishWeeks = [
    { terms: [['address', 'endereco'], ['gateway', 'porta de saida'], ['resolve', 'resolver'], ['request', 'requisicao'], ['reachable', 'alcancavel']], doc: 'The client received an IP address from DHCP, but the configured DNS server is not reachable. Test the gateway before changing the DNS settings.', translation: 'O cliente recebeu um endereco IP via DHCP, mas o servidor DNS configurado nao esta alcancavel. Teste o gateway antes de alterar o DNS.', prompt: 'Explain how you would troubleshoot a user with no internet access.', sample: 'First, I would check the IP address, subnet mask, default gateway, and DNS settings. Then I would test the local stack, the gateway, an external IP, and finally name resolution.' },
    { terms: [['subnet', 'sub-rede'], ['mask', 'mascara'], ['range', 'faixa'], ['network', 'rede'], ['broadcast', 'broadcast']], doc: 'The subnet mask defines which part of an address identifies the network. A wrong mask can make a remote host appear local.', translation: 'A mascara de sub-rede define qual parte do endereco identifica a rede. Uma mascara incorreta pode fazer um host remoto parecer local.', prompt: 'Explain why subnetting is useful.', sample: 'Subnetting divides a network into smaller segments. It improves address planning, limits broadcasts, and supports security and routing decisions.' },
    { terms: [['switch', 'switch'], ['access port', 'porta de acesso'], ['trunk', 'tronco'], ['frame', 'quadro'], ['broadcast domain', 'dominio de broadcast']], doc: 'An access port carries traffic for one VLAN. A trunk carries traffic for multiple VLANs and identifies frames with tags.', translation: 'Uma porta de acesso transporta trafego de uma VLAN. Um trunk transporta varias VLANs e identifica quadros com tags.', prompt: 'Describe the difference between an access port and a trunk.', sample: 'An access port connects an endpoint to one VLAN. A trunk connects network devices and carries multiple VLANs using tags.' },
    { terms: [['route', 'rota'], ['next hop', 'proximo salto'], ['interface', 'interface'], ['forward', 'encaminhar'], ['routing table', 'tabela de rotas']], doc: 'The router checks the destination address and selects the most specific route in its routing table.', translation: 'O roteador verifica o endereco de destino e seleciona a rota mais especifica em sua tabela de roteamento.', prompt: 'Explain how a router forwards a packet.', sample: 'The router reads the destination IP, searches its routing table, selects the longest prefix match, and sends the packet to the next hop or exit interface.' },
    { terms: [['neighbor', 'vizinho'], ['adjacency', 'adjacencia'], ['cost', 'custo'], ['link state', 'estado de enlace'], ['converge', 'convergir']], doc: 'OSPF routers exchange link-state information and calculate the best path based on cost. Healthy neighbors normally reach the FULL state.', translation: 'Roteadores OSPF trocam informacoes de estado de enlace e calculam o melhor caminho por custo. Vizinhos saudaveis normalmente chegam ao estado FULL.', prompt: 'How do you verify that OSPF is working?', sample: 'I check neighbor states, OSPF routes, protocol settings, and end-to-end connectivity with show and ping commands.' },
    { terms: [['permit', 'permitir'], ['deny', 'negar'], ['source', 'origem'], ['destination', 'destino'], ['translate', 'traduzir']], doc: 'An ACL filters traffic according to ordered rules. NAT changes address information, usually when private hosts communicate with external networks.', translation: 'Uma ACL filtra trafego conforme regras ordenadas. NAT altera informacoes de endereco, geralmente quando hosts privados acessam redes externas.', prompt: 'What is the difference between an ACL and NAT?', sample: 'An ACL decides which traffic is allowed or denied. NAT translates addresses between network domains.' },
    { terms: [['timestamp', 'marca de tempo'], ['alert', 'alerta'], ['baseline', 'linha de base'], ['polling', 'consulta periodica'], ['availability', 'disponibilidade']], doc: 'Monitoring data is useful only when timestamps are reliable. NTP helps analysts correlate alerts, logs, and outages across devices.', translation: 'Dados de monitoramento so sao uteis quando os horarios sao confiaveis. NTP ajuda analistas a correlacionar alertas, logs e indisponibilidades.', prompt: 'Why is time synchronization important?', sample: 'Accurate timestamps allow teams to correlate events from different systems and build a reliable incident timeline.' },
    { terms: [['threat', 'ameaca'], ['evidence', 'evidencia'], ['containment', 'contencao'], ['authentication', 'autenticacao'], ['suspicious', 'suspeito']], doc: 'Multiple failed logins from different addresses may indicate password spraying. Preserve evidence and check whether any attempt succeeded.', translation: 'Varias falhas de login vindas de enderecos diferentes podem indicar password spraying. Preserve evidencias e verifique se alguma tentativa teve sucesso.', prompt: 'How would you investigate suspicious login attempts?', sample: 'I would review source addresses, timing, affected accounts, successful logins, MFA events, and then follow the containment playbook.' },
    { terms: [['signal', 'sinal'], ['channel', 'canal'], ['interference', 'interferencia'], ['bandwidth', 'largura de banda'], ['client', 'cliente']], doc: 'Poor wireless performance can come from weak signal, channel interference, too many clients, or a saturated uplink.', translation: 'Desempenho Wi-Fi ruim pode vir de sinal fraco, interferencia de canal, clientes demais ou uplink saturado.', prompt: 'What would you check when Wi-Fi is slow?', sample: 'I would check signal strength, channel usage, interference, client count, access point load, and uplink utilization.' },
    { terms: [['instance', 'instancia'], ['region', 'regiao'], ['availability zone', 'zona de disponibilidade'], ['security group', 'grupo de seguranca'], ['shared responsibility', 'responsabilidade compartilhada']], doc: 'Cloud security follows a shared responsibility model. The provider protects the cloud infrastructure while the customer configures identities, data, and workloads.', translation: 'Seguranca em nuvem segue um modelo de responsabilidade compartilhada. O provedor protege a infraestrutura, enquanto o cliente configura identidades, dados e cargas.', prompt: 'Explain shared responsibility in cloud security.', sample: 'The provider secures the underlying cloud, while the customer secures configurations, identities, applications, and data according to the service used.' },
    { terms: [['automation', 'automacao'], ['configuration', 'configuracao'], ['payload', 'carga de dados'], ['endpoint', 'endpoint'], ['rollback', 'reversao']], doc: 'Network automation should be repeatable, versioned, validated, and reversible. A rollback plan is required before a large change.', translation: 'Automacao de rede deve ser repetivel, versionada, validada e reversivel. Um plano de rollback e necessario antes de uma grande mudanca.', prompt: 'When should a network task be automated?', sample: 'A task is a good automation candidate when it is repetitive, standardized, testable, and has a clear rollback procedure.' },
    { terms: [['incident', 'incidente'], ['impact', 'impacto'], ['root cause', 'causa raiz'], ['resolution', 'resolucao'], ['follow-up', 'acompanhamento']], doc: 'A strong incident summary describes impact, evidence, actions, root cause, resolution, and follow-up work without unnecessary detail.', translation: 'Um bom resumo de incidente descreve impacto, evidencias, acoes, causa raiz, resolucao e acompanhamento sem detalhes desnecessarios.', prompt: 'Tell me about a technical incident you resolved.', sample: 'I would describe the situation and impact, the tests I performed, the root cause, the resolution, the result, and what I documented afterward.' }
  ];
  let englishPractice = readState(storageKeys.englishPractice, {});

  function englishTicketTemplate(weekNumber) {
    return `# Support Ticket - Week ${weekNumber}

## Summary

Briefly describe the issue.

## Impact

Who or what is affected?

## Investigation

- Check performed:
- Command:
- Result:

## Root Cause

Describe the confirmed cause.

## Resolution

Describe the fix and validation.

## Follow-up

Document any preventive action.
`;
  }

  function renderEnglishWeek() {
    const weekNumber = getCurrentWeekNumber();
    const content = englishWeeks[weekNumber - 1];
    const saved = englishPractice[weekNumber] || {};
    document.getElementById('englishWeek').textContent = `Semana ${weekNumber}`;
    document.getElementById('englishTerms').innerHTML = content.terms.map(([term, translation]) => `
      <div class="term-item"><strong>${term}</strong><span>${translation}</span></div>
    `).join('');
    document.getElementById('englishDocument').textContent = content.doc;
    document.getElementById('englishTranslation').value = saved.translation || '';
    document.getElementById('translationFeedback').innerHTML = '';
    document.getElementById('englishTicket').value = saved.ticket || englishTicketTemplate(weekNumber);
    document.getElementById('englishInterviewPrompt').textContent = content.prompt;
    document.getElementById('englishInterviewResponse').value = saved.interview || '';
    document.getElementById('englishInterviewSample').innerHTML = '';
  }

  document.getElementById('checkTranslation').addEventListener('click', () => {
    const content = englishWeeks[getCurrentWeekNumber() - 1];
    document.getElementById('translationFeedback').innerHTML = `<strong>Traducao sugerida</strong><p>${content.translation}</p>`;
  });

  document.getElementById('downloadEnglishTicket').addEventListener('click', () => {
    downloadFile(`ticket-english-week-${getCurrentWeekNumber()}.md`, document.getElementById('englishTicket').value, 'text/markdown;charset=utf-8');
  });

  document.getElementById('saveEnglishPractice').addEventListener('click', () => {
    const weekNumber = getCurrentWeekNumber();
    const content = englishWeeks[weekNumber - 1];
    const response = document.getElementById('englishInterviewResponse').value.trim();
    const translation = document.getElementById('englishTranslation').value.trim();
    const ticket = document.getElementById('englishTicket').value;
    const normalized = response.toLowerCase();
    const requiredTerms = content.terms.map(([term]) => term);
    const usedTerms = requiredTerms.filter((term) => normalized.includes(term));
    const ticketSections = ['## Summary', '## Impact', '## Investigation', '## Root Cause', '## Resolution', '## Follow-up'];
    const completedSections = ticketSections.filter((section) => ticket.includes(section) && ticket.split(section)[1]?.trim().length > 20);
    const responseScore = Math.round(usedTerms.length / requiredTerms.length * 45 + (response.length >= 160 ? 15 : response.length >= 80 ? 8 : 0));
    const translationScore = translation.length >= Math.round(content.translation.length * .65) ? 15 : translation.length >= 40 ? 8 : 0;
    const ticketScore = Math.round(completedSections.length / ticketSections.length * 25);
    const score = Math.min(100, responseScore + translationScore + ticketScore);
    englishPractice[weekNumber] = {
      translation,
      ticket,
      interview: response,
      score,
      updatedAt: new Date().toISOString()
    };
    saveState(storageKeys.englishPractice, englishPractice);
    document.getElementById('englishInterviewSample').innerHTML = `
      <strong>Avaliacao: ${score}%</strong>
      <p>Termos usados: ${usedTerms.length}/${requiredTerms.length}. Secoes de ticket preenchidas: ${completedSections.length}/${ticketSections.length}. Meta: 80%.</p>
      ${usedTerms.length < requiredTerms.length ? `<p><strong>Pratique:</strong> ${requiredTerms.filter((term) => !usedTerms.includes(term)).map(escapeHtml).join(', ')}.</p>` : ''}
      <strong>Resposta de referencia</strong>
      <p>${englishWeeks[weekNumber - 1].sample}</p>
      <p>Sua pratica foi salva neste navegador.</p>
    `;
  });

  weekSelect.addEventListener('change', () => {
    deliverableWeek.value = String(getCurrentWeekNumber());
    ensureWeekReading(getCurrentWeekNumber());
    renderReadingQueue();
    renderEnglishWeek();
    nextInterviewQuestion();
  });

  document.addEventListener('change', (event) => {
    if (!event.target.matches('[data-progress]') || event.target.value !== 'feito') return;
    window.setTimeout(() => {
      syncCompletedTasks();
      renderDeliverables();
      renderReadiness();
    }, 0);
  });

  syncCompletedTasks();
  renderDeliverables();
  renderReadiness();
  renderEnglishWeek();
  document.getElementById('tab-readiness').addEventListener('click', renderReadiness);
})();
