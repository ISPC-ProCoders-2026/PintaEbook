import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly storageKey = 'pinta-ebook-theme';

  readonly isDark = signal(false);

  constructor() {
    const theme = this.readTheme();
    this.isDark.set(theme === 'dark');
    this.applyTheme(theme);
  }

  toggle(): void {
    this.setTheme(this.isDark() ? 'light' : 'dark');
  }

  setTheme(theme: Theme): void {
    this.isDark.set(theme === 'dark');
    this.applyTheme(theme);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.storageKey, theme);
    }
  }

  private readTheme(): Theme {
    if (!isPlatformBrowser(this.platformId)) {
      return 'light';
    }

    const savedTheme = localStorage.getItem(this.storageKey);
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private applyTheme(theme: Theme): void {
    const root = this.document.documentElement;
    root.dataset['theme'] = theme;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
  }
}
