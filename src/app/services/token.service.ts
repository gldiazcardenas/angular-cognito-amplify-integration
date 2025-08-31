import { Injectable } from '@angular/core';

export interface AuthTokens {
  accessToken: string;
  idToken: string;
  refreshToken?: string; // Make optional since it may not always be available
  expiresAt: number;
}

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly ACCESS_TOKEN_KEY = 'cognito_access_token';
  private readonly ID_TOKEN_KEY = 'cognito_id_token';
  private readonly REFRESH_TOKEN_KEY = 'cognito_refresh_token';
  private readonly EXPIRES_AT_KEY = 'cognito_expires_at';

  constructor() {}

  // Store tokens securely
  setTokens(tokens: AuthTokens): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(this.ID_TOKEN_KEY, tokens.idToken);
    if (tokens.refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
    }
    localStorage.setItem(this.EXPIRES_AT_KEY, tokens.expiresAt.toString());
  }

  // Get stored tokens
  getTokens(): AuthTokens | null {
    const accessToken = localStorage.getItem(this.ACCESS_TOKEN_KEY);
    const idToken = localStorage.getItem(this.ID_TOKEN_KEY);
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    const expiresAt = localStorage.getItem(this.EXPIRES_AT_KEY);

    if (!accessToken || !idToken || !expiresAt) {
      return null;
    }

    return {
      accessToken,
      idToken,
      refreshToken: refreshToken || undefined,
      expiresAt: parseInt(expiresAt, 10)
    };
  }

  // Check if tokens are expired
  isTokenExpired(): boolean {
    const tokens = this.getTokens();
    if (!tokens) return true;
    
    // Add 5 minute buffer before expiration
    return Date.now() >= (tokens.expiresAt - 5 * 60 * 1000);
  }

  // Get access token
  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  // Get ID token
  getIdToken(): string | null {
    return localStorage.getItem(this.ID_TOKEN_KEY);
  }

  // Get refresh token
  getRefreshToken(): string | undefined {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY) || undefined;
  }

  // Clear all tokens
  clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.ID_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.EXPIRES_AT_KEY);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const tokens = this.getTokens();
    return tokens !== null && !this.isTokenExpired();
  }
}
