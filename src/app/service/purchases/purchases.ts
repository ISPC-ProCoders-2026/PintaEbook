import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment.generated';

import { Purchase } from '../../models/purchase.model';

@Injectable({ providedIn: 'root' })
export class PurchasesService {
  private readonly http = inject(HttpClient);
  getPurchases(page = 1, status?: string): Observable<PurchasePage> {
    const states: Record<string, string> = { Aprobada: 'aprobado', Pendiente: 'pendiente', Rechazada: 'fallido', Reembolsada: 'reembolsado', Cancelada: 'cancelado' };
    const labels: Record<string, Purchase['status']> = { aprobado: 'Aprobada', pendiente: 'Pendiente', fallido: 'Rechazada', reembolsado: 'Reembolsada', cancelado: 'Cancelada' };
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
    let params = new HttpParams().set('page', page);
    if (status && states[status]) params = params.set('estado', states[status]);
    return this.http.get<TransactionPage>(`${environment.apiBaseUrl.replace(/\/$/, '')}/billing/transactions/`, { headers, params }).pipe(map(response => ({
      count: response.count, hasNext: Boolean(response.next), hasPrevious: Boolean(response.previous),
      results: response.results.map(item => ({
        id: String(item.id), timestamp: item.fecha,
        date: new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.fecha)),
        packageName: item.paquete.nombre, credits: item.paquete.cantidad_creditos,
        amount: Number(item.monto), status: labels[item.estado], userId: '', userName: '',
      })),
    })));
  }
}

interface TransactionPage {
  count: number; next: string | null; previous: string | null;
  results: { id: number; fecha: string; monto: string; estado: string; paquete: { nombre: string; cantidad_creditos: number } }[];
}
export interface PurchasePage {
  count: number; hasNext: boolean; hasPrevious: boolean; results: Purchase[];
}
