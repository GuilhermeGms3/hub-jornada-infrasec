const { test, expect } = require('@playwright/test');
const { fixture, emptyProfile, completeN3Profile, domainIds } = require('../fixtures/storage-fixtures');
const { openWithStorage, competencyLevels } = require('../helpers/app');

const passedStage = (best = 75) => ({ passed: true, best, attempts: 1 });
const failedStage = (best = 74) => ({ passed: false, best, attempts: 1 });

function networkFixture({ foundation, applied, evidence } = {}) {
  return fixture({
    'infrasec-mastery-exams': { network: { foundation, applied, history: [] } },
    'infrasec-deep-journey': evidence == null ? {} : { w1: { score: evidence, passed: false } }
  });
}

test('perfil completamente novo inicia todas as competencias em N0', async ({ page }) => {
  await openWithStorage(page, emptyProfile, '#meu-nivel');
  expect(await competencyLevels(page)).toEqual(Object.fromEntries(domainIds.map((domain) => [domain, 0])));
});

test('diagnostico perfeito nao promove nivel verificado nem altera a fila', async ({ page }) => {
  const diagnostic = fixture({
    'infrasec-learner-profile': { levels: Object.fromEntries(domainIds.map((domain) => [domain, 2])), answers: [], completedAt: '2026-01-01T00:00:00.000Z' }
  });
  await openWithStorage(page, diagnostic, '#meu-nivel');
  expect(await competencyLevels(page)).toEqual(Object.fromEntries(domainIds.map((domain) => [domain, 0])));
  await expect(page.locator('#balancedRecommendations [data-open-domain]')).toHaveCount(3);
  expect(await page.locator('#balancedRecommendations [data-open-domain]').evaluateAll((items) => items.map((item) => item.dataset.openDomain))).toEqual(['network', 'operations', 'linux']);
});

test('diagnostico completo pela interface salva acertos sem promover N0', async ({ page }) => {
  const correctAnswers = [1, 2, 2, 2, 1, 3, 1, 2, 1, 1, 2, 1, 2, 2, 1, 1];
  await openWithStorage(page, fixture(), '#meu-nivel');
  await page.locator('#openDiagnostic').click();
  await page.locator('#startDiagnostic').click();
  for (const answer of correctAnswers) {
    await page.locator(`#diagnosticOptions input[value="${answer}"]`).check();
    await page.locator('#diagnosticNext').click();
  }
  const profile = await page.evaluate(() => JSON.parse(localStorage.getItem('infrasec-learner-profile')));
  expect(Object.values(profile.levels)).toEqual(Array(8).fill(2));
  expect(await competencyLevels(page)).toEqual(Object.fromEntries(domainIds.map((domain) => [domain, 0])));
});

for (const [score, passed, expected] of [[74, false, 0], [75, true, 1], [76, true, 1]]) {
  test(`contrato persistido de fundamentos no limite ${score}% resulta em N${expected}`, async ({ page }) => {
    await openWithStorage(page, networkFixture({ foundation: { passed, best: score, attempts: 1 } }), '#meu-nivel');
    expect(await page.evaluate(() => window.InfraSecAdaptive.competency('network').level)).toBe(expected);
  });
}

test('prova aplicada nao libera N2 sem fundamentos aprovados', async ({ page }) => {
  await openWithStorage(page, networkFixture({ foundation: failedStage(), applied: passedStage() }), '#meu-nivel');
  expect(await page.evaluate(() => window.InfraSecAdaptive.competency('network').level)).toBe(0);
});

test('aplicada abaixo de 75% mantem N1', async ({ page }) => {
  await openWithStorage(page, networkFixture({ foundation: passedStage(), applied: failedStage() }), '#meu-nivel');
  expect(await page.evaluate(() => window.InfraSecAdaptive.competency('network').level)).toBe(1);
});

test('aplicada em exatamente 75% libera N2 com fundamentos aprovados', async ({ page }) => {
  await openWithStorage(page, networkFixture({ foundation: passedStage(), applied: passedStage() }), '#meu-nivel');
  expect(await page.evaluate(() => window.InfraSecAdaptive.competency('network').level)).toBe(2);
});

for (const [score, expected] of [[79, 2], [80, 3], [81, 3]]) {
  test(`evidencia pratica em ${score}% caracteriza N${expected} com as provas validas`, async ({ page }) => {
    await openWithStorage(page, networkFixture({ foundation: passedStage(), applied: passedStage(), evidence: score }), '#meu-nivel');
    expect(await page.evaluate(() => window.InfraSecAdaptive.competency('network').level)).toBe(expected);
  });
}

test('o mecanismo N3 funciona para os oito dominios', async ({ page }) => {
  await openWithStorage(page, completeN3Profile, '#meu-nivel');
  expect(await competencyLevels(page)).toEqual(Object.fromEntries(domainIds.map((domain) => [domain, 3])));
});

test('recomendacoes priorizam menor nivel e preservam ordem declarada no empate', async ({ page }) => {
  const profile = fixture({
    'infrasec-mastery-exams': {
      network: { foundation: passedStage() },
      operations: { foundation: passedStage() },
      linux: { foundation: passedStage() }
    }
  });
  await openWithStorage(page, profile, '#meu-nivel');
  const queue = await page.locator('#balancedRecommendations [data-open-domain]').evaluateAll((items) => items.map((item) => item.dataset.openDomain));
  expect(queue).toEqual(['security', 'cloud', 'architecture']);
});
