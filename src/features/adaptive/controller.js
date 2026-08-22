import { storage } from '../../core/storage.js';
import { eventBus } from '../../core/events.js';
import { navigateToPage } from '../../core/navigation.js';
import { adaptiveCatalog } from '../../data/adaptive/catalog.js';
import { evidenceRules } from '../../learning/evidence.js';
import { progression } from '../../learning/progression.js';
import { recommendationRules } from '../../learning/recommendations.js';

const { domains, levelLabels } = adaptiveCatalog;
const masteryKey = storage.keys.MASTERY_EXAMS;
let implementation = null;

function requireImplementation() {
  if (!implementation) throw new Error('Adaptive ainda nao foi inicializado.');
  return implementation;
}

export const adaptiveApi = Object.freeze({
  domains,
  levelLabels,
  masteryKey,
  competency: (...args) => requireImplementation().competency(...args),
  evidenceLevel: (...args) => requireImplementation().evidenceLevel(...args),
  renderProfile: (...args) => requireImplementation().renderProfile(...args),
  renderSupport: (...args) => requireImplementation().renderSupport(...args),
  showLevelView: (...args) => requireImplementation().showLevelView(...args),
  openDomain: (...args) => requireImplementation().openDomain(...args),
  getActiveDomain: () => requireImplementation().getActiveDomain(),
  getActiveView: () => requireImplementation().getActiveView()
});

