const { test, expect } = require('@playwright/test');
const { fixture } = require('../fixtures/storage-fixtures');
const { openWithStorage } = require('../helpers/app');

const player = (page) => page.locator('#net-r01-player');

test('laboratório e cópia de progresso funcionam dentro do Hub', async ({ page }) => {
  await openWithStorage(page, fixture(), '#redes/r01/pratica');
  await player(page).getByLabel('Cenário', { exact: true }).selectOption('dns-failure');
  await player(page).getByLabel('Investigar consulta/caminho DNS, sem causa exata comprovada.').check();
  await player(page).getByRole('button', { name: 'ping no IP remoto' }).click();
  await player(page).getByRole('button', { name: 'nslookup portal.example' }).click();
  await player(page).getByRole('button', { name: 'Verificar diagnóstico' }).click();
  await expect(player(page).getByText('Diagnóstico sustentado neste cenário.')).toBeVisible();
  await player(page).getByRole('button', { name: 'Salvar cópia', exact: true }).click();
  const downloadPromise = page.waitForEvent('download');
  await player(page).getByRole('button', { name: 'Baixar cópia desta sessão' }).click();
  const download = await downloadPromise;
  await player(page).getByLabel('Importar cópia de progresso').setInputFiles(await download.path());
  await expect(player(page).getByText(/Cópia válida:/)).toBeVisible();
  await player(page).getByRole('button', { name: 'Baixar estado anterior e substituir' }).click();
  await expect(page).toHaveURL(/#redes\/r01\/pratica$/);
  await page.reload();
  await expect(player(page).getByText('Diagnóstico sustentado neste cenário.')).toBeVisible();
});

test('R01 abre para iniciante, mantém navegação global e retoma a lição', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/hub-estudos-infrasec.html#redes/r01/aula/dns');
  await expect(player(page).locator('h1')).toHaveText('Do nome ao endereço');
  await expect(player(page).locator('h1')).toBeVisible();
  await expect(page.locator('.module-nav .nav-group')).toHaveCount(6);
  await expect(page.locator('a[data-hub-page="network-practice"]')).toHaveAttribute('aria-current', 'page');
  await player(page).getByLabel('Registrei a leitura desta lição').check();
  await page.locator('a[data-hub-page="today"]').click();
  await expect(page.locator('#todayPhase')).toBeVisible();
  await page.locator('a[data-hub-page="network-practice"]').click();
  await page.getByRole('link', { name: 'Estudar NET-R01' }).click();
  await expect(player(page).locator('h1')).toHaveText('Do nome ao endereço');
  await expect(player(page).getByLabel('Registrei a leitura desta lição')).toBeChecked();
  await page.reload();
  await expect(player(page).locator('h1')).toHaveText('Do nome ao endereço');
  expect(errors).toEqual([]);
});

test('links contextuais, histórico e avaliação respeitam os dois roteadores', async ({ page }) => {
  await openWithStorage(page, fixture(), '#redes/r01');
  await player(page).getByRole('button', { name: 'Abrir sumário' }).click();
  await player(page).getByRole('link', { name: '06 Gateway' }).click();
  await expect(page).toHaveURL(/#redes\/r01\/aula\/gateway$/);
  await player(page).getByRole('button', { name: 'Abrir sumário' }).click();
  await player(page).getByRole('link', { name: 'Avaliação independente' }).click();
  await player(page).getByRole('button', { name: 'Iniciar avaliação' }).click();
  await expect(player(page).getByText('Sem ajuda registrada')).toBeVisible();
  await page.locator('a[data-hub-page="cloud"]').click();
  await page.goBack();
  await expect(player(page).getByText('Tentativa assistida')).toBeVisible();
  await expect(page.locator('main > section:not([hidden])')).toHaveCount(1);
});

test('estudo preserva dados legados e não concede domínio por leitura', async ({ page }) => {
  const legacy = JSON.stringify({ '0-0': 'done' });
  await openWithStorage(page, fixture({ 'infrasec-guided-progress': { '0-0': 'done' } }), '#redes/r01');
  await player(page).getByLabel('Registrei a leitura desta lição').check();
  const state = await page.evaluate(() => ({
    legacy: localStorage.getItem('infrasec-guided-progress'),
    progress: JSON.parse(localStorage.getItem('infrasec-learn:v1')).progress,
  }));
  expect(state.legacy).toBe(legacy);
  expect(state.progress.read).toContain('redes');
  expect(state.progress.attempts).toHaveLength(0);
  expect(state.progress.runs).toHaveLength(0);
});

test('falha de carregamento tem recuperação e não impede páginas antigas', async ({ page }) => {
  await page.route('**/modules/net-r01/player.js', route => route.abort());
  await openWithStorage(page, fixture(), '#redes/r01');
  await expect(player(page).getByRole('alert')).toBeVisible();
  await expect(player(page).getByRole('button', { name: 'Tentar novamente' })).toBeVisible();
  await page.locator('a[data-hub-page="journey"]').click();
  await expect(page.locator('body')).toHaveAttribute('data-hub-page', 'journey');
});

for (const width of [320, 390, 768, 1440]) {
  test(`Hoje, Redes e R01 sem transbordamento a ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await openWithStorage(page, fixture({ 'infrasec-always-show-full-content': 'true' }), '#hoje');
    for (const hash of ['hoje', 'redes-pratica', 'redes/r01/aula/dns']) {
      await page.evaluate(h => { location.hash = h; }, hash);
      if (hash.includes('r01')) await expect(player(page).locator('h1')).toBeVisible();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    }
  });
}
