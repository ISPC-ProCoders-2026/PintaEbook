import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarPrivado } from './navbar-privado';

describe('NavbarPrivado', () => {
  let component: NavbarPrivado;
  let fixture: ComponentFixture<NavbarPrivado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarPrivado],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarPrivado);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows the metrics button only to administrators', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[aria-label="Ver métricas"]')).toBeNull();

    fixture.componentRef.setInput('isAdmin', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[aria-label="Ver métricas"]')).toBeTruthy();
  });
});
