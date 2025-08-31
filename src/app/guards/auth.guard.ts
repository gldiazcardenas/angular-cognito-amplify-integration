import { Injectable } from '@angular/core';
import { CanActivate, UrlTree } from '@angular/router';
import { Observable, from } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
  ) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // Check if user is authenticated using async method
    return from(this.checkAuth());
  }

  private async checkAuth(): Promise<boolean | UrlTree> {
    try {
      const isAuth = await this.authService.isAuthenticated();
      if (isAuth) {
        return true;
      }

      // If not authenticated, redirect to login
      // This will trigger the Cognito hosted UI flow
      await this.authService.login();
      return false;
    } catch (error) {
      console.error('Auth guard error:', error);
      await this.authService.login();
      return false;
    }
  }
}
