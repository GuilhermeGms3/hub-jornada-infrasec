import { storage } from '../../core/storage.js';
import { eventBus } from '../../core/events.js';
import { scoring } from '../../practice/scoring.js';
import { createDeliverable, prependUniqueDeliverable } from '../../portfolio/deliverables.js';
import { academyCatalog } from '../../data/academy/catalog.js';

export function initializeAcademy() {
  const keys = {
    journey: storage.keys.DEEP_JOURNEY,
    incidents: storage.keys.DEEP_INCIDENTS,
    soc: storage.keys.DEEP_SOC,
    cloud: storage.keys.DEEP_CLOUD,
    terminal: storage.keys.DEEP_TERMINAL,
    certs: storage.keys.DEEP_CERTS,
    deliverables: storage.keys.DELIVERABLES
  };
  const save = (key, value) => {
    storage.writeJson(key, value);
    eventBus.publish(eventBus.events.COMPETENCY_CHANGED);
  };
  const esc = (value) => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
  const normalize = (value) => String(value || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const hasTerms = (text, terms) => terms.filter((term) => normalize(text).includes(normalize(term)));
  const options = (items) => items.map((item, index) => `<option value="${index}">${esc(item)}</option>`).join('');
  const average = (items) => items.length ? Math.round(items.reduce((sum, value) => sum + value, 0) / items.length) : 0;
  const latestScores = (items, id) => items.filter((item) => item.id === id).map((item) => item.score);
  const scoreBadge = (score, passed) => score == null
    ? '<strong>Nao avaliado</strong><span>Meta: 80%</span>'
    : `<strong>${score}%</strong><span>${passed ? 'Competencia demonstrada' : 'Refaca com as lacunas indicadas'}</span>`;

  function addDeliverable(sourceId, title, type, body, week) {
    const list = storage.getDeliverables();
    const result = prependUniqueDeliverable(list, createDeliverable({
        id: `deep-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        sourceId, type, week, title, body, evidence: 'Academia Pratica: avaliacao >= 80%',
        status: 'concluido', createdAt: new Date().toISOString()
      }));
    if (result.added) {
      storage.setDeliverables(result.items);
      eventBus.publish(eventBus.events.DELIVERABLES_CHANGED);
    }
  }

  const { journey, incidents, socCases, cloudLabs, terminalLabs, certs } = academyCatalog;






  const depthTabs = [...document.querySelectorAll('[data-depth-tab]')];
  depthTabs.forEach((tab, index) => {
    const activate = () => {
      depthTabs.forEach((item) => {
        const active = item === tab;
        item.setAttribute('aria-selected', String(active));
        item.tabIndex = active ? 0 : -1;
        document.getElementById(`depth-${item.dataset.depthTab}`).hidden = !active;
      });
    };
    tab.addEventListener('click', activate);
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      const next = depthTabs[(index + (event.key === 'ArrowRight' ? 1 : -1) + depthTabs.length) % depthTabs.length];
      next.click(); next.focus();
    });
  });

  const journeySelect = document.getElementById('deepJourneySelect');
  journeySelect.innerHTML = journey.map((item) => `<option value="${item.id}">Semana ${item.week}: ${esc(item.title)}</option>`).join('');
  function renderJourney() {
    const item = journey.find((entry) => entry.id === journeySelect.value);
    const state = storage.readJson(keys.journey, {})[item.id];
    document.getElementById('deepJourneyScore').innerHTML = scoreBadge(state?.score, state?.passed);
    document.getElementById('deepJourneyContent').innerHTML = `
      <div class="mission-header"><div><h4>Semana ${item.week}: ${esc(item.title)}</h4><p>${esc(item.outcome)}</p></div><span class="tag">Saida: 80% + artefato</span></div>
      <div class="mission-grid">
        <div class="mission-phase"><h4>Antes de comecar</h4><p>${esc(item.prereq)}</p><h5>Modelo mental</h5><ul>${item.theory.map((line) => `<li>${esc(line)}</li>`).join('')}</ul></div>
        <div class="mission-phase"><h4>Construa</h4><ol>${item.build.map((line) => `<li>${esc(line)}</li>`).join('')}</ol><h5>Quebre e corrija</h5><ol>${item.breakFix.map((line) => `<li>${esc(line)}</li>`).join('')}</ol></div>
        <form class="mission-phase depth-form" id="journeyAssessment"><h4>Checkpoint tecnico</h4>
          ${item.questions.map((question, qIndex) => `<div class="question-block"><strong>${qIndex + 1}. ${esc(question[0])}</strong><div class="question-options">${question[1].map((choice, cIndex) => `<label><input type="radio" name="jq${qIndex}" value="${cIndex}" required> ${esc(choice)}</label>`).join('')}</div></div>`).join('')}
          <label for="journeyEvidence">Evidencia e raciocinio<textarea id="journeyEvidence" required placeholder="Cole comandos essenciais e explique causa, teste antes/depois e rollback.">${esc(state?.evidence || '')}</textarea></label>
          <button class="primary" type="submit">Avaliar missao</button><div class="depth-feedback" id="journeyFeedback" aria-live="polite"></div>
        </form>
        <div class="mission-phase"><h4>Rubrica e saida</h4><table class="mission-rubric"><tbody>
          <tr><th>Quiz</th><td>45 pontos; conceitos e diagnostico.</td></tr><tr><th>Evidencia</th><td>45 pontos; termos tecnicos interpretados.</td></tr>
          <tr><th>Estrutura</th><td>10 pontos; evidencia com contexto suficiente.</td></tr></tbody></table>
          <h5>Checklist do artefato</h5><ul>${item.checks.map((line) => `<li>${esc(line)}</li>`).join('')}</ul></div>
      </div>`;
    document.getElementById('journeyAssessment').addEventListener('submit', (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const correct = item.questions.filter((question, index) => Number(form.get(`jq${index}`)) === question[2]).length;
      const evidence = document.getElementById('journeyEvidence').value.trim();
      const hits = hasTerms(evidence, item.evidenceTerms);
      const score = Math.min(100, Math.round((correct / item.questions.length) * 45 + (hits.length / item.evidenceTerms.length) * 45 + (evidence.length >= 220 ? 10 : evidence.length >= 120 ? 5 : 0)));
      const passed = scoring.meetsThreshold(score, scoring.thresholds.DEEP_ACTIVITY);
      const all = storage.readJson(keys.journey, {});
      all[item.id] = { score, passed, evidence, updatedAt: new Date().toISOString() };
      save(keys.journey, all);
      if (passed) addDeliverable(`deep-journey-${item.id}`, item.title, 'README de lab', `# ${item.title}\n\n## Objetivo\n${item.outcome}\n\n## Evidencias\n${evidence}\n\n## Validacao\nNota da rubrica: ${score}%`, item.week);
      const missing = item.evidenceTerms.filter((term) => !hits.includes(term));
      const feedback = document.getElementById('journeyFeedback');
      feedback.className = `depth-feedback ${passed ? 'pass' : 'fail'}`;
      feedback.innerHTML = `<strong>${score}% - ${passed ? 'aprovado' : 'ainda nao aprovado'}</strong><p>Quiz: ${correct}/${item.questions.length}. Conceitos ausentes na evidencia: ${missing.length ? missing.map(esc).join(', ') : 'nenhum'}.</p>`;
      document.getElementById('deepJourneyScore').innerHTML = scoreBadge(score, passed);
    });
  }
  journeySelect.addEventListener('change', renderJourney);
  renderJourney();

  let selectedEvidence = [];
  const incidentSelect = document.getElementById('deepIncidentSelect');
  incidentSelect.innerHTML = incidents.map((item) => `<option value="${item.id}">${item.area}: ${esc(item.title)}</option>`).join('');
  function renderIncident() {
    const item = incidents.find((entry) => entry.id === incidentSelect.value);
    selectedEvidence = [];
    const scores = latestScores(storage.readJson(keys.incidents, []), item.id);
    document.getElementById('deepIncidentScore').innerHTML = scoreBadge(scores[0], scoring.meetsThreshold(scores[0], scoring.thresholds.DEEP_ACTIVITY));
    document.getElementById('deepIncidentBrief').innerHTML = `<h4>${esc(item.title)}</h4><p>${esc(item.brief)}</p><span class="tag">${esc(item.priority)}</span>`;
    document.getElementById('deepEvidenceActions').innerHTML = item.evidence.map((entry, index) => `<button type="button" data-evidence="${index}">${esc(entry[0])}</button>`).join('');
    document.getElementById('deepEvidenceDesk').innerHTML = '<p>Selecione somente as evidencias que ajudam a confirmar ou eliminar hipoteses.</p>';
    document.getElementById('deepEvidenceCount').textContent = '0 coletadas';
    document.getElementById('deepIncidentCause').innerHTML = options(item.causes);
    document.getElementById('deepIncidentResolution').innerHTML = options(item.resolutions);
    document.getElementById('deepIncidentEscalation').innerHTML = options(item.escalations);
    document.getElementById('deepIncidentReport').value = '';
    document.getElementById('deepIncidentFeedback').className = 'depth-feedback';
    document.getElementById('deepIncidentFeedback').innerHTML = '';
  }
  document.getElementById('deepEvidenceActions').addEventListener('click', (event) => {
    const button = event.target.closest('[data-evidence]');
    if (!button) return;
    const index = Number(button.dataset.evidence);
    if (selectedEvidence.includes(index)) return;
    selectedEvidence.push(index); button.disabled = true;
    const item = incidents.find((entry) => entry.id === incidentSelect.value);
    document.getElementById('deepEvidenceDesk').innerHTML = selectedEvidence.map((chosen) => `<div class="evidence-item"><code>$ ${esc(item.evidence[chosen][0])}</code><span>${esc(item.evidence[chosen][1])}</span></div>`).join('');
    document.getElementById('deepEvidenceCount').textContent = `${selectedEvidence.length} coletada(s)`;
  });
  document.getElementById('deepIncidentForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const item = incidents.find((entry) => entry.id === incidentSelect.value);
    const report = document.getElementById('deepIncidentReport').value.trim();
    const selections = [document.getElementById('deepIncidentCause'), document.getElementById('deepIncidentResolution'), document.getElementById('deepIncidentEscalation')];
    const decisionScore = selections.filter((field, index) => Number(field.value) === item.correct[index]).length * 15;
    const useful = selectedEvidence.filter((index) => item.evidence[index][2]).length;
    const noise = selectedEvidence.length - useful;
    const evidenceScore = Math.max(0, Math.min(25, useful * 7 - noise * 3));
    const hits = hasTerms(report, item.terms);
    const reportScore = Math.min(30, Math.round(hits.length / item.terms.length * 25) + (report.length >= 240 ? 5 : 0));
    const score = Math.min(100, decisionScore + evidenceScore + reportScore);
    const passed = scoring.meetsThreshold(score, scoring.thresholds.DEEP_ACTIVITY);
    const attempts = storage.readJson(keys.incidents, []);
    attempts.unshift({ id: item.id, area: item.area, score, passed, selectedEvidence, createdAt: new Date().toISOString() });
    save(keys.incidents, attempts.slice(0, 100));
    if (passed) addDeliverable(`deep-incident-${item.id}`, `Ticket: ${item.title}`, 'Ticket', report, item.area === 'Help Desk' ? 1 : 5);
    const feedback = document.getElementById('deepIncidentFeedback');
    feedback.className = `depth-feedback ${passed ? 'pass' : 'fail'}`;
    feedback.innerHTML = `<strong>${score}% - ${passed ? 'incidente encerrado com evidencia' : 'investigacao incompleta'}</strong><p>Decisoes: ${decisionScore}/45. Evidencias: ${evidenceScore}/25. Ticket: ${reportScore}/30. Reveja coleta util, causa, validacao e rollback.</p>`;
    document.getElementById('deepIncidentScore').innerHTML = scoreBadge(score, passed);
  });
  incidentSelect.addEventListener('change', renderIncident);
  renderIncident();

  const socSelect = document.getElementById('deepSocSelect');
  socSelect.innerHTML = socCases.map((item) => `<option value="${item.id}">${esc(item.title)}</option>`).join('');
  const socClassifications = [...new Set(socCases.map((item) => item.classification).concat(['Atividade normal', 'Malware confirmado']))];
  const severities = ['Baixa', 'Media', 'Alta', 'Critica'];
  function renderSoc() {
    const item = socCases.find((entry) => entry.id === socSelect.value);
    const scores = latestScores(storage.readJson(keys.soc, []), item.id);
    document.getElementById('deepSocScore').innerHTML = scoreBadge(scores[0], scoring.meetsThreshold(scores[0], scoring.thresholds.DEEP_ACTIVITY));
    document.getElementById('deepSocBrief').innerHTML = `<h4>${esc(item.title)}</h4><p>${esc(item.brief)}</p><span class="tag">${esc(item.mitre)}</span>`;
    document.getElementById('deepSocLogs').textContent = item.logs;
    document.getElementById('deepSocClassification').innerHTML = options(socClassifications);
    document.getElementById('deepSocSeverity').innerHTML = options(severities);
    ['deepSocIocs', 'deepSocTimeline', 'deepSocAction'].forEach((id) => { document.getElementById(id).value = ''; });
    document.getElementById('deepSocFeedback').className = 'depth-feedback';
    document.getElementById('deepSocFeedback').innerHTML = '';
  }
  document.getElementById('deepSocForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const item = socCases.find((entry) => entry.id === socSelect.value);
    const iocs = document.getElementById('deepSocIocs').value;
    const timeline = document.getElementById('deepSocTimeline').value;
    const action = document.getElementById('deepSocAction').value;
    const classOk = socClassifications[Number(document.getElementById('deepSocClassification').value)] === item.classification;
    const severityOk = severities[Number(document.getElementById('deepSocSeverity').value)] === item.severity;
    const iocHits = hasTerms(iocs, item.iocs);
    const timeHits = hasTerms(timeline, item.timeline);
    const actionHits = hasTerms(action, item.action);
    const score = Math.round((classOk ? 20 : 0) + (severityOk ? 15 : 0) + iocHits.length / item.iocs.length * 20 + timeHits.length / item.timeline.length * 20 + actionHits.length / item.action.length * 25);
    const passed = scoring.meetsThreshold(score, scoring.thresholds.DEEP_ACTIVITY);
    const attempts = storage.readJson(keys.soc, []);
    attempts.unshift({ id: item.id, score, passed, createdAt: new Date().toISOString() });
    save(keys.soc, attempts.slice(0, 100));
    if (passed) addDeliverable(`deep-soc-${item.id}`, `Investigacao SOC: ${item.title}`, 'Investigacao SOC', `# ${item.title}\n\n## IOCs\n${iocs}\n\n## Linha do tempo\n${timeline}\n\n## Contencao\n${action}\n\n${item.mitre}`, 8);
    const missing = [...item.iocs.filter((term) => !iocHits.includes(term)), ...item.action.filter((term) => !actionHits.includes(term))];
    const feedback = document.getElementById('deepSocFeedback');
    feedback.className = `depth-feedback ${passed ? 'pass' : 'fail'}`;
    feedback.innerHTML = `<strong>${score}% - ${passed ? 'analise sustentada' : 'faltam elementos'}</strong><p>Classificacao: ${classOk ? 'correta' : item.classification}. Severidade: ${severityOk ? 'correta' : item.severity}. Revise: ${missing.length ? missing.map(esc).join(', ') : 'linha do tempo'}.</p>`;
    document.getElementById('deepSocScore').innerHTML = scoreBadge(score, passed);
  });
  socSelect.addEventListener('change', renderSoc);
  renderSoc();

  const cloudSelect = document.getElementById('deepCloudSelect');
  cloudSelect.innerHTML = cloudLabs.map((item) => `<option value="${item.id}">${item.provider}: ${esc(item.title)}</option>`).join('');
  function renderCloud() {
    const item = cloudLabs.find((entry) => entry.id === cloudSelect.value);
    const scores = latestScores(storage.readJson(keys.cloud, []), item.id);
    document.getElementById('deepCloudScore').innerHTML = scoreBadge(scores[0], scoring.meetsThreshold(scores[0], scoring.thresholds.DEEP_ACTIVITY));
    document.getElementById('deepCloudBrief').innerHTML = `<h4>${esc(item.title)}</h4><p>${esc(item.brief)}</p>`;
    document.getElementById('deepCloudArtifact').textContent = item.artifact;
    document.getElementById('deepCloudSources').innerHTML = item.sources.map(([label, href]) => `<a class="button" href="${href}" target="_blank" rel="noopener">${esc(label)}</a>`).join('');
    document.getElementById('deepCloudQuestions').innerHTML = item.questions.map((question, qIndex) => `<div class="question-block"><strong>${qIndex + 1}. ${esc(question[0])}</strong><div class="question-options">${question[1].map((choice, cIndex) => `<label><input type="radio" name="cq${qIndex}" value="${cIndex}" required> ${esc(choice)}</label>`).join('')}</div></div>`).join('');
    document.getElementById('deepCloudRationale').value = '';
    document.getElementById('deepCloudFeedback').className = 'depth-feedback';
    document.getElementById('deepCloudFeedback').innerHTML = '';
  }
  document.getElementById('deepCloudForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const item = cloudLabs.find((entry) => entry.id === cloudSelect.value);
    const form = new FormData(event.currentTarget);
    const correct = item.questions.filter((question, index) => Number(form.get(`cq${index}`)) === question[2]).length;
    const rationale = document.getElementById('deepCloudRationale').value.trim();
    const hits = hasTerms(rationale, item.terms);
    const score = Math.min(100, Math.round(correct / item.questions.length * 60 + hits.length / item.terms.length * 35 + (rationale.length >= 200 ? 5 : 0)));
    const passed = scoring.meetsThreshold(score, scoring.thresholds.DEEP_ACTIVITY);
    const attempts = storage.readJson(keys.cloud, []);
    attempts.unshift({ id: item.id, provider: item.provider, score, passed, createdAt: new Date().toISOString() });
    save(keys.cloud, attempts.slice(0, 100));
    if (passed) addDeliverable(`deep-cloud-${item.id}`, `Relatorio cloud: ${item.title}`, 'Relatorio cloud', `${item.artifact}\n\n## Analise\n${rationale}\n\nNota: ${score}%`, 10);
    const missing = item.terms.filter((term) => !hits.includes(term));
    const feedback = document.getElementById('deepCloudFeedback');
    feedback.className = `depth-feedback ${passed ? 'pass' : 'fail'}`;
    feedback.innerHTML = `<strong>${score}% - ${passed ? 'arquitetura defendida' : 'revise a decisao'}</strong><p>Questoes: ${correct}/${item.questions.length}. Conceitos ausentes: ${missing.length ? missing.map(esc).join(', ') : 'nenhum'}.</p>`;
    document.getElementById('deepCloudScore').innerHTML = scoreBadge(score, passed);
  });
  cloudSelect.addEventListener('change', renderCloud);
  renderCloud();

  let terminalStep = 0;
  const terminalSelect = document.getElementById('deepTerminalSelect');
  terminalSelect.innerHTML = terminalLabs.map((item) => `<option value="${item.id}">${esc(item.title)}</option>`).join('');
  function renderTerminal() {
    const item = terminalLabs.find((entry) => entry.id === terminalSelect.value);
    const state = storage.readJson(keys.terminal, {})[item.id];
    terminalStep = state?.passed ? item.steps.length : 0;
    document.getElementById('deepTerminalScore').innerHTML = scoreBadge(state?.score, state?.passed);
    document.getElementById('deepTerminalBrief').innerHTML = `<h4>${esc(item.title)}</h4><p>${esc(item.brief)}</p>`;
    document.getElementById('deepTerminalObjectives').innerHTML = item.steps.map((step, index) => `<li class="${index < terminalStep ? 'done' : ''}">${esc(step[0])}</li>`).join('');
    document.getElementById('deepTerminalConsole').textContent = `$ lab start ${item.id}\n${item.brief}\n`;
    document.getElementById('deepTerminalFeedback').className = 'depth-feedback';
    document.getElementById('deepTerminalFeedback').textContent = state?.passed ? 'Aprovado. Agora repita em WSL/VM e guarde output real.' : 'Digite o comando da primeira etapa.';
    document.getElementById('deepTerminalCommand').disabled = Boolean(state?.passed);
  }
  document.getElementById('deepTerminalForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const item = terminalLabs.find((entry) => entry.id === terminalSelect.value);
    const field = document.getElementById('deepTerminalCommand');
    const command = field.value.trim();
    if (!command || terminalStep >= item.steps.length) return;
    const consoleEl = document.getElementById('deepTerminalConsole');
    consoleEl.textContent += `\n$ ${command}\n`;
    if (item.steps[terminalStep][1].test(command)) {
      consoleEl.textContent += `${item.steps[terminalStep][2]}\n`;
      terminalStep += 1;
      field.value = '';
      if (terminalStep === item.steps.length) {
        const all = storage.readJson(keys.terminal, {});
        all[item.id] = { score: 100, passed: true, updatedAt: new Date().toISOString() };
        save(keys.terminal, all);
        addDeliverable(`deep-terminal-${item.id}`, item.title, 'Runbook', `# ${item.title}\n\nDesafio simulado concluido. Reproduzir no WSL/VM e substituir esta nota por outputs reais.`, item.id.startsWith('git') ? 11 : 7);
        field.disabled = true;
        document.getElementById('deepTerminalFeedback').textContent = '100% - sequencia correta. Falta reproduzir no ambiente real para portfolio.';
        document.getElementById('deepTerminalScore').innerHTML = scoreBadge(100, true);
      }
    } else {
      consoleEl.textContent += `comando nao atende ao objetivo atual: ${item.steps[terminalStep][0]}\n`;
      document.getElementById('deepTerminalFeedback').textContent = 'Leia o objetivo e use o comando especifico; nenhuma etapa foi pulada.';
    }
    document.getElementById('deepTerminalObjectives').innerHTML = item.steps.map((step, index) => `<li class="${index < terminalStep ? 'done' : ''}">${esc(step[0])}</li>`).join('');
    consoleEl.scrollTop = consoleEl.scrollHeight;
  });
  terminalSelect.addEventListener('change', renderTerminal);
  renderTerminal();

  const certSelect = document.getElementById('deepCertSelect');
  certSelect.innerHTML = certs.map((item) => `<option value="${item.id}">${esc(item.title)}</option>`).join('');
  function renderCert() {
    const item = certs.find((entry) => entry.id === certSelect.value);
    const all = storage.readJson(keys.certs, {});
    const state = all[item.id] || { domains: {}, practice: 0 };
    const domainChecks = item.domains.length * 3;
    const checked = Object.values(state.domains || {}).filter(Boolean).length;
    const score = Math.round((checked / domainChecks) * 60 + Math.min(40, Number(state.practice || 0) * .4));
    const passed = checked === domainChecks && Number(state.practice) >= 80;
    document.getElementById('deepCertScore').innerHTML = scoreBadge(score, passed);
    document.getElementById('deepCertOverview').innerHTML = `<div class="mission-header"><div><h4>${esc(item.title)}</h4><p><strong>Serve para:</strong> ${esc(item.target)}. ${esc(item.cadence)}</p></div><a class="button" href="${item.link}" target="_blank" rel="noopener">Guia oficial</a></div>`;
    document.getElementById('deepCertDomains').innerHTML = item.domains.map((domain, index) => `
      <div class="cert-domain-row"><div><h4>${esc(domain[0])}</h4><p><strong>Pratica no hub:</strong> ${esc(domain[1])}</p><p>${esc(domain[2])}</p></div>
      <div class="cert-checks">${[['theory', 'Consigo explicar sem consultar'], ['lab', 'Fiz lab/caso e guardei evidencia'], ['teach', 'Acertei questoes e expliquei os erros']].map(([kind, label]) => `<label><input type="checkbox" data-cert-check="${index}-${kind}" ${state.domains?.[`${index}-${kind}`] ? 'checked' : ''}> ${label}</label>`).join('')}</div></div>`).join('');
    document.getElementById('deepCertPracticeScore').value = state.practice || '';
    document.getElementById('deepCertFeedback').className = 'depth-feedback';
    document.getElementById('deepCertFeedback').innerHTML = `<p>${checked}/${domainChecks} provas de dominio. A certificacao so fica pronta com todas e simulado limpo >= 80%.</p>`;
  }
  document.getElementById('saveDeepCert').addEventListener('click', () => {
    const item = certs.find((entry) => entry.id === certSelect.value);
    const all = storage.readJson(keys.certs, {});
    const domains = {};
    document.querySelectorAll('[data-cert-check]').forEach((field) => { domains[field.dataset.certCheck] = field.checked; });
    const practice = Math.max(0, Math.min(100, Number(document.getElementById('deepCertPracticeScore').value || 0)));
    const checked = Object.values(domains).filter(Boolean).length;
    const total = item.domains.length * 3;
    const score = Math.round(checked / total * 60 + practice * .4);
    const passed = checked === total && practice >= 80;
    all[item.id] = { domains, practice, score, passed, updatedAt: new Date().toISOString() };
    save(keys.certs, all);
    const feedback = document.getElementById('deepCertFeedback');
    feedback.className = `depth-feedback ${passed ? 'pass' : 'fail'}`;
    feedback.innerHTML = `<strong>${score}% - ${passed ? 'pronto para agendar' : 'plano em andamento'}</strong><p>${checked}/${total} provas de dominio e simulado ${practice}%. Nao use dumps: registre por que cada alternativa errada esta errada.</p>`;
    document.getElementById('deepCertScore').innerHTML = scoreBadge(score, passed);
  });
  certSelect.addEventListener('change', renderCert);
  document.querySelectorAll('[data-cert-plan]').forEach((link) => {
    link.addEventListener('click', () => {
      if (!certs.some((item) => item.id === link.dataset.certPlan)) return;
      certSelect.value = link.dataset.certPlan;
      renderCert();
    });
  });
  renderCert();
}
