import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { switchMap, tap } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface LoginRequest {
  email: string;
  motDePasse: string;
}

export interface RegisterRequest {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  motDePasse: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  role: string;
}

export interface UserProfile {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: string;
  dateCreation: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly userProfile = signal<UserProfile | null>(this.loadStoredUserProfile());

  readonly currentUser = computed(() => this.userProfile());
  readonly firstName = computed(() => this.userProfile()?.prenom || 'membre');
  readonly displayName = computed(() => {
    const user = this.userProfile();
    return [user?.prenom, user?.nom].filter(Boolean).join(' ') || user?.email || 'Membre';
  });
  readonly initials = computed(() => {
    const user = this.userProfile();
    const initials = `${user?.prenom?.charAt(0) ?? ''}${user?.nom?.charAt(0) ?? ''}`.toUpperCase();
    return initials || user?.email?.charAt(0).toUpperCase() || 'M';
  });
  readonly memberSinceLabel = computed(() => {
    const user = this.userProfile();
    const year = user?.dateCreation?.match(/\d{4}/)?.[0];
    const roleLabels: Record<string, string> = {
      LIBRAIRE: 'Libraire',
      ADMIN: 'Administrateur',
      UTILISATEUR: 'Membre',
    };
    const roleLabel = (user?.role && roleLabels[user.role]) ?? 'Membre';
    return year ? `${roleLabel} · depuis ${year}` : roleLabel;
  });

  login(payload: LoginRequest) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, payload)
      .pipe(
        tap((response) => {
          this.storeAuthResponse(response);
        }),
        switchMap(() => this.loadCurrentUser()),
      );
  }

  register(payload: RegisterRequest) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/register`, payload)
      .pipe(
        tap((response) => {
          this.storeAuthResponse(response);
        }),
      );
  }

  logout(): void {
    this.userProfile.set(null);

    if (!this.isBrowser) {
      return;
    }

    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    localStorage.removeItem('userProfile');
  }

  getToken(): string | null {
    if (!this.isBrowser) {
      return null;
    }

    return localStorage.getItem('token');
  }

  loadCurrentUser() {
    return this.http.get<UserProfile>(`${environment.apiUrl}/users/me`).pipe(
      tap((profile) => {
        this.userProfile.set(profile);

        if (this.isBrowser) {
          localStorage.setItem('userProfile', JSON.stringify(profile));
          localStorage.setItem('email', profile.email);
          localStorage.setItem('role', profile.role);
        }
      }),
    );
  }

  refreshCurrentUserIfNeeded(): void {
    if (!this.getToken() || this.userProfile()) {
      return;
    }

    this.loadCurrentUser().subscribe({
      error: () => this.logout(),
    });
  }

  private storeAuthResponse(response: AuthResponse): void {
    if (!this.isBrowser) {
      return;
    }

    localStorage.setItem('token', response.token);
    localStorage.setItem('email', response.email);
    localStorage.setItem('role', response.role);
  }

  private loadStoredUserProfile(): UserProfile | null {
    if (!this.isBrowser) {
      return null;
    }

    const storedProfile = localStorage.getItem('userProfile');
    if (!storedProfile) {
      return null;
    }

    try {
      return JSON.parse(storedProfile) as UserProfile;
    } catch {
      localStorage.removeItem('userProfile');
      return null;
    }
  }
}
