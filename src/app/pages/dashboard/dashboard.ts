import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CreditsModal } from '../../shared/components-privado/credits-modal/credits-modal';
import { NavbarPrivado } from '../../shared/components-privado/navbar-privado/navbar-privado';
import { MyEbooks } from '../../shared/components-privado/my-ebooks/my-ebooks';
import { Profile } from '../../shared/components-privado/profile/profile';
import { AuthService } from '../../service/login/login';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CreditsModal, NavbarPrivado, MyEbooks, Profile],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  isCreditsModalOpen = false;
  activeSection = 'dashboard';

  setActiveSection(section: string): void {
    this.activeSection = section;
  }

  handleNavigation(section: string): void {
    this.setActiveSection(section);
    if (section === 'credits' || section === 'buy-credits') this.isCreditsModalOpen = true;
    if (section === 'metrics') this.openAdminMetrics();
  }

  closeCreditsModal(): void {
    this.isCreditsModalOpen = false;
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  openAdminMetrics(): void {
    void this.router.navigate(['/admin/metrics']);
  }
}
