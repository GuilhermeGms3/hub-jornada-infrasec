const { test, expect } = require('@playwright/test');
const { fixture } = require('../fixtures/storage-fixtures');
const { openWithStorage } = require('../helpers/app');

test.beforeEach(async ({ page }) => {
  await openWithStorage(page, fixture(), '#meu-nivel');
});

test('chamado introdutorio preserva limites 69, 70 e 71', async ({ page }) => {
  const results = await page.evaluate(() => {
    const { meetsThreshold, thresholds } = window.InfraSecDomain.scoring;
    return [69, 70, 71].map((score) => meetsThreshold(score, thresholds.INTRO_TICKET));
  });
  expect(results).toEqual([false, true, true]);
});

test('atividade profunda preserva limites 79, 80 e 81', async ({ page }) => {
  const results = await page.evaluate(() => {
    const { meetsThreshold, thresholds } = window.InfraSecDomain.scoring;
    return [79, 80, 81].map((score) => meetsThreshold(score, thresholds.DEEP_ACTIVITY));
  });
  expect(results).toEqual([false, true, true]);
});

test('lab exige todos os checks esperados', async ({ page }) => {
  const results = await page.evaluate(() => {
    const { allChecksComplete } = window.InfraSecDomain.scoring;
    return [
      allChecksComplete([true, true, true, false], 4),
      allChecksComplete([true, true, true, true], 4),
      allChecksComplete([], 4)
    ];
  });
  expect(results).toEqual([false, true, false]);
});