export function initializeAdaptive() {
  const recommendationsRules = recommendationRules;
  const onboardingKey = storage.keys.LEVEL_ONBOARDING_SHOWN;
  const { pageRequirements, questions } = adaptiveCatalog;
  const sessionOverrides = new Set();


  let activeLevelView = 'overview';
  let activeDomainDetail = 'network';
  let balancedDomainIds = ['network', 'operations', 'linux'];


  function evidenceSnapshot() {
    return {
      guidedProgress: storage.getGuidedProgress(),
      journey: storage.readJson(storage.keys.DEEP_JOURNEY, {}),
      incidents: storage.readJson(storage.keys.DEEP_INCIDENTS, []),
      ticketAttempts: storage.readJson(storage.keys.TICKET_ATTEMPTS, []),
      terminal: storage.readJson(storage.keys.DEEP_TERMINAL, {}),
      soc: storage.readJson(storage.keys.DEEP_SOC, []),
      cloud: storage.readJson(storage.keys.DEEP_CLOUD, []),
      architecture: storage.readJson(storage.keys.DEEP_ARCHITECTURE, {}),
      deliverables: storage.getDeliverables(),
      examHistory: storage.readJson(storage.keys.EXAM_HISTORY, []),
      interviewHistory: storage.readJson(storage.keys.INTERVIEW_HISTORY, []),
      englishPractice: storage.readJson(storage.keys.ENGLISH_PRACTICE, {})
    };
  }

  function evidenceLevel(domain) {
    return evidenceRules.evaluateEvidenceLevel(domain, evidenceSnapshot());
  }

  function diagnosticLevels() {
    return storage.getLearnerProfile().levels || {};
  }

  function competency(domain) {
    const diagnosis = Number(diagnosticLevels()[domain] || 0);
    const evidence = evidenceLevel(domain);
    const mastery = storage.getMasteryExams()[domain] || {};
    return progression.evaluateCompetency({ diagnosis, evidence, mastery });
  }

  function showLevelView(view, scroll = true) {
    activeLevelView = view;
    document.querySelectorAll('[data-level-view]').forEach((element) => { element.hidden = element.dataset.levelView !== view; });
    document.body.classList.toggle('level-focus-mode', view === 'mastery' || view === 'diagnostic');
    if (scroll) window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function levelMeaning(level) {
    return [
      'Voce esta formando o vocabulario e o modelo mental desta area.',
      'Voce reconhece os fundamentos e esta pronto para cenarios guiados.',
      'Voce resolve cenarios com orientacao e precisa comprovar pratica real.',
      'Voce passou pelas provas e demonstrou a competencia em uma atividade pratica.'
    ][level];
  }

  function renderDomainDetail(domainId = activeDomainDetail) {
    activeDomainDetail = domainId;
    const domain = domains[domainId];
    const current = competency(domainId);
    const practical = evidenceLevel(domainId);
    const nextAction = current.level < 2
      ? `<button class="primary" type="button" data-start-mastery="${domainId}">Fazer prova N${current.level} para N${current.level + 1}</button>`
      : current.level === 2
        ? `<button class="primary" type="button" data-adaptive-page="${domain.page}">Fazer atividade pratica</button>`
        : `<button class="primary" type="button" data-adaptive-page="${domain.page}">Continuar praticando</button>`;
    document.getElementById('levelDomainDetail').innerHTML = `
      <header>
        <span class="guided-eyebrow">Competencia</span>
        <h2>${domain.title}</h2>
        <p>${domain.next}</p>
      </header>
      <div class="domain-current-level">
        <span>Seu nivel verificado</span>
        <strong>N${current.level}</strong>
        <div><b>${levelLabels[current.level]}</b><p>${levelMeaning(current.level)}</p></div>
      </div>
      <ol class="domain-level-path" aria-label="Caminho de niveis">
        ${levelLabels.map((label, index) => `<li class="${index < current.level ? 'complete' : index === current.level ? 'current' : 'future'}"><span>N${index}</span><div><strong>${label}</strong><small>${index === 0 ? 'Ponto inicial' : index === 1 ? 'Prova de fundamentos' : index === 2 ? 'Prova aplicada' : 'Evidencia pratica'}</small></div></li>`).join('')}
      </ol>
      <div class="domain-next-gate">
        <span class="guided-eyebrow">Para avancar agora</span>
        <h3>${current.level === 0 ? 'Comprove os fundamentos' : current.level === 1 ? 'Resolva cenarios aplicados' : current.level === 2 ? 'Produza uma evidencia real' : 'Mantenha a competencia ativa'}</h3>
        <p>${current.evidence}</p>
        ${nextAction}
      </div>
      <details class="domain-evidence-detail">
        <summary>Como o hub chegou a este nivel</summary>
        <p><strong>Diagnostico:</strong> ${current.diagnosis}/2 acertos de referencia.</p>
        <p><strong>Pratica encontrada:</strong> ${practical[1]}</p>
        <p><strong>Regra:</strong> N1 exige prova basica; N2 exige prova aplicada; N3 exige prova e pratica aprovada.</p>
      </details>`;
  }

  function openDomain(domainId) {
    renderDomainDetail(domainId);
    showLevelView('domain');
  }

  function renderProfile() {
    const entries = Object.entries(domains).map(([id, domain]) => ({ id, domain, ...competency(id) }));
    const total = entries.reduce((sum, item) => sum + item.level, 0);
    const demonstrated = entries.filter((item) => item.level === 3).length;
    const weakest = Math.min(...entries.map((item) => item.level));
    document.getElementById('levelOverview').innerHTML = `
      <div><span>Leitura geral</span><strong>${levelLabels[Math.floor(total / entries.length)]}</strong></div>
      <div><span>Competencias demonstradas</span><strong>${demonstrated} de ${entries.length}</strong></div>
      <div><span>Prioridade atual</span><strong>Nivel ${weakest}</strong></div>`;
    document.getElementById('levelDomainGrid').innerHTML = entries.map((item) => `
      <button class="competency-row" type="button" data-open-domain="${item.id}">
        <span class="competency-name"><strong>${item.domain.title}</strong><small>${levelLabels[item.level]}</small></span>
        <span class="competency-track" aria-label="Nivel ${item.level} de 3">${levelLabels.map((_, index) => `<i class="${index <= item.level ? 'filled' : ''}"></i>`).join('')}</span>
        <span class="level-badge">N${item.level}</span>
        <span class="competency-next">${item.level < 2 ? `Proxima prova: N${item.level + 1}` : item.level === 2 ? 'Falta pratica aprovada' : 'Competencia demonstrada'}</span>
        <span class="competency-arrow" aria-hidden="true">&#8594;</span>
      </button>`).join('');
    renderBalanced(entries);
    renderDomainDetail();
  }

  function renderBalanced(entries) {
    const recommendations = recommendationsRules.rankDomains(entries);
    balancedDomainIds = recommendations.map((item) => item.id);
    const [focus, ...queue] = recommendations;
    document.getElementById('balancedRecommendations').innerHTML = `
      <article class="next-study-focus">
        <div><span>Prioridade atual · N${focus.level}</span><h4>${focus.domain.title}</h4><p>${focus.domain.next}</p></div>
        <button class="primary" type="button" data-open-domain="${focus.id}">Entender o proximo passo</button>
      </article>
      <details class="balanced-queue">
        <summary>Ver as proximas ${queue.length} areas da fila</summary>
        ${queue.map((item, index) => `<button type="button" data-open-domain="${item.id}"><span>${index + 2}</span><strong>${item.domain.title}</strong><small>N${item.level} · ${levelLabels[item.level]}</small></button>`).join('')}
      </details>`;
  }

  function renderSupport(pageId = document.body.dataset.hubPage) {
    const support = document.getElementById('adaptiveSupport');
    const requirement = pageRequirements[pageId];
    document.body.classList.remove('adaptive-content-locked');
    support.hidden = true;
    support.className = 'adaptive-support';
    if (!requirement || pageId === 'level') return;
    const [domainId, required] = requirement;
    const domain = domains[domainId];
    const current = competency(domainId);
    const alwaysFull = storage.getAlwaysShowFullContent();
    const locked = current.level < required && !alwaysFull && !sessionOverrides.has(pageId);
    document.body.dataset.learnerLevel = String(current.level);
    support.hidden = false;
    support.classList.toggle('is-gate', locked);
    support.innerHTML = locked ? `
      <div>
        <span class="guided-eyebrow">Preparacao recomendada · ${domain.title}</span>
        <h2>Essa tela esta um passo acima da sua base atual</h2>
        <p>Seu nivel e <strong>${levelLabels[current.level]}</strong> e esta atividade espera <strong>${levelLabels[required]}</strong>. O conteudo continua aqui, mas primeiro vale aprender estes termos:</p>
        <div class="adaptive-glossary">${domain.glossary.map((item) => `<span>${item}</span>`).join('')}</div>
      </div>
      <div class="adaptive-support-actions">
        <button class="primary" type="button" data-adaptive-page="${domain.prepPage}">${domain.prepLabel}</button>
        <button type="button" data-unlock-page="${pageId}">Abrir conteudo mesmo assim</button>
        <button type="button" data-adaptive-page="level">Ver meu nivel</button>
      </div>` : `
      <div>
        <span class="guided-eyebrow">${domain.title} · Nivel ${current.level}</span>
        <h3>${levelLabels[current.level]}</h3>
        <p>${current.evidence}</p>
      </div>
      <div class="adaptive-support-actions"><button type="button" data-adaptive-page="level">Ver equilibrio das competencias</button></div>`;
    document.body.classList.toggle('adaptive-content-locked', locked);
  }

  let diagnosticIndex = 0;
  let answers = [];

  function renderQuestion() {
    const [domainId, question, options] = questions[diagnosticIndex];
    document.getElementById('diagnosticDomain').textContent = domains[domainId].title;
    document.getElementById('diagnosticPosition').textContent = `${diagnosticIndex + 1} de ${questions.length}`;
    document.getElementById('diagnosticProgress').value = diagnosticIndex + 1;
    document.getElementById('diagnosticQuestion').textContent = question;
    document.getElementById('diagnosticOptions').innerHTML = options.map((option, index) => `
      <label><input type="radio" name="diagnostic-answer" value="${index}" ${answers[diagnosticIndex] === index ? 'checked' : ''}> ${option}</label>`).join('');
    document.getElementById('diagnosticBack').disabled = diagnosticIndex === 0;
    const next = document.getElementById('diagnosticNext');
    next.disabled = answers[diagnosticIndex] == null;
    next.textContent = diagnosticIndex === questions.length - 1 ? 'Concluir diagnostico' : 'Proxima pergunta';
  }

  function finishDiagnostic() {
    const scores = Object.fromEntries(Object.keys(domains).map((domain) => [domain, 0]));
    questions.forEach(([domainId, , , correct], index) => {
      if (answers[index] === correct) scores[domainId] += 1;
    });
    const levels = Object.fromEntries(Object.entries(scores).map(([domain, score]) => [domain, score]));
    storage.setLearnerProfile({ levels, answers, completedAt: new Date().toISOString() });
    storage.writeRaw(onboardingKey, 'true');
    document.getElementById('diagnosticRunner').hidden = true;
    document.getElementById('diagnosticIntro').hidden = false;
    document.getElementById('startDiagnostic').textContent = 'Refazer diagnostico';
    document.getElementById('diagnosticResult').innerHTML = '<strong>Diagnostico salvo</strong><p>Ele ajusta as recomendacoes, mas os niveis sobem somente por provas e evidencias praticas.</p><button class="primary" type="button" data-show-level-overview>Ver Meu nivel atualizado</button>';
    renderProfile();
    renderSupport();
  }

  document.getElementById('startDiagnostic').addEventListener('click', () => {
    diagnosticIndex = 0;
    answers = [];
    document.getElementById('diagnosticIntro').hidden = true;
    document.getElementById('diagnosticRunner').hidden = false;
    document.getElementById('diagnosticResult').textContent = '';
    renderQuestion();
  });
  document.getElementById('diagnosticOptions').addEventListener('change', (event) => {
    answers[diagnosticIndex] = Number(event.target.value);
    document.getElementById('diagnosticNext').disabled = false;
  });
  document.getElementById('diagnosticBack').addEventListener('click', () => {
    if (diagnosticIndex > 0) diagnosticIndex -= 1;
    renderQuestion();
  });
  document.getElementById('diagnosticNext').addEventListener('click', () => {
    if (answers[diagnosticIndex] == null) return;
    if (diagnosticIndex === questions.length - 1) finishDiagnostic();
    else { diagnosticIndex += 1; renderQuestion(); }
  });
  document.getElementById('alwaysShowFullContent').addEventListener('change', (event) => {
    storage.setAlwaysShowFullContent(event.target.checked);
    renderSupport();
  });
  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-show-level-overview]')) showLevelView('overview');
    const domainButton = event.target.closest('[data-open-domain]');
    if (domainButton) openDomain(domainButton.dataset.openDomain);
    const pageButton = event.target.closest('[data-adaptive-page]');
    if (pageButton) navigateToPage(pageButton.dataset.adaptivePage);
    const unlockButton = event.target.closest('[data-unlock-page]');
    if (unlockButton) {
      sessionOverrides.add(unlockButton.dataset.unlockPage);
      renderSupport(unlockButton.dataset.unlockPage);
    }
  });

  document.getElementById('continueLearning').addEventListener('click', () => openDomain(balancedDomainIds[0]));
  document.getElementById('openDiagnostic').addEventListener('click', () => showLevelView('diagnostic'));
  document.getElementById('backToLevelOverview').addEventListener('click', () => showLevelView('overview'));
  document.getElementById('backFromDiagnostic').addEventListener('click', () => showLevelView('overview'));

  eventBus.subscribe(eventBus.events.PAGE_CHANGED, (event) => {
    renderSupport(event.detail.pageId);
    if (event.detail.pageId === 'level') showLevelView('overview', false);
  });
  eventBus.subscribe(eventBus.events.COMPETENCY_CHANGED, () => {
    renderProfile();
    renderSupport();
  });
  window.addEventListener('storage', () => {
    renderProfile();
    renderSupport();
  });

  document.getElementById('alwaysShowFullContent').checked = storage.getAlwaysShowFullContent();
  const profile = storage.getLearnerProfile();
  if (profile.completedAt) document.getElementById('startDiagnostic').textContent = 'Refazer diagnostico';
  renderProfile();
  renderSupport();
  showLevelView('overview', false);
  if (!profile.completedAt && storage.readRaw(onboardingKey, null) !== 'true') {
    storage.writeRaw(onboardingKey, 'true');
    navigateToPage('level', true);
  }

  implementation = {
    competency,
    evidenceLevel,
    renderProfile,
    renderSupport,
    showLevelView,
    openDomain,
    getActiveDomain: () => activeDomainDetail,
    getActiveView: () => activeLevelView
  };
  return adaptiveApi;
}
