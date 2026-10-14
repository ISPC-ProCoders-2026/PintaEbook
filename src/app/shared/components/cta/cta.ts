import { Component, Input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-cta',
  imports: [RouterLink,],
  templateUrl: './cta.html',
  styleUrl: './cta.css',
})
export class Cta {
  constructor(private readonly router: Router) {}

  @Input() tabThroughContent = false;

  scrollToPlans(event: MouseEvent): void {
    const currentPath = this.router.url.split(/[?#]/, 1)[0];
    if (currentPath !== '/credits') return;

    const plansSection = document.getElementById('planes');
    if (!plansSection) return;

    event.preventDefault();
    const navbarHeight = document.querySelector('app-navbar .navbar')?.getBoundingClientRect().height ?? 0;
    const top = plansSection.getBoundingClientRect().top + window.scrollY - navbarHeight;
    window.scrollTo({
      top: Math.max(0, top),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  }
}
