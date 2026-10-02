import { Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../service/login/login';
import { NavbarPrivado } from '../navbar-privado/navbar-privado';
import { Purchase, PurchaseStatus } from '../../../models/purchase.model';

@Component({
  selector: 'app-admin-purchases',
  standalone: true,
  imports: [DecimalPipe, FormsModule, NavbarPrivado],
  templateUrl: './admin-purchases.html',
  styleUrl: './admin-purchases.css'
})
export class AdminPurchases {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  searchTerm = '';
  selectedStatus: 'Todos' | PurchaseStatus = 'Todos';
  sortBy: 'Fecha' | 'Monto' | 'Créditos' = 'Fecha';

  readonly purchases: Purchase[] = [
    { id: 'ARC-1048', date: '28/09/2026', credits: 500, amount: 19.99, status: 'Aprobada' },
    { id: 'ARC-1047', date: '27/09/2026', credits: 1000, amount: 34.99, status: 'Pendiente' },
    { id: 'ARC-1046', date: '26/09/2026', credits: 250, amount: 11.99, status: 'Aprobada' },
    { id: 'ARC-1045', date: '25/09/2026', credits: 500, amount: 19.99, status: 'Rechazada' },
    { id: 'ARC-1044', date: '24/09/2026', credits: 1000, amount: 34.99, status: 'Aprobada' }
  ];

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

  handleNavigation(section: string): void {
    if (section === 'dashboard') this.backToDashboard();
    if (section === 'metrics') void this.router.navigate(['/admin/metrics']);
  }
}