import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  imports: [],
  templateUrl: './progress-bar.html',
  styleUrl: './progress-bar.css',
})
export class ProgressBar {

   isAnnual: boolean = false;
  readingProgress: number = 0;

  isRevealed: boolean = true;

  ngOnInit(): void {}

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    this.readingProgress = (scrollTop / docHeight) * 100;
  }

  toggleBilling(): void {
    this.isAnnual = !this.isAnnual;
  }

}
