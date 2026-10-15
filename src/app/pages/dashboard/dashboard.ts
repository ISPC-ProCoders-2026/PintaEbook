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
import { EbooksService } from '../../service/ebooks/ebooks';
import { EbookMetadataResponse } from '../../models/ebook.model';
import { StaticEbookEditor } from '../../shared/components-privado/static-ebook-editor/static-ebook-editor';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [AdminPurchases, AdminMetrics, CreditsModal, NavbarPrivado, MyEbooks, Profile, NewEbook, BookLoader, StaticEbookEditor],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnDestroy, OnInit {
  private readonly authService = inject(AuthService);
  private readonly billingService = inject(BillingService);
  private readonly ebooksService = inject(EbooksService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly subscriptions = new Subscription();

  isCreditsModalOpen = false;
  creditsModalMode: CreditPurchaseMode = 'credits';
  activeSection = 'dashboard';
  selectedEbook: EbookSummary | null = null;
  readonly creditBalance = signal<CreditBalance | null>(null);
  ebooks: EbookSummary[] = [];
  isLoadingEbooks = true;
  ebooksLoadError = false;
  newEbooksThisMonth = 0;
  isOpeningEbook = false;
  private openingEbookTimer?: number;
  successMessage = '';
  private successToastTimer?: number;

  ngOnInit(): void {
    this.subscriptions.add(this.activatedRoute.queryParamMap.subscribe((params) => {
      const section = params.get('section') ?? 'dashboard';
      const canonicalSection = section === 'editor' ? 'ebooks'
        : section === 'ebook-editor' && !this.selectedEbook ? 'ebooks' : section;
      if (canonicalSection !== section) {
        void this.router.navigate(['/dashboard'], { queryParams: { section: canonicalSection }, replaceUrl: true });
        return;
      }
      this.activeSection = section;
      this.isCreditsModalOpen = section === 'credits' || section === 'buy-credits';
      this.creditsModalMode = section === 'buy-credits' ? 'plans' : 'credits';
      if (section === 'dashboard') this.loadDashboardEbooks();
      this.changeDetector.markForCheck();
    }));
    this.loadCreditBalance();
  }

  get featuredEbook(): EbookSummary | null {
    return this.ebooks.find((ebook) => ebook.status !== 'Fallido') ?? null;
  }

  get inProgressCount(): number {
    return this.ebooks.filter((ebook) => ebook.status === 'En progreso').length;
  }

  get completedCount(): number {
    return this.ebooks.filter((ebook) => ebook.status === 'Finalizado').length;
  }

  get failedCount(): number {
    return this.ebooks.filter((ebook) => ebook.status === 'Fallido').length;
  }

  private loadDashboardEbooks(): void {
    this.isLoadingEbooks = true;
    this.ebooksLoadError = false;
    this.subscriptions.add(this.ebooksService.getEbooks().subscribe({
      next: (items) => {
        const currentDate = new Date();
        this.newEbooksThisMonth = items.filter((item) => {
          const created = new Date(item.created_at);
          return created.getMonth() === currentDate.getMonth()
            && created.getFullYear() === currentDate.getFullYear();
        }).length;
        this.ebooks = [...items]
          .sort((first, second) => new Date(second.updated_at).getTime() - new Date(first.updated_at).getTime())
          .map((item) => this.toEbookSummary(item));
        this.isLoadingEbooks = false;
        this.changeDetector.detectChanges();
      },
      error: () => {
        this.ebooksLoadError = true;
        this.isLoadingEbooks = false;
        this.changeDetector.detectChanges();
      }
    }));
  }

  private toEbookSummary(item: EbookMetadataResponse): EbookSummary {
    const updatedDate = new Date(item.updated_at);
    return {
      ebook_id: item.ebook_id,
      title: item.title,
      description: item.description,
      status: item.status === 'COMPLETED' ? 'Finalizado'
        : item.status === 'FAILED' ? 'Fallido' : 'En progreso',
      updatedAt: Number.isNaN(updatedDate.getTime())
        ? ''
        : new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' }).format(updatedDate),
      progress: item.status === 'COMPLETED' ? 100 : 0,
      coverClass: 'ebook-cover--default',
      coverKicker: 'Tu proyecto'
    };
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

  handleSidebarNavigation(section: string): void {
    this.handleNavigation(section);
  }

  openEbook(ebook: EbookSummary): void {
    this.selectedEbook = ebook;
    this.isOpeningEbook = true;
    window.clearTimeout(this.openingEbookTimer);
    this.openingEbookTimer = window.setTimeout(() => {
      this.handleNavigation('ebook-editor');
      this.isOpeningEbook = false;
      this.changeDetector.detectChanges();
    }, 450);
  }

  handleGenerationSuccess(): void {
    // La generación se inicia en "Nuevo Ebook"; dejarla allí permite revisar
    // la obra. Mis E-books consultará la colección al abrirse.
    this.successMessage = 'E-book creado con éxito';
    this.loadCreditBalance();
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
