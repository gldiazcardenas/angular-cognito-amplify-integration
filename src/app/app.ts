import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('angular-cognito-demo');

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    // Check if we're returning from Cognito authentication
    if (this.authService.isAuthCallback()) {
      try {
        await this.authService.handleAuthCallback();
      } catch (error) {
        console.error('Error handling auth callback:', error);
        // If callback fails, redirect to home
        this.router.navigate(['/home']);
      }
    }

    // Start token refresh monitoring if user is authenticated
    if (this.authService.isAuthenticated()) {
      this.authService.startTokenRefreshMonitoring();
    }
  }
}
