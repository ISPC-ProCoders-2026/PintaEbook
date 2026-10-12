import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/login/login';

export const dashboardSectionGuard: CanActivateFn = route => {
  const section = route.queryParamMap.get('section');
  if (section !== 'metrics' && section !== 'purchases') return true;
  return inject(AuthService).isAdmin() || inject(Router).createUrlTree(['/dashboard'], {
    queryParams: { section: 'dashboard' }
  });
};
