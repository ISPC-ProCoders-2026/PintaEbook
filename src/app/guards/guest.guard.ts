import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/login/login';

/** Keeps authenticated users out of pages intended only for guests. */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return !authService.isLoggedIn() || router.createUrlTree(['/dashboard']);
};
