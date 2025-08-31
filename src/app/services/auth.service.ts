import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { signInWithRedirect, signOut, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { BehaviorSubject } from 'rxjs';

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
  private cachedAccessToken: string | null = null;
  private tokenCacheExpiry: number = 0;

  constructor(private router: Router) {
    this.initializeAuth();
  }

  // Initialize authentication state
  private async initializeAuth(): Promise<void> {
    try {
      if (await this.isAuthenticated()) {
        const user = await this.getCurrentUser();
        this.currentUserSubject.next(user);
        // Cache the token on initialization
        await this.updateTokenCache();
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      this.logout();
    }
  }

  // Update token cache
  private async updateTokenCache(): Promise<void> {
    try {
      const session = await fetchAuthSession();
      if (session.tokens?.accessToken) {
        this.cachedAccessToken = session.tokens.accessToken.toString();
        // Cache for 5 minutes
        this.tokenCacheExpiry = Date.now() + 5 * 60 * 1000;
      }
    } catch (error) {
      console.error('Error updating token cache:', error);
      this.cachedAccessToken = null;
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

      // Update token cache
      await this.updateTokenCache();

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

  // Logout user
  async logout(): Promise<void> {
    try {
      await signOut();
      this.currentUserSubject.next(null);
      this.cachedAccessToken = null;
      this.tokenCacheExpiry = 0;
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Error during logout:', error);
      // Force logout even if there's an error
      this.currentUserSubject.next(null);
      this.cachedAccessToken = null;
      this.tokenCacheExpiry = 0;
      this.router.navigate(['/']);
    }
  }

  // Check if user is authenticated using Amplify session
  async isAuthenticated(): Promise<boolean> {
    try {
      const session = await fetchAuthSession();
      return session.tokens !== undefined;
    } catch (error) {
      return false;
    }
  }

  // Get current user
  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // Get current access token for HTTP requests (synchronous for interceptor)
  getAccessToken(): string | null {
    // Check if cache is expired
    if (Date.now() > this.tokenCacheExpiry) {
      this.cachedAccessToken = null;
    }
    return this.cachedAccessToken;
  }

  // Get current access token for HTTP requests directly from Amplify (async version)
  async getAccessTokenAsync(): Promise<string | null> {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.accessToken?.toString() || null;
      // Update cache
      this.cachedAccessToken = token;
      this.tokenCacheExpiry = Date.now() + 5 * 60 * 1000;
      return token;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  // Check if we're in the middle of an auth callback
  isAuthCallback(): boolean {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has('code') && urlParams.has('state');
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
