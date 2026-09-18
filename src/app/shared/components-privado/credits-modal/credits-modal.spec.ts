import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditsModal } from './credits-modal';

describe('CreditsModal', () => {
  let component: CreditsModal;
  let fixture: ComponentFixture<CreditsModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditsModal],
    }).compileComponents();

    fixture = TestBed.createComponent(CreditsModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
