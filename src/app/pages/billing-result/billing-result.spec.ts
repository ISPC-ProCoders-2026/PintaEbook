import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { BillingResult } from './billing-result';
import { BillingService, CHECKOUT_BALANCE_KEY } from '../../service/billing/billing';

describe('BillingResult', () => {
  let billing: { getBalance: ReturnType<typeof vi.fn> };
  function create(outcome = 'success') {
    TestBed.configureTestingModule({
      imports: [BillingResult],
      providers: [provideRouter([]), { provide: BillingService, useValue: billing },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ outcome }) } } }]
    });
    const fixture = TestBed.createComponent(BillingResult);
    fixture.componentInstance.ngOnInit();
    return fixture;
  }
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.setItem('userId', '42');
    sessionStorage.setItem(CHECKOUT_BALANCE_KEY, JSON.stringify({ balance: 10, userId: '42', createdAt: Date.now() }));
    billing = { getBalance: vi.fn(() => of({ credits_available: 10, last_updated: '' })) };
  });
  afterEach(() => { TestBed.resetTestingModule(); vi.useRealTimers(); localStorage.clear(); sessionStorage.clear(); });
  it('waits for the backend balance increase instead of trusting success', async () => {
    const fixture = create();
    await vi.advanceTimersByTimeAsync(0);
    expect(fixture.componentInstance.message()).not.toContain('Ya podés');
    billing.getBalance.mockReturnValue(of({ credits_available: 510, last_updated: '' }));
    await vi.advanceTimersByTimeAsync(3000);
    expect(fixture.componentInstance.balance()).toBe(510);
    expect(fixture.componentInstance.message()).toContain('Ya podés');
    expect(fixture.componentInstance.checking()).toBe(false);
    expect(sessionStorage.getItem(CHECKOUT_BALANCE_KEY)).toBeNull();
  });
  it('stops polling and allows a manual retry when balance does not change', async () => {
    const fixture = create();
    await vi.advanceTimersByTimeAsync(33000);
    expect(billing.getBalance).toHaveBeenCalledTimes(11);
    expect(fixture.componentInstance.checking()).toBe(false);
    expect(fixture.componentInstance.message()).toContain('procesándose');
    fixture.componentInstance.checkBalance();
    await vi.advanceTimersByTimeAsync(0);
    expect(billing.getBalance).toHaveBeenCalledTimes(12);
    fixture.destroy();
    await vi.advanceTimersByTimeAsync(60000);
    expect(billing.getBalance).toHaveBeenCalledTimes(12);
  });
  it('does not claim credits were added when checkout context is missing', async () => {
    sessionStorage.clear();
    billing.getBalance.mockReturnValue(of({ credits_available: 510, last_updated: '' }));
    const fixture = create();
    await vi.advanceTimersByTimeAsync(33000);
    expect(fixture.componentInstance.balance()).toBe(510);
    expect(fixture.componentInstance.message()).not.toContain('Ya podés');
  });
  it('checks balance once after a failed payment', async () => {
    const fixture = create('failure');
    await vi.advanceTimersByTimeAsync(33000);
    expect(billing.getBalance).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.message()).toContain('No se completó');
  });
});
