import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { Dashboard } from './dashboard';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let navigatedTo: string[] | undefined;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        provideHttpClient(),
        {
          provide: Router,
          useValue: {
            navigate: (commands: string[]) => {
              navigatedTo = commands;
              return Promise.resolve(true);
            }
          }
        }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('clears the session and redirects to login when logging out', () => {
    localStorage.setItem('token', 'access-token');
    localStorage.setItem('refresh', 'refresh-token');

    fixture.nativeElement.querySelector('.profile-card').click();

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('refresh')).toBeNull();
    expect(navigatedTo).toEqual(['/login']);
  });

  it('recognizes an administrator session', () => {
    localStorage.setItem('token', 'access-token');
    localStorage.setItem('userRole', 'ADMIN');

    expect(component.isAdmin).toBe(true);
  });
});
