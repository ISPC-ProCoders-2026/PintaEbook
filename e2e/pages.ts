import { Page } from '@playwright/test';

export class PublicPage {
  constructor(readonly page: Page) {}
  get nav() { return this.page.getByRole('navigation', { name: 'Navegación principal' }); }
  goto(path = '/') { return this.page.goto(path); }
  navigate(name: string) { return this.nav.getByRole('link', { name, exact: true }).click(); }
  async login() {
    await this.goto('/login');
    await this.page.locator('#email').fill('escritor@example.test');
    await this.page.locator('#password').fill('Prueba123!');
    await this.page.locator('button[type="submit"]').click();
  }
}

export class DashboardPage {
  constructor(readonly page: Page) {}
  get sidebar() { return this.page.locator('#dashboard-sidebar'); }
  get dialog() { return this.page.getByRole('dialog'); }
  get balance() { return this.page.locator('.stat-card').filter({ hasText: 'Créditos disponibles' }).locator('strong'); }
  async authenticate(token = 'e2e-access') {
    // Seed once, so reloads cannot restore a session after logout.
    await this.page.goto('/login');
    await this.page.evaluate(value => {
      localStorage.setItem('token', value);
      localStorage.setItem('userId', '1');
      localStorage.setItem('userRole', 'writer');
    }, token);
  }
  goto(section?: string) { return this.page.goto('/dashboard' + (section ? `?section=${section}` : '')); }
  navigate(name: string) { return this.sidebar.getByRole('button', { name, exact: true }).click(); }
  closeDialog() { return this.dialog.getByRole('button', { name: 'Cerrar', exact: true }).click(); }
  plan(name: string) {
    return this.dialog.getByRole('heading', { name, exact: true }).locator('../..');
  }
  package(name: string) {
    return this.dialog.getByRole('article').filter({ has: this.page.getByRole('heading', { name, exact: true }) });
  }
}
