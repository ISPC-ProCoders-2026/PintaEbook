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
  packages: typeof packages;
  checkouts: unknown[];
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
      checkoutStatus: 503, packages: [...packages], checkouts: [], unexpected: [],
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
      } else if (path.endsWith('/ebooks/')) {
        json = [];
      } else if (path.endsWith('/auth/login/')) {
        json = { access: 'e2e-access', refresh: 'e2e-refresh', user: { id: '1', role: 'writer' } };
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
