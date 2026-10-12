import { AdminPurchases } from '../../shared/components-privado/admin-purchases/admin-purchases';
import { AdminMetrics } from '../../shared/components-privado/admin-metrics/admin-metrics';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CreditPurchaseMode, CreditsModal } from '../../shared/components-privado/credits-modal/credits-modal';
import { NavbarPrivado } from '../../shared/components-privado/navbar-privado/navbar-privado';
import { MyEbooks } from '../../shared/components-privado/my-ebooks/my-ebooks';
import { EbookSummary } from '../../shared/components-privado/my-ebooks/my-ebooks';
import { Profile } from '../../shared/components-privado/profile/profile';
import { AuthService } from '../../service/login/login';
import { NewEbook } from '../../shared/components-privado/new-ebooks/new-ebook';
import { BookLoader } from '../../shared/components-privado/book-loader/book-loader';
import { CreditBalance } from '../../models/billing.model';
import { BillingService } from '../../service/billing/billing';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [AdminPurchases, AdminMetrics, CreditsModal, NavbarPrivado, MyEbooks, Profile, NewEbook, BookLoader],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnDestroy, OnInit {
  private readonly authService = inject(AuthService);
  private readonly billingService = inject(BillingService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly subscriptions = new Subscription();

  isCreditsModalOpen = false;
  creditsModalMode: CreditPurchaseMode = 'credits';
  activeSection = 'dashboard';
  selectedEbook: EbookSummary | null = null;
  readonly creditBalance = signal<CreditBalance | null>(null);
  isOpeningEbook = false;
  private openingEbookTimer?: number;
  successMessage = '';
  private successToastTimer?: number;

  ngOnInit(): void {
    this.subscriptions.add(this.activatedRoute.queryParamMap.subscribe((params) => {
      const section = params.get('section') ?? 'dashboard';
      this.activeSection = section;
      this.isCreditsModalOpen = section === 'credits' || section === 'buy-credits';
      this.creditsModalMode = section === 'buy-credits' ? 'plans' : 'credits';
      this.changeDetector.markForCheck();
    }));
    this.loadCreditBalance();
  }

  loadCreditBalance(): void {
    this.subscriptions.add(this.billingService.getBalance().subscribe({
      next: (balance) => this.creditBalance.set(balance),
      error: () => this.creditBalance.set(null)
    }));
  }

  setActiveSection(section: string): void {
    this.handleNavigation(section);
  }

  handleNavigation(section: string): void {
    if ((section === 'purchases' || section === 'metrics') && !this.isAdmin) return;
    void this.router.navigate(['/dashboard'], { queryParams: { section } });
  }

  openEbook(ebook: EbookSummary): void {
    this.selectedEbook = ebook;
    this.isOpeningEbook = true;
    window.clearTimeout(this.openingEbookTimer);
    this.openingEbookTimer = window.setTimeout(() => {
      this.handleNavigation('editor');
      this.isOpeningEbook = false;
      this.changeDetector.detectChanges();
    }, 450);
  }

  handleGenerationSuccess(): void {
    // La generación se inicia en "Nuevo Ebook"; dejarla allí permite revisar
    // la obra. Mis E-books consultará la colección al abrirse.
    this.successMessage = 'E-book creado con éxito';
    window.clearTimeout(this.successToastTimer);
    this.successToastTimer = window.setTimeout(() => {
      this.successMessage = '';
      this.changeDetector.markForCheck();
    }, 5000);
  }

  ngOnDestroy(): void {
    window.clearTimeout(this.openingEbookTimer);
    window.clearTimeout(this.successToastTimer);
    this.subscriptions.unsubscribe();
  }

  closeCreditsModal(): void {
    this.isCreditsModalOpen = false;
    this.handleNavigation('dashboard');
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  openAdminMetrics(): void {
    this.handleNavigation('metrics');
  }

  openPurchases(): void {
    this.handleNavigation('purchase-history');
  }
}
