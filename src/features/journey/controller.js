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

export function initializeJourney({ loadTemplate }) {

  const { dayNames, phases, guidedWeeks, hubPages } = journeyCatalog;


  const dayKey = storage.keys.GUIDED_CURRENT_DAY;
  const progress = storage.getGuidedProgress();
  const savedDays = storage.readJson(dayKey, {});
  const guidedWeekSelect = document.getElementById('guidedWeekSelect');
  const guidedDaySelect = document.getElementById('guidedDaySelect');
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
    if (Number.isInteger(saved) && saved >= 0 && saved < 5) return saved;
    const first = guidedWeeks[weekIndex].days.findIndex((_, index) => missionState(weekIndex, index) !== 'done');
    return first === -1 ? 4 : first;
  }

  function weekDoneCount(weekIndex) {
    return guidedWeeks[weekIndex].days.filter((_, index) => missionState(weekIndex, index) === 'done').length;
  }

  function renderToday() {
    const weekIndex = Number(guidedWeekSelect.value);
    const dayIndex = Number(guidedDaySelect.value);
    const week = guidedWeeks[weekIndex];
    const day = week.days[dayIndex];
    const state = missionState(weekIndex, dayIndex);
    const done = weekDoneCount(weekIndex);
    const phase = phases.find((item) => item.id === week.phase);
    document.getElementById('todayPhase').textContent = `${phase.label} · Semana ${weekIndex + 1}`;
    document.getElementById('todayMissionNumber').textContent = `Missao ${dayIndex + 1} de 5 · ${dayNames[dayIndex]}`;
    document.getElementById('todayMissionDuration').textContent = `${day.duration} minutos`;
    document.getElementById('todayMissionTitle').textContent = day.title;
    document.getElementById('todayMissionObjective').textContent = day.objective;
    document.getElementById('todayMissionSteps').innerHTML = day.steps.map((step) => `<li>${step}</li>`).join('');
    document.getElementById('todayMissionEvidence').textContent = day.evidence;
    const primary = document.getElementById('todayPrimaryAction');
    primary.textContent = state === 'doing' ? `Continuar: ${day.action}` : day.action;
    primary.dataset.guidedTarget = day.target;
    document.getElementById('guidedWeekTitle').textContent = `Semana ${weekIndex + 1}: ${week.title}`;
    document.getElementById('guidedWeekOutcome').textContent = week.outcome;
    document.getElementById('guidedExitCriteria').textContent = week.exit;
    document.getElementById('guidedNotYet').textContent = week.notYet;
    document.getElementById('guidedProgressText').textContent = `${done} de 5 missoes`;
    document.getElementById('guidedProgressPercent').textContent = `${done * 20}%`;
    document.getElementById('guidedProgress').value = done;
    document.getElementById('sidebarWeekStatus').textContent = `Semana ${weekIndex + 1} de 12`;
    document.getElementById('sidebarNextAction').textContent = state === 'done' ? 'Missao concluida. Avance quando estiver pronto.' : `Agora: ${day.title}.`;
    const feedback = document.getElementById('todayFeedback');
    feedback.className = 'guided-feedback';
    feedback.textContent = '';
    if (state === 'done') {
      feedback.className = 'guided-feedback done';
      feedback.textContent = 'Missao concluida. A evidencia deve estar salva na Central de Evidencias ou no seu repositorio.';
    } else if (state === 'blocked') {
      feedback.className = 'guided-feedback blocked';
      feedback.textContent = 'Pare aqui: volte ao primeiro passo, use o material indicado e registre exatamente onde travou. Nao avance a semana ainda.';
    } else if (state === 'doing') {
      feedback.textContent = 'Sessao iniciada. Conclua os tres passos e produza a evidencia antes de marcar como feita.';
    }
    document.getElementById('nextMission').disabled = state !== 'done' || (weekIndex === 11 && dayIndex === 4);
    savedDays[weekIndex] = dayIndex;
    storage.writeJson(dayKey, savedDays);
    renderRoadmap();
    renderSyllabus();
  }

  function chooseWeek(weekIndex, dayIndex = firstOpenDay(weekIndex), switchHome = false) {
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
        <span class="week-number">${index + 1}</span><span class="week-name">${week.title}</span><span class="week-state">${done}/5</span>
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
  guidedDaySelect.addEventListener('change', renderToday);
  document.getElementById('todayPrimaryAction').addEventListener('click', (event) => {
    event.preventDefault();
    const weekIndex = Number(guidedWeekSelect.value);
    const dayIndex = Number(guidedDaySelect.value);
    if (missionState(weekIndex, dayIndex) !== 'done') progress[`${weekIndex}-${dayIndex}`] = 'doing';
    storage.setGuidedProgress(progress);
    eventBus.publish(eventBus.events.COMPETENCY_CHANGED);
    renderToday();
    openGuidedTarget(event.currentTarget.dataset.guidedTarget);
  });
  document.getElementById('completeToday').addEventListener('click', () => {
    const weekIndex = Number(guidedWeekSelect.value);
    const dayIndex = Number(guidedDaySelect.value);
    progress[`${weekIndex}-${dayIndex}`] = 'done';
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
    if (dayIndex > 4) { weekIndex += 1; dayIndex = 0; }
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
