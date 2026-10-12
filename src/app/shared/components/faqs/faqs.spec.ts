import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Faqs } from './faqs';

describe('Faqs', () => {
  let component: Faqs;
  let fixture: ComponentFixture<Faqs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Faqs],
    }).compileComponents();

    fixture = TestBed.createComponent(Faqs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('exposes a keyboard-focusable trigger and hides collapsed answers', () => {
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    const answer = fixture.nativeElement.querySelector('.faq-answer') as HTMLElement;
    expect(button.tabIndex).toBe(0);
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(answer.hidden).toBe(true);
    button.click();
    fixture.detectChanges();
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(answer.hidden).toBe(false);
    expect(button.getAttribute('aria-controls')).toBe(answer.id);
  });
});
