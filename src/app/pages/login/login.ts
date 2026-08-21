import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
openRecoveryModal() {
throw new Error('Method not implemented.');
}
  isRecoveryModalOpen = false;

  openRecoveryModal(): void {
    this.isRecoveryModalOpen = true;
  }

  closeRecoveryModal(): void {
    this.isRecoveryModalOpen = false;
  }

  loginWithGoogle(): void {
    // La integración con Google se añadirá cuando esté disponible el proveedor.
  }

  onSubmit(): void {
    // La integración de autenticación se añadirá cuando esté disponible el endpoint.
  }
}
