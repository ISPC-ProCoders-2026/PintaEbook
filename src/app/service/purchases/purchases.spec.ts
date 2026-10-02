import { TestBed } from '@angular/core/testing';

import { PurchasesService } from './purchases';

describe('PurchasesService', () => {
  it('should be created as the future purchases API contract', () => {
    TestBed.configureTestingModule({});
    expect(TestBed.inject(PurchasesService)).toBeTruthy();
  });
});