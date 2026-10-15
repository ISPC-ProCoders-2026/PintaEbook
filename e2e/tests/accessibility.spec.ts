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

  const traverseAndAssertFocus = async (key: 'Tab' | 'Shift+Tab', resetFocus = false) => {
    const visited = new Set<string>();
    if (resetFocus) {
      // Start Tab from the document after the navigation click and axe scan.
      await page.evaluate(() => {
        document.body.setAttribute('tabindex', '-1');
        document.body.focus();
      });
    } else {
      // The forward pass ends on the last control. Seed it so Shift+Tab can
      // verify the complete reverse order without moving focus programmatically.
      const currentIndex = await page.evaluate(() =>
        document.activeElement?.getAttribute('data-e2e-focus-index') ?? null);
      expect(currentIndex).not.toBeNull();
      visited.add(currentIndex!);
    }

    for (let step = 0; step < controlCount && visited.size < ids.length; step++) {
      await page.keyboard.press(key);
      const focusState = await page.evaluate(() => {
        const active = document.activeElement as HTMLElement | null;
        if (!active || active === document.body || active === document.documentElement) return null;
        const style = getComputedStyle(active);
        return {
          index: active.getAttribute('data-e2e-focus-index'),
          focusVisible: active.matches(':focus-visible'),
          outlineStyle: style.outlineStyle,
          outlineWidth: style.outlineWidth,
        };
      });
      expect(focusState, `Tab debe mover el foco a un control (${key})`).not.toBeNull();
      const state = focusState!;
      expect(state.index, 'El foco debe estar en uno de los controles inspeccionados').not.toBeNull();
      expect(state.focusVisible, 'El foco de teclado debe ser visible').toBe(true);
      expect(state.outlineStyle).not.toBe('none');
      expect(parseFloat(state.outlineWidth)).toBeGreaterThan(0);
      visited.add(state.index!);
    }
    expect([...visited].sort()).toEqual([...ids].sort());
  };

  // Recorre controles, incluidos los botones de acción de cada tarjeta, en
  // ambos sentidos y exige un indicador visible en cada parada.
  await traverseAndAssertFocus('Tab', true);
  await traverseAndAssertFocus('Shift+Tab');
});
