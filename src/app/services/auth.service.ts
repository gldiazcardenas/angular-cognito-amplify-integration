import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { signInWithRedirect, signOut, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { BehaviorSubject } from 'rxjs';

export interface User {
  id: string;
  email: string;
  name?: string;
  tokenExpiry?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

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
      let name: string | undefined = undefined;
      let tokenExpiry: number | undefined = undefined;
      
      if (session.tokens?.idToken) {
        const idTokenPayload = session.tokens.idToken.payload;
        
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
        tokenExpiry = session.tokens?.accessToken?.payload?.exp;
        console.log('Token expiry from ID token:', tokenExpiry);
      } else {
        console.log('No ID token available in session');
      }
      
      const userInfo = {
        id: user.userId,
        email: email,
        name: name,
        tokenExpiry: tokenExpiry
      };
      
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
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Error during logout:', error);
      // Force logout even if there's an error
      this.currentUserSubject.next(null);
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

  // Get current access token for HTTP requests directly from Amplify
  async getAccessTokenAsync(): Promise<string | null> {
    try {
      // Always get fresh token from Amplify (it handles refresh automatically)
      const session = await fetchAuthSession();
      const token = session.tokens?.accessToken?.toString() || null;
      
      if (token) {
        console.log('Got fresh access token from Amplify');
      }
      
      return token;
    } catch (error) {
      console.error('Error getting access token:', error);
      this.handleAuthError(error, 'getAccessTokenAsync');
      return null;
    }
  }

  // Handle authentication errors
  private handleAuthError(error: any, context: string): void {
    console.error(`Authentication error in ${context}:`, error);
    
    // Logout on critical errors
    if (error.name === 'TokenExpiredError' || 
        error.name === 'NotAuthorizedException' ||
        error.name === 'RefreshTokenExpiredError' ||
        error.name === 'InvalidRefreshTokenError' ||
        error.statusCode === 401) {
      console.log('Critical auth error detected, logging out user...');
      this.logout();
    }
  }

}
