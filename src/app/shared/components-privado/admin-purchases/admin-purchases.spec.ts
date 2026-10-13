import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { AdminPurchases } from './admin-purchases';
import { PurchasesService } from '../../../service/purchases/purchases';
import { ThemeService } from '../../../service/theme/theme';
import { signal } from '@angular/core';

describe('AdminPurchases', () => {
  const service = { getPurchases: vi.fn() };
  beforeEach(() => {
    service.getPurchases.mockReset();
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideHttpClient(), { provide: PurchasesService, useValue: service }, { provide: ThemeService, useValue: { isDark: signal(false), toggle: () => undefined } }] });
  });
  it('loads the authenticated history and requests the next page', () => {
    service.getPurchases.mockReturnValue(of({ results: [], count: 30, hasNext: true, hasPrevious: false }));
    const component = TestBed.createComponent(AdminPurchases).componentInstance;
    component.ngOnInit();
    expect(component.total).toBe(30);
    expect(component.hasNext).toBe(true);
    component.loadPurchases(2);
    expect(service.getPurchases).toHaveBeenLastCalledWith(2, 'Todos');
  });
  it('shows an error and can retry without displaying example purchases', () => {
    service.getPurchases.mockReturnValue(throwError(() => ({ status: 503 })));
    const component = TestBed.createComponent(AdminPurchases).componentInstance;
    component.ngOnInit();
    expect(component.error).toBeTruthy();
    expect(component.loading).toBe(false);
    expect(component.purchases).toEqual([]);
    service.getPurchases.mockReturnValue(of({ results: [], count: 0, hasNext: false, hasPrevious: false }));
    component.loadPurchases();
    expect(component.error).toBe('');
  });
});
