const { test, expect } = require('@playwright/test');
const { fixture } = require('../fixtures/storage-fixtures');
const { openWithStorage } = require('../helpers/app');

const aliases = {
  inicio: 'today',
  'plano-estudos': 'journey',
  tarefas: 'weekly-tasks',
  semana1: 'week-one',
  arvore: 'dependencies',
  'academia-pratica': 'network-practice',
  laboratorio: 'packet-tracer',
  'central-carreira': 'portfolio',
  estante: 'kindle',
  biblioteca: 'library',
  templates: 'templates',
  certificacoes: 'certifications',
  'linux-git': 'linux-guide',
  'nao-estudar': 'not-yet'
};

test('todas as rotas canonicas ativam exatamente a pagina declarada', async ({ page }) => {
  await openWithStorage(page, fixture({ 'infrasec-always-show-full-content': 'true' }), '#hoje');
  const pages = await page.evaluate(() => window.InfraSecHub.pages);
  expect(pages).toHaveLength(29);
  for (const item of pages) {
    await page.evaluate((pageId) => window.InfraSecHub.navigateToPage(pageId, true, false), item.id);
    expect(await page.locator('body').getAttribute('data-hub-page')).toBe(item.id);
    expect(await page.locator('main > section:not([hidden])').count()).toBe(1);
  }
});

for (const [hash, pageId] of Object.entries(aliases)) {
  test(`alias #${hash} continua resolvendo para ${pageId}`, async ({ page }) => {
    await openWithStorage(page, fixture({ 'infrasec-always-show-full-content': 'true' }), `#${hash}`);
    await expect(page.locator('body')).toHaveAttribute('data-hub-page', pageId);
  });
}

test('reload em pagina interna preserva hash e pagina ativa', async ({ page }) => {
  await openWithStorage(page, fixture(), '#ingles');
  await expect(page.locator('body')).toHaveAttribute('data-hub-page', 'english');
  await page.reload();
  await expect(page).toHaveURL(/#ingles$/);
  await expect(page.locator('body')).toHaveAttribute('data-hub-page', 'english');
});

test('navegacao publica infrasec:page-changed com pageId', async ({ page }) => {
  await openWithStorage(page, fixture(), '#hoje');
  await page.evaluate(() => {
    window.__pageEvents = [];
    window.addEventListener('infrasec:page-changed', (event) => window.__pageEvents.push(event.detail));
    window.InfraSecHub.navigateToPage('library', true, false);
  });
  expect(await page.evaluate(() => window.__pageEvents)).toEqual([{ pageId: 'library' }]);
});

test('mudanca de missao publica competency-changed e sincroniza semana legada', async ({ page }) => {
  await page.addInitScript(() => { window.open = () => null; });
  await openWithStorage(page, fixture(), '#hoje');
  await page.evaluate(() => {
    window.__competencyEvents = 0;
    window.addEventListener('infrasec:competency-changed', () => { window.__competencyEvents += 1; });
  });
  await page.locator('#completeToday').click();
  expect(await page.evaluate(() => window.__competencyEvents)).toBe(1);
  await page.locator('#guidedWeekSelect').selectOption('3');
  await expect(page.locator('#weekSelect')).toHaveValue('3');
});
