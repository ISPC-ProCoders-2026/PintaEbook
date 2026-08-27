import { Component, OnInit, Inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../service/login/login';
import { LoginRequest } from '../../models/auth.model';
import { environment } from '../../../environments/environment.generated';

declare var google: any;

@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  isRecoveryModalOpen = false;
  isLoading = false;
  errorMessage = '';
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    @Inject(AuthService) private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.nonNullable.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    this.initGoogleScript();
  }

  initGoogleScript(): void {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (resp: any) => this.handleGoogleResponse(resp)
      });
    }
  }

  handleGoogleResponse(response: any): void {
    const idToken = response.credential;
    
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.loginWithGoogle(idToken).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.detail || err.error?.message || 'Error al iniciar sesión con Google.';
      }
    });
  }

  triggerGoogleLogin(): void {
    if (typeof google !== 'undefined') {
      google.accounts.id.prompt(); 
      this.errorMessage = 'El servicio de Google no está disponible.';
    }
  }

  openRecoveryModal(): void {
    this.isRecoveryModalOpen = true;
  }

  closeRecoveryModal(): void {
    this.isRecoveryModalOpen = false;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const credentials: LoginRequest = this.loginForm.getRawValue();

    this.authService.login(credentials).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.detail || err.error?.message || 'Error al iniciar sesión.';
      },
    });
  }
}