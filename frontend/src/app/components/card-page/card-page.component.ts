import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../services/account.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-card-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-page.component.html',
  styleUrl: './card-page.component.css'
})
export class CardPageComponent implements OnInit {
  private accountService = inject(AccountService);
  private snackBar = inject(MatSnackBar);

  loading = signal(true);
  accountId = signal<string | null>(null);
  userName = this.accountService.user;

  isFlipped = signal(false);
  showCvv = signal(false);
  showFullNumber = signal(false);

  cardNumber = computed(() => this.generateCardNumber(this.accountId()));
  cvv = computed(() => this.generateCvv(this.accountId()));
  expiry = computed(() => this.generateExpiry(this.accountId()));

  formattedCardNumber = computed(() => {
    const num = this.cardNumber();
    if (!num) return '•••• •••• •••• ••••';
    return num.match(/.{1,4}/g)?.join('  ') ?? num;
  });

  maskedCardNumber = computed(() => {
    const num = this.cardNumber();
    if (!num) return '•••• •••• •••• ••••';
    const last4 = num.slice(-4);
    return `••••  ••••  ••••  ${last4}`;
  });

  displayedCardNumber = computed(() =>
    this.showFullNumber() ? this.formattedCardNumber() : this.maskedCardNumber()
  );

  detailsCardNumber = computed(() =>
    this.showFullNumber() ? this.formattedCardNumber() : this.maskedCardNumber()
  );

  displayedCvv = computed(() => (this.showCvv() ? this.cvv() : '•••'));

  cardHolder = computed(() => {
    const name = this.userName();
    if (!name) return 'TITULAR';
    return name.toUpperCase();
  });

  ngOnInit(): void {
    this.accountService.getMe().subscribe({
      next: (info) => {
        this.accountId.set(info.accountId);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
      }
    });
  }

  toggleFlip(): void {
    this.isFlipped.update((v) => !v);
  }

  toggleFullNumber(): void {
    this.showFullNumber.update((v) => !v);
  }

  toggleCvv(): void {
    this.showCvv.update((v) => !v);
  }

  copyCardNumber(): void {
    const num = this.cardNumber();
    if (!num) return;
    navigator.clipboard.writeText(num).then(() => {
      this.snackBar.open('Número de tarjeta copiado.', 'Cerrar', {
        duration: 2000,
        verticalPosition: 'top',
        panelClass: ['success-snackbar']
      });
    });
  }

  copyCvv(): void {
    const code = this.cvv();
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      this.snackBar.open('CVV copiado.', 'Cerrar', {
        duration: 2000,
        verticalPosition: 'top',
        panelClass: ['success-snackbar']
      });
    });
  }


  private hashString(input: string | null): number {
    if (!input) return 0;
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      hash = (hash << 5) - hash + input.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private generateCardNumber(accountId: string | null): string {
    if (!accountId) return '';
    const hash = this.hashString(accountId);
    const seed = hash.toString();
    let number = '4';
    for (let i = 0; i < 15; i++) {
      const char = seed.charAt(i % seed.length);
      const digit = (parseInt(char, 10) + i) % 10;
      number += digit.toString();
    }
    return number;
  }

  private generateCvv(accountId: string | null): string {
    if (!accountId) return '•••';
    const hash = this.hashString(accountId + 'cvv');
    return (hash % 1000).toString().padStart(3, '0');
  }

  private generateExpiry(accountId: string | null): string {
    if (!accountId) return '••/••';
    const hash = this.hashString(accountId + 'exp');
    const month = ((hash % 12) + 1).toString().padStart(2, '0');
    const year = (30 + (hash % 5)).toString();
    return `${month}/${year}`;
  }
}