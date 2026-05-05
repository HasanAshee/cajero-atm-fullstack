import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AccountService } from '../../services/account.service';

export interface TransferDialogData {
  currentBalance: number;
  currentUsername: string;
}

@Component({
  selector: 'app-transfer-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transfer-dialog.component.html',
  styleUrl: './transfer-dialog.component.css'
})
export class TransferDialogComponent {
  private accountService = inject(AccountService);
  private dialogRef = inject(MatDialogRef<TransferDialogComponent>);
  data = inject<TransferDialogData>(MAT_DIALOG_DATA);

  recipient = signal('');
  amount = signal<number | null>(null);
  description = signal('');
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  isInvalid = computed(() => {
    const r = this.recipient().trim();
    const a = this.amount();
    if (!r) return true;
    if (a === null || !Number.isFinite(a) || a <= 0) return true;
    if (r === this.data.currentUsername) return true;
    if (a > this.data.currentBalance) return true;
    return false;
  });

  validationHint = computed(() => {
    const r = this.recipient().trim();
    const a = this.amount();

    if (r && r === this.data.currentUsername) {
      return 'No podés transferirte a vos mismo.';
    }
    if (a !== null && a > this.data.currentBalance) {
      return 'El monto supera tu saldo disponible.';
    }
    return null;
  });

  onSubmit(): void {
    const recipientUsername = this.recipient().trim();
    const amountValue = this.amount();
    const desc = this.description().trim();

    if (!recipientUsername) {
      this.errorMessage.set('Ingresá un destinatario.');
      return;
    }
    if (amountValue === null || !Number.isFinite(amountValue) || amountValue <= 0) {
      this.errorMessage.set('Ingresá un monto válido mayor a cero.');
      return;
    }
    if (recipientUsername === this.data.currentUsername) {
      this.errorMessage.set('No podés transferirte a vos mismo.');
      return;
    }
    if (amountValue > this.data.currentBalance) {
      this.errorMessage.set('Fondos insuficientes para esta transferencia.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.accountService
      .transfer({
        recipientUsername,
        amount: amountValue,
        description: desc || undefined
      })
      .subscribe({
        next: (response) => {
          this.loading.set(false);
          this.dialogRef.close({
            success: true,
            newBalance: response.newBalance,
            recipient: response.recipient,
            amount: amountValue
          });
        },
        error: (err) => {
          this.loading.set(false);
          const backendMessage = err?.error?.message;
          this.errorMessage.set(backendMessage || 'Hubo un error procesando la transferencia.');
        }
      });
  }

  onCancel(): void {
    this.dialogRef.close({ success: false });
  }
}