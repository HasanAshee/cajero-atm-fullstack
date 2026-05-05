import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AccountService } from '../../services/account.service';
import { AuthLayoutComponent } from '../auth-layout/auth-layout.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AuthLayoutComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private accountService = inject(AccountService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  user = signal('');
  pin = signal('');
  initialBalance = signal<number>(0);
  loading = signal(false);
  showPin = signal(false);

  onRegister(): void {
    const userValue = this.user().trim();
    const pinValue = this.pin();
    const balanceValue = this.initialBalance();

    if (!userValue || !pinValue) {
      this.snackBar.open('Usuario y PIN son requeridos.', 'Cerrar', {
        duration: 3000,
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
      return;
    }

    if (!Number.isFinite(balanceValue) || balanceValue < 0) {
      this.snackBar.open('El saldo inicial no puede ser negativo.', 'Cerrar', {
        duration: 3000,
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.loading.set(true);

    this.accountService.register(userValue, pinValue, balanceValue).subscribe({
      next: () => {
        this.loading.set(false);
        this.snackBar.open('¡Bienvenido a M.H.M. Bank!', 'Cerrar', {
          duration: 3000,
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        const message = err?.error?.message || 'Error al crear la cuenta.';
        this.snackBar.open(message, 'Cerrar', {
          duration: 3000,
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  togglePin(): void {
    this.showPin.update((v) => !v);
  }
}