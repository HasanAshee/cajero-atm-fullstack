import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  user: string = '';
  pin: string = '';
  initialBalance: number = 0;

  constructor(
    private accountService: AccountService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  onRegister(): void {
    this.accountService.register(this.user, this.pin, this.initialBalance).subscribe({
      next: () => {
        this.snackBar.open('Cuenta creada exitosamente. Ahora puedes iniciar sesión.', 'Cerrar', { duration: 3000, verticalPosition: 'top', panelClass: ['success-snackbar']});
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.snackBar.open(err.error.message || 'Error al registrar la cuenta', 'Cerrar', { duration: 3000, verticalPosition: 'top', panelClass: ['error-snackbar']});
      }
    });
  }
}
