import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  registerWithGoogle(): void {
    // Se integrará la autenticación con Google cuando esté disponible el proveedor.
  }

  onSubmit(): void {
    // La integración de registro se añadirá cuando esté disponible el endpoint.
  }
}
