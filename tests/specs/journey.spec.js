const { test, expect } = require('@playwright/test');
const { fixture } = require('../fixtures/storage-fixtures');
const { openWithStorage, readJson } = require('../helpers/app');

const evidence = 'Executei os passos, registrei os resultados observados e expliquei com minhas palavras o que cada teste comprova.';

function readySession() {
  return {
    steps: { 0: { state: 'done' }, 1: { state: 'done' }, 2: { state: 'done' } },
    evidence,
    evidenceSaved: true
  };
}

async function checkCurrentCriteria(page) {
  for (const checkbox of await page.locator('[data-today-step-check]').all()) await checkbox.check();
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { window.open = () => null; });
});

test('missao percorre not-started, doing e blocked sem permitir conclusao vazia', async ({ page }) => {
  await openWithStorage(page, fixture(), '#hoje');
  expect((await readJson(page, 'infrasec-guided-progress'))['0-0']).toBeUndefined();
  await expect(page.locator('#nextMission')).toBeDisabled();

  await page.locator('#todayPrimaryAction').click();
  expect((await readJson(page, 'infrasec-guided-progress'))['0-0']).toBe('doing');
  await expect(page.locator('#todayFeedback')).toContainText('Sessao iniciada');

  await page.locator('#blockedToday').click();
  expect((await readJson(page, 'infrasec-guided-progress'))['0-0']).toBe('blocked');
  await expect(page.locator('#todayFeedback')).toContainText('Pare aqui');

  await expect(page.locator('#completeToday')).toBeDisabled();
  expect((await readJson(page, 'infrasec-guided-progress'))['0-0']).toBe('blocked');
});

test('tres passos validados e evidencia liberam a conclusao do dia', async ({ page }) => {
  await openWithStorage(page, fixture(), '#hoje');
  for (let index = 0; index < 3; index += 1) {
    await page.locator(`[data-today-step="${index}"]`).click();
    await page.locator('#todayStepResponse').fill(`Neste passo ${index + 1}, aprendi a seguir a requisicao e consigo explicar qual evidencia confirma a conclusao sem confundir fato com hipotese.`);
    await checkCurrentCriteria(page);
    await page.locator('#validateTodayStep').click();
    await expect(page.locator(`[data-today-step="${index}"] small`)).toContainText('Feito');
  }
  await expect(page.locator('#completeToday')).toBeDisabled();
  await page.locator('#todayMissionEvidenceInput').fill(evidence);
  await page.locator('#saveTodayEvidence').click();
  await expect(page.locator('#todayEvidenceStatus')).toContainText('Evidencia salva');
  await expect(page.locator('#completeToday')).toBeEnabled();
  await page.locator('#completeToday').click();
  expect((await readJson(page, 'infrasec-guided-progress'))['0-0']).toBe('done');
  await expect(page.locator('#nextMission')).toBeEnabled();
});

test('cada passo da semana 1 abre um exercicio proprio', async ({ page }) => {
  await openWithStorage(page, fixture(), '#hoje');
  await expect(page.locator('[data-today-step]')).toHaveCount(3);
  await expect(page.locator('[data-today-step="0"]')).toHaveAttribute('aria-current', 'step');
  await expect(page.locator('#todayStepTitle')).toContainText('Ler o caminho');
  await expect(page.locator('#todayStepOutputGroup')).toBeHidden();

  await page.locator('[data-today-step="1"]').click();
  await expect(page.locator('[data-today-step="1"]')).toHaveAttribute('aria-current', 'step');
  await expect(page.locator('#todayStepTitle')).toContainText('Desenhar a requisicao');
  await expect(page.locator('#todayPrimaryAction')).toContainText('Abrir bancada');

  await page.locator('#todayPrimaryAction').click();
  await expect(page.locator('[data-unlock-page="network-practice"]')).toBeVisible();
  await page.locator('[data-unlock-page="network-practice"]').click();
  await expect(page.locator('#academia-pratica')).toBeVisible();
  await expect(page.locator('#deepJourneySelect')).toHaveValue('w1');
  expect((await readJson(page, 'infrasec-guided-progress'))['0-0']).toBe('doing');
});

