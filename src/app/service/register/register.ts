import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment.generated';
import { AuthResponse, GoogleLoginRequest, RegisterRequest } from '../../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private apiUrl = `${environment.apiBaseUrl}/auth`;

  constructor(private http: HttpClient) {}

  register(credentials: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register/`, credentials).pipe(
      tap(response => this.handleAuthentication(response))
    );
  }

  registerWithGoogle(idToken: string): Observable<AuthResponse> {
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

  private getUserRole(response: AuthResponse): string | undefined {
    const role = response.user?.role;

    if (typeof role === 'string') {
      return role;
    }

    return role?.nombre_rol ?? response.user?.role_name;
  }
}
