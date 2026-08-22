const { test, expect } = require('@playwright/test');
const { fixture } = require('../fixtures/storage-fixtures');
const { openWithStorage } = require('../helpers/app');

test('catalogo profundo inclui Security+, SC-200 e SC-300 com dominios oficiais', async ({ page }) => {
  await openWithStorage(page, fixture());
  const certs = await page.evaluate(async () => {
    const { academyCatalog } = await import('/src/data/academy/catalog.js');
    return academyCatalog.certs
      .filter((item) => ['securityplus', 'sc200', 'sc300'].includes(item.id))
      .map((item) => ({ id: item.id, domains: item.domains.length, link: item.link }));
  });

  expect(certs).toEqual([
    expect.objectContaining({ id: 'sc200', domains: 3 }),
    expect.objectContaining({ id: 'sc300', domains: 4 }),
    expect.objectContaining({ id: 'securityplus', domains: 5 })
  ]);
  expect(certs.every((item) => item.link.startsWith('https://'))).toBe(true);
});

test('atalho SC-200 abre diretamente o plano correspondente na Academia', async ({ page }) => {
  await openWithStorage(page, fixture(), '#certificacoes');
  await page.locator('[data-cert-plan="sc200"]').first().click();

  await expect(page).toHaveURL(/#certificacoes-pratica$/);
  await expect(page.locator('#deepCertSelect')).toHaveValue('sc200');
  await expect(page.locator('#deepCertOverview')).toContainText('Security Operations Analyst SC-200');
  await expect(page.locator('#deepCertDomains .cert-domain-row')).toHaveCount(3);
});

test('simulador local Security+ inicia uma prova offline sem erro de pagina', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/projetos/cert-antenas/security-plus-sy0-701/index.html');

  await expect(page.locator('h1')).toContainText('CompTIA Security+ Practice Exam');
  await page.locator('#startExamBtn').click();
  await expect(page.locator('#examScreen')).toBeVisible();
  await expect(page.locator('#quiz')).not.toBeEmpty();
  expect(errors).toEqual([]);
});

test('readiness reconhece certificacoes avancadas sem alterar os demais gates', async ({ page }) => {
  await openWithStorage(page, fixture());
  const result = await page.evaluate(async () => {
    const { readinessRules } = await import('/src/readiness/rules.js');
    const readGate = (certs, roleName) => {
      const role = readinessRules.evaluateReadiness({ certs }).roles.find((item) => item.role === roleName);
      return role.gates.find((gate) => gate.label.includes('Plano')).passed;
    };
    return {
      soc: readGate({ sc200: { score: 60 } }, 'SOC'),
      cloud: readGate({ sc300: { score: 60 } }, 'Cloud junior'),
      devsecops: readGate({ sc300: { score: 60 } }, 'DevSecOps junior')
    };
  });

  expect(result).toEqual({ soc: true, cloud: true, devsecops: true });
});
