import { storage } from '../../core/storage.js';
import { eventBus } from '../../core/events.js';
import { scoring } from '../../practice/scoring.js';
import { readinessRules } from '../../readiness/rules.js';
import { createId, downloadFile, escapeHtml, formatDate } from '../../core/presentation.js';
import { createDeliverable, prependUniqueDeliverable } from '../../portfolio/deliverables.js';
import { careerCatalog } from '../../data/career/catalog.js';
import { initializeCareerDevelopment } from './development-controller.js';

export function initializeCareer({ weeks, weekSelect }) {

  const storageKeys = {
    ticketAttempts: storage.keys.TICKET_ATTEMPTS,
    labProgress: storage.keys.LAB_PROGRESS,
    activeTab: storage.keys.CAREER_TAB
  };

  function getCurrentWeekNumber() {
    return Number(weekSelect.value) + 1;
  }

  function getTaskProgress() {
    return storage.readJson(storage.keys.TASK_PROGRESS, {});
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
    storage.writeJson(storageKeys.activeTab, name);
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

  const savedTab = storage.readJson(storageKeys.activeTab, 'portfolio');
  activateTab(tabs.some((tab) => tab.dataset.careerTab === savedTab) ? savedTab : 'portfolio');

  let deliverables = storage.getDeliverables();
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
    let changed = false;

    Object.entries(state).forEach(([key, value]) => {
      if (value !== 'feito') return;
      const [weekIndex, taskIndex] = key.split('-').map(Number);
      const task = weeks[weekIndex]?.tasks?.[taskIndex];
      const sourceId = `task-${weekIndex}-${taskIndex}`;
      if (!task) return;

      const result = prependUniqueDeliverable(deliverables, createDeliverable({
        id: createId('deliverable'),
        sourceId,
        type: deliverableTypes[taskIndex % deliverableTypes.length],
        week: weekIndex + 1,
        title: task[0],
        evidence: '',
        body: `Tarefa concluida: ${task[1]}\n\nComandos ou ferramentas utilizados:\n\nResultado observado:\n\nConclusao:`,
        status: 'rascunho',
        createdAt: new Date().toISOString()
      }));
      deliverables = result.items;
      changed = changed || result.added;
    });

    if (changed) storage.setDeliverables(deliverables);
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
      deliverables = prependUniqueDeliverable(deliverables, createDeliverable({
        id: createId('deliverable'),
        ...payload,
        status: 'rascunho',
        createdAt: new Date().toISOString()
      })).items;
      deliverableStatus.textContent = 'Entregavel salvo.';
    }

    storage.setDeliverables(deliverables);
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

    storage.setDeliverables(deliverables);
    renderDeliverables();
    renderReadiness();
  });

  function buildPortfolioHtml() {
    const completedTasks = getCompletedTaskCount();
    const labsCompleted = Object.values(labProgress).filter((item) => item.completed).length;
    const examHistory = careerDevelopment.getExamHistory();
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

  const { incidents, labs, deliverableTypes } = careerCatalog;

  let ticketAttempts = storage.readJson(storageKeys.ticketAttempts, []);
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
    storage.writeJson(storageKeys.ticketAttempts, ticketAttempts);

    const sourceId = `ticket-${ticketAttempts[0].id}`;
    deliverables = prependUniqueDeliverable(deliverables, createDeliverable({
      id: createId('deliverable'),
      sourceId,
      type: 'Ticket',
      week: getCurrentWeekNumber(),
      title: `${incident.title} · ${score}%`,
      evidence: '',
      body: `${ticketText}\n\nCorrecao comentada:\n${incident.correction}`,
      status: scoring.meetsThreshold(score, scoring.thresholds.INTRO_TICKET) ? 'concluido' : 'rascunho',
      createdAt: new Date().toISOString()
    })).items;
    storage.setDeliverables(deliverables);

    document.getElementById('incidentFeedback').innerHTML = `
      <strong>Resultado: ${score}%</strong>
      <p>${incident.correction}</p>
      ${missing.length ? `<p><strong>Faltou verificar:</strong> ${missing.map(escapeHtml).join(', ')}.</p>` : '<p>Voce cobriu as verificacoes essenciais.</p>'}
      <p>O ticket foi salvo na Central de Evidencias.</p>
    `;
    renderDeliverables();
    renderReadiness();
  });


  let labProgress = storage.readJson(storageKeys.labProgress, {});
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
    labProgress[lab.id] = { checks, completed: scoring.allChecksComplete(checks, lab.checks.length) };
    storage.writeJson(storageKeys.labProgress, labProgress);
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
    storage.writeJson(storageKeys.labProgress, labProgress);
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
    const result = prependUniqueDeliverable(deliverables, createDeliverable({
        id: createId('deliverable'),
        sourceId,
        type: lab.id === 'vlan' ? 'Diagrama' : lab.id === 'acl' ? 'Ticket' : 'README de lab',
        week: getCurrentWeekNumber(),
        title: lab.title,
        evidence: lab.image,
        body: `${lab.objective}\n\nComandos utilizados:\n${lab.commands}\n\nValidacoes:\n- ${lab.checks.join('\n- ')}\n\nEntregavel esperado:\n${lab.deliverable}`,
        status: 'concluido',
        createdAt: new Date().toISOString()
      }));
    if (result.added) {
      deliverables = result.items;
      storage.setDeliverables(deliverables);
    }
    document.getElementById('labStatus').textContent = 'Entregavel criado na Central de Evidencias.';
    renderDeliverables();
    renderReadiness();
  });
  renderValidatedLab();

  function renderReadiness() {
    deliverables = storage.getDeliverables();
    const result = readinessRules.evaluateReadiness({
      journey: storage.readJson(storage.keys.DEEP_JOURNEY, {}),
      incidents: storage.readJson(storage.keys.DEEP_INCIDENTS, []),
      soc: storage.readJson(storage.keys.DEEP_SOC, []),
      cloud: storage.readJson(storage.keys.DEEP_CLOUD, []),
      terminal: storage.readJson(storage.keys.DEEP_TERMINAL, {}),
      certs: storage.readJson(storage.keys.DEEP_CERTS, {}),
      architecture: storage.readJson(storage.keys.DEEP_ARCHITECTURE, {}),
      labProgress,
      labIds: labs.map((lab) => lab.id),
      deliverables,
      interviewHistory: careerDevelopment.getInterviewHistory()
    });
    const { labCount, deliverableCount, interviewAverage, incidentCount, socCount, cloudCount } = result.metrics;
    document.getElementById('readinessBody').innerHTML = result.roles.map((requirement) => {
      const { passedCount, score, missing } = requirement;
      const gateList = requirement.gates.map((item) => `${item.passed ? 'OK' : 'FALTA'}: ${item.label}${item.critical ? ' *' : ''}`).join('<br>');
      return `
        <tr>
          <td><strong>${requirement.role}</strong></td>
          <td class="readiness-score"><strong>${score}%</strong><progress max="100" value="${score}">${score}%</progress></td>
          <td><details><summary>${passedCount}/${requirement.gates.length} portoes</summary><small>${gateList}</small></details></td>
          <td>${labCount} Packet Tracer<br><small>${incidentCount} incidentes, ${socCount} SOC, ${cloudCount} cloud</small></td>
          <td>${deliverableCount}<br><small>Entrevista: ${interviewAverage || 0}%</small></td>
          <td>${missing.length ? `${missing[0].critical ? '<strong>Critica:</strong> ' : ''}${escapeHtml(missing[0].label)}` : 'Revisar portfolio e candidatar-se'}</td>
          <td>${requirement.cert}</td>
        </tr>
      `;
    }).join('');
  }
  document.getElementById('refreshReadiness').addEventListener('click', renderReadiness);
  eventBus.subscribe(eventBus.events.COMPETENCY_CHANGED, renderReadiness);
  eventBus.subscribe(eventBus.events.DELIVERABLES_CHANGED, () => {
    deliverables = storage.getDeliverables();
    renderDeliverables();
    renderReadiness();
  });

  const careerDevelopment = initializeCareerDevelopment({
    weekSelect,
    getCurrentWeekNumber,
    getHighestStudiedWeek,
    onProgressChanged: renderReadiness
  });

  weekSelect.addEventListener('change', () => {
    deliverableWeek.value = String(getCurrentWeekNumber());
    careerDevelopment.ensureWeekReading(getCurrentWeekNumber());
    careerDevelopment.renderReadingQueue();
    careerDevelopment.renderEnglishWeek();
    careerDevelopment.nextInterviewQuestion();
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
  careerDevelopment.renderEnglishWeek();
  document.getElementById('tab-readiness').addEventListener('click', renderReadiness);
}
