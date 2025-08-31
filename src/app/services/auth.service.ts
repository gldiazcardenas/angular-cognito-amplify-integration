import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { signInWithRedirect, signOut, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { BehaviorSubject } from 'rxjs';
import { TokenService, AuthTokens } from './token.service';

export interface User {
  id: string;
  email: string;
  name?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private router: Router,
    private tokenService: TokenService
  ) {
    this.initializeAuth();
  }

  // Initialize authentication state
  private async initializeAuth(): Promise<void> {
    try {
      if (this.tokenService.isAuthenticated()) {
        const user = await this.getCurrentUser();
        this.currentUserSubject.next(user);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      this.logout();
    }
  }

  // Redirect to Cognito hosted UI for login (Amplify handles PKCE automatically)
  async login(): Promise<void> {
    try {
      // Amplify will automatically handle PKCE, state, and redirect to Cognito hosted UI
      await signInWithRedirect();
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  }

  // Handle authentication callback from Cognito (Amplify handles this automatically)
  async handleAuthCallback(): Promise<void> {
    try {
      // Amplify automatically handles the OAuth callback and token exchange
      const session = await fetchAuthSession();
      if (!session.tokens) {
        throw new Error('No tokens in session');
      }

      // Extract tokens from Amplify session
      // Note: refreshToken might not be directly accessible in Amplify v6
      const tokens: AuthTokens = {
        accessToken: session.tokens.accessToken.toString(),
        idToken: session.tokens.idToken?.toString() || '',
        refreshToken: undefined, // Amplify handles refresh internally
        expiresAt: Date.now() + ((session.tokens.accessToken.payload.exp || 0) * 1000)
      };

      this.tokenService.setTokens(tokens);
      
      // Get user info and redirect
      const user = await this.getCurrentUser();
      this.currentUserSubject.next(user);
      
      // Redirect to welcome page
      this.router.navigate(['/welcome']);
    } catch (error) {
      console.error('Error handling auth callback:', error);
      throw error;
    }
  }

  // Get current user information
  async getCurrentUser(): Promise<User> {
    try {
      const user = await getCurrentUser();
      
      return {
        id: user.userId,
        email: user.signInDetails?.loginId || 'unknown',
        name: user.username || 'Unknown User'
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  }

  // Refresh tokens using Amplify
  async refreshTokens(): Promise<void> {
    try {
      // Amplify handles token refresh automatically
      const session = await fetchAuthSession();
      if (!session.tokens) {
        throw new Error('No tokens in session');
      }

      const tokens: AuthTokens = {
        accessToken: session.tokens.accessToken.toString(),
        idToken: session.tokens.idToken?.toString() || '',
        refreshToken: undefined, // Amplify handles refresh internally
        expiresAt: Date.now() + ((session.tokens.accessToken.payload.exp || 0) * 1000)
      };

      this.tokenService.setTokens(tokens);
    } catch (error) {
      console.error('Error refreshing tokens:', error);
      this.logout();
      throw error;
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await signOut();
      this.tokenService.clearTokens();
      this.currentUserSubject.next(null);
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Error during logout:', error);
      // Force logout even if there's an error
      this.tokenService.clearTokens();
      this.currentUserSubject.next(null);
      this.router.navigate(['/']);
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.tokenService.isAuthenticated();
  }

  // Get current user
  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // Check if tokens need refresh
  shouldRefreshTokens(): boolean {
    return this.tokenService.isTokenExpired();
  }

  // Get current access token for HTTP requests
  getAccessToken(): string | null {
    return this.tokenService.getAccessToken();
  }

  // Check if we're in the middle of an auth callback
  isAuthCallback(): boolean {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has('code') && urlParams.has('state');
  }

  // Start automatic token refresh monitoring
  startTokenRefreshMonitoring(): void {
    // Check tokens every 5 minutes
    setInterval(async () => {
      if (this.shouldRefreshTokens()) {
        try {
          await this.refreshTokens();
          console.log('Tokens refreshed successfully');
        } catch (error) {
          console.error('Token refresh failed:', error);
          // If refresh fails, logout the user
          this.logout();
        }
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  // Handle authentication errors
  private handleAuthError(error: any, context: string): void {
    console.error(`Authentication error in ${context}:`, error);
    
    // Logout on critical errors
    if (error.name === 'TokenExpiredError' || 
        error.name === 'NotAuthorizedException' ||
        error.statusCode === 401) {
      this.logout();
    }
  }

  // Check if the application is ready for authentication
  isAppReady(): boolean {
    return typeof window !== 'undefined' && 
           typeof localStorage !== 'undefined' &&
           window.location !== undefined;
  }
}
