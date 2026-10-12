import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.generated';
import { CheckoutResponse, CreditBalance, CreditPackage } from '../../models/billing.model';

export const CHECKOUT_BALANCE_KEY = 'pintaebook.checkout.balance';

export function billingError(status: number): string {
  if (status === 401) return 'Tu sesión venció. Volvé a iniciar sesión para continuar.';
  if (status === 404) return 'El paquete ya no está disponible. Actualizá el catálogo.';
  if (status === 502 || status === 503) return 'No pudimos iniciar el pago. Intentá nuevamente en unos minutos.';
  return 'No pudimos completar la solicitud. Intentá nuevamente.';
}

@Injectable({ providedIn: 'root' })
export class BillingService {
  private readonly apiUrl = `${environment.apiBaseUrl.replace(/\/$/, '')}/billing`;
  constructor(private readonly http: HttpClient) {}
  private get headers(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
  }
  getBalance(): Observable<CreditBalance> {
    return this.http.get<CreditBalance>(`${this.apiUrl}/balance/`, { headers: this.headers });
  }
  getPackages(): Observable<CreditPackage[]> {
    return this.http.get<CreditPackage[]>(`${this.apiUrl}/packages/`, { headers: this.headers });
  }
  createCheckout(packageId: number): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(`${this.apiUrl}/checkout/`, { paquete_id: packageId }, { headers: this.headers });
  }
}
