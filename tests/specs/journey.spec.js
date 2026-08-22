const { test, expect } = require('@playwright/test');
const { fixture } = require('../fixtures/storage-fixtures');
const { openWithStorage, readJson } = require('../helpers/app');

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { window.open = () => null; });
});

test('missao percorre not-started, doing, blocked e done', async ({ page }) => {
  await openWithStorage(page, fixture(), '#hoje');
  expect((await readJson(page, 'infrasec-guided-progress'))['0-0']).toBeUndefined();
  await expect(page.locator('#nextMission')).toBeDisabled();

  await page.locator('#todayPrimaryAction').click();
  expect((await readJson(page, 'infrasec-guided-progress'))['0-0']).toBe('doing');
  await expect(page.locator('#todayFeedback')).toContainText('Sessao iniciada');

  await page.locator('#blockedToday').click();
  expect((await readJson(page, 'infrasec-guided-progress'))['0-0']).toBe('blocked');
  await expect(page.locator('#todayFeedback')).toContainText('Pare aqui');

  await page.locator('#completeToday').click();
  expect((await readJson(page, 'infrasec-guided-progress'))['0-0']).toBe('done');
  await expect(page.locator('#nextMission')).toBeEnabled();
});

test('proxima missao avanca e selecao atual sobrevive ao reload', async ({ page }) => {
  await openWithStorage(page, fixture({
    'infrasec-guided-progress': { '0-0': 'done' },
    'infrasec-guided-current-day': { 0: 0 }
  }), '#hoje');
  await page.locator('#nextMission').click();
  await expect(page.locator('#guidedDaySelect')).toHaveValue('1');
  expect((await readJson(page, 'infrasec-guided-current-day'))['0']).toBe(1);
  await page.reload();
  await expect(page.locator('#guidedDaySelect')).toHaveValue('1');
});

test('primeira missao nao concluida e aberta automaticamente', async ({ page }) => {
  await openWithStorage(page, fixture({ 'infrasec-guided-progress': { '0-0': 'done', '0-1': 'done' } }), '#hoje');
  await expect(page.locator('#guidedDaySelect')).toHaveValue('2');
});

test('semanas continuam navegaveis e sincronizam o controle legado', async ({ page }) => {
  await openWithStorage(page, fixture(), '#jornada');
  await page.locator('[data-guided-week="4"]').click();
  await expect(page.locator('#guidedWeekSelect')).toHaveValue('4');
  await expect(page.locator('#weekSelect')).toHaveValue('4');
  expect(await page.evaluate(() => localStorage.getItem('infrasec-current-week'))).toBe('4');
});

test('progresso legado e guiado coexistem sem fusao depois de reload', async ({ page }) => {
  const profile = fixture({
    'infrasec-task-progress': { '0-0': 'feito', '0-1': 'nao-entendi' },
    'infrasec-guided-progress': { '0-0': 'blocked', '0-1': 'done' },
    'infrasec-guided-current-day': { 0: 0 }
  });
  await openWithStorage(page, profile, '#hoje');
  await page.reload();
  expect(await readJson(page, 'infrasec-task-progress')).toEqual({ '0-0': 'feito', '0-1': 'nao-entendi' });
  expect(await readJson(page, 'infrasec-guided-progress')).toEqual({ '0-0': 'blocked', '0-1': 'done' });
  await expect(page.locator('#todayFeedback')).toContainText('Pare aqui');
});
