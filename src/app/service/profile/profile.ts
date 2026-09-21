import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, timeout } from 'rxjs';

import { environment } from '../../../environments/environment.generated';
import { UserProfile } from '../../models/user-profile.model';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly apiUrl = `${environment.apiBaseUrl}/auth/me/`;

  constructor(private readonly http: HttpClient) {}

  getProfile(): Observable<UserProfile> {
    const token = localStorage.getItem('token');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

    return this.http.get<UserProfile>(this.apiUrl, { headers }).pipe(timeout(8000));
  }
}
