import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '../fixtures';

const sampleEbooks = [
  { ebook_id: 'ebook-1', title: 'La casa de los silencios', description: 'Una novela de misterio.', status: 'PROCESSING', created_at: '2026-10-01T00:00:00Z', updated_at: '2026-10-10T00:00:00Z' },
  { ebook_id: 'ebook-2', title: 'Recetas de otoño', description: 'Un recetario familiar.', status: 'COMPLETED', created_at: '2026-10-02T00:00:00Z', updated_at: '2026-10-11T00:00:00Z' },
  { ebook_id: 'ebook-3', title: 'Viaje al sur', description: 'Crónicas de viaje.', status: 'FAILED', created_at: '2026-10-03T00:00:00Z', updated_at: '2026-10-12T00:00:00Z' },
];

test('test_ebooks_dashboard_a11y', async ({ api, dashboard, page }) => {
  api.ebooks = sampleEbooks;
  await dashboard.authenticate();
  await dashboard.goto();
  await expect(page.getByRole('heading', { name: 'Tu espacio de escritura' })).toBeVisible();

  const dashboardResults = await new AxeBuilder({ page }).analyze();
  expect(dashboardResults.violations.filter(({ impact }) => impact === 'critical' || impact === 'serious'))
    .toEqual([]);

  await dashboard.sidebar.getByRole('button', { name: 'Mis Ebooks', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Mis Ebooks' })).toBeVisible();
  await expect(page.locator('.ebook-card')).toHaveCount(sampleEbooks.length);

  const libraryResults = await new AxeBuilder({ page }).analyze();
  expect(libraryResults.violations.filter(({ impact }) => impact === 'critical' || impact === 'serious'))
    .toEqual([]);

  const controls = page.locator('button:visible, a:visible, input:visible, select:visible');
  const controlCount = await controls.count();
  const ids = await controls.evaluateAll((elements) => elements.map((element, index) => {
    element.setAttribute('data-e2e-focus-index', String(index));
    return String(index);
  }));

  const assertKeyboardFocusVisible = async () => {
    const active = page.locator(':focus');
    await expect(active).toHaveAttribute('data-e2e-focus-index', /\d+/);
    const styles = await active.evaluate((element) => {
      const style = getComputedStyle(element);
      return { focusVisible: element.matches(':focus-visible'), outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth };
    });
    expect(styles.focusVisible, 'El control debe mostrar foco al navegar con teclado').toBe(true);
    expect(styles.outlineStyle).not.toBe('none');
    expect(parseFloat(styles.outlineWidth)).toBeGreaterThan(0);
  };

  // Recorre hacia delante toda la secuencia tabulable, incluidos los botones
  // de cada tarjeta; cada foco debe tener un indicador visible.
  const visitedForward = new Set<string>();
  for (let step = 0; step < controlCount * 2 && visitedForward.size < ids.length; step++) {
    await page.keyboard.press('Tab');
    const index = await page.locator(':focus').getAttribute('data-e2e-focus-index');
    if (index !== null) {
      visitedForward.add(index);
      await assertKeyboardFocusVisible();
    }
  }
  expect([...visitedForward].sort()).toEqual(ids);

  // Desde el final, recorre la secuencia inversa con Shift+Tab.
  const visitedBackward = new Set<string>();
  for (let step = 0; step < controlCount * 2 && visitedBackward.size < ids.length; step++) {
    await page.keyboard.press('Shift+Tab');
    const index = await page.locator(':focus').getAttribute('data-e2e-focus-index');
    if (index !== null) {
      visitedBackward.add(index);
      await assertKeyboardFocusVisible();
    }
  }
  expect([...visitedBackward].sort()).toEqual(ids);
});
