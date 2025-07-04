import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, tap } from 'rxjs';

export interface Transaction {
    type: 'Retiro' | 'Depósito';
    amount: number;
    date: Date;
}

@Injectable({
    providedIn: 'root'
})
export class AccountService {
    private apiUrl = 'https://cajero-api.onrender.com/api'
    private loggedIn = false;
    private accountId: string | null = null;
    private userName: string | null = null;

    constructor(
        private http: HttpClient,
        private router: Router,
        private snackBar: MatSnackBar
    ) {}

    private openSnackBar(message: string, panelClass: 'success-snackbar' | 'error-snackbar') {
        this.snackBar.open(message, 'Cerrar', {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: [panelClass]
        });
    }

    login(user: string, pin: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/auth/login`, { user, pin }).pipe(
            tap((response: any) => {
                this.loggedIn = true;
                this.accountId = response.accountId;
                this.userName = user;
            })
        );
    }

    logout(): void {
        this.loggedIn = false;
        this.accountId = null;
        this.router.navigate(['/login']);
        this.openSnackBar('Sesión cerrada correctamente.', 'success-snackbar');
    }

    register(user: string, pin: string, balance: number): Observable<any> {
      return this.http.post(`${this.apiUrl}/auth/register`, { user, pin, balance });
    }

    isLoggedIn(): boolean {
        return this.loggedIn;
    }

    getUserName(): string {
        return this.userName || '';
    }

    getBalance(): Observable<{ balance: number }> {
        return this.http.post<{ balance: number }>(`${this.apiUrl}/account/balance`, { accountId: this.accountId });
    }

    withdraw(amount: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/account/withdraw`, { accountId: this.accountId, amount }).pipe(
            tap(() => this.openSnackBar('Retiro exitoso.', 'success-snackbar'))
        );
    }

    deposit(amount: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/account/deposit`, { accountId: this.accountId, amount }).pipe(
            tap(() => this.openSnackBar('Depósito exitoso.', 'success-snackbar'))
        );
    }

    getTransactions(): Observable<Transaction[]> {
        return this.http.post<Transaction[]>(`${this.apiUrl}/account/history`, { accountId: this.accountId });
    }
}
