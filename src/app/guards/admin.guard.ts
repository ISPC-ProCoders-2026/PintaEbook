import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/login/login';

/** Allows access only to authenticated users whose backend role is admin. */
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAdmin() || router.createUrlTree(['/dashboard']);
};
