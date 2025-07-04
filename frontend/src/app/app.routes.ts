import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';


export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'menu',
    loadComponent: () => import('./components/menu/menu.component').then(m => m.MenuComponent),
    canActivate: [authGuard]
  },
    {
    path: 'balance',
    loadComponent: () => import('./components/balance/balance.component').then(m => m.BalanceComponent),
    canActivate: [authGuard]
  },
  {
    path: 'withdraw',
    loadComponent: () => import('./components/withdraw/withdraw.component').then(m => m.WithdrawComponent),
    canActivate: [authGuard]
  },
  {
    path: 'deposit',
    loadComponent: () => import('./components/deposit/deposit.component').then(m => m.DepositComponent),
    canActivate: [authGuard]
  },
  {
    path: 'history',
    loadComponent: () => import('./components/history/history.component').then(m => m.HistoryComponent),
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },

];
