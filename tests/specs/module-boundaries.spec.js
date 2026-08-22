const { test, expect } = require('@playwright/test');
const { fixture } = require('../fixtures/storage-fixtures');
const { openWithStorage } = require('../helpers/app');

test('bootstrap principal usa um unico entrypoint externo ES Module', async ({ page }) => {
  await openWithStorage(page, fixture());
  const scripts = await page.locator('script').evaluateAll((items) => items.map((item) => ({
    src: item.getAttribute('src'),
    type: item.getAttribute('type'),
    inline: item.textContent.trim()
  })));

  expect(scripts).toEqual([{ src: 'src/main.js', type: 'module', inline: '' }]);
});

test('catalogos extraidos preservam a cardinalidade curricular', async ({ page }) => {
  await openWithStorage(page, fixture());
  const counts = await page.evaluate(async () => {
    const [{ legacyCatalog }, { journeyCatalog }, { academyCatalog }, { careerCatalog }, { architectureCatalog }] = await Promise.all([
      import('/src/data/legacy/catalog.js'),
      import('/src/data/journey/catalog.js'),
      import('/src/data/academy/catalog.js'),
      import('/src/data/career/catalog.js'),
      import('/src/data/architecture/catalog.js')
    ]);
    return {
      legacyWeeks: legacyCatalog.weeks.length,
      guidedWeeks: journeyCatalog.guidedWeeks.length,
      missions: journeyCatalog.guidedWeeks.reduce((total, week) => total + week.days.length, 0),
      academyJourney: academyCatalog.journey.length,
      academyIncidents: academyCatalog.incidents.length,
      academyCerts: academyCatalog.certs.length,
      careerLabs: careerCatalog.labs.length,
      englishWeeks: careerCatalog.englishWeeks.length,
      architectures: architectureCatalog.architectures.length
    };
  });

  expect(counts).toEqual({
    legacyWeeks: 12,
    guidedWeeks: 12,
    missions: 60,
    academyJourney: 6,
    academyIncidents: 6,
    academyCerts: 9,
    careerLabs: 4,
    englishWeeks: 12,
    architectures: 6
  });
});

test('bootstrap legado exporta semanas sem recriar globals de catalogo', async ({ page }) => {
  await openWithStorage(page, fixture());
  const result = await page.evaluate(async () => {
    const legacy = await import('/src/bootstrap/legacy-bootstrap.js');
    return {
      weeks: legacy.weeks.length,
      ownsSelect: legacy.weekSelect === document.getElementById('weekSelect'),
      catalogGlobal: 'InfraSecCatalogs' in window,
      legacyGlobal: 'InfraSecLegacy' in window
    };
  });

  expect(result).toEqual({ weeks: 12, ownsSelect: true, catalogGlobal: false, legacyGlobal: false });
});

test('entregaveis sao construidos e deduplicados por sourceId sem mutar a lista', async ({ page }) => {
  await openWithStorage(page, fixture());
  const result = await page.evaluate(async () => {
    const { createDeliverable, prependUniqueDeliverable } = await import('/src/portfolio/deliverables.js');
    const original = [createDeliverable({ id: 'd1', sourceId: 'task-1', title: 'Existente' })];
    const duplicate = prependUniqueDeliverable(original, createDeliverable({ id: 'd2', sourceId: 'task-1', title: 'Duplicado' }));
    const added = prependUniqueDeliverable(original, createDeliverable({ id: 'd3', sourceId: 'task-2', title: 'Novo' }));
    return {
      originalIds: original.map((item) => item.id),
      duplicateIds: duplicate.items.map((item) => item.id),
      duplicateAdded: duplicate.added,
      addedIds: added.items.map((item) => item.id),
      added: added.added
    };
  });

  expect(result).toEqual({
    originalIds: ['d1'],
    duplicateIds: ['d1'],
    duplicateAdded: false,
    addedIds: ['d3', 'd1'],
    added: true
  });
});
