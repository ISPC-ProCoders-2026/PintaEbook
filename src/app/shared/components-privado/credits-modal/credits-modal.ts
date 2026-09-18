
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-credits-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './credits-modal.html',
  styleUrls: ['./credits-modal.css']
})
export class CreditsModal {
  @Input() isOpen: boolean = false;
  @Output() closeEvent = new EventEmitter<void>();

  isAnnual: boolean = false;

  toggleBilling(): void {
    this.isAnnual = !this.isAnnual;
  }

  close(): void {
    this.closeEvent.emit();
  }

  closeModalOnBackdrop(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('backdrop-blur-sm')) {
      this.close();
    }
  }
}