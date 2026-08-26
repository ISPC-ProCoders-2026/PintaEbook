import { Component, HostListener, OnInit } from '@angular/core';
import { Navbar } from "../../shared/components/navbar/navbar";
import { Footer } from "../../shared/components/footer/footer";
import { Cta } from '../../shared/components/cta/cta';
import { ProgressBar } from "../../shared/components/progress-bar/progress-bar";


@Component({
  selector: 'app-about',
  imports: [Navbar, Cta, Footer, ProgressBar],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About implements OnInit {
  ngOnInit(): void {
    this.checkScroll();
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.checkScroll();
  }

  private checkScroll(): void {
    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach((el: Element) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 80) {
        el.classList.add('active');
      }
    });
  }
}
