import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
   onSubmit(): void {
    // La integración de autenticación se añadirá cuando esté disponible el endpoint.
  }
}
