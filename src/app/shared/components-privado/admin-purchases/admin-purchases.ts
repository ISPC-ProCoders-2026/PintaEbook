import { Component, inject } from '@angular/core';
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
export class AdminPurchases {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  isCreditsModalOpen = false;
  creditsModalMode: CreditPurchaseMode = 'credits';

  get isAdminView(): boolean {
    return this.router.url.startsWith('/admin/purchases');
  }

  get isAdminUser(): boolean {
    return this.authService.isAdmin();
  }

  searchTerm = '';
  selectedStatus: 'Todos' | PurchaseStatus = 'Todos';
  sortBy: 'Fecha' | 'Monto' | 'Créditos' = 'Fecha';

  readonly purchases: Purchase[] = [
    { id: 'ARC-1048', date: '28/09/2026', credits: 500, amount: 19.99, status: 'Aprobada', userId: 'user-1', userName: 'Ana Pérez' },
    { id: 'ARC-1047', date: '27/09/2026', credits: 1000, amount: 34.99, status: 'Pendiente', userId: 'user-2', userName: 'Lucas Gómez' },
    { id: 'ARC-1046', date: '26/09/2026', credits: 250, amount: 11.99, status: 'Aprobada', userId: 'user-1', userName: 'Ana Pérez' },
    { id: 'ARC-1045', date: '25/09/2026', credits: 500, amount: 19.99, status: 'Rechazada', userId: 'user-3', userName: 'Sofía Díaz' },
    { id: 'ARC-1044', date: '24/09/2026', credits: 1000, amount: 34.99, status: 'Aprobada', userId: 'user-2', userName: 'Lucas Gómez' },
    { id: 'ARC-1043', date: '23/09/2026', credits: 500, amount: 19.99, status: 'Aprobada', userId: 'admin-1', userName: 'Administrador' }
  ];

  get filteredPurchases(): Purchase[] {
    const search = this.searchTerm.trim().toLocaleLowerCase();
    const filtered = this.purchases.filter((purchase) => {
      const belongsToCurrentUser = this.isAdminView || purchase.userId === this.authService.getUserId();
      const matchesSearch = !search || purchase.id.toLocaleLowerCase().includes(search);
      const matchesStatus = this.selectedStatus === 'Todos' || purchase.status === this.selectedStatus;
      return belongsToCurrentUser && matchesSearch && matchesStatus;
    });

    return [...filtered].sort((first, second) => {
      if (this.sortBy === 'Monto') return second.amount - first.amount;
      if (this.sortBy === 'Créditos') return second.credits - first.credits;
      return second.id.localeCompare(first.id);
    });
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
  }

  backToDashboard(): void {
    void this.router.navigate(['/dashboard']);
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
    if (section === 'metrics') void this.router.navigate(['/admin/metrics']);
    if (section === 'credits' || section === 'buy-credits') {
      this.creditsModalMode = section === 'buy-credits' ? 'plans' : 'credits';
      this.isCreditsModalOpen = true;
    }
    if (section === 'purchase-history') {
      void this.router.navigate(['/purchases']);
    }
    if (section === 'purchases') {
      void this.router.navigate(['/admin/purchases']);
    }
    if (['ebooks', 'new-ebook', 'editor', 'profile', 'settings'].includes(section)) {
      this.openDashboardSection(section);
    }
  }

  private openDashboardSection(section: string): void {
    void this.router.navigate(['/dashboard'], { queryParams: { section } });
  }
}