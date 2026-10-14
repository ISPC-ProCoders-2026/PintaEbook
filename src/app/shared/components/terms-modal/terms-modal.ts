import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Component({
  selector: 'app-terms-modal',
  templateUrl: './terms-modal.html',
  styleUrl: './terms-modal.css',
})
export class TermsModal {
  @Input() isOpen = false;
  @Output() closeEvent = new EventEmitter<void>();

  close(): void { this.closeEvent.emit(); }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen) this.close();
  }
}
