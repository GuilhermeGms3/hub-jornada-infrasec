import { storage } from '../../core/storage.js';
import { eventBus } from '../../core/events.js';
import { navigateToPage } from '../../core/navigation.js';
import { examCatalog } from '../../data/exams/catalog.js';
import { assessment } from '../../learning/assessment.js';

export function initializeExams(adaptive) {
  const { sources, banks } = examCatalog;


  const escapeHtml = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
  const domainSelect = document.getElementById('masteryDomain');
  let activeDomain = 'network';
  let activeStage = 'foundation';
  let questionIndex = 0;
  let answers = [];

  domainSelect.innerHTML = Object.entries(adaptive.domains).map(([id, domain]) => `<option value="${id}">${domain.title}</option>`).join('');

  function stageFor(domainId) {
    const level = adaptive.competency(domainId).level;
    return assessment.selectStageForLevel(level);
  }

  function renderStatus() {
    activeDomain = domainSelect.value;
    const competency = adaptive.competency(activeDomain);
    const state = storage.getMasteryExams()[activeDomain] || {};
    const source = sources[activeDomain];
    const next = competency.level === 0 ? 'Prova de fundamentos · meta 75%'
      : competency.level === 1 ? 'Prova aplicada · meta 75%'
        : competency.level === 2 ? 'Falta atividade pratica aprovada para chegar ao N3'
          : 'Nivel maximo verificado; voce pode refazer a prova aplicada';
    document.getElementById('masteryStatus').innerHTML = `
      <strong>N${competency.level} · ${adaptive.levelLabels[competency.level]}</strong>
      <span>${next}</span>
      <small>Melhores notas: base ${state.foundation?.best || 0}% · aplicada ${state.applied?.best || 0}%</small>
      <a href="${source[1]}" ${source[1].startsWith('http') ? 'target="_blank" rel="noopener"' : ''}>${source[0]}</a>`;
    const button = document.getElementById('startMasteryExam');
    button.textContent = competency.level === 2 ? 'Abrir atividade pratica' : competency.level === 3 ? 'Refazer prova aplicada' : 'Iniciar prova atual';
    renderHistory();
  }

  function startExam(domainId = domainSelect.value) {
    domainSelect.value = domainId;
    activeDomain = domainId;
    const competency = adaptive.competency(domainId);
    if (competency.level === 2) {
      navigateToPage(adaptive.domains[domainId].page);
      return;
    }
    activeStage = stageFor(domainId);
    questionIndex = 0;
    answers = [];
    adaptive.showLevelView('mastery');
    document.getElementById('masteryToolbar').hidden = true;
    document.getElementById('masteryRunner').hidden = false;
    document.getElementById('masteryResult').innerHTML = '';
    document.getElementById('masteryHistory').innerHTML = '';
    renderQuestion();
  }

  function renderQuestion() {
    const item = banks[activeDomain][activeStage][questionIndex];
    document.getElementById('masteryStage').textContent = `${adaptive.domains[activeDomain].title} · ${activeStage === 'foundation' ? 'Fundamentos' : 'Aplicacao'}`;
    document.getElementById('masteryPosition').textContent = `${questionIndex + 1} de 4`;
    document.getElementById('masteryProgress').value = questionIndex + 1;
    document.getElementById('masteryQuestion').textContent = item.prompt;
    document.getElementById('masteryOptions').innerHTML = item.options.map((option, index) => `
      <label><input type="radio" name="mastery-answer" value="${index}" ${answers[questionIndex] === index ? 'checked' : ''}> ${escapeHtml(option)}</label>`).join('');
    const next = document.getElementById('masteryNext');
    next.disabled = answers[questionIndex] == null;
    next.textContent = questionIndex === 3 ? 'Corrigir prova' : 'Proxima pergunta';
  }

  function finishExam() {
    const questions = banks[activeDomain][activeStage];
    const { correct, score, passed } = assessment.grade(questions, answers);
    const state = storage.getMasteryExams();
    const domainState = state[activeDomain] || { history: [] };
    state[activeDomain] = assessment.recordAttempt(domainState, activeStage, score, {
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    });
    storage.setMasteryExams(state);
    document.getElementById('masteryRunner').hidden = true;
    document.getElementById('masteryToolbar').hidden = true;
    const currentLevelAfter = adaptive.competency(activeDomain).level;
    document.getElementById('masteryResult').innerHTML = `
      <div class="result-hero ${passed ? 'pass' : 'fail'}">
        <span>${passed ? 'Etapa concluida' : 'Revisao necessaria'}</span>
        <strong>${score}%</strong>
        <div><h2>${passed ? 'Nivel liberado' : 'Ainda nao passou'}</h2><p>${correct}/4 respostas corretas. A meta e 75%.</p></div>
      </div>
      <div class="result-next-action">
        <div><span class="guided-eyebrow">O que fazer agora</span><h3>${passed ? (currentLevelAfter === 2 ? 'Prepare a atividade pratica' : 'Continue para a proxima prova') : 'Revise somente os pontos abaixo'}</h3><p>${passed ? 'Seu progresso foi salvo. O proximo requisito ja esta disponivel.' : 'Leia as justificativas, volte ao resumo da competencia e tente novamente quando conseguir explicar os conceitos.'}</p></div>
        <button class="primary" type="button" id="masteryResultPrimary">${passed ? (currentLevelAfter === 2 ? 'Ver requisito pratico' : 'Fazer proxima prova') : 'Voltar para a competencia'}</button>
      </div>
      <div class="result-corrections-head"><h3>Correcao comentada</h3><p>Erros ficam abertos. Acertos permanecem recolhidos para reduzir ruido.</p></div>
      <div class="mastery-corrections">${questions.map((item, index) => {
        const isCorrect = answers[index] === item.correct;
        return `<details class="${isCorrect ? 'correct' : 'wrong'}" ${isCorrect ? '' : 'open'}><summary><span>${index + 1}</span><strong>${isCorrect ? 'Resposta correta' : 'Precisa revisar'}</strong><small>${escapeHtml(item.prompt)}</small></summary><div><p><b>Resposta:</b> ${escapeHtml(item.options[item.correct])}</p><p>${escapeHtml(item.explanation)}</p></div></details>`;
      }).join('')}</div>`;
    eventBus.publish(eventBus.events.COMPETENCY_CHANGED);
    renderStatus();
    document.getElementById('masteryResultPrimary').addEventListener('click', () => {
      const current = adaptive.competency(activeDomain);
      if (!passed) adaptive.openDomain(activeDomain);
      else if (current.level === 1) startExam(activeDomain);
      else adaptive.openDomain(activeDomain);
    });
  }

  function renderHistory() {
    const history = storage.getMasteryExams()[activeDomain]?.history || [];
    document.getElementById('masteryHistory').innerHTML = history.length ? `
      <details><summary>Historico de tentativas</summary>
      <div>${history.slice(0, 5).map((attempt) => `<span><strong>${attempt.score}%</strong> ${attempt.stage === 'foundation' ? 'Fundamentos' : 'Aplicacao'} · ${attempt.passed ? 'aprovado' : 'revisar'}</span>`).join('')}</div></details>` : '';
  }

  domainSelect.addEventListener('change', renderStatus);
  document.getElementById('startMasteryExam').addEventListener('click', () => startExam());
  document.getElementById('masteryOptions').addEventListener('change', (event) => {
    answers[questionIndex] = Number(event.target.value);
    document.getElementById('masteryNext').disabled = false;
  });
  document.getElementById('masteryNext').addEventListener('click', () => {
    if (answers[questionIndex] == null) return;
    if (questionIndex === 3) finishExam();
    else { questionIndex += 1; renderQuestion(); }
  });
  document.getElementById('masteryQuit').addEventListener('click', () => {
    document.getElementById('masteryRunner').hidden = true;
    document.getElementById('masteryToolbar').hidden = false;
    adaptive.openDomain(activeDomain);
  });
  document.getElementById('backFromMastery').addEventListener('click', () => adaptive.openDomain(activeDomain));
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-start-mastery]');
    if (!button) return;
    document.getElementById('masteryDomain').value = button.dataset.startMastery;
    startExam(button.dataset.startMastery);
  });
  eventBus.subscribe(eventBus.events.COMPETENCY_CHANGED, renderStatus);
  renderStatus();
}
