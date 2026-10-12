import { AfterViewChecked, ElementRef, ViewChild, Component, Input, Output, EventEmitter, OnChanges, OnDestroy, inject, signal } from '@angular/core';
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
export class CreditsModal implements OnChanges, OnDestroy, AfterViewChecked {
  @ViewChild('purchaseDialog') private dialog?: ElementRef<HTMLDialogElement>;
  private returnFocus: HTMLElement | null = null;
  ngAfterViewChecked(): void {
    const dialog = this.dialog?.nativeElement;
    if (!this.isOpen || !dialog || dialog.open) return;
    this.returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    // Native modal dialogs make the background inert and contain keyboard focus.
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    dialog.querySelector<HTMLElement>('#credits-title')?.focus();
  }
  onCancel(event: Event): void {
    event.preventDefault();
    this.close();
  }
  private restoreFocus(): void {
    if (this.returnFocus?.isConnected) this.returnFocus.focus();
    this.returnFocus = null;
  }
  private readonly billing = inject(BillingService);
  private readonly subscriptions = new Subscription();
  @Input() isOpen = false;
  @Input() mode: CreditPurchaseMode = 'credits';
  @Output() closeEvent = new EventEmitter<void>();
  readonly creditPackages = signal<CreditPackage[]>([]);
  readonly loading = signal(false);
  readonly buyingId = signal<number | null>(null);
  readonly error = signal('');
  readonly selectedPlan = signal<string | null>(null);
  isAnnual = false;
  toggleBilling(): void { this.isAnnual = !this.isAnnual; }
  selectPlan(plan: string): void {
    if (this.buyingId() !== null || this.loading()) return;
    if (plan === 'Lector') { this.close(); return; }
    const credits = plan === 'Escritor' ? 500 : plan === 'Editorial' ? 1000 : null;
    if (credits === null) return;
    this.selectedPlan.set(plan);
    this.loading.set(true);
    this.error.set('');
    this.subscriptions.add(this.billing.getPackages().subscribe({
      next: packages => {
        this.creditPackages.set(packages);
        this.loading.set(false);
        const pkg = packages.find(item => item.cantidad_creditos === credits && Number(item.precio) > 0);
        if (pkg) this.buy(pkg);
        else this.error.set('El paquete de ' + credits + ' cr\u00e9ditos no est\u00e1 disponible. Intent\u00e1 nuevamente.');
      },
      error: err => { this.loading.set(false); this.error.set(billingError(err.status)); }
    }));
  }
  ngOnChanges(): void {
    if (!this.isOpen) this.restoreFocus();
    this.selectedPlan.set(null);
    if (this.isOpen && this.mode === 'credits') this.loadPackages();
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
  close(): void {
    if (this.buyingId() !== null) return;
    const dialog = this.dialog?.nativeElement;
    if (dialog && typeof dialog.close === 'function') dialog.close();
    this.restoreFocus();
    this.closeEvent.emit();
  }
  closeModalOnBackdrop(event: MouseEvent): void { if (event.target === event.currentTarget) this.close(); }
  ngOnDestroy(): void { this.subscriptions.unsubscribe(); this.restoreFocus(); }
}
