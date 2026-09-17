import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: { login: ReturnType<typeof vi.fn> };
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockAuthService = {
      login: vi.fn()
    };
    mockRouter = {
      navigate: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the login component', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form initially when empty', () => {
    expect(component.loginForm.valid).toBe(false);
  });

  it('should validate email format and required password', () => {
    const emailCtrl = component.loginForm.get('email');
    const passwordCtrl = component.loginForm.get('password');

    emailCtrl?.setValue('not-an-email');
    passwordCtrl?.setValue('');

    expect(emailCtrl?.hasError('email')).toBe(true);
    expect(passwordCtrl?.hasError('required')).toBe(true);

    emailCtrl?.setValue('info@enhanzer.com');
    passwordCtrl?.setValue('Welcome#5');

    expect(component.loginForm.valid).toBe(true);
  });

  it('should toggle password visibility', () => {
    expect(component.showPassword()).toBe(false);
    component.togglePasswordVisibility();
    expect(component.showPassword()).toBe(true);
    component.togglePasswordVisibility();
    expect(component.showPassword()).toBe(false);
  });

  it('should call authService and navigate to /purchase-bill on valid login', () => {
    mockAuthService.login.mockReturnValue(
      of({ success: true, message: 'Login successful', token: 'jwt-token-xyz' })
    );

    component.loginForm.setValue({
      email: 'info@enhanzer.com',
      password: 'Welcome#5'
    });

    component.onSubmit();

    expect(mockAuthService.login).toHaveBeenCalledWith({
      email: 'info@enhanzer.com',
      password: 'Welcome#5'
    });
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/purchase-bill']);
  });

  it('should show error message when login fails', () => {
    mockAuthService.login.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 401, error: { message: 'Invalid username or password' } }))
    );

    component.loginForm.setValue({
      email: 'info@enhanzer.com',
      password: 'WrongPassword'
    });

    component.onSubmit();

    expect(component.errorMessage()).toBe('Invalid username or password');
  });
});
