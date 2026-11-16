import { test, expect } from '@playwright/test';
test('IPv6 /60 e AAA têm feedback e navegação funcionais', async ({ page }) => {
  await page.goto('/#/certificacao/ccna/semana/3');
  await page.getByLabel('Quantidade de LANs').fill('4');
  await page.getByRole('button', { name: 'Conferir prefixo' }).click();
  await expect(page.getByText(/Revise a diferença dos prefixos/)).toBeVisible();
  await page.getByLabel('Quantidade de LANs').fill('16');
  await page.getByRole('button', { name: 'Conferir prefixo' }).click();
  await expect(page.getByText(/Correto. 64/)).toBeVisible();
  await page.goto('/#/certificacao/ccna/semana/8');
  await expect(page.getByText(/Rejeição explícita: login negado/)).toBeVisible();
  await page.getByLabel('Resposta do servidor').selectOption('timeout');
  await expect(page.getByText(/Erro\/indisponibilidade: o próximo método local/)).toBeVisible();
  await page.getByLabel('Resposta do servidor').selectOption('accept');
  await expect(page.getByText(/autorização ainda determina/)).toBeVisible();
});
for (const [week, title] of [
  [6, 'OSPFv3 executável: da adjacência ao ping'],
  [9, 'Wireless: diagnosticar RF, autenticação, DHCP e DNS'],
  [10, 'Ansible executável: inventário, coleta e falha explícita'],
] as const)
  test(`semana ${week} abre prática e aula no mobile`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/#/certificacao/ccna/semana/${week}`);
    await expect(
      page.getByRole('heading', { name: `Prática avançada · semana ${week}` }),
    ).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await page.getByRole('link', { name: title }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
  });
