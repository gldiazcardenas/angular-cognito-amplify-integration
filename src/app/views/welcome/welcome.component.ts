import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css'
})
export class WelcomeComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  private userSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      // First, try to get the current user directly
      this.currentUser = await this.authService.getCurrentUser();
      console.log('Loaded user directly:', this.currentUser);
      
      // Trigger change detection after setting user data
      this.cdr.detectChanges();
      
      // Also subscribe to user changes in case the user data gets updated
      this.userSubscription = this.authService.currentUser$.subscribe(user => {
        console.log('User updated via subscription:', user);
        this.currentUser = user;
        // Trigger change detection when user data changes
        this.cdr.detectChanges();
      });
      
      // If we still don't have user data, try to get it from the service
      if (!this.currentUser) {
        const cachedUser = this.authService.getCurrentUserValue();
        if (cachedUser) {
          this.currentUser = cachedUser;
          console.log('Loaded user from cache:', this.currentUser);
          // Trigger change detection after setting cached user data
          this.cdr.detectChanges();
        } else {
          // If still no user data, wait a bit and try again (in case auth is still initializing)
          setTimeout(async () => {
            try {
              const retryUser = await this.authService.getCurrentUser();
              if (retryUser) {
                this.currentUser = retryUser;
                console.log('Loaded user on retry:', this.currentUser);
                this.cdr.detectChanges();
              }
            } catch (error) {
              console.error('Error on retry getting user:', error);
            }
          }, 1000);
        }
      }
      
    } catch (error) {
      console.error('Error getting current user:', error);
      // If we can't get user info, redirect to home
      this.router.navigate(['/home']);
    }
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  async logout(): Promise<void> {
    try {
      await this.authService.logout();
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
}
