import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AccountService } from '../../services/account.service';

export type BalanceMutationMode = 'deposit' | 'withdraw';

export interface BalanceMutationDialogData {
  mode: BalanceMutationMode;
  currentBalance: number;
}

@Component({
  selector: 'app-balance-mutation-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './balance-mutation-dialog.component.html',
  styleUrl: './balance-mutation-dialog.component.css'
})
export class BalanceMutationDialogComponent {
  private accountService = inject(AccountService);
  private dialogRef = inject(MatDialogRef<BalanceMutationDialogComponent>);
  data = inject<BalanceMutationDialogData>(MAT_DIALOG_DATA);

  // Forum state
  amount = signal<number | null>(null);
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  // Helpers
  get title(): string {
    return this.data.mode === 'deposit' ? 'Depositar dinero' : 'Retirar dinero';
  }

  get subtitle(): string {
    return this.data.mode === 'deposit'
      ? 'Agregá fondos a tu cuenta principal'
      : 'Retirá efectivo de tu cuenta';
  }

  get submitLabel(): string {
    return this.data.mode === 'deposit' ? 'Confirmar depósito' : 'Confirmar retiro';
  }

  get quickAmounts(): number[] {
    return [500, 1000, 5000, 10000];
  }

  selectQuickAmount(value: number): void {
    this.amount.set(value);
    this.errorMessage.set(null);
  }

  onSubmit(): void {
    const amountValue = this.amount();

    // Validación cliente-side
    if (amountValue === null || !Number.isFinite(amountValue) || amountValue <= 0) {
      this.errorMessage.set('Ingresá un monto válido mayor a cero.');
      return;
    }

    if (this.data.mode === 'withdraw' && amountValue > this.data.currentBalance) {
      this.errorMessage.set('Fondos insuficientes para este retiro.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const operation$ =
      this.data.mode === 'deposit'
        ? this.accountService.deposit(amountValue)
        : this.accountService.withdraw(amountValue);

    operation$.subscribe({
      next: (response) => {
        this.loading.set(false);
        this.dialogRef.close({
          success: true,
          newBalance: response.newBalance,
          amount: amountValue,
          mode: this.data.mode
        });
      },
      error: (err) => {
        this.loading.set(false);
        const backendMessage = err?.error?.message;
        this.errorMessage.set(backendMessage || 'Hubo un error procesando la operación.');
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close({ success: false });
  }
}