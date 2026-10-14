import { test, expect } from './fixtures';

test('navegación pública desde el menú', async ({ publicPage, page }) => {
  await publicPage.goto();
  await publicPage.navigate('Sobre Nosotros');
  await expect(page).toHaveURL(/\/about$/);
  await publicPage.navigate('Créditos');
  await expect(page).toHaveURL(/\/credits#planes$/);
  await expect(page.getByRole('heading', { name: 'Planes disponibles' })).toBeAttached();
  await publicPage.navigate('Registro');
  await expect(page).toHaveURL(/\/register$/);
});

for (const path of ['/dashboard', '/dashboard/futuro', '/dashboard?section=credits', '/billing', '/billing/result/success', '/admin/metrics', '/purchases']) {
  test(`invitado: protege ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Iniciar sesión', exact: true })).toBeVisible();
  });
}

test('login, biblioteca, regreso y cierre de sesión', async ({ publicPage, dashboard, page }) => {
  await publicPage.login();
  await expect(page).toHaveURL(/\/dashboard/);
  await dashboard.navigate('Mis Ebooks');
  await expect(page).toHaveURL(/section=ebooks/);
  await expect(dashboard.sidebar.getByRole('button', { name: 'Mis Ebooks', exact: true })).toHaveAttribute('aria-current', 'page');
  await page.reload();
  await expect(page).toHaveURL(/section=ebooks/);
  await dashboard.sidebar.getByRole('button', { name: 'PintaEbook, ir al inicio' }).click();
  await expect(page.getByRole('heading', { name: 'Tu espacio de escritura' })).toBeVisible();
  await dashboard.navigate('Cerrar sesión');
  await expect(page).toHaveURL(/\/login$/);
  await dashboard.goto();
  await expect(page).toHaveURL(/\/login$/);
  expect(await page.evaluate(() => localStorage.getItem('token'))).toBeNull();
});

for (const path of ['/login', '/register']) {
  test(`usuario autenticado sale de ${path}`, async ({ dashboard, page }) => {
    await dashboard.authenticate();
    await page.goto(path);
    await expect(page).toHaveURL(/\/dashboard$/);
  });
}

test('JWT vencido elimina la sesión', async ({ dashboard, page }) => {
  const payload = Buffer.from(JSON.stringify({ exp: 1 })).toString('base64url');
  await dashboard.authenticate(`header.${payload}.signature`);
  await dashboard.goto();
  await expect(page).toHaveURL(/\/login$/);
  expect(await page.evaluate(() => localStorage.getItem('token'))).toBeNull();
});

for (const section of ['metrics', 'purchases']) {
  test(`escritor no puede entrar a ${section}`, async ({ dashboard, page }) => {
    await dashboard.authenticate();
    await dashboard.goto(section);
    await expect(page).toHaveURL(/section=dashboard/);
    await expect(dashboard.sidebar.getByRole('button', { name: 'Ver métricas' })).toHaveCount(0);
  });
}
