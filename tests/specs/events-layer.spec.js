const { test, expect } = require('@playwright/test');
const { fixture } = require('../fixtures/storage-fixtures');
const { openWithStorage } = require('../helpers/app');

test.beforeEach(async ({ page }) => {
  await openWithStorage(page, fixture({ 'infrasec-always-show-full-content': 'true' }), '#hoje');
});

test('camada publica os tres nomes oficiais sem altera-los', async ({ page }) => {
  expect(await page.evaluate(() => window.InfraSecEvents.events)).toEqual({
    PAGE_CHANGED: 'infrasec:page-changed',
    COMPETENCY_CHANGED: 'infrasec:competency-changed',
    DELIVERABLES_CHANGED: 'infrasec:deliverables-changed'
  });
});

test('publish e subscribe entregam o payload de PAGE_CHANGED com pageId', async ({ page }) => {
  const details = await page.evaluate(() => {
    const received = [];
    const { events, publish, subscribe } = window.InfraSecEvents;
    subscribe(events.PAGE_CHANGED, (event) => received.push(event.detail));
    publish(events.PAGE_CHANGED, { pageId: 'library' });
    return received;
  });
  expect(details).toEqual([{ pageId: 'library' }]);
});

test('eventos sem payload preservam detail nulo', async ({ page }) => {
  const details = await page.evaluate(() => {
    const received = [];
    const { events, publish, subscribe } = window.InfraSecEvents;
    subscribe(events.COMPETENCY_CHANGED, (event) => received.push(event.detail));
    subscribe(events.DELIVERABLES_CHANGED, (event) => received.push(event.detail));
    publish(events.COMPETENCY_CHANGED);
    publish(events.DELIVERABLES_CHANGED);
    return received;
  });
  expect(details).toEqual([null, null]);
});

test('publish notifica multiplos listeners na ordem de registro', async ({ page }) => {
  const calls = await page.evaluate(() => {
    const received = [];
    const { events, publish, subscribe } = window.InfraSecEvents;
    subscribe(events.COMPETENCY_CHANGED, () => received.push('primeiro'));
    subscribe(events.COMPETENCY_CHANGED, () => received.push('segundo'));
    publish(events.COMPETENCY_CHANGED);
    return received;
  });
  expect(calls).toEqual(['primeiro', 'segundo']);
});

test('unsubscribe remove somente o listener informado', async ({ page }) => {
  const calls = await page.evaluate(() => {
    const received = [];
    const { events, publish, subscribe, unsubscribe } = window.InfraSecEvents;
    const removed = () => received.push('removido');
    const retained = () => received.push('mantido');
    subscribe(events.COMPETENCY_CHANGED, removed);
    subscribe(events.COMPETENCY_CHANGED, retained);
    unsubscribe(events.COMPETENCY_CHANGED, removed);
    publish(events.COMPETENCY_CHANGED);
    return received;
  });
  expect(calls).toEqual(['mantido']);
});

test('listeners nativos legados continuam recebendo eventos publicados pela camada', async ({ page }) => {
  const count = await page.evaluate(() => {
    let received = 0;
    window.addEventListener('infrasec:deliverables-changed', () => { received += 1; });
    window.InfraSecEvents.publish(window.InfraSecEvents.events.DELIVERABLES_CHANGED);
    return received;
  });
  expect(count).toBe(1);
});

test('mudanca de pagina persiste e atualiza o DOM antes de publicar', async ({ page }) => {
  const observed = await page.evaluate(() => {
    let snapshot;
    const { events, subscribe } = window.InfraSecEvents;
    subscribe(events.PAGE_CHANGED, (event) => {
      snapshot = {
        detail: event.detail,
        stored: localStorage.getItem('infrasec-active-page'),
        activePage: document.body.dataset.hubPage
      };
    });
    window.InfraSecHub.navigateToPage('library', true, false);
    return snapshot;
  });
  expect(observed).toEqual({
    detail: { pageId: 'library' },
    stored: 'library',
    activePage: 'library'
  });
  await page.reload();
  await expect(page.locator('body')).toHaveAttribute('data-hub-page', 'library');
});

test('conclusao de missao persiste antes de publicar competencia', async ({ page }) => {
  await page.evaluate(() => {
    window.__missionStateAtEvent = null;
    const { events, subscribe } = window.InfraSecEvents;
    subscribe(events.COMPETENCY_CHANGED, () => {
      const progress = JSON.parse(localStorage.getItem('infrasec-guided-progress') || '{}');
      window.__missionStateAtEvent = progress['0-0'];
    });
  });
  await page.locator('#completeToday').click();
  expect(await page.evaluate(() => window.__missionStateAtEvent)).toBe('done');
});

test('novo entregavel persiste antes de publicar a atualizacao', async ({ page }) => {
  await page.evaluate(() => {
    window.__deliverablesAtEvent = [];
    const { events, subscribe } = window.InfraSecEvents;
    subscribe(events.DELIVERABLES_CHANGED, () => {
      window.__deliverablesAtEvent = JSON.parse(localStorage.getItem('infrasec-deliverables') || '[]')
        .map((item) => item.sourceId);
    });
  });
  await windowTerminalLab(page);
  expect(await page.evaluate(() => window.__deliverablesAtEvent)).toContain('deep-terminal-linux-files');
});

async function windowTerminalLab(page) {
  await page.evaluate(() => window.InfraSecHub.navigateToPage('terminal', true, false));
  for (const command of ['pwd', 'ls -la', "find /etc -name '*.conf'", 'tail -n 20 /var/log/app.log']) {
    await page.locator('#deepTerminalCommand').fill(command);
    await page.locator('#deepTerminalForm').evaluate((form) => form.requestSubmit());
  }
}
