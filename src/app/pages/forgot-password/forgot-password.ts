import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../service/login/login';

type ResetStep = 'request' | 'confirm' | 'success';
const COOLDOWN_MS = 60_000;
const COOLDOWN_KEY = 'pintaebook.passwordResetCooldown.';
const EMAIL_KEY = 'pintaebook.passwordResetEmail';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private timer?: ReturnType<typeof setInterval>;

  step: ResetStep = 'request';
  email = '';
  busy = false;
  message = '';
  errorMessage = '';
  secondsUntilResend = 0;

  readonly requestForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  readonly confirmForm = this.fb.nonNullable.group({
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    newPassword: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?!\d+$).+/)]],
    confirmPassword: ['', [Validators.required]],
  });

  ngOnInit(): void {
    const email = this.router.getCurrentNavigation()?.extras.state?.['email'];
    const savedEmail = typeof email === 'string' && email ? email : sessionStorage.getItem(EMAIL_KEY);
    if (savedEmail) {
      this.requestForm.controls.email.setValue(savedEmail);
      const until = Number(sessionStorage.getItem(this.cooldownStorageKey(savedEmail)) ?? 0);
      if (until > Date.now()) {
        this.email = savedEmail;
        this.step = 'confirm';
        this.message = 'Si el correo está registrado, te enviamos un código de verificación. Revisa también la carpeta de spam.';
        this.updateCooldown(savedEmail);
        this.timer = setInterval(() => this.updateCooldown(savedEmail), 1000);
      }
    }
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  requestCode(): void {
    this.errorMessage = '';
    this.message = '';
    if (this.requestForm.invalid) {
      this.requestForm.markAllAsTouched();
      return;
    }

    const submittedEmail = this.requestForm.controls.email.value.trim();
    this.busy = true;
    this.authService.requestPasswordReset(submittedEmail).subscribe({
      next: () => {
        this.busy = false;
        this.email = submittedEmail;
        sessionStorage.setItem(EMAIL_KEY, submittedEmail);
        this.step = 'confirm';
        // Keep this deliberately generic: the API never reveals whether an account exists.
        this.message = 'Si el correo está registrado, te enviamos un código de verificación. Revisa también la carpeta de spam.';
        this.startCooldown(submittedEmail);
      },
      error: (error: unknown) => {
        this.busy = false;
        const fieldError = this.getFieldError(error, 'email');
        this.errorMessage = fieldError ?? 'No pudimos solicitar el código. Revisa tu conexión e intenta nuevamente.';
        if (fieldError) this.requestForm.controls.email.setErrors({ server: true });
      },
    });
  }

  resendCode(): void {
    if (this.busy || this.secondsUntilResend > 0) return;
    this.errorMessage = '';
    this.message = '';
    this.busy = true;
    this.authService.requestPasswordReset(this.email).subscribe({
      next: () => {
        this.busy = false;
        this.message = 'Si el correo está registrado, te enviamos un nuevo código. Revisa también la carpeta de spam.';
        this.confirmForm.controls.code.reset();
        this.startCooldown(this.email);
      },
      error: (error: unknown) => {
        this.busy = false;
        this.errorMessage = this.getFieldError(error, 'email') ?? 'No pudimos reenviar el código. Intenta nuevamente.';
      },
    });
  }

  confirmReset(): void {
    this.errorMessage = '';
    this.message = '';
    if (this.confirmForm.invalid) {
      this.confirmForm.markAllAsTouched();
      return;
    }

    const { code, newPassword, confirmPassword } = this.confirmForm.getRawValue();
    if (newPassword !== confirmPassword) {
      this.confirmForm.controls.confirmPassword.setErrors({ mismatch: true });
      return;
    }

    this.busy = true;
    this.authService.confirmPasswordReset({ email: this.email, code, new_password: newPassword }).subscribe({
      next: () => {
        this.busy = false;
        this.step = 'success';
        this.stopTimer();
        sessionStorage.removeItem(this.cooldownStorageKey(this.email));
        sessionStorage.removeItem(EMAIL_KEY);
      },
      error: (error: unknown) => {
        this.busy = false;
        const codeError = this.getFieldError(error, 'code');
        const passwordError = this.getFieldError(error, 'new_password');
        const emailError = this.getFieldError(error, 'email');
        if (codeError) this.confirmForm.controls.code.setErrors({ server: true });
        if (passwordError) this.confirmForm.controls.newPassword.setErrors({ server: true });
        this.errorMessage = codeError ?? passwordError ?? emailError ?? 'No pudimos actualizar la contraseña. Intenta nuevamente.';
      },
    });
  }

  editEmail(): void {
    this.stopTimer();
    sessionStorage.removeItem(EMAIL_KEY);
    this.step = 'request';
    this.errorMessage = '';
    this.message = '';
  }

  private startCooldown(email: string): void {
    const until = Date.now() + COOLDOWN_MS;
    sessionStorage.setItem(this.cooldownStorageKey(email), String(until));
    this.updateCooldown(email);
    this.stopTimer();
    this.timer = setInterval(() => this.updateCooldown(email), 1000);
  }

  private updateCooldown(email: string): void {
    const until = Number(sessionStorage.getItem(this.cooldownStorageKey(email)) ?? 0);
    this.secondsUntilResend = Math.max(0, Math.ceil((until - Date.now()) / 1000));
    if (!this.secondsUntilResend) {
      sessionStorage.removeItem(this.cooldownStorageKey(email));
      this.stopTimer();
    }
  }

  private stopTimer(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
  }

  private cooldownStorageKey(email: string): string {
    return `${COOLDOWN_KEY}${email.toLowerCase()}`;
  }

  private getFieldError(error: unknown, field: string): string | null {
    if (!(error instanceof HttpErrorResponse) || !error.error || typeof error.error !== 'object') return null;
    const value = (error.error as Record<string, unknown>)[field];
    if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
    if (typeof value === 'string') return value;
    return null;
  }
}
