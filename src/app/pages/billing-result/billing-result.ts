import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription, catchError, exhaustMap, of, take, takeUntil, timer } from 'rxjs';
import { BillingService, CHECKOUT_BALANCE_KEY, billingError } from '../../service/billing/billing';
import { CreditsModal } from '../../shared/components-privado/credits-modal/credits-modal';

@Component({
  selector: 'app-billing-result',
  imports: [RouterLink],
  template: `
    <main class="min-h-screen bg-[#211b17] text-white flex items-center justify-center p-6">
      <section class="max-w-xl w-full rounded-3xl border border-white/20 p-8">
        <h1 class="text-3xl font-bold mb-4">Compra de créditos</h1>
        <p role="status" class="mb-6">{{ message() }}</p>
        @if (balance() !== null) { <p class="mb-6">Saldo disponible: {{ balance() }} créditos</p> }
        <div class="flex gap-4 flex-wrap">
          <a routerLink="/dashboard" class="text-amber-300">Volver al dashboard</a>
          <button type="button" [disabled]="checking()" (click)="checkBalance()">Consultar saldo</button>
          <a routerLink="/billing" class="text-amber-300">Comprar créditos</a>
        </div>
      </section>
    </main>
  `
})
export class BillingResult implements OnInit, OnDestroy {
  private readonly billing = inject(BillingService);
  private readonly route = inject(ActivatedRoute);
  private polling?: Subscription;
  readonly balance = signal<number | null>(null);
  readonly checking = signal(false);
  readonly message = signal('Consultando tu saldo...');
  private previousBalance: number | null = null;
  private outcome = '';
  ngOnInit(): void {
    this.outcome = this.route.snapshot.paramMap.get('outcome') ?? '';
    try {
      const saved = JSON.parse(sessionStorage.getItem(CHECKOUT_BALANCE_KEY) ?? 'null');
      if (saved && saved.userId === localStorage.getItem('userId') && Number.isFinite(saved.balance)
        && saved.balance >= 0 && Date.now() - saved.createdAt < 24 * 60 * 60 * 1000) this.previousBalance = saved.balance;
    } catch { /* A return without checkout context still displays the actual balance. */ }
    this.checkBalance();
  }
  checkBalance(): void {
    if (this.checking()) return;
    this.checking.set(true);
    const failure = this.outcome === 'failure';
    this.message.set(failure ? 'No se completó el pago. Podés volver a intentarlo.'
      : this.outcome === 'pending' ? 'Tu pago está pendiente. Los créditos se acreditarán cuando se confirme.'
      : 'Consultando el saldo mientras se procesa tu pago...');
    this.polling = timer(0, 3000).pipe(
      take(failure ? 1 : 11),
      exhaustMap(() => this.billing.getBalance().pipe(catchError(err => {
        this.message.set(billingError(err.status));
        if (err.status === 401) { this.polling?.unsubscribe(); this.checking.set(false); }
        return of(null);
      }))),
      takeUntil(timer(33000))
    ).subscribe({
      next: balance => {
        if (!balance) return;
        this.balance.set(balance.credits_available);
        if (!failure && this.previousBalance !== null && balance.credits_available > this.previousBalance) {
          this.message.set('Tu saldo se actualizó. Ya podés usar tus créditos.');
          sessionStorage.removeItem(CHECKOUT_BALANCE_KEY);
          this.previousBalance = null;
          this.checking.set(false);
          this.polling?.unsubscribe();
        }
      },
      complete: () => {
        this.checking.set(false);
        if (!failure) this.message.set('Tu pago puede seguir procesándose. Consultá el saldo nuevamente en unos minutos.');
      }
    });
  }
  ngOnDestroy(): void { this.polling?.unsubscribe(); }
}

@Component({
  selector: 'app-billing-packages',
  imports: [CreditsModal, RouterLink],
  template: `<main class="min-h-screen bg-[#211b17] text-white p-8"><a routerLink="/dashboard">Volver al dashboard</a><app-credits-modal [isOpen]="true" (closeEvent)="close()" /></main>`
})
export class BillingPackages {
  private readonly router = inject(Router);
  close(): void { void this.router.navigate(['/dashboard']); }
}
