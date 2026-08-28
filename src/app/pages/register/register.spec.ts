import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { Register } from './register';
import { RegisterService } from '../../service/register/register';

class RegisterServiceMock {
  register() {
    return of({ access: 'test-token' });
  }

  registerWithGoogle() {
    return of({ access: 'test-token' });
  }
}

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [
        provideRouter([]),
        { provide: RegisterService, useClass: RegisterServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reject an incomplete form', () => {
    component.onSubmit();

    expect(component.registerForm.invalid).toBe(true);
    expect(component.registerForm.controls.email.touched).toBe(true);
  });

  it('should reject passwords that do not match', () => {
    component.registerForm.setValue({
      firstName: 'Ana',
      lastName: 'Perez',
      email: 'ana@example.com',
      password: 'secret123',
      confirmPassword: 'different123',
      terms: true,
    });

    expect(component.registerForm.hasError('passwordsMismatch')).toBe(true);
  });
});
