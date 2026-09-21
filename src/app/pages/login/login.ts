import { Component, inject, OnInit, Inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../service/login/login';
import { LoginRequest } from '../../models/auth.model';
import { environment } from '../../../environments/environment.generated';
import { ThemeToggle } from '../../shared/components/theme-toggle/theme-toggle';
import { ThemeService } from '../../service/theme/theme';

declare var google: any;

@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule, ThemeToggle],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  readonly themeService = inject(ThemeService);
  isRecoveryModalOpen = false;
  isLoading = false;
  isGoogleLoginInProgress = false;
  errorMessage = '';
  googleMessage = '';
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

    if (!idToken) {
      this.googleMessage = '';
      this.errorMessage = 'No recibimos la confirmación de Google. Intentá nuevamente.';
      return;
    }
    
    this.isLoading = true;
    this.isGoogleLoginInProgress = true;
    this.errorMessage = '';
    this.googleMessage = 'Estamos iniciando sesión con tu cuenta de Google...';

    this.authService.loginWithGoogle(idToken).subscribe({
      next: () => {
        this.isLoading = false;
        this.isGoogleLoginInProgress = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.isGoogleLoginInProgress = false;
        this.googleMessage = '';
        this.errorMessage = this.getErrorMessage(err, 'No pudimos iniciar sesión con Google.');
      }
    });
  }

  triggerGoogleLogin(): void {
    if (typeof google === 'undefined' || !google.accounts?.id) {
      this.googleMessage = '';
      this.errorMessage = 'No pudimos abrir Google en este momento. Revisá tu conexión e intentá nuevamente.';
      return;
    }

    this.errorMessage = '';
    this.googleMessage = 'Elegí la cuenta de Google con la que querés continuar.';
    google.accounts.id.prompt();
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
    this.isGoogleLoginInProgress = false;
    this.errorMessage = '';
    this.googleMessage = '';

    const credentials: LoginRequest = this.loginForm.getRawValue();

    this.authService.login(credentials).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(err, 'No pudimos iniciar sesión.');
      },
    });
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (!(error instanceof HttpErrorResponse)) {
      return fallback;
    }

    if (error.status === 0) {
      return 'No pudimos conectarnos con el servidor. Revisa tu conexión e intenta nuevamente.';
    }

    if (error.status === 401 || error.status === 403) {
      return 'El correo o la contraseña no son correctos. Verifica tus datos e intenta nuevamente.';
    }

    if (error.status === 429) {
      return 'Hiciste demasiados intentos. Espera un momento y vuelve a intentarlo.';
    }

    return fallback;
  }
}
