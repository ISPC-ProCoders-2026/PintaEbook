import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NavbarPrivado } from '../navbar-privado/navbar-privado';
import { AuthService } from '../../../service/login/login';

@Component({
  selector: 'app-admin-metrics',
  standalone: true,
  imports: [NavbarPrivado],
  templateUrl: './admin-metrics.html',
  styleUrl: './admin-metrics.css'
})
export class AdminMetrics {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  backToDashboard(): void {
    void this.router.navigate(['/dashboard']);
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }

  handleNavigation(section: string): void {
    if (section === 'dashboard') this.backToDashboard();
    if (section === 'purchases') void this.router.navigate(['/admin/purchases']);
    if (['ebooks', 'new-ebook', 'editor', 'profile', 'settings', 'credits', 'buy-credits'].includes(section)) {
      this.openDashboardSection(section);
    }
  }

  handleBrandClick(): void {
    this.backToDashboard();
  }

  private openDashboardSection(section: string): void {
    void this.router.navigate(['/dashboard'], { queryParams: { section } });
  }
}
