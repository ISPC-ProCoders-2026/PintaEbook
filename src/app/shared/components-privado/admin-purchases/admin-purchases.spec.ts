import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { ThemeService } from '../../../service/theme/theme';
import { AdminPurchases } from './admin-purchases';

describe('AdminPurchases', () => {
  let component: AdminPurchases;
  let fixture: ComponentFixture<AdminPurchases>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPurchases],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: ThemeService, useValue: { isDark: signal(false), toggle: () => undefined } }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(AdminPurchases);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the static purchases view', () => {
    expect(component).toBeTruthy();
    expect(component.filteredPurchases.length).toBe(5);
  });

  it('should filter purchases by status and sort by amount', () => {
    component.selectedStatus = 'Aprobada';
    component.sortBy = 'Monto';

    expect(component.filteredPurchases.every((purchase) => purchase.status === 'Aprobada')).toBe(true);
    expect(component.filteredPurchases[0].amount).toBe(34.99);
  });
});