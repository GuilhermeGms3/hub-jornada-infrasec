const { test, expect } = require('@playwright/test');
const { fixture } = require('../fixtures/storage-fixtures');
const { openWithStorage } = require('../helpers/app');

test('usuario abaixo do requisito recebe preparacao e pode liberar na sessao', async ({ page }) => {
  await openWithStorage(page, fixture(), '#redes-pratica');
  await expect(page.locator('body')).toHaveClass(/adaptive-content-locked/);
  await expect(page.locator('#adaptiveSupport')).toContainText('Preparacao recomendada');
  await page.locator('[data-unlock-page="network-practice"]').click();
  await expect(page.locator('body')).not.toHaveClass(/adaptive-content-locked/);
  await expect(page.locator('#academia-pratica')).toBeVisible();
});

test('override temporario desaparece depois do reload', async ({ page }) => {
  await openWithStorage(page, fixture(), '#redes-pratica');
  await page.locator('[data-unlock-page="network-practice"]').click();
  await expect(page.locator('body')).not.toHaveClass(/adaptive-content-locked/);
  await page.reload();
  await expect(page.locator('body')).toHaveClass(/adaptive-content-locked/);
});

test('preferencia mostrar tudo persiste depois de reload', async ({ page }) => {
  await openWithStorage(page, fixture(), '#meu-nivel');
  await page.locator('#alwaysShowFullContent').evaluate((input) => { input.closest('details').open = true; });
  await page.locator('#alwaysShowFullContent').check();
  expect(await page.evaluate(() => localStorage.getItem('infrasec-always-show-full-content'))).toBe('true');
  await page.evaluate(() => window.InfraSecHub.navigateToPage('network-practice'));
  await expect(page.locator('body')).not.toHaveClass(/adaptive-content-locked/);
  await page.reload();
  await expect(page.locator('body')).not.toHaveClass(/adaptive-content-locked/);
});

test('ausencia da preferencia mantem gating normal sem hard lock de navegacao', async ({ page }) => {
  const profile = fixture({}, ['infrasec-always-show-full-content']);
  await openWithStorage(page, profile, '#redes-pratica');
  await expect(page.locator('body')).toHaveClass(/adaptive-content-locked/);
  expect(await page.evaluate(() => window.InfraSecHub.getActivePage())).toBe('network-practice');
  await page.locator('[data-adaptive-page="level"]').click();
  await expect(page).toHaveURL(/#meu-nivel$/);
});

test('classes de foco, rota e hidden preservam divulgacao progressiva', async ({ page }) => {
  await openWithStorage(page, fixture(), '#meu-nivel');
  await page.locator('#openDiagnostic').click();
  await expect(page.locator('body')).toHaveClass(/level-focus-mode/);
  await expect(page.locator('[data-level-view="diagnostic"]')).toBeVisible();
  await expect(page.locator('[data-level-view="overview"]')).toBeHidden();
  await page.locator('#backFromDiagnostic').click();
  await expect(page.locator('body')).not.toHaveClass(/level-focus-mode/);
  await page.evaluate(() => window.InfraSecHub.navigateToPage('network-practice'));
  await expect(page.locator('body')).toHaveClass(/route-focused/);
  expect(await page.locator('main > section:not([hidden])').count()).toBe(1);
});
