import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-purchase-bill',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="purchase-bill-placeholder">
      <header class="page-header">
        <div class="header-inner">
          <div class="brand">
            <span class="logo-bars">///</span>
            <span class="brand-title">Purchase Management</span>
          </div>
          <div class="user-meta">
            <span class="user-email">{{ authService.currentUser() }}</span>
            <button (click)="logout()" class="logout-btn">Logout</button>
          </div>
        </div>
      </header>
      <main class="page-body">
        <div class="welcome-card">
          <h2>Authentication Successful!</h2>
          <p>You have successfully logged in via the Enhanzer POS Authentication API.</p>
          <div class="session-info">
            <p><strong>Authenticated User:</strong> {{ authService.currentUser() }}</p>
            <p><strong>Session Status:</strong> Protected Route Active</p>
          </div>
          <p class="next-step">Purchase Bill Form (Task 2) will be developed in the next step.</p>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .purchase-bill-placeholder {
      min-height: 100vh;
      background-color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .page-header {
      background: #1e3a8a;
      color: white;
      padding: 1rem 2rem;
    }
    .header-inner {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.25rem;
      font-weight: 600;
    }
    .logo-bars {
      color: #60a5fa;
      font-weight: 900;
    }
    .user-meta {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .user-email {
      font-size: 0.875rem;
      color: #bfdbfe;
    }
    .logout-btn {
      background: #ef4444;
      color: white;
      border: none;
      padding: 0.375rem 0.875rem;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      font-size: 0.875rem;
      transition: background 0.15s;
    }
    .logout-btn:hover {
      background: #dc2626;
    }
    .page-body {
      max-width: 800px;
      margin: 3rem auto;
      padding: 0 1rem;
    }
    .welcome-card {
      background: white;
      padding: 2.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      text-align: center;
    }
    .welcome-card h2 {
      color: #1e3a8a;
      margin-top: 0;
    }
    .session-info {
      margin: 1.5rem 0;
      padding: 1rem;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      text-align: left;
    }
    .next-step {
      color: #64748b;
      font-style: italic;
    }
  `]
})
export class PurchaseBillComponent {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
