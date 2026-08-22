const { test, expect } = require('@playwright/test');
const { fixture } = require('../fixtures/storage-fixtures');
const { openWithStorage, readJson, answerCurrentExam } = require('../helpers/app');

const foundationCorrect = [1, 0, 1, 1];
const appliedCorrect = [0, 0, 0, 1];

async function startNetworkExam(page) {
  await page.evaluate(() => window.InfraSecAdaptive.openDomain('network'));
  await page.locator('[data-start-mastery="network"]').click();
}

async function repeatAppliedFromMastery(page) {
  await page.evaluate(() => window.InfraSecAdaptive.showLevelView('mastery'));
  await page.locator('#masteryDomain').selectOption('network');
  await page.locator('#startMasteryExam').click();
}

test('foundation abaixo de 75% reprova e nao libera N1', async ({ page }) => {
  await openWithStorage(page, fixture(), '#meu-nivel');
  await startNetworkExam(page);
  await answerCurrentExam(page, [1, 0, 0, 0]);
  await expect(page.locator('#masteryResult')).toContainText('50%');
  expect(await page.evaluate(() => window.InfraSecAdaptive.competency('network').level)).toBe(0);
});

test('foundation em exatamente 75% aprova e abre aplicada como proxima etapa', async ({ page }) => {
  await openWithStorage(page, fixture(), '#meu-nivel');
  await startNetworkExam(page);
  await answerCurrentExam(page, [1, 0, 1, 0]);
  expect(await page.evaluate(() => window.InfraSecAdaptive.competency('network').level)).toBe(1);
  await page.locator('#masteryResultPrimary').click();
  await expect(page.locator('#masteryStage')).toContainText('Aplicacao');
});

test('foundation acima de 75% aprova', async ({ page }) => {
  await openWithStorage(page, fixture(), '#meu-nivel');
  await startNetworkExam(page);
  await answerCurrentExam(page, foundationCorrect);
  await expect(page.locator('#masteryResult')).toContainText('100%');
  expect(await page.evaluate(() => window.InfraSecAdaptive.competency('network').level)).toBe(1);
});

test('aplicada reprova abaixo de 75% e aprova em 75%', async ({ page }) => {
  const profile = fixture({
    'infrasec-mastery-exams': { network: { foundation: { passed: true, best: 75, attempts: 1 }, history: [] } }
  });
  await openWithStorage(page, profile, '#meu-nivel');
  await repeatAppliedFromMastery(page);
  await answerCurrentExam(page, [0, 0, 1, 0]);
  expect(await page.evaluate(() => window.InfraSecAdaptive.competency('network').level)).toBe(1);
  await page.evaluate(() => window.InfraSecAdaptive.openDomain('network'));
  await page.locator('[data-start-mastery="network"]').click();
  await answerCurrentExam(page, [0, 0, 0, 0]);
  expect(await page.evaluate(() => window.InfraSecAdaptive.competency('network').level)).toBe(2);
});

test('aprovacao cumulativa e melhor nota sobrevivem a uma tentativa posterior pior', async ({ page }) => {
  const history = [{ stage: 'applied', score: 100, passed: true, createdAt: '2026-01-01T00:00:00.000Z' }];
  const profile = fixture({
    'infrasec-mastery-exams': { network: {
      foundation: { passed: true, best: 100, attempts: 1 },
      applied: { passed: true, best: 100, attempts: 1 },
      history
    } },
    'infrasec-deep-journey': { w1: { score: 80, passed: true } }
  });
  await openWithStorage(page, profile, '#meu-nivel');
  await repeatAppliedFromMastery(page);
  await answerCurrentExam(page, [0, 0, 1, 0]);
  const state = (await readJson(page, 'infrasec-mastery-exams')).network.applied;
  expect(state).toMatchObject({ passed: true, best: 100, attempts: 2 });
  expect(await page.evaluate(() => window.InfraSecAdaptive.competency('network').level)).toBe(3);
});

test('historico de prova permanece limitado a 20 tentativas por dominio', async ({ page }) => {
  const history = Array.from({ length: 20 }, (_, index) => ({ stage: 'applied', score: 75, passed: true, createdAt: `2026-01-${String(index + 1).padStart(2, '0')}T00:00:00.000Z` }));
  const profile = fixture({
    'infrasec-mastery-exams': { network: {
      foundation: { passed: true, best: 75, attempts: 1 },
      applied: { passed: true, best: 75, attempts: 20 },
      history
    } },
    'infrasec-deep-journey': { w1: { score: 80, passed: true } }
  });
  await openWithStorage(page, profile, '#meu-nivel');
  await repeatAppliedFromMastery(page);
  await answerCurrentExam(page, appliedCorrect);
  const saved = await readJson(page, 'infrasec-mastery-exams');
  expect(saved.network.history).toHaveLength(20);
  expect(saved.network.applied.attempts).toBe(21);
});

test('prova e nivel persistem depois de reload', async ({ page }) => {
  await openWithStorage(page, fixture(), '#meu-nivel');
  await startNetworkExam(page);
  await answerCurrentExam(page, [1, 0, 1, 0]);
  const before = await readJson(page, 'infrasec-mastery-exams');
  await page.reload();
  await page.waitForLoadState('domcontentloaded');
  const after = await readJson(page, 'infrasec-mastery-exams');
  expect(after).toEqual(before);
  expect(await page.evaluate(() => window.InfraSecAdaptive.competency('network').level)).toBe(1);
});
