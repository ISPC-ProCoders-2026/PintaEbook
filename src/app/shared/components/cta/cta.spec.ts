import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Cta } from './cta';

describe('Cta', () => {
  let component: Cta;
  let fixture: ComponentFixture<Cta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cta],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Cta);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