test('passo de comando mostra roteiro copiavel sem executar o computador', async ({ page }) => {
  await openWithStorage(page, fixture(), '#hoje');
  await page.locator('#guidedDaySelect').selectOption('1');
  await expect(page.locator('#todayStepCommandBlock')).toBeVisible();
  await expect(page.locator('#todayStepCommands')).toContainText('ipconfig /all');
  await expect(page.locator('#todayStepActionNote')).toContainText('navegador nao executa comandos');
});

test('as 12 semanas possuem 252 passos estruturados e acionaveis', async ({ page }) => {
  await openWithStorage(page, fixture(), '#hoje');
  const result = await page.evaluate(async () => {
    const { journeyCatalog } = await import('/src/data/journey/catalog.js');
    const steps = journeyCatalog.guidedWeeks.flatMap((week) => week.days.flatMap((day) => day.steps));
    return {
      total: steps.length,
      invalid: steps.filter((item) => typeof item !== 'object'
        || !item.title || !item.kind || !item.instruction || !item.action || !item.target
        || !Array.isArray(item.checks) || item.checks.length < 2).length
    };
  });
  expect(result).toEqual({ total: 252, invalid: 0 });
});

for (let weekIndex = 0; weekIndex < 12; weekIndex += 1) {
  test(`semana ${weekIndex + 1} renderiza os sete dias e todos os passos verificaveis`, async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await openWithStorage(page, fixture({ 'infrasec-always-show-full-content': 'true' }), '#hoje');
    await page.locator('#guidedWeekSelect').selectOption(String(weekIndex));
    const expectedDays = await page.evaluate(async (selectedWeek) => {
      const { journeyCatalog } = await import('/src/data/journey/catalog.js');
      return journeyCatalog.guidedWeeks[selectedWeek].days.map((day) => ({
        title: day.title,
        steps: day.steps.map((step) => ({
          title: step.title,
          completion: step.completion,
          requiresOutput: step.requiresOutput
        }))
      }));
    }, weekIndex);

    for (let dayIndex = 0; dayIndex < expectedDays.length; dayIndex += 1) {
      await page.locator('#guidedDaySelect').selectOption(String(dayIndex));
      await expect(page.locator('#todayMissionNumber')).toContainText(`Missao ${dayIndex + 1} de 7`);
      await expect(page.locator('#todayMissionTitle')).toHaveText(expectedDays[dayIndex].title);
      await expect(page.locator('[data-today-step]')).toHaveCount(3);

      for (let stepIndex = 0; stepIndex < 3; stepIndex += 1) {
        const expectedStep = expectedDays[dayIndex].steps[stepIndex];
        await page.locator(`[data-today-step="${stepIndex}"]`).click();
        await expect(page.locator('#todayStepTitle')).toHaveText(expectedStep.title);
        await expect(page.locator('#todayStepQuestion')).not.toBeEmpty();
        if (expectedStep.completion === 'manual') {
          await expect(page.locator('#todayStepValidation')).toBeVisible();
          await expect(page.locator('#todayStepOutputGroup'))[expectedStep.requiresOutput ? 'toBeVisible' : 'toBeHidden']();
        } else {
          await expect(page.locator('#todayStepValidation')).toBeHidden();
          await expect(page.locator('#todayLinkedActivityStatus')).toBeVisible();
        }
      }
    }
    expect(pageErrors).toEqual([]);
  });
}

