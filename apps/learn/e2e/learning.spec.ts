import { test, expect, type Page } from '@playwright/test';
import { questionById } from '../src/content/questions';

async function openOutline(page: Page) {
  if (!(await page.locator('.unit-outline').evaluate((e) => e.hasAttribute('open'))))
    await page.getByText('Sumário da unidade', { exact: true }).click();
}

async function chooseCorrect(page: Page) {
  await expect(page.locator('.assessment-run fieldset')).toHaveCount(8);
  const ids = await page
    .locator('.assessment-run fieldset')
    .evaluateAll((items) => items.map((e) => e.querySelector('input')?.getAttribute('name') || ''));
  for (const id of ids)
    await page.locator(`input[name="${id}"][value="${questionById[id].correct}"]`).check();
}
test('leitura real, atividade, feedback e retomada sem contaminar legado', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(() => localStorage.setItem('infrasec-task-progress', 'legado-intacto'));
  await page.goto('/#/aula/redes');
  await expect(page).toHaveTitle('InfraSec · NET-R01');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Uma rede começa com uma conversa',
  );
  await page.locator(`input[name="c-redes"][value="${questionById['c-redes'].correct}"]`).check();
  await page.getByRole('button', { name: 'Pedir pista' }).click();
  await page.getByRole('button', { name: 'Verificar resposta' }).click();
  await expect(
    page.getByRole('status').filter({ hasText: 'Resposta correta neste exercício' }),
  ).toBeVisible();
  await page.getByLabel('Registrei a leitura desta lição').check();
  await openOutline(page);
  await page.getByRole('link', { name: '06 Gateway' }).click();
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('A saída para outras redes');
  expect(await page.evaluate(() => localStorage.getItem('infrasec-task-progress'))).toBe(
    'legado-intacto',
  );
  await openOutline(page);
  await page.getByRole('link', { name: 'Evidências e histórico' }).click();
  await expect(page.getByText('1/11', { exact: true })).toBeVisible();
  await expect(page.getByText('Demonstrado neste recorte', { exact: true })).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('máscara e percurso respondem aos controles; todas as lições têm conteúdo', async ({
  page,
}) => {
  await page.goto('/#/aula/mascara');
  await expect(page.getByText('Mesmo prefixo: rede diretamente conectada.')).toBeVisible();
  await page.getByLabel('Prefixo', { exact: true }).selectOption('26');
  await expect(page.getByText('Prefixos diferentes: procurar rota remota.')).toBeVisible();
  await page.goto('/#/aula/percurso');
  await page.getByRole('button', { name: 'Próxima etapa' }).click();
  await expect(page.locator('.flow-explanation')).toContainText('Usar cache ou consultar DNS');
  await page.getByRole('button', { name: 'Próxima etapa' }).click();
  await expect(page.locator('.flow-explanation')).toContainText('Chegar ao próprio resolvedor');
  for (const id of [
    'redes',
    'cliente-servidor',
    'ipv4',
    'mascara',
    'mac',
    'gateway',
    'dns',
    'tcp',
    'https',
    'percurso',
    'diagnostico',
  ]) {
    await page.goto(`/#/aula/${id}`);
    await expect(page.locator('.lesson-section')).toHaveCount(3);
    await expect(page.locator('.worked-example')).toBeVisible();
  }
});

test('laboratório exige evidências, registra ajuda e mostra diagnóstico', async ({ page }) => {
  await page.goto('/#/pratica');
  await page.getByLabel('Cenário', { exact: true }).selectOption('dns-failure');
  await page.getByRole('button', { name: 'Pedir pista' }).click();
  await page.getByLabel('Investigar consulta/caminho DNS, sem causa exata comprovada.').check();
  await page.getByRole('button', { name: 'Verificar diagnóstico' }).click();
  await expect(page.getByRole('alert')).toContainText('Ainda faltam evidências');
  await page.getByRole('button', { name: 'ping no IP remoto' }).click();
  await page.getByRole('button', { name: 'nslookup portal.example' }).click();
  await page.getByRole('button', { name: 'Verificar diagnóstico' }).click();
  await expect(page.getByText('Diagnóstico sustentado neste cenário.')).toBeVisible();
  await page.reload();
  await expect(page.getByText('Diagnóstico sustentado neste cenário.')).toBeVisible();
  const p = await page.evaluate(
    () => JSON.parse(localStorage.getItem('infrasec-learn:v1')!).progress,
  );
  expect(p.labAttempts[0].hintLevel).toBe(1);
  expect(p.attempts).toHaveLength(0);
});

