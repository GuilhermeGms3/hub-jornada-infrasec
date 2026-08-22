const { test, expect } = require('@playwright/test');
const { fixture } = require('../fixtures/storage-fixtures');
const { openWithStorage } = require('../helpers/app');

test.beforeEach(async ({ page }) => {
  await openWithStorage(page, fixture(), '#meu-nivel');
});

async function evidence(page, domain, snapshot) {
  return page.evaluate(({ domainId, value }) => window.InfraSecDomain.evidence.evaluateEvidenceLevel(domainId, value), {
    domainId: domain, value: snapshot
  });
}

test('ausencia ou dados incompletos resultam em nivel zero', async ({ page }) => {
  expect(await evidence(page, 'network', {})).toEqual([0, 'Ainda nao ha evidencia pratica nesta competencia.']);
  expect(await evidence(page, 'linux', { terminal: null })).toEqual([0, 'Ainda nao ha evidencia pratica nesta competencia.']);
});

test('evidencia guiada inicial produz nivel um', async ({ page }) => {
  expect((await evidence(page, 'network', { guidedProgress: { '0-0': 'done' } }))[0]).toBe(1);
  expect((await evidence(page, 'operations', { ticketAttempts: [{ id: 't1' }] }))[0]).toBe(1);
});

test('tentativa avaliada sem aprovacao produz nivel dois', async ({ page }) => {
  expect((await evidence(page, 'network', { journey: { w1: { score: 79, passed: false } } }))[0]).toBe(2);
  expect((await evidence(page, 'security', { soc: [{ id: 's1', score: 79, passed: false }] }))[0]).toBe(2);
});

test('atividade aprovada no limite produz nivel tres', async ({ page }) => {
  expect((await evidence(page, 'cloud', { cloud: [{ id: 'c1', score: 80, passed: false }] }))[0]).toBe(3);
});

test('multiplas evidencias de terminal liberam nivel tres', async ({ page }) => {
  const result = await evidence(page, 'linux', {
    terminal: { files: { passed: true }, permissions: { passed: true } },
    guidedProgress: { '6-0': 'done' }
  });
  expect(result[0]).toBe(3);
});

test('fonte irrelevante nao promove outro dominio', async ({ page }) => {
  expect((await evidence(page, 'cloud', { soc: [{ id: 's1', score: 100, passed: true }] }))[0]).toBe(0);
});

test('portfolio e ingles preservam seus criterios especificos', async ({ page }) => {
  expect((await evidence(page, 'career', { deliverables: [{}, {}, {}] }))[0]).toBe(3);
  expect((await evidence(page, 'english', { englishPractice: { 1: { score: 80 } } }))[0]).toBe(3);
});
