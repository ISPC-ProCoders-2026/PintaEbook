import { test, expect } from './fixtures';

test.beforeEach(async ({ dashboard }) => { await dashboard.authenticate(); });

for (const balance of [275, 0]) {
  test(`dashboard muestra saldo ${balance}`, async ({ api, dashboard }) => {
    api.balance = balance;
    await dashboard.goto();
    await expect(dashboard.balance).toHaveText(String(balance));
  });
}

test('saldo no disponible no se presenta como cero', async ({ api, dashboard }) => {
  api.balanceStatus = 503;
  await dashboard.goto();
  await expect(dashboard.balance).toHaveText('—');
});

test('catálogo, cierre y reapertura de créditos', async ({ dashboard, page }) => {
  await dashboard.goto();
  await dashboard.navigate('Comprar créditos');
  await expect(dashboard.dialog).toBeVisible();
  await expect(dashboard.package('Escritor')).toContainText('500');
  await expect(dashboard.dialog.getByRole('article')).toHaveCount(3);
  await dashboard.closeDialog();
  await expect(dashboard.dialog).toHaveCount(0);
  await expect(page).toHaveURL(/section=dashboard/);
  await dashboard.navigate('Comprar créditos');
  await page.keyboard.press('Escape');
  await expect(dashboard.dialog).toHaveCount(0);
});

test('error de catálogo permite reintentar', async ({ api, dashboard }) => {
  api.packagesStatus = 503;
  await dashboard.goto('credits');
  await expect(dashboard.dialog.getByRole('alert')).toBeVisible();
  api.packagesStatus = 200;
  await dashboard.dialog.getByRole('button', { name: 'Actualizar catálogo' }).click();
  await expect(dashboard.dialog.getByRole('article')).toHaveCount(3);
  await expect(dashboard.dialog.getByRole('alert')).toHaveCount(0);
});

test('compra de créditos redirige a checkout simulado', async ({ api, dashboard, page }) => {
  api.checkoutStatus = 200;
  await dashboard.goto('credits');
  await dashboard.package('Escritor').getByRole('button', { name: 'Comprar con Mercado Pago' }).click();
  await expect(page.getByRole('heading', { name: 'Checkout simulado' })).toBeVisible();
  expect(api.checkouts).toEqual([{ paquete_id: 2 }]);
});

test('planes cambian precios mensual/anual y plan gratis cierra modal', async ({ dashboard }) => {
  await dashboard.goto();
  await dashboard.navigate('Comprar planes');
  await expect(dashboard.dialog.getByRole('heading', { name: 'Escritor', exact: true })).toBeVisible();
  await expect(dashboard.dialog).toContainText('ARS4,000.00');
  const annual = dashboard.dialog.getByRole('switch', { name: 'Facturación anual' });
  await annual.click();
  await expect(annual).toBeChecked();
  await expect(dashboard.dialog).toContainText('ARS38,400.00');
  await expect(dashboard.dialog).toContainText('ARS67,200.00');
  await annual.click();
  await expect(annual).not.toBeChecked();
  await dashboard.dialog.getByRole('button', { name: 'Comenzar gratis' }).click();
  await expect(dashboard.dialog).toHaveCount(0);
});

for (const [name, id] of [['Escritor', 2], ['Editorial', 3]] as const) {
  test(`plan ${name} envía el paquete correcto y permite reintentar pago`, async ({ api, dashboard }) => {
    await dashboard.goto('buy-credits');
    // Scope to the card containing this heading, regardless of its CSS classes.
    const card = dashboard.plan(name);
    await card.getByRole('button', { name: 'Comprar con Mercado Pago' }).click();
    await expect(dashboard.dialog.getByRole('alert')).toContainText('No pudimos iniciar el pago');
    expect(api.checkouts).toEqual([{ paquete_id: id }]);
    await expect(card.getByRole('button', { name: 'Comprar con Mercado Pago' })).toBeEnabled();
    await dashboard.closeDialog();
  });
}

test('plan sin paquete disponible muestra error sin iniciar checkout', async ({ api, dashboard }) => {
  api.packages = [];
  await dashboard.goto('buy-credits');
  await dashboard.dialog.getByRole('button', { name: 'Comprar con Mercado Pago' }).first().click();
  await expect(dashboard.dialog.getByRole('alert')).toContainText('no está disponible');
  expect(api.checkouts).toEqual([]);
});

test('planes públicos: precios y compra requieren login', async ({ publicPage, page }) => {
  await page.evaluate(() => localStorage.clear());
  await publicPage.goto('/credits');
  await expect(page.getByRole('heading', { name: 'Lector', exact: true })).toBeVisible();
  await page.getByRole('switch', { name: 'Facturación anual' }).click();
  await expect(page.locator('#planes')).toContainText('ARS38,400.00');
  await page.getByRole('link', { name: 'Comprar con Mercado Pago' }).first().click();
  await expect(page).toHaveURL(/\/login$/);
});
