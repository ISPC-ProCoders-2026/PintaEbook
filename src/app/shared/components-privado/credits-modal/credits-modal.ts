import { Component, Input, Output, EventEmitter, OnChanges, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, switchMap, tap } from 'rxjs';
import { CreditPackage } from '../../../models/billing.model';
import { BillingService, billingError, CHECKOUT_BALANCE_KEY } from '../../../service/billing/billing';

export type CreditPurchaseMode = 'credits' | 'plans';
@Component({
  selector: 'app-credits-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './credits-modal.html',
  styleUrls: ['./credits-modal.css']
})
export class CreditsModal implements OnChanges, OnDestroy {
  private readonly billing = inject(BillingService);
  private readonly subscriptions = new Subscription();
  @Input() isOpen = false;
  @Input() mode: CreditPurchaseMode = 'credits';
  @Output() closeEvent = new EventEmitter<void>();
  readonly creditPackages = signal<CreditPackage[]>([]);
  readonly loading = signal(false);
  readonly buyingId = signal<number | null>(null);
  readonly error = signal('');
  ngOnChanges(): void {
    if (this.isOpen) this.loadPackages();
  }
  loadPackages(): void {
    if (this.loading()) return;
    this.loading.set(true);
    this.error.set('');
    this.subscriptions.add(this.billing.getPackages().subscribe({
      next: packages => { this.creditPackages.set(packages); this.loading.set(false); },
      error: err => { this.error.set(billingError(err.status)); this.loading.set(false); }
    }));
  }
  buy(pkg: CreditPackage): void {
    if (this.buyingId() !== null) return;
    this.buyingId.set(pkg.id);
    this.error.set('');
    this.subscriptions.add(this.billing.getBalance().pipe(
      tap(balance => sessionStorage.setItem(CHECKOUT_BALANCE_KEY, JSON.stringify({
        balance: balance.credits_available, userId: localStorage.getItem('userId'), createdAt: Date.now()
      }))),
      switchMap(() => this.billing.createCheckout(pkg.id))
    ).subscribe({
      next: response => {
        try {
          const url = new URL(response.init_point);
          if (url.protocol !== 'https:' || !(url.hostname === 'mercadopago.com.ar' || url.hostname.endsWith('.mercadopago.com.ar'))) throw new Error('Invalid checkout URL');
          this.redirectToCheckout(url.href);
        } catch {
          this.buyingId.set(null);
          this.error.set('No pudimos abrir Mercado Pago. Intentá nuevamente.');
        }
      },
      error: err => { this.buyingId.set(null); this.error.set(billingError(err.status)); }
    }));
  }
  redirectToCheckout(url: string): void { window.location.assign(url); }
  close(): void { if (this.buyingId() === null) this.closeEvent.emit(); }
  closeModalOnBackdrop(event: MouseEvent): void { if (event.target === event.currentTarget) this.close(); }
  ngOnDestroy(): void { this.subscriptions.unsubscribe(); }
}
