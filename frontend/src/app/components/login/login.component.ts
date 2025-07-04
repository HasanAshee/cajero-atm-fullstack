import { Component } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AccountService } from '../../services/account.service';
import { Router, RouterLink  } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  user: string = '';
  pin: string = '';

    constructor(
    private accountService: AccountService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

    onLogin() {
        if (!this.user || !this.pin) {
            this.snackBar.open('Usuario y PIN son requeridos.', 'Cerrar', { duration: 3000, verticalPosition: 'top', panelClass: ['error-snackbar']});
            return;
        }
        this.accountService.login(this.user, this.pin).subscribe({
            next: () => {
                this.router.navigate(['/menu']);
            },
            error: (err) => {
                this.snackBar.open(err.error.message || 'Error en el login', 'Cerrar', { duration: 3000, verticalPosition: 'top', panelClass: ['error-snackbar']});
            }
        });
    }

}
