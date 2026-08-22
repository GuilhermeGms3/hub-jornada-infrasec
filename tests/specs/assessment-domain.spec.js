const { test, expect } = require('@playwright/test');
const { fixture } = require('../fixtures/storage-fixtures');
const { openWithStorage } = require('../helpers/app');

test.beforeEach(async ({ page }) => {
  await openWithStorage(page, fixture(), '#meu-nivel');
});

test('threshold de prova preserva 74 reprovado e 75/76 aprovados', async ({ page }) => {
  const results = await page.evaluate(() => [74, 75, 76].map(window.InfraSecDomain.assessment.isPassingScore));
  expect(results).toEqual([false, true, true]);
});

test('grade calcula acertos, percentual e aprovacao', async ({ page }) => {
  const result = await page.evaluate(() => window.InfraSecDomain.assessment.grade(
    [{ correct: 0 }, { correct: 1 }, { correct: 2 }, { correct: 3 }],
    [0, 1, 2, 0]
  ));
  expect(result).toEqual({ correct: 3, total: 4, score: 75, passed: true });
});

test('foundation e applied seguem o nivel verificado atual', async ({ page }) => {
  const stages = await page.evaluate(() => [0, 1, 2, 3].map(window.InfraSecDomain.assessment.selectStageForLevel));
  expect(stages).toEqual(['foundation', 'applied', 'applied', 'applied']);
});

test('tentativa pior preserva passed, best e incrementa attempts', async ({ page }) => {
  const state = await page.evaluate(() => window.InfraSecDomain.assessment.recordAttempt({
    foundation: { passed: true, best: 100, attempts: 2 },
    history: []
  }, 'foundation', 50, { updatedAt: 'updated', createdAt: 'created' }));
  expect(state.foundation).toEqual({ passed: true, best: 100, attempts: 3, updatedAt: 'updated' });
  expect(state.history[0]).toEqual({ stage: 'foundation', score: 50, passed: false, createdAt: 'created' });
});

test('historico mantem somente as 20 tentativas mais recentes', async ({ page }) => {
  const state = await page.evaluate(() => {
    const history = Array.from({ length: 20 }, (_, index) => ({ stage: 'foundation', score: index }));
    return window.InfraSecDomain.assessment.recordAttempt({ history }, 'applied', 75, {
      updatedAt: 'updated', createdAt: 'newest'
    });
  });
  expect(state.history).toHaveLength(20);
  expect(state.history[0].createdAt).toBe('newest');
  expect(state.history.at(-1).score).toBe(18);
});

test('dados ausentes iniciam estado sem promover ou perder formato', async ({ page }) => {
  const state = await page.evaluate(() => window.InfraSecDomain.assessment.recordAttempt(undefined, 'foundation', 0, {
    updatedAt: 'updated', createdAt: 'created'
  }));
  expect(state.foundation).toEqual({ passed: false, best: 0, attempts: 1, updatedAt: 'updated' });
  expect(state.history).toHaveLength(1);
});
