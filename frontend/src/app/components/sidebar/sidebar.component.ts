import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AccountService } from '../../services/account.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  private accountService = inject(AccountService);

  depositClicked = output<void>();
  withdrawClicked = output<void>();
  transferClicked = output<void>();

  userName = this.accountService.user;

  navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/stats', label: 'Estadísticas', icon: '📈' },
    { path: '/card', label: 'Tarjeta', icon: '💳' },
    { path: '/transactions', label: 'Transacciones', icon: '📜' },
    { path: '/settings', label: 'Ajustes', icon: '⚙️' }
  ];

  logout(): void {
    this.accountService.logout();
  }
}