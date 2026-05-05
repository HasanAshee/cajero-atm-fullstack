import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./components/register/register.component').then((m) => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    canActivate: [authGuard]
  },

  // ── Routes ──
  {
    path: 'menu',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'balance',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'withdraw',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'deposit',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'history',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },

  // ── Defaults ──
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];