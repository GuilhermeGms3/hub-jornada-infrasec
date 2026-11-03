import { test, expect } from '@playwright/test';
import { certifications } from '../src/certifications/catalog';

test('política interativa distingue regra ampla, específica e negação implícita sem avaliar domínio', async ({
  page,
}) => {
  await page.goto('/#/certificacao/nse4/semana/3/aula/fort-policy');
  const model = page.getByRole('region', { name: 'Percurso de política de firewall' });
  await expect(model).toContainText('Decisão deste modelo: accept.');
  await model.getByRole('button', { name: 'Somente regras específicas' }).click();
  await expect(model).toContainText('Decisão deste modelo: deny.');
  await model.getByLabel('Fluxo para investigar').selectOption('web');
  await expect(model).toContainText('não corresponde');
  await model.getByRole('button', { name: 'Examinar próxima regra' }).click();
  await expect(model).toContainText('Decisão deste modelo: accept.');
  await model.getByLabel('Fluxo para investigar').selectOption('guest');
  await model.getByRole('button', { name: 'Examinar próxima regra' }).click();
  await model.getByRole('button', { name: 'Examinar próxima regra' }).click();
  await expect(model).toContainText('Negação implícita');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('infrasec-learn:v1')!));
  expect(saved.certifications.attempts).toEqual([]);
});

