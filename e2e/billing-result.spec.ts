import { test, expect } from './fixtures';

test('resultado de pago exitoso espera el aumento del saldo', async ({ dashboard, page }) => {
  await dashboard.authenticate();
  await page.evaluate(() => sessionStorage.setItem('pintaebook.checkout.balance', JSON.stringify({
    balance: 250, userId: '1', createdAt: Date.now(),
  })));
  await page.goto('/billing/result/success');

  await expect(page.getByRole('status')).toContainText('Tu saldo se actualizó. Ya podés usar tus créditos.');
  await expect(page.getByText('Saldo disponible: 275 créditos')).toBeVisible();
  expect(await page.evaluate(() => sessionStorage.getItem('pintaebook.checkout.balance'))).toBeNull();
  await expect(page.getByRole('link', { name: 'Volver al dashboard' })).toHaveAttribute('href', '/dashboard');
});

test('resultado de pago rechazado informa que no se completó y muestra el saldo consultado', async ({ dashboard, page }) => {
  await dashboard.authenticate();
  await page.goto('/billing/result/failure');

  await expect(page.getByRole('status')).toContainText('No se completó el pago. Podés volver a intentarlo.');
  await expect(page.getByText('Saldo disponible: 275 créditos')).toBeVisible();
  await page.getByRole('link', { name: 'Comprar créditos' }).click();
  await expect(page).toHaveURL(/\/billing$/);
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('resultado pendiente ofrece volver a consultar el saldo', async ({ dashboard, page }) => {
  await dashboard.authenticate();
  await page.goto('/billing/result/pending');

  await expect(page.getByRole('status')).toContainText('Tu pago está pendiente');
  await expect(page.getByRole('button', { name: 'Consultar saldo' })).toBeEnabled();
  await page.getByRole('button', { name: 'Consultar saldo' }).click();
  await expect(page.getByText('Saldo disponible: 275 créditos')).toBeVisible();
});
