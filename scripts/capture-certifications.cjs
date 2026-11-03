// Run with the root static server already listening on loopback: npm run dev.
const { chromium } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
(async () => {
  const target = path.resolve(__dirname, '../docs/quality/evidence');
  fs.mkdirSync(target, { recursive: true });
  const browser = await chromium.launch();
  try {
    for (const [size, viewport] of [['desktop', { width: 1440, height: 1000 }], ['mobile', { width: 390, height: 844 }]]) {
      const page = await browser.newPage({ viewport });
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      for (const [name, route, selector] of [
        ['catalog', 'certificacoes'],
        ['ccna', 'certificacao/ccna'],
        ['fortimanager', 'certificacao/nse6/semana/6'],
        ['policy', 'certificacao/nse4/semana/3/aula/fort-policy', '[aria-label="Percurso de política de firewall"]'],
      ]) {
        await page.goto(`http://127.0.0.1:4173/platform/index.html#/${route}`);
        await page.locator('main h1').waitFor();
        if (selector) await page.locator(selector).scrollIntoViewIfNeeded();
        if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error(`Overflow: ${size}/${route}`);
        await page.screenshot({ path: path.join(target, `certifications-${name}-${size}.png`) });
      }
      if (errors.length) throw new Error(errors.join('\n'));
      await page.close();
    }
    console.log('8 screenshots captured; no overflow or page errors.');
  } finally { await browser.close(); }
})().catch((e) => { console.error(e); process.exitCode = 1; });
