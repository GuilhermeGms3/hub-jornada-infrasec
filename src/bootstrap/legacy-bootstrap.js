import { storage } from '../core/storage.js';
import { legacyCatalog } from '../data/legacy/catalog.js';

const { weeks, treeNodes, templates, certRecommendations, weekShelf } = legacyCatalog;



const weekSelect = document.getElementById('weekSelect');
const weekTitle = document.getElementById('weekTitle');
const weekSummary = document.getElementById('weekSummary');
const todayText = document.getElementById('todayText');
const deliverableText = document.getElementById('deliverableText');
const toolTags = document.getElementById('toolTags');
const taskList = document.getElementById('taskList');
const labFrame = document.getElementById('labFrame');
const progressKey = 'infrasec-task-progress';
const progressState = JSON.parse(localStorage.getItem(progressKey) || '{}');

weeks.forEach((week, index) => {
  const option = document.createElement('option');
  option.value = index;
  option.textContent = `Semana ${week.title}`;
  weekSelect.appendChild(option);
});

function openAction(target) {
  if (target.startsWith('template:')) {
    loadTemplate(target.replace('template:', ''));
    location.hash = '#templates';
    return;
  }
  if (target.startsWith('#')) {
    location.hash = target;
    return;
  }
  labFrame.src = target;
  location.hash = '#laboratorio';
}

function renderWeek(index) {
  const week = weeks[index];
  weekTitle.textContent = week.title;
  weekSummary.textContent = week.summary;
  todayText.textContent = week.today;
  deliverableText.textContent = week.deliverable;
  toolTags.innerHTML = week.tools.map((tool) => `<span class="tag">${tool}</span>`).join('');
  taskList.innerHTML = week.tasks.map((task, taskIndex) => `
    <article class="task">
      <span class="num">${taskIndex + 1}</span>
      <div>
        <h4>${task[0]}</h4>
        <p>${task[1]}</p>
        <div class="task-actions">
          ${task[2].map((action) => `<button data-action="${action[1]}">${action[0]}</button>`).join('')}
        </div>
        <div class="progress-row" role="radiogroup" aria-label="Progresso da tarefa ${taskIndex + 1}">
          ${['feito', 'revisar', 'nao-entendi'].map((status) => `
            <label class="progress-option">
              <input type="radio" name="progress-${index}-${taskIndex}" value="${status}" data-progress="${index}-${taskIndex}" ${progressState[`${index}-${taskIndex}`] === status ? 'checked' : ''}>
              ${status === 'nao-entendi' ? 'nao entendi' : status}
            </label>
          `).join('')}
        </div>
      </div>
    </article>
  `).join('');
  document.querySelectorAll('[data-action]').forEach((button) => {
    button.addEventListener('click', () => openAction(button.dataset.action));
  });
  document.querySelectorAll('[data-progress]').forEach((input) => {
    input.addEventListener('change', () => {
      progressState[input.dataset.progress] = input.value;
      localStorage.setItem(progressKey, JSON.stringify(progressState));
      renderProgressSummary();
    });
  });
  renderProgressSummary();
  storage.setCurrentWeek(index);
}

function renderProgressSummary() {
  let summary = document.getElementById('progressSummary');
  if (!summary) {
    summary = document.createElement('div');
    summary.id = 'progressSummary';
    summary.className = 'progress-summary';
    taskList.after(summary);
  }
  const currentWeek = Number(weekSelect.value);
  const values = weeks[currentWeek].tasks.map((_, taskIndex) => progressState[`${currentWeek}-${taskIndex}`]);
  const done = values.filter((value) => value === 'feito').length;
  const review = values.filter((value) => value === 'revisar').length;
  const stuck = values.filter((value) => value === 'nao-entendi').length;
  summary.textContent = `Progresso da semana: ${done} feito(s), ${review} para revisar, ${stuck} nao entendido(s).`;
}

weekSelect.addEventListener('change', () => renderWeek(Number(weekSelect.value)));
const savedWeek = Number(storage.getCurrentWeek('0'));
weekSelect.value = Number.isFinite(savedWeek) ? savedWeek : 0;
renderWeek(Number(weekSelect.value));

const tree = document.getElementById('tree');
const nodeName = document.getElementById('nodeName');
const nodeDescription = document.getElementById('nodeDescription');
const nodeTools = document.getElementById('nodeTools');
const nodeUnlocks = document.getElementById('nodeUnlocks');

