import { storage } from '../../core/storage.js';
import { eventBus } from '../../core/events.js';
import {
  configureNavigation,
  getActivePage,
  getPageAt,
  getPageIndex,
  handleHash,
  navigateToPage
} from '../../core/navigation.js';
import { journeyCatalog } from '../../data/journey/catalog.js';
import {
  activityResultFor,
  applyActivityResult,
  getMissionSession,
  missionReadiness,
  saveMissionEvidence,
  setStepState,
  validateManualStep
} from '../../journey/session.js';

export function initializeJourney({ loadTemplate }) {

  const { dayNames, phases, guidedWeeks, hubPages } = journeyCatalog;


  const dayKey = storage.keys.GUIDED_CURRENT_DAY;
  const progress = storage.getGuidedProgress();
  const sessions = storage.getGuidedSessions();
  const savedDays = storage.readJson(dayKey, {});
  const guidedWeekSelect = document.getElementById('guidedWeekSelect');
  const guidedDaySelect = document.getElementById('guidedDaySelect');
  let activeStepIndex = 0;

  function esc(value = '') {
    return String(value).replace(/[&<>"']/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
  }

  function normalizeStep(item, day) {
    if (typeof item === 'string') {
      return {
        title: item,
        kind: 'Passo pratico',
        instruction: `Execute este passo dentro da atividade completa da missao. Ao terminar, registre o resultado na evidencia do dia: ${day.evidence}`,
        action: day.action,
        target: day.target,
        checks: ['Executei o passo, nao apenas li a descricao.', 'Registrei resultado e interpretacao na evidencia.'],
        question: 'O que este passo comprovou e como outra pessoa poderia repetir a verificacao?',
        completion: 'manual',
        requiresOutput: false
      };
    }
    return item;
  }

  function stepEnvironment(selected) {
    if (selected.environment) return selected.environment;
    if (selected.target?.includes('.pkt')) return 'No CLI do Cisco Packet Tracer';
    if (selected.target?.startsWith('practice:terminal:git-')) return 'No Git Bash ou PowerShell';
    if (selected.target?.startsWith('practice:terminal:')) return 'No Linux, WSL ou VM';
    if (selected.target?.startsWith('practice:incidents:')) return 'No caso guiado ou Windows';
    return 'No PowerShell ou CMD do Windows';
  }

  const sessionKey = (weekIndex, dayIndex) => `${weekIndex}-${dayIndex}`;

  function sessionFor(weekIndex, dayIndex) {
    return getMissionSession(sessions, sessionKey(weekIndex, dayIndex));
  }

  function saveSession(weekIndex, dayIndex, session) {
    sessions[sessionKey(weekIndex, dayIndex)] = session;
    storage.setGuidedSessions(sessions);
  }

  function activitySnapshot() {
    return {
      journey: storage.readJson(storage.keys.DEEP_JOURNEY, {}),
      incidents: storage.readJson(storage.keys.DEEP_INCIDENTS, []),
      soc: storage.readJson(storage.keys.DEEP_SOC, []),
      cloud: storage.readJson(storage.keys.DEEP_CLOUD, []),
      terminal: storage.readJson(storage.keys.DEEP_TERMINAL, {}),
      certs: storage.readJson(storage.keys.DEEP_CERTS, {}),
      architecture: storage.readJson(storage.keys.DEEP_ARCHITECTURE, {}),
      quiz: storage.readJson(storage.keys.CCNA_HUB_STATS, {})
    };
  }

  function syncActivityResults(day, weekIndex, dayIndex) {
    const steps = day.steps.map((item) => normalizeStep(item, day));
    const snapshot = activitySnapshot();
    let session = sessionFor(weekIndex, dayIndex);
    let changed = false;
    [...new Set(steps.map((item) => item.target))].forEach((target) => {
      const applied = applyActivityResult(session, steps, target, activityResultFor(target, snapshot));
      session = applied.session;
      changed ||= applied.changed;
    });
    if (changed) saveSession(weekIndex, dayIndex, session);
    return session;
  }

  function stepStateLabel(state) {
    if (state?.state === 'done') return state.score != null ? `Feito · ${state.score}%` : 'Feito';
    if (state?.state === 'verified') return `Atividade aprovada${state.score != null ? ` · ${state.score}%` : ''} · falta explicar`;
    if (state?.state === 'blocked') return 'Revisar';
    if (state?.state === 'doing') return 'Em andamento';
    return 'Nao iniciado';
  }

  function renderStepWorkspace(day, weekIndex, dayIndex) {
    const steps = day.steps.map((item) => normalizeStep(item, day));
    const selected = steps[Math.min(activeStepIndex, steps.length - 1)];
    const session = sessionFor(weekIndex, dayIndex);
    const savedStep = session.steps?.[activeStepIndex] || {};
    document.querySelectorAll('[data-today-step]').forEach((button, index) => {
      button.setAttribute('aria-current', index === activeStepIndex ? 'step' : 'false');
    });
    document.getElementById('todayStepKind').textContent = `Passo ${activeStepIndex + 1} · ${selected.kind}`;
    document.getElementById('todayStepTitle').textContent = selected.title;
    document.getElementById('todayStepInstruction').textContent = selected.instruction;
    const commandBlock = document.getElementById('todayStepCommandBlock');
    const commands = selected.commands || [];
    commandBlock.hidden = commands.length === 0;
    document.getElementById('todayStepCommands').textContent = commands.join('\n');
    document.getElementById('todayStepEnvironment').textContent = stepEnvironment(selected);
    document.getElementById('copyStepCommands').textContent = 'Copiar comandos';
    const linkedResult = activityResultFor(selected.target, activitySnapshot());
    const linked = ['activity', 'quiz'].includes(selected.completion);
    const canValidate = !linked || Boolean(linkedResult?.passed);
    const validationForm = document.getElementById('todayStepValidation');
    validationForm.hidden = !canValidate;
    document.getElementById('todayStepQuestion').textContent = selected.question;
    document.getElementById('todayStepResponse').value = savedStep.response || '';
    const outputGroup = document.getElementById('todayStepOutputGroup');
    outputGroup.hidden = !selected.requiresOutput;
    document.getElementById('todayStepOutput').value = savedStep.output || '';
    document.getElementById('todayStepChecks').innerHTML = `<legend>Confirme depois de verificar</legend>${selected.checks.map((check, index) => `
      <label><input type="checkbox" data-today-step-check="${index}" ${savedStep.checked?.includes(index) ? 'checked' : ''}> ${esc(check)}</label>
    `).join('')}`;
    const linkedStatus = document.getElementById('todayLinkedActivityStatus');
    linkedStatus.hidden = !linked;
    linkedStatus.className = `linked-activity-status ${linkedResult?.passed ? 'pass' : linkedResult ? 'fail' : ''}`;
    linkedStatus.innerHTML = !linked ? '' : linkedResult
      ? `<strong>Ultima nota importada: ${linkedResult.score}%</strong><p>${linkedResult.passed ? 'Execucao aprovada. Explique o resultado e confirme os criterios abaixo para encerrar o passo.' : 'A meta ainda nao foi atingida. Reabra a atividade, corrija as lacunas e tente novamente.'}</p>`
      : '<strong>Aguardando atividade vinculada</strong><p>Abra a atividade, conclua a avaliacao e volte para importar a nota automaticamente.</p>';
    const primary = document.getElementById('todayPrimaryAction');
    primary.textContent = selected.action || day.action;
    primary.dataset.guidedTarget = selected.target || day.target;
    document.getElementById('todayStepActionNote').textContent = selected.target?.includes('.pkt')
      ? 'O navegador entrega o arquivo .pkt. Abra-o no Cisco Packet Tracer instalado no computador.'
      : commands.length
        ? 'O hub prepara e explica o exercicio; por seguranca, o navegador nao executa comandos no seu computador.'
        : 'A atividade abre no ponto do hub ou no material necessario para este passo.';
    const feedback = document.getElementById('todayStepValidationFeedback');
    feedback.className = `step-validation-feedback ${savedStep.state || ''}`;
    feedback.textContent = savedStep.state === 'done'
      ? `Passo concluido${savedStep.score != null ? ` com ${savedStep.score}%` : ''}.`
      : savedStep.state === 'blocked'
        ? 'Passo marcado para revisar. Reabra o material e tente novamente.'
        : '';
  }
  function selectDepthTab(name) {
    document.querySelector(`[data-depth-tab="${name}"]`)?.click();
  }

  function selectCareerTab(name) {
    document.querySelector(`[data-career-tab="${name}"]`)?.click();
  }

  configureNavigation({
    activateFeatureView(page) {
      if (page.depthTab) selectDepthTab(page.depthTab);
      if (page.careerTab) selectCareerTab(page.careerTab);
    }
  });

  function setPractice(tab, value) {
    const pageMap = {
      journey: 'network-practice', incidents: 'helpdesk-noc', soc: 'soc', cloud: 'cloud',
      terminal: 'terminal', certs: 'cert-practice', architecture: 'architecture'
    };
    navigateToPage(pageMap[tab] || 'network-practice');
    selectDepthTab(tab);
    const selectMap = {
      journey: 'deepJourneySelect', incidents: 'deepIncidentSelect', soc: 'deepSocSelect',
      cloud: 'deepCloudSelect', terminal: 'deepTerminalSelect', certs: 'deepCertSelect',
      architecture: 'architectureSelect'
    };
    const select = document.getElementById(selectMap[tab]);
    if (select && value) {
      select.value = value;
      select.dispatchEvent(new Event('change'));
    }
  }

  function openGuidedTarget(target) {
    if (target.startsWith('practice:')) {
      const [, tab, value] = target.split(':');
      setPractice(tab, value);
      return;
    }
    if (target.startsWith('career:')) {
      const tab = target.split(':')[1];
      const pageMap = {
        portfolio: 'portfolio', tickets: 'ticket-simulator', labs: 'validated-labs', readiness: 'readiness',
        exams: 'simulations', reading: 'reading-queue', interview: 'interview', english: 'english'
      };
      navigateToPage(pageMap[tab] || 'portfolio');
      selectCareerTab(tab);
      return;
    }
    if (target.startsWith('template:')) {
      navigateToPage('templates');
      loadTemplate(target.split(':')[1]);
      return;
    }
    if (target.startsWith('#')) {
      location.hash = target;
      handleHash();
      return;
    }
    window.open(target, '_blank', 'noopener');
  }

  function missionState(weekIndex, dayIndex) {
    return progress[`${weekIndex}-${dayIndex}`] || 'not-started';
  }

  function firstOpenDay(weekIndex) {
    const saved = Number(savedDays[weekIndex]);
    const dayCount = guidedWeeks[weekIndex].days.length;
    if (Number.isInteger(saved) && saved >= 0 && saved < dayCount) return saved;
    const first = guidedWeeks[weekIndex].days.findIndex((_, index) => missionState(weekIndex, index) !== 'done');
    return first === -1 ? dayCount - 1 : first;
  }

  function weekDoneCount(weekIndex) {
    return guidedWeeks[weekIndex].days.filter((_, index) => missionState(weekIndex, index) === 'done').length;
  }

  function renderToday() {
    const weekIndex = Number(guidedWeekSelect.value);
    const dayIndex = Number(guidedDaySelect.value);
    const week = guidedWeeks[weekIndex];
    const day = week.days[dayIndex];
    const dayCount = week.days.length;
    const session = syncActivityResults(day, weekIndex, dayIndex);
    const state = missionState(weekIndex, dayIndex);
    const done = weekDoneCount(weekIndex);
    const phase = phases.find((item) => item.id === week.phase);
    document.getElementById('todayPhase').textContent = `${phase.label} · Semana ${weekIndex + 1}`;
    document.getElementById('todayMissionNumber').textContent = `Missao ${dayIndex + 1} de ${dayCount} · ${dayNames[dayIndex]}`;
    document.getElementById('todayMissionDuration').textContent = `${day.duration} minutos`;
    document.getElementById('todayMissionTitle').textContent = day.title;
    document.getElementById('todayMissionObjective').textContent = day.objective;
    const normalizedSteps = day.steps.map((item) => normalizeStep(item, day));
    document.getElementById('todayMissionSteps').innerHTML = normalizedSteps.map((item, index) => `
      <li class="step-${session.steps?.[index]?.state || 'not-started'}"><button type="button" data-today-step="${index}" aria-current="${index === activeStepIndex ? 'step' : 'false'}"><span>${esc(item.title)}</span><small>${esc(item.kind)} · ${esc(stepStateLabel(session.steps?.[index]))}</small></button></li>
    `).join('');
    renderStepWorkspace(day, weekIndex, dayIndex);
    document.getElementById('todayMissionEvidence').textContent = day.evidence;
    document.getElementById('todayMissionEvidenceInput').value = session.evidence || '';
    const evidenceStatus = document.getElementById('todayEvidenceStatus');
    evidenceStatus.className = session.evidenceSaved ? 'done' : '';
    evidenceStatus.textContent = session.evidenceSaved ? 'Evidencia salva.' : 'Ainda nao salva.';
    document.getElementById('guidedWeekTitle').textContent = `Semana ${weekIndex + 1}: ${week.title}`;
    document.getElementById('guidedWeekOutcome').textContent = week.outcome;
    document.getElementById('guidedExitCriteria').textContent = week.exit;
    document.getElementById('guidedNotYet').textContent = week.notYet;
    document.getElementById('guidedProgressText').textContent = `${done} de ${dayCount} missoes`;
    document.getElementById('guidedProgressPercent').textContent = `${Math.round(done / dayCount * 100)}%`;
    document.getElementById('guidedProgress').value = done;
    document.getElementById('guidedProgress').max = dayCount;
    document.getElementById('sidebarWeekStatus').textContent = `Semana ${weekIndex + 1} de 12`;
    document.getElementById('sidebarNextAction').textContent = state === 'done' ? 'Missao concluida. Avance quando estiver pronto.' : `Agora: ${day.title}.`;
    const feedback = document.getElementById('todayFeedback');
    const readiness = missionReadiness(session, normalizedSteps.length);
    const completeButton = document.getElementById('completeToday');
    completeButton.disabled = state === 'done' || !readiness.ready;
    completeButton.textContent = state === 'done' ? 'Dia concluido' : 'Concluir hoje';
    feedback.className = 'guided-feedback';
    feedback.textContent = '';
    if (state === 'done') {
      feedback.className = 'guided-feedback done';
      feedback.textContent = 'Missao concluida. A evidencia deve estar salva na Central de Evidencias ou no seu repositorio.';
    } else if (state === 'blocked') {
      feedback.className = 'guided-feedback blocked';
      feedback.textContent = 'Pare aqui: volte ao primeiro passo, use o material indicado e registre exatamente onde travou. Nao avance a semana ainda.';
    } else if (state === 'doing') {
      feedback.textContent = `Sessao iniciada. ${readiness.completed}/3 passos validados; ${readiness.evidenceReady ? 'evidencia salva' : 'evidencia pendente'}.`;
    } else {
      feedback.textContent = `Para concluir: valide os tres passos e salve uma evidencia. Agora: ${readiness.completed}/3 passos.`;
    }
    document.getElementById('nextMission').disabled = state !== 'done' || (weekIndex === guidedWeeks.length - 1 && dayIndex === dayCount - 1);
    savedDays[weekIndex] = dayIndex;
    storage.writeJson(dayKey, savedDays);
    renderRoadmap();
    renderSyllabus();
  }

  function chooseWeek(weekIndex, dayIndex = firstOpenDay(weekIndex), switchHome = false) {
    activeStepIndex = 0;
    guidedWeekSelect.value = String(weekIndex);
    guidedDaySelect.innerHTML = guidedWeeks[weekIndex].days.map((day, index) => `<option value="${index}">${dayNames[index]} · ${day.title}</option>`).join('');
    guidedDaySelect.value = String(dayIndex);
    const legacyWeekSelect = document.getElementById('weekSelect');
    if (legacyWeekSelect && Number(legacyWeekSelect.value) !== weekIndex) {
      legacyWeekSelect.value = String(weekIndex);
      legacyWeekSelect.dispatchEvent(new Event('change'));
    }
    renderToday();
    if (switchHome) {
      navigateToPage('today', true);
    }
  }

  function renderRoadmap() {
    const currentWeek = Number(guidedWeekSelect.value);
    document.getElementById('guidedWeekRoadmap').innerHTML = guidedWeeks.map((week, index) => {
      const done = weekDoneCount(index);
      return `<button type="button" data-guided-week="${index}" ${index === currentWeek ? 'aria-current="step"' : ''}>
        <span class="week-number">${index + 1}</span><span class="week-name">${week.title}</span><span class="week-state">${done}/${week.days.length}</span>
      </button>`;
    }).join('');
  }

  function renderSyllabus() {
    const weekIndex = Number(guidedWeekSelect.value);
    const week = guidedWeeks[weekIndex];
    const phase = phases.find((item) => item.id === week.phase);
    document.getElementById('guidedWeekSyllabus').innerHTML = `
      <header><span class="guided-eyebrow">${phase.label} · Semana ${weekIndex + 1}</span><h3>${week.title}</h3><p>${week.outcome}</p></header>
      <div class="syllabus-meta">
        <div><strong>Antes de comecar</strong><span>${week.prerequisite}</span></div>
        <div><strong>Ferramentas</strong><span>${week.tools}</span></div>
        <div><strong>Saida da semana</strong><span>${week.exit}</span></div>
      </div>
      <div class="syllabus-days">${week.days.map((day, dayIndex) => {
        const state = missionState(weekIndex, dayIndex);
        const label = state === 'done' ? 'Concluida' : state === 'blocked' ? 'Revisar' : state === 'doing' ? 'Em andamento' : 'Abrir';
        return `<div class="syllabus-day"><span class="day-label">${dayNames[dayIndex]}</span><div><h4>${day.title}</h4><p>${day.objective} · ${day.duration} min</p></div><button type="button" data-open-mission="${weekIndex}-${dayIndex}">${label}</button></div>`;
      }).join('')}</div>`;
  }

  function renderPhases() {
    const currentPhase = guidedWeeks[Number(guidedWeekSelect.value)].phase;
    document.getElementById('phaseRail').innerHTML = phases.map((phase) => `<button type="button" data-guided-phase="${phase.id}" aria-pressed="${phase.id === currentPhase}"><strong>${phase.label}</strong><span>${phase.range}</span></button>`).join('');
  }

  function currentMission() {
    const weekIndex = Number(guidedWeekSelect.value);
    const dayIndex = Number(guidedDaySelect.value);
    const day = guidedWeeks[weekIndex].days[dayIndex];
    return {
      weekIndex,
      dayIndex,
      day,
      steps: day.steps.map((item) => normalizeStep(item, day))
    };
  }

  function setMissionInProgress(weekIndex, dayIndex) {
    if (missionState(weekIndex, dayIndex) !== 'done') {
      progress[sessionKey(weekIndex, dayIndex)] = 'doing';
      storage.setGuidedProgress(progress);
    }
  }

  guidedWeeks.forEach((week, index) => {
    const option = document.createElement('option');
    option.value = String(index);
    option.textContent = `Semana ${index + 1} · ${week.title}`;
    guidedWeekSelect.appendChild(option);
  });

  guidedWeekSelect.addEventListener('change', () => {
    chooseWeek(Number(guidedWeekSelect.value));
    renderPhases();
  });
  guidedDaySelect.addEventListener('change', () => {
    activeStepIndex = 0;
    renderToday();
  });
  document.getElementById('todayMissionSteps').addEventListener('click', (event) => {
    const button = event.target.closest('[data-today-step]');
    if (!button) return;
    activeStepIndex = Number(button.dataset.todayStep);
    const { day, weekIndex, dayIndex } = currentMission();
    renderStepWorkspace(day, weekIndex, dayIndex);
  });
  document.getElementById('copyStepCommands').addEventListener('click', async (event) => {
    const commands = document.getElementById('todayStepCommands').textContent;
    try {
      await navigator.clipboard.writeText(commands);
      event.currentTarget.textContent = 'Comandos copiados';
    } catch {
      event.currentTarget.textContent = 'Selecione e copie os comandos acima';
    }
  });
  document.getElementById('todayPrimaryAction').addEventListener('click', (event) => {
    event.preventDefault();
    const { weekIndex, dayIndex } = currentMission();
    const session = sessionFor(weekIndex, dayIndex);
    const previous = session.steps?.[activeStepIndex] || {};
    if (!['done', 'verified'].includes(previous.state)) {
      saveSession(weekIndex, dayIndex, setStepState(session, activeStepIndex, { state: 'doing', launchedAt: new Date().toISOString() }));
    }
    setMissionInProgress(weekIndex, dayIndex);
    eventBus.publish(eventBus.events.COMPETENCY_CHANGED);
    renderToday();
    openGuidedTarget(event.currentTarget.dataset.guidedTarget);
  });
  document.getElementById('todayStepValidation').addEventListener('submit', (event) => {
    event.preventDefault();
    const { weekIndex, dayIndex, steps } = currentMission();
    const step = steps[activeStepIndex];
    const session = sessionFor(weekIndex, dayIndex);
    const linkedResult = activityResultFor(step.target, activitySnapshot());
    const submission = {
      response: document.getElementById('todayStepResponse').value,
      output: document.getElementById('todayStepOutput').value,
      checked: [...document.querySelectorAll('[data-today-step-check]:checked')].map((input) => Number(input.dataset.todayStepCheck)),
      activityPassed: Boolean(linkedResult?.passed),
      activityScore: linkedResult?.score,
      activitySource: linkedResult?.source
    };
    const result = validateManualStep(step, submission);
    const savedStep = session.steps?.[activeStepIndex] || {};
    const next = result.valid
      ? setStepState(session, activeStepIndex, result.stepState)
      : setStepState(session, activeStepIndex, {
        state: savedStep.state === 'verified' ? 'verified' : 'doing',
        response: submission.response,
        output: submission.output,
        checked: submission.checked
      });
    saveSession(weekIndex, dayIndex, next);
    setMissionInProgress(weekIndex, dayIndex);
    renderToday();
    const feedback = document.getElementById('todayStepValidationFeedback');
    if (!result.valid) {
      feedback.className = 'step-validation-feedback error';
      feedback.textContent = result.message;
    }
  });
  document.getElementById('reviewTodayStep').addEventListener('click', () => {
    const { weekIndex, dayIndex } = currentMission();
    const session = sessionFor(weekIndex, dayIndex);
    const next = setStepState(session, activeStepIndex, {
      state: 'blocked',
      response: document.getElementById('todayStepResponse').value,
      output: document.getElementById('todayStepOutput').value,
      checked: [...document.querySelectorAll('[data-today-step-check]:checked')].map((input) => Number(input.dataset.todayStepCheck))
    });
    saveSession(weekIndex, dayIndex, next);
    progress[sessionKey(weekIndex, dayIndex)] = 'blocked';
    storage.setGuidedProgress(progress);
    eventBus.publish(eventBus.events.COMPETENCY_CHANGED);
    renderToday();
  });
  document.getElementById('saveTodayEvidence').addEventListener('click', () => {
    const { weekIndex, dayIndex } = currentMission();
    const result = saveMissionEvidence(sessionFor(weekIndex, dayIndex), document.getElementById('todayMissionEvidenceInput').value);
    if (!result.valid) {
      const status = document.getElementById('todayEvidenceStatus');
      status.className = 'error';
      status.textContent = result.message;
      return;
    }
    saveSession(weekIndex, dayIndex, result.session);
    setMissionInProgress(weekIndex, dayIndex);
    renderToday();
  });
  document.getElementById('completeToday').addEventListener('click', () => {
    const { weekIndex, dayIndex, steps } = currentMission();
    if (!missionReadiness(sessionFor(weekIndex, dayIndex), steps.length).ready) {
      renderToday();
      return;
    }
    progress[sessionKey(weekIndex, dayIndex)] = 'done';
    storage.setGuidedProgress(progress);
    eventBus.publish(eventBus.events.COMPETENCY_CHANGED);
    renderToday();
  });
  document.getElementById('blockedToday').addEventListener('click', () => {
    const weekIndex = Number(guidedWeekSelect.value);
    const dayIndex = Number(guidedDaySelect.value);
    progress[`${weekIndex}-${dayIndex}`] = 'blocked';
    storage.setGuidedProgress(progress);
    eventBus.publish(eventBus.events.COMPETENCY_CHANGED);
    renderToday();
  });
  document.getElementById('nextMission').addEventListener('click', () => {
    let weekIndex = Number(guidedWeekSelect.value);
    let dayIndex = Number(guidedDaySelect.value) + 1;
    if (dayIndex >= guidedWeeks[weekIndex].days.length) { weekIndex += 1; dayIndex = 0; }
    if (weekIndex < guidedWeeks.length) chooseWeek(weekIndex, dayIndex, true);
  });
  document.getElementById('guidedWeekRoadmap').addEventListener('click', (event) => {
    const button = event.target.closest('[data-guided-week]');
    if (!button) return;
    chooseWeek(Number(button.dataset.guidedWeek));
    renderPhases();
  });
  document.getElementById('guidedWeekSyllabus').addEventListener('click', (event) => {
    const button = event.target.closest('[data-open-mission]');
    if (!button) return;
    const [weekIndex, dayIndex] = button.dataset.openMission.split('-').map(Number);
    chooseWeek(weekIndex, dayIndex, true);
  });
  document.getElementById('phaseRail').addEventListener('click', (event) => {
    const button = event.target.closest('[data-guided-phase]');
    if (!button) return;
    const weekIndex = guidedWeeks.findIndex((week) => week.phase === button.dataset.guidedPhase);
    chooseWeek(weekIndex);
    renderPhases();
  });
  document.getElementById('toggleLegacyJourney').addEventListener('click', (event) => {
    event.currentTarget.setAttribute('aria-expanded', 'false');
    navigateToPage('weekly-overview');
  });
  document.querySelectorAll('[data-hub-page]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      navigateToPage(link.dataset.hubPage);
    });
  });
  document.getElementById('previousHubPage').addEventListener('click', () => {
    const index = getPageIndex(getActivePage());
    if (index > 0) navigateToPage(getPageAt(index - 1).id);
  });
  document.getElementById('nextHubPage').addEventListener('click', () => {
    const index = getPageIndex(getActivePage());
    if (index < hubPages.length - 1) navigateToPage(getPageAt(index + 1).id);
  });
  window.addEventListener('hashchange', () => handleHash());
  eventBus.subscribe(eventBus.events.COMPETENCY_CHANGED, () => {
    const { day, weekIndex, dayIndex } = currentMission();
    syncActivityResults(day, weekIndex, dayIndex);
    renderToday();
  });
  window.addEventListener('focus', () => renderToday());
  window.addEventListener('storage', (event) => {
    if ([storage.keys.CCNA_HUB_STATS, storage.keys.DEEP_JOURNEY, storage.keys.DEEP_INCIDENTS,
      storage.keys.DEEP_SOC, storage.keys.DEEP_CLOUD, storage.keys.DEEP_TERMINAL,
      storage.keys.DEEP_CERTS, storage.keys.DEEP_ARCHITECTURE].includes(event.key)) renderToday();
  });

  const oldWeekSelect = document.getElementById('weekSelect');
  oldWeekSelect?.addEventListener('change', () => {
    const weekIndex = Number(oldWeekSelect.value);
    if (Number(guidedWeekSelect.value) !== weekIndex) {
      guidedWeekSelect.value = String(weekIndex);
      chooseWeek(weekIndex);
      renderPhases();
    }
  });

  const initialWeek = Math.max(0, Math.min(11, Number(storage.getCurrentWeek('0'))));
  guidedWeekSelect.value = String(initialWeek);
  chooseWeek(initialWeek);
  renderPhases();
  handleHash(false);
}
