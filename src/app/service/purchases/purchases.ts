import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Purchase } from '../../models/purchase.model';

@Injectable({ providedIn: 'root' })
export class PurchasesService {
  /** Contrato preparado para conectar el endpoint de compras del backend. */
  getPurchases(): Observable<Purchase[]> {
    throw new Error('Endpoint de compras pendiente de implementación.');
  }
}