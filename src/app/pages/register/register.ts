import { Component, inject, OnInit, Inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { RegisterService } from '../../service/register/register';
import { RegisterRequest } from '../../models/auth.model';
import { environment } from '../../../environments/environment.generated';
import { ThemeToggle } from '../../shared/components/theme-toggle/theme-toggle';
import { ThemeService } from '../../service/theme/theme';

declare var google: any;

const matchingPasswordsValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordsMismatch: true };
};

@Component({
  selector: 'app-register',
  imports: [RouterLink, ReactiveFormsModule, ThemeToggle],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit {
  readonly themeService = inject(ThemeService);
  isLoading = false;
  isGoogleRegistrationInProgress = false;
  errorMessage = '';
  googleMessage = '';
  registerForm;

  constructor(
    private fb: FormBuilder,
    @Inject(RegisterService) private registerService: RegisterService,
    private router: Router
  ) {
    this.registerForm = this.fb.nonNullable.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      terms: [false, Validators.requiredTrue],
    }, { validators: matchingPasswordsValidator });
  }

  ngOnInit(): void {
    this.initGoogleScript();
  }

  private initGoogleScript(): void {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (response: any) => this.handleGoogleResponse(response),
      });
    }
  }

  private handleGoogleResponse(response: any): void {
    this.submitGoogleRegistration(response.credential);
  }

  registerWithGoogle(): void {
    if (typeof google === 'undefined' || !google.accounts?.id) {
      this.googleMessage = '';
      this.errorMessage = 'No pudimos abrir Google en este momento. Revisá tu conexión e intentá nuevamente.';
      return;
    }

    this.errorMessage = '';
    this.googleMessage = 'Elegí la cuenta de Google con la que querés registrarte.';
    google.accounts.id.prompt();
  }

  private submitGoogleRegistration(idToken: string): void {
    this.isLoading = true;
    this.isGoogleRegistrationInProgress = true;
    this.errorMessage = '';
    this.googleMessage = 'Estamos creando tu cuenta con Google...';

    this.registerService.registerWithGoogle(idToken).subscribe({
      next: () => {
        this.isLoading = false;
        this.isGoogleRegistrationInProgress = false;
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isGoogleRegistrationInProgress = false;
        this.googleMessage = '';
        this.handleError(error, 'Error al registrarse con Google.');
      },
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.isGoogleRegistrationInProgress = false;
    this.errorMessage = '';
    this.googleMessage = '';

    const formValue = this.registerForm.getRawValue();
    const credentials: RegisterRequest = {
      first_name: formValue.firstName,
      last_name: formValue.lastName,
      email: formValue.email,
      password: formValue.password,
    };

    this.registerService.register(credentials).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (error) => this.handleError(error, 'Error al crear la cuenta.'),
    });
  }

  private handleError(error: any, fallback: string): void {
    this.isLoading = false;
    this.errorMessage = error.error?.detail || error.error?.message || fallback;
  }
}
