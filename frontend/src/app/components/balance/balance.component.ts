import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { AccountService } from '../../services/account.service';

@Component({
  selector: 'app-balance',
  standalone: true,
  imports: [
    CurrencyPipe,
    RouterLink,
    MatCardModule,
    MatButtonModule
  ],
  templateUrl: './balance.component.html',
  styleUrl: './balance.component.css'
})
export class BalanceComponent {

  currentBalance: number = 0;

  constructor(private accountService: AccountService) {}

  ngOnInit(): void {
    this.accountService.getBalance().subscribe({
      next: (response) => {
        this.currentBalance = response.balance;
      },
      error: (err) => {
        console.error('Error al obtener el saldo', err);
      }
    });
  }
}