test('Packet Tracer exige output alem da explicacao e do checklist', async ({ page }) => {
  await openWithStorage(page, fixture({ 'infrasec-always-show-full-content': 'true' }), '#hoje');
  await page.locator('#guidedWeekSelect').selectOption('2');
  await page.locator('#guidedDaySelect').selectOption('1');
  await page.locator('[data-today-step="2"]').click();
  await page.locator('#todayStepResponse').fill('A VLAN aparece na tabela do switch e este resultado confirma a associacao da porta, mas ainda preciso validar o caminho completo com ping.');
  await checkCurrentCriteria(page);
  await page.locator('#validateTodayStep').click();
  await expect(page.locator('#todayStepValidationFeedback')).toContainText('Cole pelo menos 40 caracteres');
  await page.locator('#todayStepOutput').fill('SW1# show vlan brief\nFa0/1 active VLAN 10 USERS\nPing entre os hosts: sucesso, 0% de perda.');
  await page.locator('#validateTodayStep').click();
  await expect(page.locator('[data-today-step="2"] small')).toContainText('Feito');
});

test('nota de incidente e quiz entram como execucao verificada e pedem interpretacao', async ({ page }) => {
  await openWithStorage(page, fixture({
    'infrasec-always-show-full-content': 'true',
    'infrasec-deep-incidents': [{ id: 'hd-dhcp', score: 88, passed: true, createdAt: '2026-09-15T10:00:00.000Z' }],
    ccna1_hub_stats: { lastQuizPct: 80, lastQuizDate: '2026-09-15T11:00:00.000Z' }
  }), '#hoje');
  await page.locator('#guidedDaySelect').selectOption('3');
  await expect(page.locator('.today-steps .step-verified')).toHaveCount(3);
  await expect(page.locator('#todayLinkedActivityStatus')).toContainText('88%');
  await expect(page.locator('#todayStepValidation')).toBeVisible();

  await page.locator('#guidedWeekSelect').selectOption('2');
  await page.locator('#guidedDaySelect').selectOption('4');
  await expect(page.locator('.today-steps .step-verified')).toHaveCount(1);
  await expect(page.locator('#todayMissionSteps')).toContainText('80%');
});

test('terminal aprovado importa a nota mas exige output e interpretacao por passo', async ({ page }) => {
  await openWithStorage(page, fixture({
    'infrasec-always-show-full-content': 'true',
    'infrasec-deep-terminal': { 'linux-files': { score: 100, passed: true, updatedAt: '2026-09-15T12:00:00.000Z' } }
  }), '#hoje');
  await page.locator('#guidedWeekSelect').selectOption('6');
  await expect(page.locator('.today-steps .step-verified')).toHaveCount(3);
  await expect(page.locator('#todayLinkedActivityStatus')).toContainText('100%');
  await expect(page.locator('#todayStepQuestion')).toContainText('saida');
  await expect(page.locator('#todayStepOutputGroup')).toBeVisible();
  await expect(page.locator('#completeToday')).toBeDisabled();
});

test('todas as semanas apresentam sabado de consolidacao e domingo de revisao', async ({ page }) => {
  await openWithStorage(page, fixture(), '#hoje');
  await expect(page.locator('#guidedDaySelect option')).toHaveCount(7);
  await expect(page.locator('#guidedDaySelect option').nth(5)).toContainText('Sabado');
  await expect(page.locator('#guidedDaySelect option').nth(6)).toContainText('Domingo');
  await page.locator('#guidedDaySelect').selectOption('5');
  await expect(page.locator('#todayMissionTitle')).toContainText('LAN no Packet Tracer');
  await page.locator('#guidedDaySelect').selectOption('6');
  await expect(page.locator('#todayMissionObjective')).toContainText('Fechar lacunas');
});

test('sessao pronta persistida continua apta a concluir depois do reload', async ({ page }) => {
  await openWithStorage(page, fixture({ 'infrasec-guided-sessions': { '0-0': readySession() } }), '#hoje');
  await expect(page.locator('#completeToday')).toBeEnabled();
  await page.reload();
  await expect(page.locator('#completeToday')).toBeEnabled();
});

