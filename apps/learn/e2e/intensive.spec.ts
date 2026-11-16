import { test, expect } from '@playwright/test';
test('subnetting gera variante e corrige /28 no desktop e mobile', async ({ page }) => {
  await page.goto('/#/certificacao/ccna/semana/2');
  await page.getByLabel('Rede', { exact: true }).fill('160');
  await page.getByLabel('Broadcast', { exact: true }).fill('175');
  await page.getByLabel('Hosts utilizáveis', { exact: true }).fill('14');
  await page.getByRole('button', { name: 'Corrigir cálculo' }).click();
  await expect(page.getByText('Cálculo correto.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Novo endereço e prefixo' }).click();
  await expect(page.getByLabel('Rede', { exact: true })).toHaveValue('');
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({
    path: '../../docs/quality/evidence/ccna-intensive-mobile.png',
    fullPage: true,
  });
});
test('monitoramento distingue reconhecer, recuperar e sem dados', async ({ page }) => {
  await page.goto('/#/certificacao/ccna/semana/10');
  await page.getByLabel('Água no piso').check();
  await page.getByRole('button', { name: 'Reconhecer ocorrência' }).click();
  await expect(page.getByText(/Água: detectada/)).toBeVisible();
  await page.getByLabel('Sensor enviando leituras').uncheck();
  await expect(page.getByText(/Sem dados novos:/)).toBeVisible();
  await page.screenshot({
    path: '../../docs/quality/evidence/monitor-room-desktop.png',
    fullPage: true,
  });
});
test('ensaio abre 20 itens, corrige brancos e oferece recuperação válida', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/#/certificacao/ccna/semana/12');
  await page.getByRole('button', { name: 'Iniciar ensaio' }).click();
  await expect(page.locator('fieldset')).toHaveCount(20);
  await page.getByRole('button', { name: /Encerrar e corrigir/ }).click();
  await expect(page.getByText(/0\/20 acertos/)).toBeVisible();
  await page.getByRole('link', { name: 'Reestudar a aula' }).first().click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Vida de um pacote');
  expect(errors).toEqual([]);
});
