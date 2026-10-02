
import { ChangeDetectorRef, Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookLoader } from '../book-loader/book-loader';

type CreditPackage = {
  name: string;
  credits: number;
  price?: number;
  monthlyPrice?: number;
};

export type CreditPurchaseMode = 'credits' | 'plans';

@Component({
  selector: 'app-credits-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, BookLoader],
  templateUrl: './credits-modal.html',
  styleUrls: ['./credits-modal.css']
})
export class CreditsModal {
  private readonly changeDetector = inject(ChangeDetectorRef);
  @Input() isOpen: boolean = false;
  @Input() mode: CreditPurchaseMode = 'credits';
  @Output() closeEvent = new EventEmitter<void>();

  isAnnual = false;
  selectedPlan: CreditPackage | null = null;
  customCredits = 150;
  checkoutSubmitted = false;
  cardholderName = '';
  email = '';
  cardNumber = '';
  expiration = '';
  securityCode = '';
  isLoading = false;
  loadingMessage = 'Estamos preparando tu selección...';
  private loadingTimer?: number;

  readonly creditPackages: CreditPackage[] = [
    { name: 'Carga inicial', credits: 100, price: 1500 },
    { name: 'Carga estándar', credits: 200, price: 2800 },
    { name: 'Carga creadora', credits: 500, price: 6000 },
    { name: 'Carga completa', credits: 1000, price: 11000 },
  ];

  selectPlan(plan: CreditPackage): void {
    this.loadingMessage = plan.monthlyPrice !== undefined
      ? 'Estamos preparando tu plan...'
      : 'Estamos preparando tus créditos...';
    this.isLoading = true;
    window.clearTimeout(this.loadingTimer);
    this.loadingTimer = window.setTimeout(() => {
      this.selectedPlan = plan;
      this.checkoutSubmitted = false;
      this.isLoading = false;
      this.changeDetector.detectChanges();
    }, 450);
  }

  get selectedPrice(): number {
    return this.selectedPlan?.price ?? this.selectedPlan?.monthlyPrice ?? 0;
  }

  selectCustomCredits(): void {
    const credits = Math.max(1, Math.floor(this.customCredits));
    this.customCredits = credits;
    this.selectPlan({
      name: 'Carga personalizada',
      credits,
      price: credits * 12,
    });
  }

  submitPurchase(): void {
    if (!this.selectedPlan) return;
    this.checkoutSubmitted = true;
  }

  backToPlans(): void {
    this.selectedPlan = null;
    this.checkoutSubmitted = false;
  }

  toggleBilling(): void {
    this.isAnnual = !this.isAnnual;
  }

  close(): void {
    window.clearTimeout(this.loadingTimer);
    this.isLoading = false;
    this.backToPlans();
    this.closeEvent.emit();
  }

  closeModalOnBackdrop(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('backdrop-blur-sm')) {
      this.close();
    }
  }
}