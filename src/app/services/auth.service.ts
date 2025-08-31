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
    // Initialize auth asynchronously without blocking constructor
    this.initializeAuth().catch(error => {
      console.error('Error during auth initialization:', error);
    });
  }

  // Initialize authentication state
  private async initializeAuth(): Promise<void> {
    try {
      console.log('Initializing auth...');
      if (await this.isAuthenticated()) {
        console.log('User is authenticated, loading user data...');
        const user = await this.getCurrentUser();
        this.currentUserSubject.next(user);
        // Cache the token on initialization
        await this.updateTokenCache();
        console.log('Auth initialization complete');
      } else {
        console.log('User is not authenticated');
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      // Don't call logout here as it might cause infinite loops
      this.currentUserSubject.next(null);
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
      // Check if user is already authenticated
      if (await this.isAuthenticated()) {
        console.log('User is already authenticated, redirecting to welcome page');
        this.router.navigate(['/welcome']);
        return;
      }
      
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
      const session = await fetchAuthSession();
      
      // Extract user information from ID token payload
      let email = 'unknown';
      let name = 'Name not available';
      
      if (session.tokens?.idToken) {
        const idTokenPayload = session.tokens.idToken.payload;
        console.log('ID Token payload:', idTokenPayload);
        
        // Get email from ID token payload
        if (idTokenPayload['email'] && typeof idTokenPayload['email'] === 'string') {
          email = idTokenPayload['email'];
          console.log('Email from ID token:', email);
        }
        
        // Get name from ID token payload
        if (idTokenPayload['name'] && typeof idTokenPayload['name'] === 'string') {
          name = idTokenPayload['name'];
        } else if (idTokenPayload['given_name'] && typeof idTokenPayload['given_name'] === 'string') {
          name = idTokenPayload['given_name'];
        } else if (idTokenPayload['preferred_username'] && typeof idTokenPayload['preferred_username'] === 'string') {
          name = idTokenPayload['preferred_username'];
        }
        console.log('Name from ID token:', name);
      } else {
        console.log('No ID token available in session');
      }
      
      const userInfo = {
        id: user.userId,
        email: email,
        name: name
      };
      
      console.log('Processed user info:', userInfo);
      return userInfo;
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
      console.log('Session:', session);
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
