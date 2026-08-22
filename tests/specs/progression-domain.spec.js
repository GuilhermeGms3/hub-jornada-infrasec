const { test, expect } = require('@playwright/test');
const { fixture } = require('../fixtures/storage-fixtures');
const { openWithStorage } = require('../helpers/app');

test.beforeEach(async ({ page }) => {
  await openWithStorage(page, fixture(), '#meu-nivel');
});

async function level(page, input) {
  return page.evaluate((value) => window.InfraSecDomain.progression.evaluateCompetency(value).level, input);
}

test('sequencia valida produz N0, N1, N2 e N3', async ({ page }) => {
  expect(await level(page, {})).toBe(0);
  expect(await level(page, { mastery: { foundation: { passed: true } } })).toBe(1);
  expect(await level(page, { mastery: { foundation: { passed: true }, applied: { passed: true } } })).toBe(2);
  expect(await level(page, { mastery: { foundation: { passed: true }, applied: { passed: true } }, evidence: [3, 'ok'] })).toBe(3);
});

test('diagnostico alto sem prova nao promove nivel', async ({ page }) => {
  expect(await level(page, { diagnosis: 2, mastery: {}, evidence: [3, 'ok'] })).toBe(0);
});

test('applied sem foundation nao promove', async ({ page }) => {
  expect(await level(page, { mastery: { applied: { passed: true } }, evidence: [3, 'ok'] })).toBe(0);
});

test('evidencia nivel tres sem applied mantem N1', async ({ page }) => {
  expect(await level(page, { mastery: { foundation: { passed: true } }, evidence: [3, 'ok'] })).toBe(1);
});

test('dados ausentes preservam retorno estruturado', async ({ page }) => {
  const result = await page.evaluate(() => window.InfraSecDomain.progression.evaluateCompetency());
  expect(result).toEqual({
    level: 0,
    evidence: 'Passe na prova de fundamentos. ',
    diagnosis: 0,
    evidenceLevel: 0,
    mastery: {}
  });
});