test('avaliação não antecipa gabarito, persiste rascunho e concede apenas evidência restrita', async ({
  page,
}) => {
  await page.goto('/#/avaliacao');
  await page.getByRole('button', { name: 'Iniciar avaliação', exact: true }).click();
  await chooseCorrect(page);
  await page.reload();
  await expect(page.getByRole('status').filter({ hasText: '8/8 respostas' })).toBeVisible();
  await expect(page.getByText('Resposta correta neste exercício.', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Concluir e ver correção' }).click();
  await expect(page.getByRole('heading', { name: 'Resultado observado: 8/8' })).toBeVisible();
  await page.getByRole('button', { name: 'Iniciar outra tentativa' }).click();
  await chooseCorrect(page);
  await page.getByRole('button', { name: 'Concluir e ver correção' }).click();
  await page.getByRole('link', { name: 'Ver evidências por objetivo' }).click();
  await expect(page.getByText('Demonstrado neste recorte', { exact: true })).toHaveCount(8);
});

test('consulta durante avaliação a reclassifica e recuperação tem atividade diferente', async ({
  page,
}) => {
  await page.goto('/#/avaliacao');
  await page.getByRole('button', { name: 'Iniciar avaliação', exact: true }).click();
  await openOutline(page);
  await page.getByRole('link', { name: '07 DNS', exact: true }).click();
  await openOutline(page);
  await page.getByRole('link', { name: 'Avaliação independente', exact: true }).click();
  await chooseCorrect(page);
  await page.getByRole('button', { name: 'Concluir e ver correção' }).click();
  await expect(
    page.getByText(
      'Tentativa assistida. O resultado registra prática e não desempenho independente.',
    ),
  ).toBeVisible();
  await openOutline(page);
  await page.getByRole('link', { name: 'Recuperar conceitos', exact: true }).click();
  await expect(page.locator('.recovery-section')).toHaveCount(6);
  await page
    .locator(`input[name="m-gateway-dns"][value="${questionById['m-gateway-dns'].correct}"]`)
    .check();
  await page.locator('#gateway-dns').getByRole('button', { name: 'Verificar resposta' }).click();
  await expect(page.locator('#gateway-dns')).toContainText('Resposta correta neste exercício.');
});

test('revisão é funcional e antecipação não vira retenção medida', async ({ page }) => {
  await page.goto('/#/revisao');
  await page.getByRole('button', { name: 'Iniciar revisão' }).click();
  await chooseCorrect(page);
  await page.getByRole('button', { name: 'Concluir e ver correção' }).click();
  await expect(page.getByRole('heading', { name: 'Resultado observado: 8/8' })).toBeVisible();
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem('infrasec-learn:v1')!).progress.reviews.length,
    ),
  ).toBe(1);
});

test('dados corrompidos ficam intactos e a sessão continua utilizável', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('infrasec-learn:v1', '{corrompido'));
  await page.goto('/#/aula/redes');
  await expect(page.getByRole('alert').first()).toContainText(
    'Os dados antigos não foram sobrescritos',
  );
  await page.getByLabel('Registrei a leitura desta lição').check();
  expect(await page.evaluate(() => localStorage.getItem('infrasec-learn:v1'))).toBe('{corrompido');
});

test('quota bloqueada informa não salvo sem perder interação em memória', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('Quota excedida', 'QuotaExceededError');
    };
  });
  await page.goto('/#/aula/redes');
  await page.getByLabel('Registrei a leitura desta lição').check();
  await expect(page.getByRole('status').first()).toContainText('Não salvo no dispositivo');
  await expect(page.getByLabel('Registrei a leitura desta lição')).toBeChecked();
});

test('mobile, teclado e navegação inválida continuam acessíveis', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/rota-inexistente');
  await expect(page.getByRole('alert')).toContainText('não pertence à plataforma');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.getByRole('link', { name: 'Começar a unidade', exact: true }).click();
  await page.getByText('Sumário da unidade', { exact: true }).click();
  await page.getByRole('link', { name: '06 Gateway' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('A saída para outras redes');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('link', { name: 'Pular para o conteúdo' }).focus();
  await page.keyboard.press('Enter');
  expect(await page.evaluate(() => document.activeElement?.id)).toBe('main');
  expect(page.url()).toContain('/aula/gateway');
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => document.activeElement?.tagName)).not.toBe('BODY');
});

test('exportação e importação preservam progresso após confirmação', async ({ page }) => {
  await page.goto('/#/aula/redes');
  await page.getByLabel('Registrei a leitura desta lição').check();
  await page.getByRole('button', { name: 'Salvar cópia', exact: true }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Baixar cópia desta sessão' }).click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).not.toBeNull();
  await page.getByLabel('Registrei a leitura desta lição').uncheck();
  await page.getByLabel('Importar cópia de progresso').setInputFiles(path!);
  await expect(page.getByText(/Cópia válida: 1 leituras/)).toBeVisible();
  await expect(page.getByLabel('Registrei a leitura desta lição')).not.toBeChecked();
  await page.getByRole('button', { name: 'Baixar estado anterior e substituir' }).click();
  await expect(page.getByLabel('Registrei a leitura desta lição')).toBeChecked();
});