tree.innerHTML = treeNodes.map((node, index) => `
  <article class="node ${index > 1 ? 'locked' : ''}" data-node="${index}">
    <span class="badge">${index + 1}</span>
    <h4>${node[0]}</h4>
    <p>${node[1]}</p>
    <ul>${node[2].map((item) => `<li>${item}</li>`).join('')}</ul>
  </article>
`).join('');

function renderNode(index) {
  const node = treeNodes[index];
  document.querySelectorAll('.node').forEach((item) => item.classList.remove('active'));
  document.querySelector(`[data-node="${index}"]`).classList.add('active');
  nodeName.textContent = node[0];
  nodeDescription.textContent = node[1];
  nodeTools.innerHTML = node[2].map((item) => `<span class="tag">${item}</span>`).join('');
  nodeUnlocks.textContent = node[3];
}

document.querySelectorAll('.node').forEach((item) => {
  item.addEventListener('click', () => renderNode(Number(item.dataset.node)));
});
renderNode(0);

const templateText = document.getElementById('templateText');
const copyStatus = document.getElementById('copyStatus');

function loadTemplate(name) {
  templateText.value = templates[name];
  copyStatus.textContent = 'Modelo carregado.';
}

document.querySelectorAll('[data-template]').forEach((button) => {
  button.addEventListener('click', () => loadTemplate(button.dataset.template));
});
loadTemplate('readme');

document.getElementById('copyTemplate').addEventListener('click', async () => {
  await navigator.clipboard.writeText(templateText.value);
  copyStatus.textContent = 'Copiado.';
});

document.getElementById('downloadTemplate').addEventListener('click', () => {
  const blob = new Blob([templateText.value], { type: 'text/markdown;charset=utf-8' });
  const link = document.createElement('a');
  const title = templateText.value.split('\n')[0].replace(/^#\s*/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'entregavel';
  link.href = URL.createObjectURL(blob);
  link.download = `${title}.md`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
  copyStatus.textContent = 'Arquivo .md baixado.';
});


function renderCertDecision() {
  const selected = document.querySelector('input[name="careerGoal"]:checked').value;
  const [first, second] = certRecommendations[selected];
  document.getElementById('certDecision').innerHTML = `<strong>${first}</strong><p>${second}</p>`;
}

document.querySelectorAll('input[name="careerGoal"]').forEach((input) => {
  input.addEventListener('change', renderCertDecision);
});
renderCertDecision();

const kindleWeek = document.getElementById('kindleWeek');
const kindleFormat = document.getElementById('kindleFormat');
const kindleCommand = document.getElementById('kindleCommand');
const kindleStatus = document.getElementById('kindleStatus');

function renderWeekShelf() {
  const weekIndex = Number(kindleWeek.value) - 1;
  const [primaryBook, secondaryBook] = weekShelf[weekIndex];
  const notesBase = 'projetos/CCNA_Course_Notes/Course_Notes/';
  document.getElementById('weekBookPrimary').href = notesBase + primaryBook[1];
  document.getElementById('weekBookPrimaryTitle').innerHTML = `Semana ${weekIndex + 1}<br>${primaryBook[0]}`;
  document.getElementById('weekBookSecondary').href = notesBase + secondaryBook[1];
  document.getElementById('weekBookSecondaryTitle').innerHTML = `Semana ${weekIndex + 1}<br>${secondaryBook[0]}`;
}

function renderKindleCommand() {
  kindleCommand.textContent = `.\\scripts\\preparar-kindle.ps1 -Week ${kindleWeek.value} -Format ${kindleFormat.value}`;
  renderWeekShelf();
}

kindleWeek.addEventListener('change', renderKindleCommand);
kindleFormat.addEventListener('change', renderKindleCommand);
weekSelect.addEventListener('change', () => {
  kindleWeek.value = String(Number(weekSelect.value) + 1);
  renderKindleCommand();
});
kindleWeek.value = String(Number(weekSelect.value) + 1);
document.getElementById('copyKindleCommand').addEventListener('click', async () => {
  await navigator.clipboard.writeText(kindleCommand.textContent);
  kindleStatus.textContent = 'Comando copiado. Execute no PowerShell aberto na pasta do projeto.';
});
renderKindleCommand();

document.querySelectorAll('[data-library-filter]').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-library-filter]').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    const filter = button.dataset.libraryFilter;
    document.querySelectorAll('[data-library]').forEach((card) => {
      const visible = filter === 'all' || card.dataset.library.split(' ').includes(filter);
      card.style.display = visible ? 'grid' : 'none';
    });
  });
});

document.querySelectorAll('[data-open]').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-open]').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    labFrame.src = button.dataset.open;
  });
});

export { weeks, weekSelect, loadTemplate };
