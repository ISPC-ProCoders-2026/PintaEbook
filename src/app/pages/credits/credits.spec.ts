import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Credits } from './credits';

describe('Credits', () => {
  let component: Credits;
  let fixture: ComponentFixture<Credits>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Credits],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Credits);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
