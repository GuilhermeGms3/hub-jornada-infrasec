const { test, expect } = require('@playwright/test');
const { fixture } = require('../fixtures/storage-fixtures');
const { openWithStorage, readJson } = require('../helpers/app');

test('atividade profunda caracteriza 79 reprovado, 80 e 81 aprovados', async ({ page }) => {
  const profile = fixture({
    'infrasec-mastery-exams': {
      network: {
        foundation: { passed: true, best: 75 },
        applied: { passed: true, best: 75 }
      }
    }
  });
  await openWithStorage(page, profile, '#meu-nivel');

  for (const [score, expectedEvidence] of [[79, 2], [80, 3], [81, 3]]) {
    await page.evaluate((value) => {
      localStorage.setItem('infrasec-deep-journey', JSON.stringify({ w1: { score: value, passed: false } }));
      window.dispatchEvent(new CustomEvent('infrasec:competency-changed'));
    }, score);
    expect(await page.evaluate(() => window.InfraSecAdaptive.competency('network').evidenceLevel)).toBe(expectedEvidence);
  }
});

test('chamado introdutorio em exatamente 70% cria entregavel concluido', async ({ page }) => {
  await openWithStorage(page, fixture(), '#simulador-chamados');
  for (const value of ['0', '1', '2']) await page.locator(`#incidentCommands input[value="${value}"]`).check();
  await page.locator('#incidentCause').selectOption('0');
  await page.locator('#incidentTicket').fill('teste');
  await page.locator('#ticketSimulatorForm').evaluate((form) => form.requestSubmit());
  await expect(page.locator('#incidentFeedback')).toContainText('70%');
  const deliverables = await readJson(page, 'infrasec-deliverables');
  expect(deliverables[0].status).toBe('concluido');
});

test('chamado introdutorio abaixo de 70% mantem entregavel como rascunho', async ({ page }) => {
  await openWithStorage(page, fixture(), '#simulador-chamados');
  for (const value of ['0', '1', '2', '3']) await page.locator(`#incidentCommands input[value="${value}"]`).check();
  await page.locator('#incidentCause').selectOption('1');
  await page.locator('#incidentTicket').fill('Registro com mais de trinta e cinco caracteres uteis.');
  await page.locator('#ticketSimulatorForm').evaluate((form) => form.requestSubmit());
  await expect(page.locator('#incidentFeedback')).toContainText('68%');
  const deliverables = await readJson(page, 'infrasec-deliverables');
  expect(deliverables[0].status).toBe('rascunho');
});

test('lab permanece incompleto com um check faltando e conclui somente com todos', async ({ page }) => {
  await openWithStorage(page, fixture({ 'infrasec-always-show-full-content': 'true' }), '#labs-validados');
  const checks = page.locator('#validatedLabChecks input');
  for (let index = 0; index < 3; index += 1) await checks.nth(index).check();
  expect((await readJson(page, 'infrasec-lab-progress')).dhcp.completed).toBe(false);
  await page.locator('#validateLab').click();
  await expect(page.locator('#labStatus')).toContainText('Faltam 1');
  await checks.nth(3).check();
  expect((await readJson(page, 'infrasec-lab-progress')).dhcp.completed).toBe(true);
  await page.reload();
  await expect(page.locator('#validatedLabChecks input:checked')).toHaveCount(4);
});
