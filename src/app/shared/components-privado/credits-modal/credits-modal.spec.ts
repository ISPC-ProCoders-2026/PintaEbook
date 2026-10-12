import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { CreditsModal } from './credits-modal';
import { CHECKOUT_BALANCE_KEY } from '../../../service/billing/billing';

const pkg = { id: 2, nombre: 'Estándar', cantidad_creditos: 500, precio: '4000.00' };
describe('CreditsModal checkout', () => {
  let component: CreditsModal;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CreditsModal], providers: [provideHttpClient(), provideHttpClientTesting()] });
    component = TestBed.createComponent(CreditsModal).componentInstance;
    http = TestBed.inject(HttpTestingController);
    localStorage.setItem('token', 'test-token');
  });
  afterEach(() => { http.verify(); localStorage.clear(); sessionStorage.clear(); });
  it('loads the backend catalog with JWT', () => {
    component.isOpen = true;
    component.ngOnChanges();
    const req = http.expectOne(r => r.url.endsWith('/billing/packages/'));
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
    req.flush([pkg]);
    expect(component.creditPackages()).toEqual([pkg]);
  });
  it('sends only the package ID, prevents double clicks and redirects', () => {
    const redirect = vi.spyOn(component, 'redirectToCheckout').mockImplementation(() => {});
    component.buy(pkg);
    component.buy(pkg);
    http.expectOne(r => r.url.endsWith('/billing/balance/')).flush({ credits_available: 10, last_updated: '' });
    const req = http.expectOne(r => r.url.endsWith('/billing/checkout/'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ paquete_id: 2 });
    req.flush({ init_point: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=test' });
    expect(redirect).toHaveBeenCalledOnce();
    expect(JSON.parse(sessionStorage.getItem(CHECKOUT_BALANCE_KEY)!).balance).toBe(10);
  });
  it('allows retry when checkout fails', () => {
    component.buy(pkg);
    http.expectOne(r => r.url.endsWith('/billing/balance/')).flush({ credits_available: 10 });
    http.expectOne(r => r.url.endsWith('/billing/checkout/')).flush({}, { status: 503, statusText: 'Unavailable' });
    expect(component.buyingId()).toBeNull();
    expect(component.error()).toContain('Intentá nuevamente');
  });
  it('does not redirect to an unexpected checkout host', () => {
    const redirect = vi.spyOn(component, 'redirectToCheckout');
    component.buy(pkg);
    http.expectOne(r => r.url.endsWith('/billing/balance/')).flush({ credits_available: 10 });
    http.expectOne(r => r.url.endsWith('/billing/checkout/')).flush({ init_point: 'https://example.com' });
    expect(redirect).not.toHaveBeenCalled();
    expect(component.buyingId()).toBeNull();
  });
});
