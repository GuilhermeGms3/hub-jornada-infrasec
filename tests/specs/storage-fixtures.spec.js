const { test, expect } = require('@playwright/test');
const {
  STORAGE_KEYS,
  ABSENT,
  fixture,
  emptyProfile,
  partialProfile,
  intermediateProfile,
  completeN3Profile,
  oldIncompleteProfile,
  tolerantCorruptProfile,
  raw
} = require('../fixtures/storage-fixtures');
const { openWithStorage, storageSnapshot } = require('../helpers/app');

test('fixtures representam as 24 storage keys e valores ausentes', async () => {
  expect(STORAGE_KEYS).toHaveLength(24);
  for (const profile of [emptyProfile, partialProfile, intermediateProfile, completeN3Profile, oldIncompleteProfile, tolerantCorruptProfile]) {
    expect(Object.keys(profile).sort()).toEqual([...STORAGE_KEYS].sort());
  }
  expect(Object.values(emptyProfile).every((value) => value === ABSENT)).toBe(true);
  expect(oldIncompleteProfile['infrasec-reading-queue']).toBe(ABSENT);
});

test('strings cruas e valores JSON chegam ao navegador sem conversao indevida', async ({ page }) => {
  await openWithStorage(page, partialProfile, '#meu-nivel');
  const snapshot = await storageSnapshot(page);
  expect(snapshot['infrasec-current-week']).toBe('0');
  expect(snapshot['infrasec-active-page']).toBe('level');
  expect(snapshot['infrasec-always-show-full-content']).toBe('false');
  expect(snapshot['infrasec-career-tab']).toBe('"portfolio"');
  expect(JSON.parse(snapshot['infrasec-task-progress'])['0-0']).toBe('feito');
});

test('dados antigos sem createdAt expõem o erro atual, mas o nivel ainda inicializa', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await openWithStorage(page, oldIncompleteProfile, '#meu-nivel');
  await expect(page.locator('#levelOverviewView')).toBeVisible();
  expect(await page.evaluate(() => window.InfraSecAdaptive.competency('network').level)).toBe(1);
  expect(errors).toContain('Invalid time value');
});

test('JSON corrompido nas leituras tolerantes usa fallback e mantem o hub carregado', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await openWithStorage(page, tolerantCorruptProfile, '#meu-nivel');
  await expect(page.locator('#levelOverviewView')).toBeVisible();
  expect(await page.evaluate(() => window.InfraSecAdaptive.competency('network').level)).toBe(0);
  expect(errors).toEqual([]);
});

test('JSON corrompido em infrasec-task-progress interrompe o bootstrap legado atual', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await openWithStorage(page, fixture({ 'infrasec-task-progress': raw('{broken') }), '#visao-semanal');
  expect(errors.some((message) => message.includes('JSON'))).toBe(true);
  await expect(page.locator('#taskList .task')).toHaveCount(0);
});
