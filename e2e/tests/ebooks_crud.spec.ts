import { test, expect } from '../fixtures';
import { readFile } from 'node:fs/promises';

test('test_create_ebook_success', async ({ api, dashboard, page }) => {
  const title = 'Manual de TypeScript 2026';
  const description = 'Guía práctica de desarrollo';
  const idea = 'Manual didáctico para aprender TypeScript desde cero.';

  await dashboard.authenticate();
  await dashboard.goto();
  await dashboard.navigate('Nuevo Ebook');

  await expect(page.getByRole('heading', { name: 'Preparate para crear tu E-book' })).toBeVisible();
  await page.locator('input[formcontrolname="title"]').fill(title);
  await page.locator('textarea[formcontrolname="description"]').fill(description);
  await page.locator('textarea[formcontrolname="prompt"]').fill(idea);
  await page.locator('select[formcontrolname="genre"]').selectOption({ index: 2 });
  await page.locator('select[formcontrolname="contentType"]').selectOption({ index: 2 });

  const creationResponse = page.waitForResponse((response) =>
    response.request().method() === 'POST' && new URL(response.url()).pathname.endsWith('/api/ebooks/'));
  await page.getByRole('button', { name: /Generar E-book/ }).click();
  expect((await creationResponse).status()).toBe(201);

  await expect(page.getByRole('heading', { name: 'Generador de Ebook' })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('heading', { name: /Cap.tulo 1:/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Conceptos iniciales' })).toBeVisible();
  await expect(page.getByText('Contenido de prueba del manuscrito.')).toBeVisible();

  expect(api.ebookCreateRequests).toHaveLength(1);
  expect(api.ebookCreateRequests[0]).toMatchObject({
    title,
    description,
    quantity_chapters: 3,
  });
  expect(api.ebookCreateRequests[0]['prompt_idea']).toContain(idea);
  expect(api.ebookCreateRequests[0]['prompt_idea']).toContain('Tipo de contenido:');

  // El mock conserva los metadatos devueltos por el POST 201 y la vista
  // previa solo se abre tras confirmar la generación y cargar el manuscrito.
  expect(api.ebooks[0]).toMatchObject({
    ebook_id: api.ebookId,
    title,
    description,
    status: 'PROCESSING',
  });
});

test('test_export_ebook_epub_download', async ({ api, dashboard, page }) => {
  const ebookId = 'ebook-ready-for-export';
  const title = 'Manual de TypeScript 2026';
  api.ebooks = [{
    ebook_id: ebookId,
    title,
    description: 'GuÃ­a prÃ¡ctica de desarrollo',
    status: 'COMPLETED',
    created_at: '2026-10-10T00:00:00Z',
    updated_at: '2026-10-12T00:00:00Z',
  }];
  // The export route derives the resource identifier from the data under test.
  api.ebookId = ebookId;

  await dashboard.authenticate();
  await dashboard.goto();
  await dashboard.navigate('Mis Ebooks');

  const card = page.locator('.ebook-card').filter({ has: page.getByRole('heading', { name: title, exact: true }) });
  await expect(card).toBeVisible();
  const exportResponsePromise = page.waitForResponse((response) =>
    response.request().method() === 'GET' && new URL(response.url()).pathname.endsWith(`/api/ebooks/${ebookId}/export/epub/`));
  const downloadPromise = page.waitForEvent('download');
  await card.getByRole('button', { name: 'Exportar EPUB', exact: true }).click();

  const [response, download] = await Promise.all([exportResponsePromise, downloadPromise]);
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/epub+zip');
  expect(download.suggestedFilename()).toBe('manual-typescript.epub');

  const downloadedPath = await download.path();
  expect(downloadedPath).not.toBeNull();
  const downloadedBytes = await readFile(downloadedPath!);
  expect(downloadedBytes.subarray(0, 4)).toEqual(Buffer.from([0x50, 0x4b, 0x03, 0x04]));

  expect(api.ebookExportRequests).toEqual([{
    path: `/api/ebooks/${ebookId}/export/epub/`,
    authorization: 'Bearer e2e-access',
  }]);
  await expect(card.getByRole('button', { name: 'Descarga iniciada' })).toBeVisible();
});
