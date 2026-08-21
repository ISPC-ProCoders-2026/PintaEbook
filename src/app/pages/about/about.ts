import { Component, HostListener, OnInit } from '@angular/core';
import { Navbar } from "../../shared/components/navbar/navbar";
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-about',
  imports: [Navbar, RouterLink],
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
