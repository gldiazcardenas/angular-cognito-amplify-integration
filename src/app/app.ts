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
    if (this.isAuthCallback()) {
      try {
        await this.authService.handleAuthCallback();
      } catch (error) {
        console.error('Error handling auth callback:', error);
        // If callback fails, redirect to home
        this.router.navigate(['/home']);
      }
    }

    // Amplify handles token refresh automatically, no need for manual monitoring
  }

  // Check if we're in the middle of an auth callback
  isAuthCallback(): boolean {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has('code') && urlParams.has('state');
  }
}
