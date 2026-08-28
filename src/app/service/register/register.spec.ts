import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { RegisterService } from './register';
import { environment } from '../../../environments/environment.generated';
import { RegisterRequest } from '../../models/auth.model';

describe('RegisterService', () => {
  let service: RegisterService;
  let httpTesting: HttpTestingController;
  const apiUrl = `${environment.apiBaseUrl}/auth`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RegisterService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(RegisterService);
    httpTesting = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should register with email and store the access token', () => {
    const credentials: RegisterRequest = {
      first_name: 'Ana',
      last_name: 'Perez',
      email: 'ana@example.com',
      password: 'secret123',
    };

    service.register(credentials).subscribe(response => {
      expect(response.access).toBe('access-token');
      expect(localStorage.getItem('token')).toBe('access-token');
      expect(localStorage.getItem('refresh')).toBe('refresh-token');
    });

    const request = httpTesting.expectOne(`${apiUrl}/register/`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(credentials);
    request.flush({ access: 'access-token', refresh: 'refresh-token' });
  });

  it('should register with Google using the credential token', () => {
    service.registerWithGoogle('google-credential').subscribe(response => {
      expect(response.access).toBe('google-access-token');
      expect(localStorage.getItem('token')).toBe('google-access-token');
    });

    const request = httpTesting.expectOne(`${apiUrl}/google/`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ id_token: 'google-credential' });
    request.flush({ access: 'google-access-token' });
  });
});
