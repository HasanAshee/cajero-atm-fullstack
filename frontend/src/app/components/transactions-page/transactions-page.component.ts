import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AccountService } from '../../services/account.service';
import { Transaction, TransactionType } from '../../models/account.model';
import { MainLayoutComponent } from '../main-layout/main-layout.component';
import { TransactionDetailModalComponent } from '../../components/transaction-detail-modal/transaction-detail-modal.component';
import { ReceiptPdfService } from '../../services/receipt-pdf.service';

type TypeFilter = 'all' | TransactionType;
type DateRange = 'all' | 'today' | 'week' | 'month' | 'year';

@Component({
  selector: 'app-transactions-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TransactionDetailModalComponent],
  templateUrl: './transactions-page.component.html',
  styleUrl: './transactions-page.component.css'
})
export class TransactionsPageComponent implements OnInit, OnDestroy {
  private accountService = inject(AccountService);
  private balanceChangedSub?: Subscription;
  private receiptPdfService = inject(ReceiptPdfService);

  loading = signal(true);
  errorMessage = signal<string | null>(null);

  allTransactions = signal<Transaction[]>([]);

  searchQuery = signal('');
  typeFilter = signal<TypeFilter>('all');
  dateRange = signal<DateRange>('all');

  selectedTransaction = signal<Transaction | null>(null);

  filteredTransactions = computed(() => {
    const txs = this.allTransactions();
    const query = this.searchQuery().toLowerCase().trim();
    const type = this.typeFilter();
    const range = this.dateRange();
    const now = new Date();

    return txs.filter((tx) => {
      if (type !== 'all' && tx.type !== type) return false;

      if (range !== 'all') {
        const txDate = new Date(tx.date);
        const cutoff = this.getDateCutoff(range, now);
        if (txDate < cutoff) return false;
      }

      if (query) {
        const counterparty = (tx.counterpartyUsername ?? '').toLowerCase();
        const description = (tx.description ?? '').toLowerCase();
        const type = tx.type.toLowerCase();
        if (
          !counterparty.includes(query) &&
          !description.includes(query) &&
          !type.includes(query)
        ) {
          return false;
        }
      }

      return true;
    });
  });

  // Stats 
  totalIncome = computed(() =>
    this.filteredTransactions()
      .filter((t) => t.type === 'Depósito' || t.type === 'Transferencia recibida')
      .reduce((sum, t) => sum + t.amount, 0)
  );

  totalExpenses = computed(() =>
    this.filteredTransactions()
      .filter((t) => t.type === 'Retiro' || t.type === 'Transferencia enviada')
      .reduce((sum, t) => sum + t.amount, 0)
  );

  hasActiveFilters = computed(
    () =>
      this.searchQuery().trim() !== '' ||
      this.typeFilter() !== 'all' ||
      this.dateRange() !== 'all'
  );

  typeOptions: { value: TypeFilter; label: string }[] = [
    { value: 'all', label: 'Todos los tipos' },
    { value: 'Depósito', label: 'Depósitos' },
    { value: 'Retiro', label: 'Retiros' },
    { value: 'Transferencia enviada', label: 'Transferencias enviadas' },
    { value: 'Transferencia recibida', label: 'Transferencias recibidas' }
  ];

  dateOptions: { value: DateRange; label: string }[] = [
    { value: 'all', label: 'Todo el tiempo' },
    { value: 'today', label: 'Hoy' },
    { value: 'week', label: 'Última semana' },
    { value: 'month', label: 'Último mes' },
    { value: 'year', label: 'Último año' }
  ];

  ngOnInit(): void {
    this.loadTransactions();

    this.balanceChangedSub = MainLayoutComponent.balanceChanged$.subscribe(() => {
      this.loadTransactions();
    });
  }

  ngOnDestroy(): void {
    this.balanceChangedSub?.unsubscribe();
  }

  loadTransactions(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.accountService.getTransactions().subscribe({
      next: (txs) => {
        const sorted = [...txs].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        this.allTransactions.set(sorted);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage.set('No pudimos cargar tus transacciones.');
        this.loading.set(false);
      }
    });
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.typeFilter.set('all');
    this.dateRange.set('all');
  }

  // ─── Modal ───

  openDetail(tx: Transaction): void {
    this.selectedTransaction.set(tx);
  }

  closeDetail(): void {
    this.selectedTransaction.set(null);
  }
  
  onDownloadPdf(tx: Transaction): void {
    const user = this.accountService.getUserName();
    this.receiptPdfService.generateReceipt(tx, user);
  }

  // ─── Helpers ───

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

  private getDateCutoff(range: DateRange, now: Date): Date {
    const cutoff = new Date(now);
    switch (range) {
      case 'today':
        cutoff.setHours(0, 0, 0, 0);
        break;
      case 'week':
        cutoff.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoff.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        cutoff.setFullYear(now.getFullYear() - 1);
        break;
    }
    return cutoff;
  }
}