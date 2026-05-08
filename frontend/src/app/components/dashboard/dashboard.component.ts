import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AccountService } from '../../services/account.service';
import { Transaction } from '../../models/account.model';
import { MainLayoutComponent } from '../main-layout/main-layout.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private accountService = inject(AccountService);
  private balanceChangedSub?: Subscription;

  loading = signal(true);
  balance = signal(0);
  transactions = signal<Transaction[]>([]);
  errorMessage = signal<string | null>(null);

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

    this.balanceChangedSub = MainLayoutComponent.balanceChanged$.subscribe(() => {
      this.loadDashboard();
    });
  }

  ngOnDestroy(): void {
    this.balanceChangedSub?.unsubscribe();
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