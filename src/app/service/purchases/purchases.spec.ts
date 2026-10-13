import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PurchasesService } from './purchases';
import { environment } from '../../../environments/environment.generated';

describe('PurchasesService', () => {
  afterEach(() => { TestBed.inject(HttpTestingController).verify(); localStorage.clear(); });
  it('authenticates, filters, paginates and maps real transactions', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    localStorage.setItem('token', 'test-token');
    TestBed.inject(PurchasesService).getPurchases(2, 'Reembolsada').subscribe(result => {
      expect(result.count).toBe(21);
      expect(result.hasPrevious).toBe(true);
      expect(result.hasNext).toBe(false);
      expect(result.results[0]).toMatchObject({ id: '9', amount: 4000, credits: 500, status: 'Reembolsada', packageName: 'Standard' });
    });
    const request = TestBed.inject(HttpTestingController).expectOne(req => req.url === `${environment.apiBaseUrl.replace(/\/$/, '')}/billing/transactions/`);
    expect(request.request.headers.get('Authorization')).toBe('Bearer test-token');
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('estado')).toBe('reembolsado');
    request.flush({ count: 21, next: null, previous: 'previous', results: [{ id: 9, monto: '4000.00', estado: 'reembolsado', fecha: '2026-10-13T03:00:00Z', paquete: { nombre: 'Standard', cantidad_creditos: 500 } }] });
  });
});
