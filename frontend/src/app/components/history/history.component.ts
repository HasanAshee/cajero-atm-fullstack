import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { AccountService, Transaction } from '../../services/account.service';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatListModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    CurrencyPipe,
    DatePipe
  ],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent implements OnInit {
  transactions: Transaction[] = [];

  constructor(private accountService: AccountService) {}

  ngOnInit(): void {
    this.accountService.getTransactions().subscribe({
      next: (response) => {
        this.transactions = response;
      },
      error: (err) => {
        console.error('Error al obtener el historial', err);
      }
    });
  }
}
