const { test, expect } = require('@playwright/test');
const { fixture } = require('../fixtures/storage-fixtures');
const { openWithStorage } = require('../helpers/app');

test.beforeEach(async ({ page }) => {
  await openWithStorage(page, fixture(), '#prontidao');
});

test('nenhum gate retorna zero sem erro', async ({ page }) => {
  expect(await page.evaluate(() => window.InfraSecDomain.readiness.summarizeGates([]))).toEqual({
    passedCount: 0, criticalMissing: false, rawScore: 0, score: 0, missing: []
  });
});

test('score bruto 92 com portao critico ausente fica limitado a 69', async ({ page }) => {
  const result = await page.evaluate(() => {
    const gates = Array.from({ length: 12 }, (_, index) => ({ label: String(index), passed: index !== 0, critical: index === 0 }));
    return window.InfraSecDomain.readiness.summarizeGates(gates);
  });
  expect(result.rawScore).toBe(92);
  expect(result.score).toBe(69);
});

test('gates parciais sem falha critica preservam percentual calculado', async ({ page }) => {
  const result = await page.evaluate(() => window.InfraSecDomain.readiness.summarizeGates([
    { label: 'a', passed: true }, { label: 'b', passed: false }, { label: 'c', passed: true }
  ]));
  expect(result.rawScore).toBe(67);
  expect(result.score).toBe(67);
  expect(result.missing.map((gate) => gate.label)).toEqual(['b']);
});

test('todos os gates atendidos resultam em 100', async ({ page }) => {
  const result = await page.evaluate(() => window.InfraSecDomain.readiness.summarizeGates([
    { passed: true, critical: true }, { passed: true }
  ]));
  expect(result.score).toBe(100);
  expect(result.missing).toEqual([]);
});

test('snapshot incompleto retorna os seis cargos sem promover prontidao', async ({ page }) => {
  const result = await page.evaluate(() => window.InfraSecDomain.readiness.evaluateReadiness({}));
  expect(result.roles.map((item) => item.role)).toEqual([
    'Help Desk', 'Suporte N2', 'NOC', 'SOC', 'Cloud junior', 'DevSecOps junior'
  ]);
  expect(result.roles.every((item) => item.score === 0)).toBe(true);
});

test('snapshot completo de Help Desk satisfaz seus cinco gates', async ({ page }) => {
  const result = await page.evaluate(() => window.InfraSecDomain.readiness.evaluateReadiness({
    journey: { w1: { passed: true }, w2: { passed: true } },
    incidents: [
      { id: 'h1', area: 'Help Desk', passed: true },
      { id: 'h2', area: 'Help Desk', passed: true }
    ],
    terminal: { one: { passed: true }, two: { passed: true } },
    deliverables: [{ status: 'concluido' }, { status: 'concluido' }],
    interviewHistory: [{ score: 70 }]
  }));
  const helpDesk = result.roles.find((item) => item.role === 'Help Desk');
  expect(helpDesk.score).toBe(100);
  expect(helpDesk.passedCount).toBe(5);
});
