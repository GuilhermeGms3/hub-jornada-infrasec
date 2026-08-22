const { test, expect } = require('@playwright/test');
const { fixture } = require('../fixtures/storage-fixtures');
const { openWithStorage } = require('../helpers/app');

test.beforeEach(async ({ page }) => {
  await openWithStorage(page, fixture(), '#meu-nivel');
});

async function rank(page, entries) {
  return page.evaluate((items) => window.InfraSecDomain.recommendations.rankDomains(items).map((item) => item.id), entries);
}

test('menores niveis aparecem primeiro', async ({ page }) => {
  expect(await rank(page, [{ id: 'a', level: 2 }, { id: 'b', level: 0 }, { id: 'c', level: 1 }, { id: 'd', level: 3 }]))
    .toEqual(['b', 'c', 'a']);
});

test('empate preserva a ordem declarada', async ({ page }) => {
  expect(await rank(page, [{ id: 'network', level: 0 }, { id: 'operations', level: 0 }, { id: 'linux', level: 0 }, { id: 'security', level: 0 }]))
    .toEqual(['network', 'operations', 'linux']);
});

test('todos N3 continuam estaveis e limitados ao top tres', async ({ page }) => {
  expect(await rank(page, [{ id: 'a', level: 3 }, { id: 'b', level: 3 }, { id: 'c', level: 3 }, { id: 'd', level: 3 }]))
    .toEqual(['a', 'b', 'c']);
});

test('dados incompletos sao tratados como nivel inicial sem reordenar empates', async ({ page }) => {
  expect(await rank(page, [{ id: 'a' }, { id: 'b', level: 2 }, { id: 'c' }, { id: 'd', level: 1 }]))
    .toEqual(['a', 'c', 'd']);
});

test('entrada ausente retorna fila vazia', async ({ page }) => {
  expect(await page.evaluate(() => window.InfraSecDomain.recommendations.rankDomains())).toEqual([]);
});
