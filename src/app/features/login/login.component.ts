import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // State signals
  showPassword = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  // Reactive form matching PDF requirements
  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  // Convenience getters for form controls
  get emailControl() {
    return this.loginForm.get('email');
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((val) => !val);
  }

  onSubmit(): void {
    this.errorMessage.set(null);

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const { email, password } = this.loginForm.value;

    this.authService.login({ email: email.trim(), password }).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success) {
          this.router.navigate(['/purchase-bill']);
        } else {
          this.errorMessage.set(response.message || 'Invalid username or password');
        }
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading.set(false);
        if (error.status === 400 || error.status === 401) {
          this.errorMessage.set(
            error.error?.message || 'Invalid username or password'
          );
        } else if (error.status === 0 || error.status >= 500) {
          this.errorMessage.set('Unable to authenticate. Please try again.');
        } else {
          this.errorMessage.set(
            error.error?.message || 'Unable to authenticate. Please try again.'
          );
        }
      }
    });
  }
}
