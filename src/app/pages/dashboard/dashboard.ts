import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CreditPurchaseMode, CreditsModal } from '../../shared/components-privado/credits-modal/credits-modal';
import { NavbarPrivado } from '../../shared/components-privado/navbar-privado/navbar-privado';
import { MyEbooks } from '../../shared/components-privado/my-ebooks/my-ebooks';
import { EbookSummary } from '../../shared/components-privado/my-ebooks/my-ebooks';
import { Profile } from '../../shared/components-privado/profile/profile';
import { AuthService } from '../../service/login/login';
import { NewEbook } from '../../shared/components-privado/new-ebooks/new-ebook';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CreditsModal, NavbarPrivado, MyEbooks, Profile, NewEbook],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  isCreditsModalOpen = false;
  creditsModalMode: CreditPurchaseMode = 'credits';
  activeSection = 'dashboard';
  selectedEbook: EbookSummary | null = null;

  ngOnInit(): void {
    this.activatedRoute.queryParamMap.subscribe((params) => {
      const section = params.get('section');
      if (section) this.setActiveSection(section);
    });
  }

  setActiveSection(section: string): void {
    this.activeSection = section;
  }

  handleNavigation(section: string): void {
    this.setActiveSection(section);
    if (section === 'credits' || section === 'buy-credits') {
      this.creditsModalMode = section === 'buy-credits' ? 'plans' : 'credits';
      this.isCreditsModalOpen = true;
    }

    if (section === 'metrics') this.openAdminMetrics();
    if (section === 'purchase-history') this.openPurchases();
  }

  openEbook(ebook: EbookSummary): void {
    this.selectedEbook = ebook;
    this.activeSection = 'editor';
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

  openPurchases(): void {
    void this.router.navigate(['/purchases']);
  }
}
