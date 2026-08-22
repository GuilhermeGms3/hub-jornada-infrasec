const { test, expect } = require('@playwright/test');
const { fixture, STORAGE_KEYS, raw } = require('../fixtures/storage-fixtures');
const { openWithStorage } = require('../helpers/app');

test('camada central inventaria as 24 keys com codecs explicitos', async ({ page }) => {
  await openWithStorage(page, fixture(), '#meu-nivel');
  const inventory = await page.evaluate(() => ({
    keys: window.InfraSecStorage.listKeys(),
    codecs: window.InfraSecStorage.listKeys().map((key) => window.InfraSecStorage.codecFor(key))
  }));
  expect(inventory.keys.sort()).toEqual([...STORAGE_KEYS].sort());
  expect(inventory.codecs.filter((codec) => codec === 'json')).toHaveLength(20);
  expect(inventory.codecs.filter((codec) => codec === 'raw')).toHaveLength(2);
  expect(inventory.codecs.filter((codec) => codec === 'boolean-string')).toHaveLength(2);
});

test('le objeto e array JSON validos sem alterar o formato', async ({ page }) => {
  const profile = fixture({
    'infrasec-learner-profile': { levels: { network: 2 }, answers: [1, 2] },
    'infrasec-deliverables': [{ id: 'd1', title: 'Teste' }]
  });
  await openWithStorage(page, profile, '#meu-nivel');
  const values = await page.evaluate(() => ({
    profile: window.InfraSecStorage.getLearnerProfile(),
    deliverables: window.InfraSecStorage.getDeliverables()
  }));
  expect(values.profile).toEqual({ levels: { network: 2 }, answers: [1, 2] });
  expect(values.deliverables).toEqual([{ id: 'd1', title: 'Teste' }]);
});

test('valor ausente retorna fallback sem criar a key', async ({ page }) => {
  await openWithStorage(page, fixture({}, ['infrasec-deep-cloud']), '#meu-nivel');
  const result = await page.evaluate(() => {
    const fallback = [{ id: 'fallback' }];
    const value = window.InfraSecStorage.readJson(window.InfraSecStorage.keys.DEEP_CLOUD, fallback);
    return { value, persisted: localStorage.getItem(window.InfraSecStorage.keys.DEEP_CLOUD) };
  });
  expect(result).toEqual({ value: [{ id: 'fallback' }], persisted: null });
});

test('strings cruas e booleanos-string continuam armazenados como texto', async ({ page }) => {
  await openWithStorage(page, fixture(), '#meu-nivel');
  const result = await page.evaluate(() => {
    const storage = window.InfraSecStorage;
    storage.setCurrentWeek(7);
    storage.setAlwaysShowFullContent(true);
    return {
      week: localStorage.getItem(storage.keys.CURRENT_WEEK),
      flag: localStorage.getItem(storage.keys.ALWAYS_SHOW_FULL_CONTENT),
      flagValue: storage.getAlwaysShowFullContent()
    };
  });
  expect(result).toEqual({ week: '7', flag: 'true', flagValue: true });
});

test('JSON corrompido usa o fallback tolerante da camada', async ({ page }) => {
  await openWithStorage(page, fixture({ 'infrasec-deep-cloud': raw('{broken') }), '#meu-nivel');
  const value = await page.evaluate(() => window.InfraSecStorage.readJson(window.InfraSecStorage.keys.DEEP_CLOUD, []));
  expect(value).toEqual([]);
});

test('escrita JSON e raw permanece byte e logicamente equivalente', async ({ page }) => {
  await openWithStorage(page, fixture(), '#meu-nivel');
  const result = await page.evaluate(() => {
    const storage = window.InfraSecStorage;
    const value = { network: { foundation: { passed: true, best: 75 } } };
    storage.setMasteryExams(value);
    storage.writeRaw(storage.keys.ACTIVE_PAGE, 'level');
    return {
      json: localStorage.getItem(storage.keys.MASTERY_EXAMS),
      raw: localStorage.getItem(storage.keys.ACTIVE_PAGE),
      read: storage.getMasteryExams()
    };
  });
  expect(result.json).toBe(JSON.stringify({ network: { foundation: { passed: true, best: 75 } } }));
  expect(result.raw).toBe('level');
  expect(result.read.network.foundation.best).toBe(75);
});

test('mutar valor lido nao altera storage sem escrita explicita', async ({ page }) => {
  await openWithStorage(page, fixture({ 'infrasec-deliverables': [{ id: 'original' }] }), '#meu-nivel');
  const result = await page.evaluate(() => {
    const first = window.InfraSecStorage.getDeliverables();
    first[0].id = 'mutado';
    return {
      second: window.InfraSecStorage.getDeliverables(),
      persisted: JSON.parse(localStorage.getItem(window.InfraSecStorage.keys.DELIVERABLES))
    };
  });
  expect(result.second).toEqual([{ id: 'original' }]);
  expect(result.persisted).toEqual([{ id: 'original' }]);
});

test('codec incompativel e key desconhecida falham explicitamente', async ({ page }) => {
  await openWithStorage(page, fixture(), '#meu-nivel');
  const messages = await page.evaluate(() => {
    const storage = window.InfraSecStorage;
    const errors = [];
    try { storage.readJson(storage.keys.CURRENT_WEEK, {}); } catch (error) { errors.push(error.message); }
    try { storage.readRaw('infrasec-nao-existe', ''); } catch (error) { errors.push(error.message); }
    return errors;
  });
  expect(messages[0]).toContain('incompativel');
  expect(messages[1]).toContain('desconhecida');
});
