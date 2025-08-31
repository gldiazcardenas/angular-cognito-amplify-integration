import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./views/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'welcome',
    loadComponent: () => import('./views/welcome/welcome.component').then(m => m.WelcomeComponent),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: '/home'
  }
];
