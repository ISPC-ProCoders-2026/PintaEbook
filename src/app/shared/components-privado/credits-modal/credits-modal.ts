
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type CreditPlan = {
  name: string;
  credits: number;
  monthlyPrice: number;
};

@Component({
  selector: 'app-credits-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './credits-modal.html',
  styleUrls: ['./credits-modal.css']
})
export class CreditsModal {
  @Input() isOpen: boolean = false;
  @Output() closeEvent = new EventEmitter<void>();

  isAnnual: boolean = false;
  selectedPlan: CreditPlan | null = null;
  checkoutSubmitted = false;
  cardholderName = '';
  email = '';
  cardNumber = '';
  expiration = '';
  securityCode = '';

  selectPlan(plan: CreditPlan): void {
    this.selectedPlan = plan;
    this.checkoutSubmitted = false;
  }

  get selectedPrice(): number {
    if (!this.selectedPlan) return 0;
    return this.isAnnual ? this.selectedPlan.monthlyPrice * 12 * 0.8 : this.selectedPlan.monthlyPrice;
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