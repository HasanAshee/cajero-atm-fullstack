import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AccountService } from '../../services/account.service';
import { AuthLayoutComponent } from '../auth-layout/auth-layout.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AuthLayoutComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private accountService = inject(AccountService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  user = signal('');
  pin = signal('');
  loading = signal(false);
  showPin = signal(false);

  onLogin(): void {
    const userValue = this.user().trim();
    const pinValue = this.pin();

    if (!userValue || !pinValue) {
      this.snackBar.open('Usuario y PIN son requeridos.', 'Cerrar', {
        duration: 3000,
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.loading.set(true);

    this.accountService.login(userValue, pinValue).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        const message = err?.error?.message || 'Error al iniciar sesión.';
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