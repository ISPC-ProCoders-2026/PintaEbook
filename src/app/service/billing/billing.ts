import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment.generated';
import { CreditBalance } from '../../models/billing.model';

@Injectable({ providedIn: 'root' })
export class BillingService {
  private readonly apiUrl = `${environment.apiBaseUrl.replace(/\/$/, '')}/billing`;

  constructor(private readonly http: HttpClient) {}

  getBalance(): Observable<CreditBalance> {
    const token = localStorage.getItem('token');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.get<CreditBalance>(`${this.apiUrl}/balance/`, { headers });
  }
}
