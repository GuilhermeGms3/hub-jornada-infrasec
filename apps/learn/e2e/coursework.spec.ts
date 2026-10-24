import { test, expect, type Page } from '@playwright/test';
import { courseUnits, courseQuestionById } from '../src/coursework/catalog';
// JSON curriculum uses import attributes in the catalog to support both Vite and Node.
async function answerSet(page: Page, wrong = false) {
  await expect(page.locator('.course-assessment fieldset')).toHaveCount(4);
  const ids = await page
    .locator('.course-assessment input[type=radio]')
    .evaluateAll((elements) => [...new Set(elements.map((e) => e.getAttribute('name')!))]);
  for (const [id, index] of ids.map((id, i) => [id, i] as const)) {
    const q = courseQuestionById.get(id)!;
    await page
      .locator(
        `input[name="${id}"][value="${wrong && index === 0 ? q.options.find((o) => o.id !== q.correct)!.id : q.correct}"]`,
      )
      .check();
  }
}
for (const unit of courseUnits)
  test(`${unit.id}: aula → exemplo → prática → avaliação → revisão → jornada`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/#/aula/dns');
    await page.getByLabel('Registrei a leitura desta lição').check();
    await page.goto(`/#/unidade/${unit.id}/${unit.lessons[0].id}`);
    await expect(page.locator('main h1')).toHaveText(unit.lessons[0].title);
    await expect(page.locator('.lesson-section')).toHaveCount(3);
    await expect(page.locator('.worked-example')).toBeVisible();
    const check = unit.questions.find(
      (q) => q.lessonId === unit.lessons[0].id && q.purpose === 'comprehension',
    )!;
    await page.locator(`input[name="${check.id}"][value="${check.correct}"]`).check();
    await page.getByRole('button', { name: 'Pedir orientação' }).click();
    await page.getByRole('button', { name: 'Verificar resposta', exact: true }).click();
    await expect(
      page.getByText('Resposta correta neste exercício.', { exact: true }),
    ).toBeVisible();
    await page.getByLabel('Registrei a leitura desta lição').check();
    await page.reload();
    await expect(page.getByLabel('Registrei a leitura desta lição')).toBeChecked();
    await page.goto(`/#/unidade/${unit.id}/pratica`);
    await page
      .locator(`input[name="${unit.lab.question.id}"][value="${unit.lab.question.correct}"]`)
      .check();
    await page.getByRole('button', { name: 'Verificar resposta', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('Colete');
    for (const id of unit.lab.required)
      await page
        .getByRole('button', {
          name: unit.lab.outputs.find((o) => o.id === id)!.label,
          exact: true,
        })
        .click();
    await page.getByRole('button', { name: 'Verificar resposta', exact: true }).click();
    await expect(
      page.getByText('Resposta correta neste exercício.', { exact: true }),
    ).toBeVisible();
    if (unit.id === 'net-r04') {
      await page
        .getByLabel('Impacto e escopo')
        .fill('Caso simulado: exportação do relatório falha.');
      const download = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Exportar runbook' }).click();
      expect((await download).suggestedFilename()).toBe('runbook-infrasec.md');
      await page.reload();
      await expect(page.getByLabel('Impacto e escopo')).toHaveValue(/Caso simulado/);
    }
    await page.goto(`/#/unidade/${unit.id}/avaliacao`);
    await page.getByRole('button', { name: 'Iniciar avaliação', exact: true }).click();
    await page.getByRole('button', { name: 'Concluir e ver correção' }).click();
    await expect(page.getByRole('alert')).toContainText('todos');
    await answerSet(page);
    await page.reload();
    await expect(page.getByText('4/4 respostas salvas', { exact: false })).toBeVisible();
    await expect(page.getByText('Resposta correta neste exercício.', { exact: true })).toHaveCount(
      0,
    );
    await page.getByRole('button', { name: 'Concluir e ver correção' }).click();
    await expect(page.getByRole('heading', { name: 'Resultado observado: 4/4' })).toBeVisible();
    await page.getByRole('link', { name: 'Revisão posterior', exact: true }).last().click();
    await page.getByRole('button', { name: 'Iniciar revisão', exact: true }).click();
    await answerSet(page);
    await page.getByRole('button', { name: 'Concluir e ver correção' }).click();
    await expect(page.getByRole('heading', { name: 'Resultado observado: 4/4' })).toBeVisible();
    await page.getByRole('link', { name: 'Voltar à jornada', exact: true }).click();
    await expect(page.locator('.week-one-teaching')).toContainText(unit.id.toUpperCase());
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('infrasec-learn:v1')!));
    expect(saved.progress.read).toContain('dns');
    expect(saved.coursework.runs).toHaveLength(2);
    expect(saved.coursework.runs.every((r: { consulted: boolean }) => !r.consulted)).toBe(true);
    expect(errors).toEqual([]);
  });
test('consulta global, recuperação diferente e backup preservam o contexto', async ({ page }) => {
  await page.goto('/#/unidade/net-r02/avaliacao');
  await page.getByRole('button', { name: 'Iniciar avaliação', exact: true }).click();
  await page.locator('.global-sidebar').getByRole('link', { name: 'Hoje', exact: true }).click();
  await page.getByRole('link', { name: 'Retomar meu estudo', exact: true }).click();
  await expect(page.getByText('Tentativa assistida', { exact: false })).toBeVisible();
  await answerSet(page, true);
  await page.getByRole('button', { name: 'Concluir e ver correção' }).click();
  await expect(
    page.getByText('Tentativa assistida: registra prática, não desempenho independente.'),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Rever explicações e praticar em outra situação' }).click();
  await expect(page.locator('.recovery-section')).toHaveCount(4);
  await page.getByRole('button', { name: 'Progresso neste dispositivo' }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Baixar cópia desta sessão' }).click();
  const file = await (await downloadPromise).path();
  await page.getByLabel('Importar cópia de progresso').setInputFiles(file!);
  await expect(page.getByText(/respostas das unidades novas/)).toBeVisible();
  await page.getByRole('button', { name: 'Baixar estado anterior e substituir' }).click();
  await expect(page).toHaveURL(/unidade\/net-r02\/recuperacao$/);
});
test('Hoje e mapa oferecem ensino interno sem bloqueio de pré-requisitos', async ({ page }) => {
  await page.goto('/#/semana-1');
  await expect(page.locator('.week-one-teaching > details')).toHaveCount(7);
  await page.goto('/#/dependencias');
  await expect(page.locator('.week-row')).toHaveCount(12);
  await page.locator('.week-row').first().locator('summary').first().click();
  await page.getByRole('link', { name: 'Aula e exemplo', exact: true }).first().click();
  await expect(page.locator('main h1')).toHaveText('Ler a interface certa');
});
for (const width of [320, 390, 768, 1440])
  test(`novas unidades preservam layout a ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      'unidade/net-r02/dora',
      'unidade/net-r03/pratica',
      'unidade/net-r04/pratica',
      'semana-1',
      'dependencias',
    ]) {
      await page.goto(`/#/${route}`);
      await expect(page.locator('main h1')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
    }
  });
