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
    path: '',
    loadComponent: () =>
      import('./components/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./components/dashboard/dashboard.component').then((m) => m.DashboardComponent)
      },
      {
        path: 'transactions',
        loadComponent: () =>
          import('./components/transactions-page/transactions-page.component').then(
            (m) => m.TransactionsPageComponent
          )
      },
      {
        path: 'card',
        loadComponent: () =>
          import('./components/card-page/card-page.component').then(
            (m) => m.CardPageComponent
          )
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];