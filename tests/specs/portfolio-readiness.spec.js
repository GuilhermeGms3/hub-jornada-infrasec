const { test, expect } = require('@playwright/test');
const { fixture } = require('../fixtures/storage-fixtures');
const { openWithStorage, readJson } = require('../helpers/app');

const deliverable = (id, sourceId) => ({
  id, sourceId, type: 'README', week: 1, title: id, body: 'Registro', evidence: '', status: 'concluido', createdAt: '2026-01-01T00:00:00.000Z'
});

test('tarefa concluida gera entregavel automatico com sourceId e persiste sem duplicar', async ({ page }) => {
  await openWithStorage(page, fixture({ 'infrasec-task-progress': { '0-0': 'feito' } }), '#portfolio');
  let items = await readJson(page, 'infrasec-deliverables');
  expect(items).toHaveLength(1);
  expect(items[0].sourceId).toBe('task-0-0');
  await page.reload();
  items = await readJson(page, 'infrasec-deliverables');
  expect(items.filter((item) => item.sourceId === 'task-0-0')).toHaveLength(1);
});

test('entregavel preexistente com mesmo sourceId nao e duplicado', async ({ page }) => {
  const existing = deliverable('existing', 'task-0-0');
  await openWithStorage(page, fixture({
    'infrasec-task-progress': { '0-0': 'feito' },
    'infrasec-deliverables': [existing]
  }), '#portfolio');
  const items = await readJson(page, 'infrasec-deliverables');
  expect(items).toEqual([existing]);
});

test('produtor terminal usa array compartilhado e publica eventos', async ({ page }) => {
  await openWithStorage(page, fixture({
    'infrasec-always-show-full-content': 'true',
    'infrasec-deliverables': [deliverable('manual', 'manual-1')]
  }), '#terminal');
  await page.evaluate(() => {
    window.__eventCounts = { competency: 0, deliverables: 0 };
    window.addEventListener('infrasec:competency-changed', () => { window.__eventCounts.competency += 1; });
    window.addEventListener('infrasec:deliverables-changed', () => { window.__eventCounts.deliverables += 1; });
  });
  for (const command of ['pwd', 'ls -la', "find /etc -name '*.conf'", 'tail -n 20 /var/log/app.log']) {
    await page.locator('#deepTerminalCommand').fill(command);
    await page.locator('#deepTerminalForm').evaluate((form) => form.requestSubmit());
  }
  const items = await readJson(page, 'infrasec-deliverables');
  expect(items.map((item) => item.sourceId)).toEqual(expect.arrayContaining(['manual-1', 'deep-terminal-linux-files']));
  expect(await page.evaluate(() => window.__eventCounts)).toEqual({ competency: 1, deliverables: 1 });
  await page.reload();
  expect((await readJson(page, 'infrasec-deliverables')).filter((item) => item.sourceId === 'deep-terminal-linux-files')).toHaveLength(1);
});

function readinessFixture(includeCritical) {
  return fixture({
    'infrasec-deep-journey': {
      w1: { score: 80, passed: true },
      ...(includeCritical ? { w2: { score: 80, passed: true } } : {})
    },
    'infrasec-deep-incidents': [
      { id: 'hd-1', area: 'Help Desk', score: 80, passed: true },
      { id: 'hd-2', area: 'Help Desk', score: 80, passed: true }
    ],
    'infrasec-deep-terminal': {
      'linux-files': { score: 100, passed: true },
      'linux-perms': { score: 100, passed: true }
    },
    'infrasec-deliverables': [deliverable('d1', 'd1'), deliverable('d2', 'd2')],
    'infrasec-interview-history': [{ id: 'i1', score: 70, createdAt: '2026-01-01T00:00:00.000Z' }]
  });
}

test('readiness calcula 100% quando todos os portoes de Help Desk passam', async ({ page }) => {
  await openWithStorage(page, readinessFixture(true), '#prontidao');
  const row = page.locator('#readinessBody tr').filter({ hasText: 'Help Desk' });
  await expect(row.locator('.readiness-score strong')).toHaveText('100%');
  await expect(row).toContainText('5/5 portoes');
});

test('portao critico ausente limita resultado bruto de 80% a 69%', async ({ page }) => {
  await openWithStorage(page, readinessFixture(false), '#prontidao');
  const row = page.locator('#readinessBody tr').filter({ hasText: 'Help Desk' });
  await expect(row.locator('.readiness-score strong')).toHaveText('69%');
  await expect(row).toContainText('4/5 portoes');
  await expect(row).toContainText('Critica: Semanas 1 e 2 aprovadas');
});
