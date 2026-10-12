import { Component, DestroyRef, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor() {
    const router = inject(Router);
    router.events.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe(event => {
      if (!(event instanceof NavigationEnd)) return;
      const url = router.parseUrl(event.urlAfterRedirects);
      const path = url.root.children['primary']?.segments.map(segment => segment.path).join('/') ?? '';
      const section = url.queryParams['section'];
      const names: Record<string, string> = {
        '': 'Inicio', about: 'Sobre nosotros', credits: 'Créditos y planes', billing: 'Comprar créditos',
        dashboard: 'Mi espacio', login: 'Iniciar sesión', register: 'Registro',
        'purchase-history': 'Historial de compras', purchases: 'Compras', metrics: 'Métricas',
        'buy-credits': 'Planes'
      };
      document.title = `${names[section] ?? names[path] ?? (path.startsWith('billing/result/') ? 'Resultado de compra' : 'PintaEbook')} | PintaEbook`;
      requestAnimationFrame(() => {
        const target = document.querySelector<HTMLElement>('main h1, main, h1');
        if (target) { target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
      });
    });
  }
  skipToContent(event: Event): void {
    const main = document.querySelector<HTMLElement>('main');
    if (!main) return;
    event.preventDefault();
    main.setAttribute('tabindex', '-1');
    main.focus();
    main.scrollIntoView();
  }
  protected readonly title = signal('frontend-ebook');
}
