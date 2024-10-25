// auth.service.ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { Observable, tap } from 'rxjs';
import { ENV_CONFIG } from '../env.config';
import { LoggedInUser, Tokens, UserProfile } from './models/logged-in-user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private envConfig = inject(ENV_CONFIG);
  readonly URL = `${this.envConfig.apiUrl}/auth/login`;
  readonly TOKENS = 'TOKENS';

  httpClient = inject(HttpClient);
  router = inject(Router);

  loggedInUser: LoggedInUser | null = null;

  constructor() {
    const tokensInStorage = sessionStorage.getItem(this.TOKENS);
    if (tokensInStorage) {
      this.setTokens(JSON.parse(tokensInStorage) as Tokens);
    }
  }

  login(credential: { username: string; password: string }): Observable<Tokens> {
    return this.httpClient
      .post<Tokens>(this.URL, credential)
      .pipe(tap((newToken) => this.setTokens(newToken)));
  }

  setTokens(newToken: Tokens) {
    const userProfile = jwtDecode<UserProfile>(newToken.access_token);
    this.loggedInUser = { tokens: newToken, userProfile };
    sessionStorage.setItem(this.TOKENS, JSON.stringify(newToken)); // add
  }

  logout(): void {
    this.loggedInUser = null;
    this.router.navigate(['/auth/login']);
    sessionStorage.removeItem(this.TOKENS);
  }

  refreshToken(): Observable<{ access_token: string }> {
    return this.httpClient.post<{ access_token: string }>(
      `${this.envConfig.apiUrl}/auth/refresh`,
      null
    );
  }
}
