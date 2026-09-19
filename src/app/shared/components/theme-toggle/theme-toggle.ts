import { Component, inject } from '@angular/core';
import { ThemeService } from '../../../service/theme/theme';

@Component({
  selector: 'app-theme-toggle',
  imports: [],
  templateUrl: './theme-toggle.html',
})
export class ThemeToggle {
  readonly themeService = inject(ThemeService);
}
