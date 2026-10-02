
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  imports: [CommonModule, FormsModule],
  templateUrl: './credits-modal.html',
  styleUrls: ['./credits-modal.css']
})
export class CreditsModal {
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

  readonly creditPackages: CreditPackage[] = [
    { name: 'Carga inicial', credits: 100, price: 1500 },
    { name: 'Carga estándar', credits: 200, price: 2800 },
    { name: 'Carga creadora', credits: 500, price: 6000 },
    { name: 'Carga completa', credits: 1000, price: 11000 },
  ];

  selectPlan(plan: CreditPackage): void {
    this.selectedPlan = plan;
    this.checkoutSubmitted = false;
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
    this.backToPlans();
    this.closeEvent.emit();
  }

  closeModalOnBackdrop(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('backdrop-blur-sm')) {
      this.close();
    }
  }
}