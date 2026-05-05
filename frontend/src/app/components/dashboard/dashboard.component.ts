import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AccountService } from '../../services/account.service';
import { Transaction } from '../../models/account.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private accountService = inject(AccountService);
  private router = inject(Router);

  // Status
  loading = signal(true);
  balance = signal(0);
  transactions = signal<Transaction[]>([]);
  errorMessage = signal<string | null>(null);

  // User Data
  userName = this.accountService.user;

  monthlyIncome = computed(() => {
    const now = new Date();
    return this.transactions()
      .filter((t) => this.isInCurrentMonth(t.date, now))
      .filter((t) => t.type === 'Depósito' || t.type === 'Transferencia recibida')
      .reduce((sum, t) => sum + t.amount, 0);
  });

  monthlyExpenses = computed(() => {
    const now = new Date();
    return this.transactions()
      .filter((t) => this.isInCurrentMonth(t.date, now))
      .filter((t) => t.type === 'Retiro' || t.type === 'Transferencia enviada')
      .reduce((sum, t) => sum + t.amount, 0);
  });

  recentTransactions = computed(() => this.transactions().slice(0, 8));

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    let pending = 2;
    const tryFinish = () => {
      pending--;
      if (pending === 0) this.loading.set(false);
    };

    this.accountService.getMe().subscribe({
      next: (info) => {
        this.balance.set(info.balance);
        tryFinish();
      },
      error: (err) => {
        this.errorMessage.set('No pudimos cargar tu cuenta.');
        console.error(err);
        tryFinish();
      }
    });

    this.accountService.getTransactions().subscribe({
      next: (txs) => {
        this.transactions.set(txs);
        tryFinish();
      },
      error: (err) => {
        console.error(err);
        tryFinish();
      }
    });
  }

  // ─── Actions ───

  openDeposit(): void {
    // TODO: abrir modal de depósito
    console.log('TODO: abrir modal depósito');
  }

  openWithdraw(): void {
    // TODO: abrir modal de retiro
    console.log('TODO: abrir modal retiro');
  }

  openTransfer(): void {
    // TODO: abrir modal de transferencia
    console.log('TODO: abrir modal transferencia');
  }

  logout(): void {
    this.accountService.logout();
  }

  // ─── Helpers ───

  private isInCurrentMonth(dateStr: string, now: Date): boolean {
    const d = new Date(dateStr);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }

  iconFor(type: Transaction['type']): string {
    switch (type) {
      case 'Depósito':
        return '↓';
      case 'Retiro':
        return '↑';
      case 'Transferencia enviada':
        return '→';
      case 'Transferencia recibida':
        return '←';
    }
  }

  signFor(type: Transaction['type']): '+' | '-' {
    return type === 'Depósito' || type === 'Transferencia recibida' ? '+' : '-';
  }

  colorClassFor(type: Transaction['type']): string {
    return this.signFor(type) === '+' ? 'amount-positive' : 'amount-negative';
  }
}