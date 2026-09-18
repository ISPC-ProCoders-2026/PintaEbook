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

});
