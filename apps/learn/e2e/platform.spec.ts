import { test, expect } from '@playwright/test';
import { pages, canonicalRoute } from '../src/platform/catalog';

test('Hoje, Redes e R01 são uma plataforma nativa com retomada real', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page).toHaveURL(/#\/hoje$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Seu próximo passo, com clareza.',
  );
  await expect(page.locator('.study-facts')).toContainText('0 de 11');
  await expect(page.locator('.global-group')).toHaveCount(6);
  await expect(page.locator('.global-sidebar nav a')).toHaveCount(29);
  await page.getByRole('link', { name: 'Ver formação de redes', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Formação de redes');
  await expect(page.locator('.curriculum-list a')).toHaveCount(0);
  await page.getByRole('link', { name: 'Entrar na unidade NET-R01' }).click();
  await page.getByLabel('Registrei a leitura desta lição').check();
  await page.getByText('Sumário da unidade', { exact: true }).click();
  await page.getByRole('link', { name: '06 Gateway' }).click();
  await page.locator('.global-sidebar').getByRole('link', { name: 'Hoje', exact: true }).click();
  await expect(page.locator('.study-facts')).toContainText('1 de 11');
  await page.getByRole('link', { name: 'Retomar meu estudo' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('A saída para outras redes');
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('A saída para outras redes');
  expect(await page.locator('iframe').count()).toBe(0);
  expect(
    await page.evaluate(() => [...document.querySelectorAll('*')].some((e) => e.shadowRoot)),
  ).toBe(false);
  expect(errors).toEqual([]);
});

test('as 29 responsabilidades têm destino sem anunciar aulas inexistentes', async ({ page }) => {
  await page.goto('/');
  for (const item of pages) {
    await page.evaluate((hash) => {
      location.hash = `#/${hash}`;
    }, item.hash);
    await expect(page.locator('main h1')).toBeVisible();
    if (
      ![
        'hoje',
        'meu-nivel',
        'jornada',
        'visao-semanal',
        'tarefas-jornada',
        'semana-1',
        'redes',
      ].includes(canonicalRoute(item.hash))
    ) {
      await expect(page.locator('.area-status')).toContainText('reformulação');
      await expect(
        page.getByRole('link', { name: new RegExp(`Abrir ${item.name}`) }),
      ).toHaveAttribute('href', new RegExp(`hub-estudos-infrasec.html#${item.hash}$`));
    }
  }
});

test('plano preserva sequência e missão sem fabricar progresso', async ({ page }) => {
  await page.goto('/#/jornada');
  await expect(page.locator('.week-row')).toHaveCount(12);
  await expect(page.locator('.week-row ol li')).toHaveCount(84);
  await expect(page.locator('main')).toContainText('não é uma formação nova concluída');
});

test('consulta global durante avaliação mantém tentativa assistida e chaves antigas', async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem('infrasec-task-progress', '{"original":"preservado"}'),
  );
  await page.goto('/#/avaliacao');
  await page.getByRole('button', { name: 'Iniciar avaliação' }).click();
  await page.locator('.global-sidebar').getByRole('link', { name: 'Hoje', exact: true }).click();
  await page.getByRole('link', { name: 'Retomar tentativa', exact: true }).click();
  await expect(page.getByText('Tentativa assistida')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('infrasec-task-progress'))).toBe(
    '{"original":"preservado"}',
  );
});

for (const width of [320, 390, 768, 1440])
  test(`navegação e estudo responsivos a ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    if (width <= 850) {
      await page.getByRole('button', { name: 'Abrir navegação' }).click();
      await expect(page.getByRole('navigation', { name: 'Navegação global' })).toBeVisible();
      await page.getByRole('button', { name: 'Fechar navegação' }).click();
    }
    for (const hash of ['hoje', 'redes', 'aula/dns', 'pratica', 'cloud', 'jornada']) {
      await page.evaluate((h) => {
        location.hash = h;
      }, hash);
      await expect(page.locator('main h1')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
    }
  });
