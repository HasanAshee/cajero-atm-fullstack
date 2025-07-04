import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AccountService } from '../../services/account.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-deposit',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './deposit.component.html',
  styleUrl: './deposit.component.css'
})
export class DepositComponent {

  amountToDeposit: number | null = null;

  constructor(
    private accountService: AccountService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  onDeposit(): void {
    if (this.amountToDeposit === null || this.amountToDeposit <= 0) {
      this.snackBar.open('Por favor, ingresa un monto válido.', 'Cerrar', { duration: 3000, verticalPosition: 'top', panelClass: ['error-snackbar']});
      return;
    }

    this.accountService.deposit(this.amountToDeposit).subscribe({
      next: () => {
        this.router.navigate(['/menu']);
      },
      error: (err) => {
        this.snackBar.open(err.error.message || 'Error al depositar', 'Cerrar', { duration: 3000, verticalPosition: 'top', panelClass: ['error-snackbar']});
      }
    });
  }
}
