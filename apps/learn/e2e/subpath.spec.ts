import { test, expect } from '@playwright/test';
import { createServer, type Server } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

let server: Server;
test.beforeAll(async () => {
  const root = path.resolve('dist');
  server = createServer(async (req, res) => {
    const requestPath = new URL(req.url || '/', 'http://localhost').pathname;
    const filename = path.resolve(root, requestPath.replace(/^\/estudo\//, ''));
    if (!requestPath.startsWith('/estudo/') || !filename.startsWith(root + path.sep)) {
      res.writeHead(404).end();
      return;
    }
    try {
      const data = await readFile(filename);
      const ext = path.extname(filename);
      res
        .writeHead(200, {
          'content-type':
            ext === '.js' ? 'text/javascript' : ext === '.css' ? 'text/css' : 'text/html',
        })
        .end(data);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise<void>((resolve) => server.listen(4184, '127.0.0.1', resolve));
});
test.afterAll(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
});
test('bundle funciona em subdiretório com assets relativos e deep link recarregado', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('http://127.0.0.1:4184/estudo/index.html#/aula/dns');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Do nome ao endereço');
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Do nome ao endereço');
  expect(errors).toEqual([]);
});