test('catálogo recupera as certificações, filtra Fortinet e trata busca vazia', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/#/certificacoes');
  await expect(page.locator('.cert-grid > section')).toHaveCount(16);
  await expect(page.locator('.global-sidebar nav a')).toHaveCount(29);
  await page.getByLabel('Área', { exact: true }).selectOption('Fortinet');
  await expect(page.locator('.cert-grid > section')).toHaveCount(7);
  await page.getByLabel('Buscar certificação').fill('FortiManager');
  await expect(page.locator('.cert-grid > section')).toHaveCount(1);
  await page.getByRole('link', { name: 'Ver roteiro de 12 semanas' }).click();
  await expect(page.locator('main h1')).toContainText('NSE 6');
  await expect(page.locator('main')).toContainText('NSE 5 não é pré-requisito');
  await page.getByRole('link', { name: 'Todas as certificações' }).click();
  await page.getByLabel('Buscar certificação').fill('certificação inexistente');
  await expect(
    page.getByText('Nenhum roteiro corresponde à busca.', { exact: false }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test('cada certificação abre 12 semanas e ensino interno, sem iframe nem arquivo MD obrigatório', async ({
  page,
}) => {
  for (const c of certifications) {
    await page.goto(`/#/certificacao/${c.id}`);
    await expect(page.locator('main h1')).toHaveText(c.title);
    await expect(page.locator('.cert-weeks > li')).toHaveCount(12);
    await page.getByRole('link', { name: 'Começar Semana 1', exact: true }).click();
    await expect(page.locator('main h1')).toContainText('Semana 1');
    await page.locator('.cert-lesson-links a').first().click();
    await expect(page.getByRole('heading', { name: 'Entenda o mecanismo' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Exercício de compreensão' })).toBeVisible();
    await expect(page.locator('iframe')).toHaveCount(0);
    await expect(page.locator('main a[href$=".md"]')).toHaveCount(0);
  }
});

test('CCNA percorre semanas específicas e mantém matriz v2.0 com lacunas honestas', async ({
  page,
}) => {
  await page.goto('/#/certificacao/ccna/semana/1');
  for (let n = 1; n <= 12; n++) {
    await expect(page.locator('main h1')).toHaveText(
      `Semana ${n} · ${certifications[0].weeks[n - 1].title}`,
    );
    await expect(page.locator('main')).toContainText('Objetivos CCNA v2.0:');
    await expect(
      page.getByRole('heading', { name: 'Aprofundamento ainda necessário' }),
    ).toBeVisible();
    if (n < 12) await page.getByRole('link', { name: `Semana ${n + 1} →`, exact: true }).click();
  }
  await expect(page.locator('main')).toContainText('Ainda não há simulado completo v2.0 calibrado');
});

test('aula, recuperação, leitura e histórico persistem sem aprovar avaliação', async ({ page }) => {
  await page.goto('/#/aula/ipv4');
  await page.getByLabel('Registrei a leitura desta lição').check();
  await page.goto('/#/certificacao/ccna/semana/2/aula/subnetting');
  await expect(page.getByRole('button', { name: 'Conferir meu raciocínio' })).toBeDisabled();
  await page.getByRole('button', { name: 'Mostrar raciocínio do exemplo' }).click();
  await expect(page.locator('.worked-example')).toContainText('sem sobreposição');
  await page.getByRole('radio').first().check();
  await page.getByRole('button', { name: 'Conferir meu raciocínio' }).click();
  await expect(page.locator('.cert-check')).toContainText('Vamos rever o raciocínio');
  const before = page.url();
  await page.getByRole('link', { name: 'Abrir recuperação contextual' }).click();
  await expect(page.locator('#cert-recovery')).toBeFocused();
  expect(page.url()).toBe(before);
  await page.getByLabel('Registrei a leitura desta aula-base').check();
  await page.reload();
  await expect(page.getByLabel('Registrei a leitura desta aula-base')).toBeChecked();
  await expect(page.locator('.cert-check')).toContainText('Vamos rever o raciocínio');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('infrasec-learn:v1')!));
  expect(saved.progress.read).toContain('ipv4');
  expect(saved.progress.runs).toEqual([]);
  expect(saved.certifications.attempts).toHaveLength(1);
  expect(saved.certifications.attempts[0]).toMatchObject({
    certificationId: 'ccna',
    week: 2,
    mode: 'comprehension',
  });
  await page.goto('/#/meu-nivel');
  await expect(page.locator('.cert-history')).toContainText('Revisar o raciocínio');
});

test('caderno autodeclarado exporta e cópia única restaura certificação e R01', async ({
  page,
}) => {
  await page.goto('/#/aula/ipv4');
  await page.getByLabel('Registrei a leitura desta lição').check();
  await page.goto('/#/certificacao/nse6/semana/6');
  await page
    .getByLabel('Observações, raciocínio, erros e próximos testes')
    .fill('Divergência local: preservar revisão e comparar diff. <img src=x onerror=alert(1)>');
  await page.reload();
  await expect(page.getByLabel('Observações, raciocínio, erros e próximos testes')).toHaveValue(
    /Divergência local/,
  );
  await expect(page.locator('main img')).toHaveCount(0);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Baixar meu caderno', exact: true }).click();
  expect((await download).suggestedFilename()).toBe('infrasec-nse6-semana-6.md');
  await page.getByRole('button', { name: 'Progresso neste dispositivo' }).click();
  const backupEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Baixar cópia desta sessão' }).click();
  const backup = await backupEvent;
  const file = await backup.path();
  expect(file).toBeTruthy();
  await page
    .getByLabel('Observações, raciocínio, erros e próximos testes')
    .fill('Alteração posterior');
  await page.getByLabel('Importar cópia de progresso').setInputFiles(file!);
  await expect(page.locator('.backup-panel')).toContainText('TODAS as unidades e certificações');
  await page.getByRole('button', { name: 'Baixar estado anterior e substituir' }).click();
  await expect(page.getByLabel('Observações, raciocínio, erros e próximos testes')).toHaveValue(
    /Divergência local/,
  );
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('infrasec-learn:v1')!));
  expect(saved.progress.read).toContain('ipv4');
  expect(saved.certifications.route).toBe('certificacao/nse6/semana/6');
  expect(saved.certifications.attempts).toEqual([]);
});

test('consultar certificações durante avaliação R01 marca consulta e preserva tentativa', async ({
  page,
}) => {
  await page.goto('/#/avaliacao');
  await page.getByRole('button', { name: 'Iniciar avaliação', exact: true }).click();
  await page.goto('/#/certificacao/ccna/semana/1/aula/connectivity');
  await expect(page.locator('main h1')).toContainText('caminho do cliente');
  await page.goto('/#/avaliacao');
  await expect(page.getByText('Tentativa assistida')).toBeVisible();
});

test('falha ao carregar as aulas mostra recuperação e preserva a unidade anterior', async ({
  page,
}) => {
  await page.route('**/CertificationPage-*.js', (route) => route.abort());
  await page.goto('/#/aula/ipv4');
  await page.getByLabel('Registrei a leitura desta lição').check();
  await page.goto('/#/certificacao/ccna');
  await expect(
    page.getByRole('heading', { name: 'Não foi possível abrir este conteúdo' }),
  ).toBeVisible();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('infrasec-learn:v1')!));
  expect(saved.progress.read).toContain('ipv4');
  await page.getByRole('link', { name: 'Voltar ao início' }).click();
  await expect(page.locator('main h1')).toHaveText('Seu próximo passo, com clareza.');
});

for (const width of [320, 390, 768, 1440])
  test(`certificações responsivas a ${width}px e assets lazy em deep link`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    for (const route of [
      'certificacoes',
      'certificacao/ccna',
      'certificacao/nse4/semana/3',
      'certificacao/nse4/semana/3/aula/fort-policy',
    ]) {
      await page.goto(`/#/${route}`);
      await expect(page.locator('main h1')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
    }
    await page.reload();
    await expect(page.locator('main h1')).toHaveText('FortiGate: encontrar a política de um fluxo');
    expect(errors).toEqual([]);
  });
