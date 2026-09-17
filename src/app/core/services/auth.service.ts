import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse } from '../../shared/models/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';
  private readonly LOCATIONS_KEY = 'auth_locations';

  // Reactive state using Angular Signals
  readonly token = signal<string | null>(this.getStoredToken());
  readonly currentUser = signal<string | null>(this.getStoredUser());
  readonly isAuthenticated = computed(() => !!this.token());

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap((response) => {
        if (response.success && response.token) {
          this.setSession(response);
        }
      })
    );
  }

  setSession(authResult: LoginResponse): void {
    if (authResult.token) {
      sessionStorage.setItem(this.TOKEN_KEY, authResult.token);
      this.token.set(authResult.token);
    }
    if (authResult.email) {
      sessionStorage.setItem(this.USER_KEY, authResult.email);
      this.currentUser.set(authResult.email);
    }
    if (authResult.userLocations) {
      sessionStorage.setItem(this.LOCATIONS_KEY, JSON.stringify(authResult.userLocations));
    }
  }

  logout(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
    sessionStorage.removeItem(this.LOCATIONS_KEY);
    this.token.set(null);
    this.currentUser.set(null);
  }

  getToken(): string | null {
    return this.token();
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  private getStoredToken(): string | null {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return sessionStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  private getStoredUser(): string | null {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return sessionStorage.getItem(this.USER_KEY);
    }
    return null;
  }
}
