import { storage } from '../../core/storage.js';
import { eventBus } from '../../core/events.js';
import { scoring } from '../../practice/scoring.js';
import { createDeliverable, prependUniqueDeliverable } from '../../portfolio/deliverables.js';
import { architectureCatalog } from '../../data/architecture/catalog.js';

export function initializeArchitecture() {
  const stateKey = storage.keys.DEEP_ARCHITECTURE;
  const deliverablesKey = storage.keys.DELIVERABLES;
  const esc = (value) => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
  const normalize = (value) => String(value || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const termHits = (text, terms) => terms.filter((term) => normalize(text).includes(normalize(term)));
  const { architectures } = architectureCatalog;


  const select = document.getElementById('architectureSelect');
  if (!select) return;
  let selectedEvidence = [];
  let activeComponent = null;

  const getArchitecture = () => architectures.find((item) => item.id === select.value);
  const getState = () => storage.readJson(stateKey, {});
  const saveState = (value) => {
    storage.writeJson(stateKey, value);
    eventBus.publish(eventBus.events.COMPETENCY_CHANGED);
  };
  const scoreMarkup = (state) => state
    ? `<strong>${state.score}%</strong><span>${state.passed ? 'Competencia demonstrada' : 'Refaca as lacunas'}</span>`
    : '<strong>Nao avaliado</strong><span>Meta: 80%</span>';

  function addDeliverable(item, report, score) {
    const list = storage.getDeliverables();
    const sourceId = `deep-architecture-${item.id}`;
    const mermaid = `flowchart LR\n  ${item.components.map((entry, index) => `${entry.id.replaceAll('-', '_')}[${entry.label}]${index < item.components.length - 1 ? ` --> ${item.components[index + 1].id.replaceAll('-', '_')}` : ''}`).join('\n  ')}`;
    const result = prependUniqueDeliverable(list, createDeliverable({
      id: `architecture-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      sourceId,
      type: 'Diagrama',
      week: item.id === 'client-server' || item.id === 'layered' ? 4 : item.id === 'security' ? 8 : 10,
      title: `Arquitetura: ${item.title}`,
      evidence: `Academia Pratica: ${score}%`,
      body: `# ${item.title}\n\n## Objetivo\n${item.goal}\n\n## Diagrama\n\n\`\`\`mermaid\n${mermaid}\n\`\`\`\n\n## Fluxo\n${item.flow.map((step) => `- ${step}`).join('\n')}\n\n## Investigacao\n${report}\n\n## Validacao\nRubrica: ${score}%`,
      status: 'concluido',
      createdAt: new Date().toISOString()
    }));
    if (!result.added) return;
    storage.setDeliverables(result.items);
    eventBus.publish(eventBus.events.DELIVERABLES_CHANGED);
  }

  function renderComponent(componentId, focus = false) {
    const item = getArchitecture();
    const entry = item.components.find((componentItem) => componentItem.id === componentId) || item.components[0];
    activeComponent = entry.id;
    document.querySelectorAll('[data-architecture-component]').forEach((button) => {
      const active = button.dataset.architectureComponent === entry.id;
      button.setAttribute('aria-pressed', String(active));
      if (active && focus) button.focus();
    });
    document.getElementById('architectureDetail').innerHTML = `
      <h4>${esc(entry.label)}</h4><p>${esc(entry.responsibility)}</p>
      <div class="architecture-component-grid">
        <div><strong>Entrada e saida</strong><span>${esc(entry.io)}</span></div>
        <div><strong>Dependencias</strong><span>${esc(entry.dependencies)}</span></div>
        <div><strong>Logs e metricas</strong><span>${esc(entry.telemetry)}</span></div>
        <div><strong>Pontos de falha</strong><span>${esc(entry.failures)}</span></div>
      </div>`;
  }

  function renderArchitecture() {
    const item = getArchitecture();
    const state = getState()[item.id];
    selectedEvidence = [];
    activeComponent = null;
    const completed = architectures.filter((entry) => getState()[entry.id]?.passed).map((entry) => entry.id);
    document.getElementById('architectureScore').innerHTML = scoreMarkup(state);
    document.getElementById('architectureIntro').innerHTML = `
      <div><h4>${esc(item.title)}</h4><p>${esc(item.goal)}</p></div>
      <div class="architecture-progress" aria-label="Progresso da trilha">${architectures.map((entry, index) => `<span class="${completed.includes(entry.id) ? 'done' : ''}">${index + 1}. ${esc(entry.title)}</span>`).join('')}</div>`;
    document.getElementById('architectureMap').innerHTML = item.components.map((entry, index) => `
      <button type="button" class="architecture-node" data-architecture-component="${entry.id}" data-kind="${entry.kind}" aria-pressed="false">
        <strong>${index + 1}. ${esc(entry.label)}</strong><small>${esc(entry.kind)}</small>
      </button>`).join('');
    document.getElementById('architectureFlow').innerHTML = item.flow.map((step) => `<li>${esc(step)}</li>`).join('');
    document.getElementById('architectureRunbook').innerHTML = item.runbook.map(([label, content]) => `<div class="architecture-runbook-row"><strong>${esc(label)}</strong><span>${esc(content)}</span></div>`).join('');
    document.getElementById('architectureScenario').innerHTML = `<span class="module-kicker">Incidente operacional</span><h4>${esc(item.scenario)}</h4><p><strong>Impacto:</strong> ${esc(item.impact)}</p>`;
    document.getElementById('architectureEvidenceActions').innerHTML = item.evidence.map((entry, index) => `<button type="button" data-architecture-evidence="${index}">${esc(entry[0])}</button>`).join('');
    document.getElementById('architectureEvidenceCount').textContent = '0 coletadas';
    document.getElementById('architectureEvidenceDesk').innerHTML = '<p>Colete somente o necessario para confirmar ou eliminar hipoteses.</p>';
    document.getElementById('architectureHypothesis').innerHTML = item.hypotheses.map((value, index) => `<option value="${index}">${esc(value)}</option>`).join('');
    document.getElementById('architectureFailureDomain').innerHTML = item.domains.map((value, index) => `<option value="${index}">${esc(value)}</option>`).join('');
    document.getElementById('architectureQuestions').innerHTML = item.questions.map((question, qIndex) => `
      <div class="question-block"><strong>${qIndex + 1}. ${esc(question[0])}</strong><div class="question-options">
        ${question[1].map((choice, cIndex) => `<label><input type="radio" name="architecture-q${qIndex}" value="${cIndex}" required> ${esc(choice)}</label>`).join('')}
      </div></div>`).join('');
    document.getElementById('architectureReport').value = state?.report || '';
    const feedback = document.getElementById('architectureFeedback');
    feedback.className = 'depth-feedback';
    feedback.innerHTML = state ? `<p>Ultima tentativa: ${state.score}%. ${state.passed ? 'Artefato gerado na Central de Evidencias.' : 'Use as lacunas da proxima avaliacao para revisar.'}</p>` : '';
    renderComponent(item.components[0].id);
  }

  select.innerHTML = architectures.map((item, index) => `<option value="${item.id}">${index + 1}. ${esc(item.title)}</option>`).join('');
  select.addEventListener('change', renderArchitecture);

  document.getElementById('architectureMap').addEventListener('click', (event) => {
    const button = event.target.closest('[data-architecture-component]');
    if (button) renderComponent(button.dataset.architectureComponent);
  });

  document.getElementById('architectureMap').addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    const item = getArchitecture();
    const currentIndex = item.components.findIndex((entry) => entry.id === activeComponent);
    const nextIndex = (currentIndex + (event.key === 'ArrowRight' ? 1 : -1) + item.components.length) % item.components.length;
    event.preventDefault();
    renderComponent(item.components[nextIndex].id, true);
  });

  document.getElementById('architectureEvidenceActions').addEventListener('click', (event) => {
    const button = event.target.closest('[data-architecture-evidence]');
    if (!button) return;
    const index = Number(button.dataset.architectureEvidence);
    if (selectedEvidence.includes(index)) return;
    selectedEvidence.push(index);
    button.disabled = true;
    const item = getArchitecture();
    document.getElementById('architectureEvidenceCount').textContent = `${selectedEvidence.length} coletada(s)`;
    document.getElementById('architectureEvidenceDesk').innerHTML = selectedEvidence.map((chosen) => `
      <div class="evidence-item"><code>$ ${esc(item.evidence[chosen][0])}</code><span>${esc(item.evidence[chosen][1])}</span></div>`).join('');
  });

  document.getElementById('architectureAssessment').addEventListener('submit', (event) => {
    event.preventDefault();
    const item = getArchitecture();
    const form = new FormData(event.currentTarget);
    const report = document.getElementById('architectureReport').value.trim();
    const hypothesis = Number(document.getElementById('architectureHypothesis').value);
    const domain = Number(document.getElementById('architectureFailureDomain').value);
    const decisionScore = (hypothesis === item.correct[0] ? 15 : 0) + (domain === item.correct[1] ? 10 : 0);
    const correctQuestions = item.questions.filter((question, index) => Number(form.get(`architecture-q${index}`)) === question[2]).length;
    const questionScore = Math.round(correctQuestions / item.questions.length * 25);
    const useful = selectedEvidence.filter((index) => item.evidence[index][2]).length;
    const noise = selectedEvidence.length - useful;
    const evidenceScore = Math.max(0, Math.min(20, useful * 7 - noise * 3));
    const hits = termHits(report, item.terms);
    const reportScore = Math.min(30, Math.round(hits.length / item.terms.length * 25) + (report.length >= 260 ? 5 : report.length >= 160 ? 2 : 0));
    const score = Math.min(100, decisionScore + questionScore + evidenceScore + reportScore);
    const passed = scoring.meetsThreshold(score, scoring.thresholds.DEEP_ACTIVITY);
    const state = getState();
    state[item.id] = { score, passed, report, updatedAt: new Date().toISOString() };
    saveState(state);
    if (passed) addDeliverable(item, report, score);
    const missingTerms = item.terms.filter((term) => !hits.includes(term));
    const feedback = document.getElementById('architectureFeedback');
    feedback.className = `depth-feedback ${passed ? 'pass' : 'fail'}`;
    feedback.innerHTML = `<strong>${score}% - ${passed ? 'arquitetura demonstrada' : 'investigacao incompleta'}</strong>
      <p>Decisao: ${decisionScore}/25. Checkpoint: ${questionScore}/25. Evidencias: ${evidenceScore}/20. Relatorio: ${reportScore}/30.</p>
      <p>${missingTerms.length ? `<strong>Faltou conectar:</strong> ${missingTerms.map(esc).join(', ')}.` : 'O relatorio cobriu os conceitos essenciais.'}</p>`;
    document.getElementById('architectureScore').innerHTML = scoreMarkup({ score, passed });
  });

  renderArchitecture();
}
