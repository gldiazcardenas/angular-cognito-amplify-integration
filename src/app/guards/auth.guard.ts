import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // Check if user is authenticated
    if (this.authService.isAuthenticated()) {
      return true;
    }

    // If not authenticated, redirect to login
    // This will trigger the Cognito hosted UI flow
    this.authService.login();
    return false;
  }
}
