import { test, expect } from './fixtures';

test('login muestra validaciones y permite recuperar acceso', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByText('Ingresa un correo electrónico válido.')).toBeVisible();
  await expect(page.getByText('La contraseña debe contener al menos 6 caracteres.')).toBeVisible();

  await page.getByRole('button', { name: '¿Olvidaste tu contraseña?' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByLabel('Correo electrónico', { exact: true }).last().fill('escritor@example.test');
  await page.getByRole('button', { name: 'Enviar enlace' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('login comunica credenciales incorrectas y conserva el formulario', async ({ api, page }) => {
  api.loginStatus = 401;
  await page.goto('/login');
  await page.locator('#email').fill('escritor@example.test');
  await page.locator('#password').fill('incorrecta123');
  await page.getByRole('button', { name: 'Entrar' }).click();

  await expect(page.getByText('El correo o la contraseña no son correctos. Verifica tus datos e intenta nuevamente.')).toBeVisible();
  await expect(page.locator('#email')).toHaveValue('escritor@example.test');
  await expect(page).toHaveURL(/\/login$/);
});

test('registro valida campos, términos y coincidencia de contraseñas', async ({ api, page }) => {
  await page.goto('/register');
  await page.getByRole('button', { name: 'Registrarme' }).click();
  await expect(page.getByText('Ingresa un correo electrónico válido.')).toBeVisible();
  await expect(page.getByLabel('Acepto los términos y condiciones')).not.toBeChecked();
  expect(api.registrations).toEqual([]);

  await page.locator('#firstName').fill('Ana');
  await page.locator('#lastName').fill('Lectora');
  await page.locator('#register-email').fill('ana@example.test');
  await page.locator('#register-password').fill('secreto123');
  await page.locator('#confirm-password').fill('otra123456');
  await page.getByLabel('Acepto los términos y condiciones').check();
  await expect(page.getByText('Las contraseñas deben coincidir.')).toBeVisible();
  await page.getByRole('button', { name: 'Registrarme' }).click();
  expect(api.registrations).toEqual([]);
});

test('registro envía los datos válidos y abre el dashboard', async ({ api, page }) => {
  await page.goto('/register');
  await page.locator('#firstName').fill('Ana');
  await page.locator('#lastName').fill('Lectora');
  await page.locator('#register-email').fill('ana@example.test');
  await page.locator('#register-password').fill('secreto123');
  await page.locator('#confirm-password').fill('secreto123');
  await page.getByLabel('Acepto los términos y condiciones').check();
  await page.getByRole('button', { name: 'Registrarme' }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  expect(api.registrations).toEqual([{
    first_name: 'Ana', last_name: 'Lectora', email: 'ana@example.test', password: 'secreto123',
  }]);
  await expect(page.getByRole('heading', { name: 'Tu espacio de escritura' })).toBeVisible();
});

test('registro informa que el correo ya está registrado', async ({ api, page }) => {
  api.registerStatus = 409;
  await page.goto('/register');
  await page.locator('#firstName').fill('Ana');
  await page.locator('#lastName').fill('Lectora');
  await page.locator('#register-email').fill('ana@example.test');
  await page.locator('#register-password').fill('secreto123');
  await page.locator('#confirm-password').fill('secreto123');
  await page.getByLabel('Acepto los términos y condiciones').check();
  await page.getByRole('button', { name: 'Registrarme' }).click();

  await expect(page.getByRole('alert')).toContainText('Ya existe una cuenta con ese correo');
  await expect(page).toHaveURL(/\/register$/);
});
