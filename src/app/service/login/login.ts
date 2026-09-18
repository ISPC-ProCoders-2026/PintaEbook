import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment.generated';
import { LoginRequest, GoogleLoginRequest, AuthResponse } from '../../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiBaseUrl}/auth`;

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login/`, credentials).pipe(
      tap(response => this.handleAuthentication(response))
    );
  }

  loginWithGoogle(idToken: string): Observable<AuthResponse> {
    const payload: GoogleLoginRequest = { id_token: idToken };
    return this.http.post<AuthResponse>(`${this.apiUrl}/google/`, payload).pipe(
      tap(response => this.handleAuthentication(response))
    );
  }

  private handleAuthentication(response: AuthResponse): void {
    const token = response.access || response.token;
    if (token) {
      localStorage.setItem('token', token);
    }
    if (response.refresh) {
      localStorage.setItem('refresh', response.refresh);
    }
    const role = this.getUserRole(response);
    if (role) {
      localStorage.setItem('userRole', role);
    } else {
      localStorage.removeItem('userRole');
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    localStorage.removeItem('userRole');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    const token = this.getToken();

    if (!token || this.isExpiredJwt(token)) {
      this.logout();
      return false;
    }

    return true;
  }

  isAdmin(): boolean {
    return this.isLoggedIn() && localStorage.getItem('userRole')?.toLowerCase() === 'admin';
  }

  private getUserRole(response: AuthResponse): string | undefined {
    const role = response.user?.role;

    if (typeof role === 'string') {
      return role;
    }

    return role?.nombre_rol ?? response.user?.role_name;
  }

  private isExpiredJwt(token: string): boolean {
    const payload = token.split('.')[1];

    // Some backends issue opaque tokens. Their validity remains delegated to
    // the API, while JWT access tokens can be checked locally for expiration.
    if (!payload) {
      return false;
    }

    try {
      const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decodedPayload = JSON.parse(atob(normalizedPayload)) as { exp?: number };

      return typeof decodedPayload.exp === 'number' && decodedPayload.exp * 1000 <= Date.now();
    } catch {
      return true;
    }
  }
}
