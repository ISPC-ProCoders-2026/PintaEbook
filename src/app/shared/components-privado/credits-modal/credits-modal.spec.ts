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

  it('should open the checkout form for a selected plan', () => {
    component.selectPlan({ name: 'Escritor', credits: 500, monthlyPrice: 14 });

    expect(component.selectedPlan?.name).toBe('Escritor');
    expect(component.selectedPrice).toBe(14);
  });

  it('should mark the purchase as pending after submitting the static form', () => {
    component.selectPlan({ name: 'Escritor', credits: 500, monthlyPrice: 14 });
    component.submitPurchase();

    expect(component.checkoutSubmitted).toBe(true);
  });

  it('should select a custom credit amount with a provisional price', () => {
    component.customCredits = 750;
    component.selectCustomCredits();

    expect(component.selectedPlan?.credits).toBe(750);
    expect(component.selectedPrice).toBe(9000);
  });
});
