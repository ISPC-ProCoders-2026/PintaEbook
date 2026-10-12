import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { routes } from '../../app.routes';
import { Dashboard } from './dashboard';
import { AuthService } from '../../service/login/login';
import { BillingService } from '../../service/billing/billing';

 describe('Dashboard section URLs', () => {
  let admin = false;
  beforeEach(() => {
    admin = false;
    TestBed.configureTestingModule({ providers: [provideRouter(routes), provideHttpClient(),
      { provide: AuthService, useValue: { isLoggedIn: () => true, isAdmin: () => admin } },
      { provide: BillingService, useValue: { getBalance: () => of({ credits_available: 100 }) } }
    ] });
    TestBed.overrideComponent(Dashboard, { set: { imports: [], template: '{{ activeSection }}' } });
  });
  it('redirects the old history URL and supports back navigation between sections', async () => {
    const harness = await RouterTestingHarness.create();
    const dashboard = await harness.navigateByUrl('/purchases', Dashboard);
    expect(TestBed.inject(Router).url).toBe('/dashboard?section=purchase-history');
    expect(dashboard.activeSection).toBe('purchase-history');
    await harness.navigateByUrl('/dashboard?section=profile', Dashboard);
    expect(dashboard.activeSection).toBe('profile');
    await harness.navigateByUrl('/dashboard?section=purchase-history', Dashboard);
    expect(dashboard.activeSection).toBe('purchase-history');
  });
  it('allows administrators to open legacy purchases and metrics URLs', async () => {
    admin = true;
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/admin/purchases', Dashboard);
    expect(TestBed.inject(Router).url).toBe('/dashboard?section=purchases');
    await harness.navigateByUrl('/admin/metrics', Dashboard);
    expect(TestBed.inject(Router).url).toBe('/dashboard?section=metrics');
  });
  it('blocks admin sections on direct access and query changes for ordinary users', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/dashboard?section=purchases', Dashboard);
    expect(TestBed.inject(Router).url).toBe('/dashboard?section=dashboard');
    await harness.navigateByUrl('/dashboard?section=metrics', Dashboard);
    expect(TestBed.inject(Router).url).toBe('/dashboard?section=dashboard');
  });
});
