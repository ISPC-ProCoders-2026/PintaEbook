import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject } from 'rxjs';
import { Dashboard } from './dashboard';
import { BillingService } from '../../service/billing/billing';
import { AuthService } from '../../service/login/login';
import { CreditBalance } from '../../models/billing.model';

describe('Dashboard asynchronous credit balance', () => {
  it('renders the API balance after the initial render without a user interaction', async () => {
    const response = new Subject<CreditBalance>();
    TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [provideRouter([]),
        { provide: BillingService, useValue: { getBalance: () => response } },
        { provide: AuthService, useValue: { isAdmin: () => false } }]
    });
    TestBed.overrideComponent(Dashboard, {
      set: { imports: [], template: `<strong>{{ creditBalance()?.credits_available ?? '—' }}</strong>` }
    });
    const fixture = TestBed.createComponent(Dashboard);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('—');
    response.next({ credits_available: 100, last_updated: '2026-10-12T10:00:00Z' });
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('100');
    response.next({ credits_available: 0, last_updated: '2026-10-12T10:00:01Z' });
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent.trim()).toBe('0');
  });
});
