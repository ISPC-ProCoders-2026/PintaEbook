import { Subscription } from 'rxjs';
import { PurchasesService } from '../../../service/purchases/purchases';
import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../service/login/login';
import { NavbarPrivado } from '../navbar-privado/navbar-privado';
import { CreditPurchaseMode, CreditsModal } from '../credits-modal/credits-modal';
import { Purchase, PurchaseStatus } from '../../../models/purchase.model';

@Component({
  selector: 'app-admin-purchases',
  standalone: true,
  imports: [DecimalPipe, FormsModule, NavbarPrivado, CreditsModal],
  templateUrl: './admin-purchases.html',
  styleUrl: './admin-purchases.css'
})
export class AdminPurchases implements OnInit, OnDestroy {
  private readonly purchasesService = inject(PurchasesService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private request?: Subscription;
  loading = false;
  error = '';
  page = 1;
  total = 0;
  hasNext = false;
  hasPrevious = false;
  ngOnInit(): void { this.loadPurchases(); }
  ngOnDestroy(): void { this.request?.unsubscribe(); }
  loadPurchases(page = 1): void {
    this.request?.unsubscribe();
    this.loading = true;
    this.error = '';
    this.purchases = [];
    this.request = this.purchasesService.getPurchases(page, this.selectedStatus).subscribe({
      next: result => {
        this.purchases = result.results;
        this.total = result.count;
        this.hasNext = result.hasNext;
        this.hasPrevious = result.hasPrevious;
        this.page = page;
        this.loading = false;
        this.changeDetector.markForCheck();
      },
      error: error => {
        this.loading = false;
        this.error = error.status === 401 ? 'Tu sesión venció. Volvé a iniciar sesión.' : 'No pudimos cargar tus compras. Intentá nuevamente.';
        this.changeDetector.markForCheck();
      },
    });
  }
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  isCreditsModalOpen = false;
  creditsModalMode: CreditPurchaseMode = 'credits';

  get isAdminView(): boolean {
    return this.router.url.startsWith('/admin/purchases')
      || this.router.parseUrl(this.router.url).queryParams['section'] === 'purchases';
  }

  get isAdminUser(): boolean {
    return this.authService.isAdmin();
  }

  searchTerm = '';
  selectedStatus: 'Todos' | PurchaseStatus = 'Todos';
  sortBy: 'Fecha' | 'Monto' | 'Créditos' = 'Fecha';

  purchases: Purchase[] = [];

  get filteredPurchases(): Purchase[] {
    const search = this.searchTerm.trim().toLocaleLowerCase();
    const filtered = this.purchases.filter((purchase) => {
      const matchesSearch = !search || purchase.id.toLocaleLowerCase().includes(search);
      const matchesStatus = this.selectedStatus === 'Todos' || purchase.status === this.selectedStatus;
      return matchesSearch && matchesStatus;
    });

    return [...filtered].sort((first, second) => {
      if (this.sortBy === 'Monto') return second.amount - first.amount;
      if (this.sortBy === 'Créditos') return second.credits - first.credits;
      return new Date(second.timestamp ?? second.date).getTime() - new Date(first.timestamp ?? first.date).getTime();
    });
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
  }

  backToDashboard(): void {
    this.openDashboardSection('dashboard');
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }

  closeCreditsModal(): void {
    this.isCreditsModalOpen = false;
  }

  openPurchaseMode(mode: CreditPurchaseMode): void {
    this.creditsModalMode = mode;
    this.isCreditsModalOpen = true;
  }

  handleNavigation(section: string): void {
    if (section === 'dashboard') this.openDashboardSection('dashboard');
    if (section === 'metrics') this.openDashboardSection('metrics');
    if (section === 'credits' || section === 'buy-credits') {
      this.creditsModalMode = section === 'buy-credits' ? 'plans' : 'credits';
      this.isCreditsModalOpen = true;
    }
    if (section === 'purchase-history') {
      this.openDashboardSection('purchase-history');
    }
    if (section === 'purchases') {
      this.openDashboardSection('purchases');
    }
    if (['ebooks', 'new-ebook', 'editor', 'profile', 'settings'].includes(section)) {
      this.openDashboardSection(section);
    }
  }

  private openDashboardSection(section: string): void {
    void this.router.navigate(['/dashboard'], { queryParams: { section } });
  }
}