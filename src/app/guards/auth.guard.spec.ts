import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { AuthService } from '../service/login/login';
import { authGuard } from './auth.guard';
import { adminGuard } from './admin.guard';
import { guestGuard } from './guest.guard';

describe('authentication route guards', () => {
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, provideRouter([])]
    });
    router = TestBed.inject(Router);
    localStorage.clear();
  });

  afterEach(() => localStorage.clear());

  it('redirects a guest away from a private route', () => {
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );

    expect(router.serializeUrl(result as UrlTree)).toBe('/login');
  });

  it('allows an authenticated user into a private route', () => {
    localStorage.setItem('token', 'access-token');

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );

    expect(result).toBe(true);
  });

  it('allows a guest to visit login or register', () => {
    const result = TestBed.runInInjectionContext(() =>
      guestGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );

    expect(result).toBe(true);
  });

  it('redirects an authenticated user away from login or register', () => {
    localStorage.setItem('token', 'access-token');

    const result = TestBed.runInInjectionContext(() =>
      guestGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );

    expect(router.serializeUrl(result as UrlTree)).toBe('/dashboard');
  });

  it('allows an authenticated administrator into an admin route', () => {
    localStorage.setItem('token', 'access-token');
    localStorage.setItem('userRole', 'admin');

    const result = TestBed.runInInjectionContext(() =>
      adminGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );

    expect(result).toBe(true);
  });

  it('redirects a non-administrator away from an admin route', () => {
    localStorage.setItem('token', 'access-token');
    localStorage.setItem('userRole', 'writer');

    const result = TestBed.runInInjectionContext(() =>
      adminGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );

    expect(router.serializeUrl(result as UrlTree)).toBe('/dashboard');
  });
});
