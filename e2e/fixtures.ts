import { test as base, expect } from '@playwright/test';
import { DashboardPage, PublicPage } from './pages';

export const packages = [
  { id: 1, nombre: 'Inicial', cantidad_creditos: 100, precio: '1000.00' },
  { id: 2, nombre: 'Escritor', cantidad_creditos: 500, precio: '4000.00' },
  { id: 3, nombre: 'Editorial', cantidad_creditos: 1000, precio: '7000.00' },
];
type MockApi = {
  balance: number;
  balanceStatus: number;
  packagesStatus: number;
  checkoutStatus: number;
  loginStatus: number;
  registerStatus: number;
  packages: typeof packages;
  ebooks: { ebook_id: string; title: string; description: string; status: string; created_at: string; updated_at: string }[];
  ebookCreateRequests: Record<string, unknown>[];
  ebookId: string;
  ebookExportRequests: { path: string; authorization: string | undefined }[];
  checkouts: unknown[];
  registrations: unknown[];
  unexpected: string[];
};

export const test = base.extend<{
  api: MockApi;
  dashboard: DashboardPage;
  publicPage: PublicPage;
}>({
  api: [async ({ page }, use) => {
    const api: MockApi = {
      balance: 275, balanceStatus: 200, packagesStatus: 200,
      checkoutStatus: 503, loginStatus: 200, registerStatus: 201,
      packages: [...packages], checkouts: [], registrations: [], unexpected: [],
      ebooks: [], ebookCreateRequests: [], ebookId: 'e2e-created-ebook', ebookExportRequests: [],
    };
    // Every API request is intercepted; unknown endpoints fail the test.
    await page.route('**/api/**', async route => {
      const path = new URL(route.request().url()).pathname;
      let status = 200;
      let json: unknown;
      if (path.endsWith('/billing/balance/')) {
        status = api.balanceStatus;
        json = { credits_available: api.balance, last_updated: '2026-10-01T00:00:00Z' };
      } else if (path.endsWith('/billing/packages/')) {
        status = api.packagesStatus;
        json = api.packages;
      } else if (path.endsWith('/billing/checkout/')) {
        api.checkouts.push(route.request().postDataJSON());
        status = api.checkoutStatus;
        json = { init_point: 'https://www.mercadopago.com.ar/checkout/mock' };
      } else if (path.endsWith('/ebooks/') && route.request().method() === 'POST') {
        const payload = route.request().postDataJSON() as Record<string, unknown>;
        api.ebookCreateRequests.push(payload);
        status = 201;
        json = { ebook_id: api.ebookId };
        api.ebooks.unshift({
          ebook_id: api.ebookId,
          title: String(payload['title'] ?? ''),
          description: String(payload['description'] ?? ''),
          status: 'PROCESSING',
          created_at: '2026-10-14T00:00:00Z',
          updated_at: '2026-10-14T00:00:00Z',
        });
      } else if (path.endsWith('/export/epub/')) {
        api.ebookExportRequests.push({
          path,
          authorization: route.request().headers()['authorization'],
        });
        await route.fulfill({
          status: 200,
          contentType: 'application/epub+zip',
          headers: { 'Content-Disposition': 'attachment; filename="manual-typescript.epub"' },
          // ZIP local-file signature plus mock binary bytes for download handling.
          body: Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00]),
        });
        return;
      } else if (path.endsWith(`/ebooks/${api.ebookId}/content/`)) {
        json = {
          ebook_id: api.ebookId,
          chapters: [{
            id: 'chapter-1',
            title: 'Introducción',
            sections: [{ id: 'section-1', title: 'Conceptos iniciales', content_html: '<p>Contenido de prueba del manuscrito.</p>' }],
          }],
        };
      } else if (path.endsWith(`/ebooks/${api.ebookId}/`)) {
        const created = api.ebooks.find((ebook) => ebook.ebook_id === api.ebookId);
        json = { ebook_id: api.ebookId, title: created?.title ?? '', status: 'COMPLETED' };
      } else if (path.endsWith('/ebooks/')) {
        json = { count: api.ebooks.length, next: null, previous: null, results: api.ebooks };
      } else if (path.endsWith('/auth/login/')) {
        status = api.loginStatus;
        json = status >= 400 ? { detail: 'Credenciales inválidas' } : { access: 'e2e-access', refresh: 'e2e-refresh', user: { id: '1', role: 'writer' } };
      } else if (path.endsWith('/auth/register/')) {
        api.registrations.push(route.request().postDataJSON());
        status = api.registerStatus;
        json = status >= 400 ? { detail: 'Correo ya registrado' } : { access: 'e2e-access', refresh: 'e2e-refresh', user: { id: '1', role: 'writer' } };
      } else {
        api.unexpected.push(`${route.request().method()} ${path}`);
        status = 500;
        json = { detail: 'Endpoint sin mock' };
      }
      await route.fulfill({ status, json });
    });
    await page.route('https://www.mercadopago.com.ar/**', route => route.fulfill({
      contentType: 'text/html', body: '<h1>Checkout simulado</h1>',
    }));
    await use(api);
    expect(api.unexpected, 'No debe accederse a endpoints sin mock').toEqual([]);
  }, { auto: true }],
  dashboard: async ({ page }, use) => { await use(new DashboardPage(page)); },
  publicPage: async ({ page }, use) => { await use(new PublicPage(page)); },
});
export { expect };
