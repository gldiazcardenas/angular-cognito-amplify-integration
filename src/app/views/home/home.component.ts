import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  isAuthenticated = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.checkAuthStatus();
  }

  private async checkAuthStatus(): Promise<void> {
    this.isAuthenticated = await this.authService.isAuthenticated();
    
    // If user is already authenticated, redirect to welcome page
    if (this.isAuthenticated) {
      this.router.navigate(['/welcome']);
    }
  }

  async login(): Promise<void> {
    try {
      this.isLoading = true;
      this.errorMessage = '';
      
      // Check if already authenticated before attempting login
      if (await this.authService.isAuthenticated()) {
        console.log('User is already authenticated');
        this.router.navigate(['/welcome']);
        return;
      }
      
      await this.authService.login();
    } catch (error) {
      console.error('Login error:', error);
      this.errorMessage = 'Login failed. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  goToWelcome(): void {
    this.router.navigate(['/welcome']);
  }

  async logout(): Promise<void> {
    try {
      this.isLoading = true;
      this.errorMessage = '';
      await this.authService.logout();
      await this.checkAuthStatus();
    } catch (error) {
      console.error('Logout error:', error);
      this.errorMessage = 'Logout failed. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }
}
