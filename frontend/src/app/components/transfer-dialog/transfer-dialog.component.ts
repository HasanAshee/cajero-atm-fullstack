import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AccountService } from '../../services/account.service';
import { FavoritesDialogComponent } from '../favorites-dialog/favorites-dialog.component';

export interface TransferDialogData {
  currentBalance: number;
  currentUsername: string;
}

type ViewMode = 'form' | 'save-prompt';

@Component({
  selector: 'app-transfer-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transfer-dialog.component.html',
  styleUrl: './transfer-dialog.component.css'
})
export class TransferDialogComponent implements OnInit {
  private accountService = inject(AccountService);
  private dialog = inject(MatDialog);
  private dialogRef = inject(MatDialogRef<TransferDialogComponent>);
  data = inject<TransferDialogData>(MAT_DIALOG_DATA);

  recipient = signal('');
  amount = signal<number | null>(null);
  description = signal('');
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  favorites = this.accountService.favorites;
  loadingFavorites = signal(false);

  viewMode = signal<ViewMode>('form');
  lastTransferRecipient = signal<string | null>(null);
  lastTransferNewBalance = signal<number | null>(null);
  lastTransferAmount = signal<number | null>(null);
  savingFavorite = signal(false);

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

  recipientIsAlreadyFavorite = computed(() => {
    const r = this.lastTransferRecipient();
    if (!r) return false;
    return this.favorites().includes(r);
  });

  ngOnInit(): void {
    this.loadingFavorites.set(true);
    this.accountService.loadFavorites().subscribe({
      next: () => this.loadingFavorites.set(false),
      error: () => this.loadingFavorites.set(false)
    });
  }


  selectFavorite(username: string): void {
    this.recipient.set(username);
    this.errorMessage.set(null);
  }

  openManageFavorites(): void {
    this.dialog.open(FavoritesDialogComponent, {
      autoFocus: 'first-tabbable',
      restoreFocus: true
    });
  }

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
          this.lastTransferRecipient.set(response.recipient);
          this.lastTransferNewBalance.set(response.newBalance);
          this.lastTransferAmount.set(amountValue);

          if (!this.accountService.isFavorite(response.recipient)) {
            this.viewMode.set('save-prompt');
          } else {
            this.closeWithSuccess();
          }
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

  // ─── Prompt post ───

  onSaveAsFavorite(): void {
    const username = this.lastTransferRecipient();
    if (!username) {
      this.closeWithSuccess();
      return;
    }

    this.savingFavorite.set(true);

    this.accountService.addFavorite(username).subscribe({
      next: () => {
        this.savingFavorite.set(false);
        this.closeWithSuccess();
      },
      error: () => {
        this.savingFavorite.set(false);
        this.closeWithSuccess();
      }
    });
  }

  onSkipFavorite(): void {
    this.closeWithSuccess();
  }

  private closeWithSuccess(): void {
    this.dialogRef.close({
      success: true,
      newBalance: this.lastTransferNewBalance(),
      recipient: this.lastTransferRecipient(),
      amount: this.lastTransferAmount()
    });
  }
}