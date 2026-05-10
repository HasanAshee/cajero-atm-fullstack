import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Transaction } from '../../models/account.model';

@Component({
  selector: 'app-transaction-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transaction-detail-modal.component.html',
  styleUrl: './transaction-detail-modal.component.css'
})
export class TransactionDetailModalComponent {
  @Input({ required: true }) transaction!: Transaction;
  @Output() close = new EventEmitter<void>();
  @Output() downloadPdf = new EventEmitter<Transaction>();

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }

  onClose(): void {
    this.close.emit();
  }

  onDownload(): void {
    this.downloadPdf.emit(this.transaction);
  }

  // ─── Helpers de UI ───

  signFor(type: Transaction['type']): '+' | '-' {
    return type === 'Depósito' || type === 'Transferencia recibida' ? '+' : '-';
  }

  colorClassFor(type: Transaction['type']): string {
    return this.signFor(type) === '+' ? 'amount-positive' : 'amount-negative';
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

  shortId(id?: string): string {
    if (!id) return '—';
    return id.slice(-12).toUpperCase();
  }
}