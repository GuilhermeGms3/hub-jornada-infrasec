const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { fixture } = require('../fixtures/storage-fixtures');
const { openWithStorage } = require('../helpers/app');

test('APIs ESM de navegacao e adaptive sustentam as fachadas historicas', async ({ page }) => {
  await openWithStorage(page, fixture(), '#meu-nivel');
  const result = await page.evaluate(async () => {
    const navigation = await import('/src/core/navigation.js');
    const { adaptiveApi } = await import('/src/features/adaptive/controller.js');
    navigation.navigateToPage('library', true, false);
    return {
      activePage: navigation.getActivePage(),
      bridgePage: window.InfraSecHub.getActivePage(),
      sameNavigation: navigation.navigateToPage === window.InfraSecHub.navigateToPage,
      sameAdaptive: adaptiveApi === window.InfraSecAdaptive,
      networkLevel: adaptiveApi.competency('network').level
    };
  });

  expect(result).toEqual({
    activePage: 'library',
    bridgePage: 'library',
    sameNavigation: true,
    sameAdaptive: true,
    networkLevel: 0
  });
});

test('legacy-bridge e o unico produtor das cinco fachadas window', () => {
  const root = path.resolve(__dirname, '..', '..');
  const files = [];
  const visit = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(fullPath);
      else if (entry.name.endsWith('.js')) files.push(fullPath);
    }
  };
  visit(path.join(root, 'src'));

  const assignments = files.flatMap((file) => {
    const matches = fs.readFileSync(file, 'utf8').match(/window\.InfraSec(?:Storage|Events|Domain|Hub|Adaptive)\s*=/g) || [];
    return matches.map((match) => ({ file: path.relative(root, file).replaceAll(path.sep, '/'), match }));
  });

  expect(new Set(assignments.map((item) => item.file))).toEqual(new Set(['src/bootstrap/legacy-bridge.js']));
  expect(assignments).toHaveLength(5);
});

test('inicializador isola feature com falha e continua a composicao', async ({ page }) => {
  await openWithStorage(page, fixture());
  const result = await page.evaluate(async () => {
    const { initializeFeature } = await import('/src/bootstrap/feature-initializer.js');
    const calls = [];
    const report = (error, name) => calls.push(`erro:${name}:${error.message}`);
    const failed = initializeFeature('broken', () => { throw new Error('falha controlada'); }, report);
    const continued = initializeFeature('next', () => calls.push('next:ok'), report);
    return { failed, continued, calls };
  });

  expect(result).toEqual({
    failed: false,
    continued: true,
    calls: ['erro:broken:falha controlada', 'next:ok']
  });
});

test('abas da Academia preservam ArrowRight, aria-selected e foco', async ({ page }) => {
  await openWithStorage(page, fixture(), '#academia-pratica');
  await page.locator('[data-unlock-page="network-practice"]').click();
  await page.evaluate(() => document.body.classList.remove('route-focused'));
  const tabs = page.locator('[data-depth-tab]');
  await tabs.first().click();
  await tabs.first().press('ArrowRight');

  await expect(tabs.nth(1)).toBeFocused();
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
  await expect(tabs.first()).toHaveAttribute('aria-selected', 'false');
});

test('abas de Carreira preservam ArrowLeft, tabindex e foco', async ({ page }) => {
  await openWithStorage(page, fixture(), '#portfolio');
  await page.evaluate(() => document.body.classList.remove('route-focused'));
  const tabs = page.locator('[data-career-tab]');
  await tabs.first().click();
  await tabs.first().press('ArrowLeft');
  const last = tabs.last();

  await expect(last).toBeFocused();
  await expect(last).toHaveAttribute('aria-selected', 'true');
  await expect(last).toHaveAttribute('tabindex', '0');
  await expect(tabs.first()).toHaveAttribute('tabindex', '-1');
});
