import { storage } from '../../core/storage.js';
import { eventBus } from '../../core/events.js';
import { createId, downloadFile, escapeHtml, formatDate } from '../../core/presentation.js';
import { careerCatalog } from '../../data/career/catalog.js';

export function initializeCareerDevelopment({
  weekSelect,
  getCurrentWeekNumber,
  getHighestStudiedWeek,
  onProgressChanged
}) {
  const { examTopics, readingStatuses, initialReadingQueue, interviewQuestions, interviewRubrics, englishWeeks } = careerCatalog;
  let examHistory = storage.readJson(storage.keys.EXAM_HISTORY, []);
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
    storage.writeJson(storage.keys.EXAM_HISTORY, examHistory);
    event.target.reset();
    renderExamHistory();
    onProgressChanged();
  });

  document.getElementById('examHistoryList').addEventListener('click', (event) => {
    const button = event.target.closest('[data-exam-delete]');
    if (!button || !window.confirm('Remover este resultado do historico?')) return;
    examHistory = examHistory.filter((item) => item.id !== button.dataset.examDelete);
    storage.writeJson(storage.keys.EXAM_HISTORY, examHistory);
    renderExamHistory();
    onProgressChanged();
  });

  document.getElementById('weakTopic').addEventListener('click', (event) => {
    const button = event.target.closest('[data-review-week]');
    if (!button) return;
    weekSelect.value = String(Number(button.dataset.reviewWeek) - 1);
    weekSelect.dispatchEvent(new Event('change'));
    location.hash = '#jornada';
  });
  renderExamHistory();

  let readingQueue = storage.readJson(storage.keys.READING_QUEUE, initialReadingQueue);

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
    storage.writeJson(storage.keys.READING_QUEUE, readingQueue);
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
    storage.writeJson(storage.keys.READING_QUEUE, readingQueue);
    renderReadingQueue();
  });

  document.getElementById('readingQueue').addEventListener('click', (event) => {
    const button = event.target.closest('[data-reading-delete]');
    if (!button || !window.confirm('Remover este item da fila de leitura?')) return;
    readingQueue = readingQueue.filter((item) => item.id !== button.dataset.readingDelete);
    storage.writeJson(storage.keys.READING_QUEUE, readingQueue);
    renderReadingQueue();
  });
  ensureWeekReading(getCurrentWeekNumber());
  renderReadingQueue();

  let interviewHistory = storage.readJson(storage.keys.INTERVIEW_HISTORY, []);
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
    storage.writeJson(storage.keys.INTERVIEW_HISTORY, interviewHistory);
    document.getElementById('interviewStatus').textContent = `Pratica salva com ${currentInterviewScore}%. A proxima pergunta continuara respeitando o conteudo estudado.`;
    onProgressChanged();
  });
  nextInterviewQuestion();

  let englishPractice = storage.readJson(storage.keys.ENGLISH_PRACTICE, {});

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
    storage.writeJson(storage.keys.ENGLISH_PRACTICE, englishPractice);
    eventBus.publish(eventBus.events.COMPETENCY_CHANGED);
    document.getElementById('englishInterviewSample').innerHTML = `
      <strong>Avaliacao: ${score}%</strong>
      <p>Termos usados: ${usedTerms.length}/${requiredTerms.length}. Secoes de ticket preenchidas: ${completedSections.length}/${ticketSections.length}. Meta: 80%.</p>
      ${usedTerms.length < requiredTerms.length ? `<p><strong>Pratique:</strong> ${requiredTerms.filter((term) => !usedTerms.includes(term)).map(escapeHtml).join(', ')}.</p>` : ''}
      <strong>Resposta de referencia</strong>
      <p>${englishWeeks[weekNumber - 1].sample}</p>
      <p>Sua pratica foi salva neste navegador.</p>
    `;
  });


  return Object.freeze({
    ensureWeekReading,
    renderReadingQueue,
    nextInterviewQuestion,
    renderEnglishWeek,
    getExamHistory: () => examHistory,
    getInterviewHistory: () => interviewHistory
  });
}
