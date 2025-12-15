import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User, LoginRequest, AuthResponse, ProfileResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  // Signals for reactive state management
  private readonly currentUserSignal = signal<User | null>(this.getUserFromStorage());
  private readonly tokenSignal = signal<string | null>(this.getTokenFromStorage());

  // Public computed signals
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);
  readonly isAdmin = computed(() => this.currentUserSignal()?.role === 'admin');

  // BehaviorSubject for compatibility with async pipe (optional)
  private readonly currentUser$ = new BehaviorSubject<User | null>(this.getUserFromStorage());

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, data).pipe(
      tap((response) => this.handleAuthSuccess(response)),
      catchError((error) => this.handleError(error))
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/logout`, {}).pipe(
      tap(() => {
        this.clearAuth();
        this.router.navigate(['/login']);
      }),
      catchError((error) => {
        // Even if the server request fails, clear local auth
        this.clearAuth();
        this.router.navigate(['/login']);
        return this.handleError(error);
      })
    );
  }

  getProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(`${environment.apiUrl}/auth/profile`).pipe(
      tap((response) => this.setUser(response.data.user)),
      catchError((error) => this.handleError(error))
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http
      .post(`${environment.apiUrl}/auth/change-password`, {
        current_password: currentPassword,
        new_password: newPassword,
      })
      .pipe(catchError((error) => this.handleError(error)));
  }

  private handleAuthSuccess(response: AuthResponse): void {
    this.setToken(response.data.token);
    this.setUser(response.data.user);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.tokenSignal.set(token);
  }

  private setUser(user: User): void {
    const normalizedUser = this.normalizeUser(user);
    localStorage.setItem(this.USER_KEY, JSON.stringify(normalizedUser));
    this.currentUserSignal.set(normalizedUser);
    this.currentUser$.next(normalizedUser);
  }

  private clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.tokenSignal.set(null);
    this.currentUserSignal.set(null);
    this.currentUser$.next(null);
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    if (!userJson) {
      return null;
    }
    try {
      return JSON.parse(userJson);
    } catch (error) {
      console.error('Error parsing user from storage:', error);
      localStorage.removeItem(this.USER_KEY);
      return null;
    }
  }

  private getTokenFromStorage(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private normalizeUser(user: any): User {
    return {
      id: user.id,
      person_id: user.person_id,
      email: user.email,
      role: user.role,
      is_active: user.is_active ?? true,
      account_expiration_date: user.account_expiration_date,
      created_by: user.created_by,
      modified_by: user.modified_by,
      created_date: user.created_date,
      modified_date: user.modified_date,
      person: user.person,
    };
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = error.error?.message || error.message;

      // If unauthorized, clear auth and redirect to login
      if (error.status === 401) {
        this.clearAuth();
        this.router.navigate(['/login']);
      }
    }

    console.error('Auth Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