test('passos posteriores abrem ferramentas e comandos coerentes com a semana', async ({ page }) => {
  await openWithStorage(page, fixture({ 'infrasec-always-show-full': 'true' }), '#hoje');

  await page.locator('#guidedWeekSelect').selectOption('2');
  await page.locator('#guidedDaySelect').selectOption('1');
  await page.locator('[data-today-step="2"]').click();
  await expect(page.locator('#todayStepKind')).toContainText('Packet Tracer');
  await expect(page.locator('#todayStepCommands')).toContainText('show vlan brief');
  await expect(page.locator('#todayStepEnvironment')).toContainText('Cisco Packet Tracer');
  await expect(page.locator('#todayPrimaryAction')).toContainText('lab .pkt');
  await expect(page.locator('#todayStepActionNote')).toContainText('Cisco Packet Tracer instalado');

  await page.locator('#guidedWeekSelect').selectOption('6');
  await page.locator('#guidedDaySelect').selectOption('2');
  await page.locator('[data-today-step="1"]').click();
  await expect(page.locator('#todayStepKind')).toContainText('Terminal guiado');
  await expect(page.locator('#todayStepCommands')).toContainText('systemctl status');
  await expect(page.locator('#todayStepEnvironment')).toContainText('Linux, WSL ou VM');

  await page.locator('#guidedWeekSelect').selectOption('10');
  await page.locator('#guidedDaySelect').selectOption('1');
  await page.locator('[data-today-step="0"]').click();
  await expect(page.locator('#todayStepKind')).toContainText('Lab cloud');
  await page.locator('#todayPrimaryAction').click();
  await expect(page.locator('#deepCloudSelect')).toHaveValue('aws-vpc');
});

test('proxima missao avanca e selecao atual sobrevive ao reload', async ({ page }) => {
  await openWithStorage(page, fixture({
    'infrasec-guided-progress': { '0-0': 'done' },
    'infrasec-guided-current-day': { 0: 0 }
  }), '#hoje');
  await page.locator('#nextMission').click();
  await expect(page.locator('#guidedDaySelect')).toHaveValue('1');
  expect((await readJson(page, 'infrasec-guided-current-day'))['0']).toBe(1);
  await page.reload();
  await expect(page.locator('#guidedDaySelect')).toHaveValue('1');
});

test('primeira missao nao concluida e aberta automaticamente', async ({ page }) => {
  await openWithStorage(page, fixture({ 'infrasec-guided-progress': { '0-0': 'done', '0-1': 'done' } }), '#hoje');
  await expect(page.locator('#guidedDaySelect')).toHaveValue('2');
});

test('semanas continuam navegaveis e sincronizam o controle legado', async ({ page }) => {
  await openWithStorage(page, fixture(), '#jornada');
  await page.locator('[data-guided-week="4"]').click();
  await expect(page.locator('#guidedWeekSelect')).toHaveValue('4');
  await expect(page.locator('#weekSelect')).toHaveValue('4');
  expect(await page.evaluate(() => localStorage.getItem('infrasec-current-week'))).toBe('4');
});

test('progresso legado e guiado coexistem sem fusao depois de reload', async ({ page }) => {
  const profile = fixture({
    'infrasec-task-progress': { '0-0': 'feito', '0-1': 'nao-entendi' },
    'infrasec-guided-progress': { '0-0': 'blocked', '0-1': 'done' },
    'infrasec-guided-current-day': { 0: 0 }
  });
  await openWithStorage(page, profile, '#hoje');
  await page.reload();
  expect(await readJson(page, 'infrasec-task-progress')).toEqual({ '0-0': 'feito', '0-1': 'nao-entendi' });
  expect(await readJson(page, 'infrasec-guided-progress')).toEqual({ '0-0': 'blocked', '0-1': 'done' });
  await expect(page.locator('#todayFeedback')).toContainText('Pare aqui');
});
