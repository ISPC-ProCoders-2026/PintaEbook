import { Component } from '@angular/core';

@Component({
  selector: 'app-faqs',
  imports: [],
  templateUrl: './faqs.html',
  styleUrl: './faqs.css',
})
export class Faqs {

faqOpen: number | null = null;

     toggleFAQ(index: number): void {
    if (this.faqOpen === index) {
      this.faqOpen = null;
    } else {
      this.faqOpen = index;
    }
  }
}
