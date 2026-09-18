import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { AuthService } from './login';

describe('Login', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()]
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('treats an expired JWT as a closed session', () => {
    const expiredPayload = btoa(JSON.stringify({ exp: 1 }));
    localStorage.setItem('token', `header.${expiredPayload}.signature`);
    localStorage.setItem('refresh', 'refresh-token');

    expect(service.isLoggedIn()).toBe(false);
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('refresh')).toBeNull();
  });
});
