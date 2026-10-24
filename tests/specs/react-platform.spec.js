const { test, expect } = require('@playwright/test');

test('entrada principal serve React e preserva bookmarks e progresso R01 na mesma origem', async ({ page }) => {
  await page.goto('/#redes/r01/aula/dns');
  await expect(page).toHaveURL(/\/platform\/index.html#redes\/r01\/aula\/dns$/);
  await expect(page.locator('main h1')).toHaveText('Do nome ao endereço');
  await expect(page.locator('iframe')).toHaveCount(0);
  await page.getByLabel('Registrei a leitura desta lição').check();
  await page.locator('.global-sidebar').getByRole('link', { name: 'Hoje', exact: true }).click();
  await page.getByRole('link', { name: 'Retomar meu estudo' }).click();
  await expect(page.locator('main h1')).toHaveText('Do nome ao endereço');
  await page.reload();
  await expect(page.getByLabel('Registrei a leitura desta lição')).toBeChecked();
});

test('ferramenta anterior abre explicitamente fora do novo frontend e mantém chaves antigas', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('infrasec-level-onboarding-shown', 'true');
    localStorage.setItem('infrasec-always-show-full-content', 'true');
    localStorage.setItem('infrasec-task-progress', '{"0-0":"done"}');
  });
  await page.goto('/#cloud');
  await expect(page.locator('main h1')).toHaveText('AWS e Azure');
  const link = page.getByRole('link', { name: 'Abrir AWS e Azure na versão anterior' });
  const popupPromise = page.waitForEvent('popup');
  await link.click();
  const popup = await popupPromise;
  await expect(popup).toHaveURL(/\/hub-estudos-infrasec.html#cloud$/);
  await expect(popup.locator('body')).toHaveAttribute('data-hub-page', 'cloud');
  expect(await page.evaluate(() => localStorage.getItem('infrasec-task-progress'))).toBe('{"0-0":"done"}');
});
