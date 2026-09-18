import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NavbarPrivado } from '../navbar-privado/navbar-privado';

@Component({
  selector: 'app-admin-metrics',
  standalone: true,
  imports: [NavbarPrivado],
  templateUrl: './admin-metrics.html',
  styleUrl: './admin-metrics.css'
})
export class AdminMetrics {
  private readonly router = inject(Router);

  backToDashboard(): void {
    void this.router.navigate(['/dashboard']);
  }
}
