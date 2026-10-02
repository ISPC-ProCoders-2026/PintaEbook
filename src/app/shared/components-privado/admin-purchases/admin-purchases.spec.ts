import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { ThemeService } from '../../../service/theme/theme';
import { AdminPurchases } from './admin-purchases';

describe('AdminPurchases', () => {
  let component: AdminPurchases;
  let fixture: ComponentFixture<AdminPurchases>;
  let router: Router;

  beforeEach(async () => {
    localStorage.clear();
    localStorage.setItem('token', 'user-token');
    localStorage.setItem('userId', 'user-1');
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
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create the static purchases view', () => {
    expect(component).toBeTruthy();
    expect(component.filteredPurchases.length).toBe(2);
  });

  it('should filter purchases by status and sort by amount', () => {
    component.selectedStatus = 'Aprobada';
    component.sortBy = 'Monto';

    expect(component.filteredPurchases.every((purchase) => purchase.status === 'Aprobada')).toBe(true);
    expect(component.filteredPurchases[0].amount).toBe(19.99);
  });

  it('should show every user purchase in the administrator view', () => {
    localStorage.setItem('userRole', 'admin');
    vi.spyOn(router, 'url', 'get').mockReturnValue('/admin/purchases');

    expect(component.isAdminView).toBe(true);
    expect(component.filteredPurchases.length).toBe(6);
  });

  it('should show only the administrator purchases in the private history route', () => {
    localStorage.setItem('userRole', 'admin');
    localStorage.setItem('userId', 'admin-1');

    expect(component.isAdminView).toBe(false);
    expect(component.filteredPurchases.length).toBe(1);
  });
});