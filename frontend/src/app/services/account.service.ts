import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { STORAGE_KEYS } from './storage-keys';
import {
  AccountInfo,
  AuthResponse,
  BalanceMutationResponse,
  Transaction,
  TransferRequest,
  TransferResponse,
  FavoritesResponse,
  FavoritesMutationResponse
} from '../models/account.model';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiUrl = environment.apiUrl;
  private _favorites = signal<string[]>([]);
  readonly favorites = this._favorites.asReadonly();

  // Estado reactivo con signals
  private _user = signal<string | null>(this.readStoredUser());
  private _accountId = signal<string | null>(this.readStoredAccountId());

  // Derivados
  readonly user = this._user.asReadonly();
  readonly accountId = this._accountId.asReadonly();
  readonly isLoggedIn = computed(() => !!this._user() && !!this.getToken());

  constructor(
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  // ────────────────────────────────────────────────────────────
  // Helpers private
  // ────────────────────────────────────────────────────────────

  private openSnackBar(
    message: string,
    panelClass: 'success-snackbar' | 'error-snackbar'
  ) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      verticalPosition: 'top',
      panelClass: [panelClass]
    });
  }

  private readStoredUser(): string | null {
    return localStorage.getItem(STORAGE_KEYS.USER);
  }

  private readStoredAccountId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCOUNT_ID);
  }

  private storeSession(token: string, user: string, accountId: string): void {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.USER, user);
    localStorage.setItem(STORAGE_KEYS.ACCOUNT_ID, accountId);
    this._user.set(user);
    this._accountId.set(accountId);
  }

  private clearSession(): void {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.ACCOUNT_ID);
    this._user.set(null);
    this._accountId.set(null);
    this._favorites.set([]);
  }

  // ────────────────────────────────────────────────────────────
  // API public
  // ────────────────────────────────────────────────────────────

  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  getUserName(): string {
    return this._user() ?? '';
  }

  // ─── auth ───

  login(user: string, pin: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/login`, { user, pin })
      .pipe(
        tap((response) => {
          this.storeSession(response.token, response.user, response.accountId);
        })
      );
  }

  register(user: string, pin: string, balance: number): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/register`, { user, pin, balance })
      .pipe(
        tap((response) => {
          this.storeSession(response.token, response.user, response.accountId);
        })
      );
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
    this.openSnackBar('Sesión cerrada correctamente.', 'success-snackbar');
  }

  // ─── account ───

  getMe(): Observable<AccountInfo> {
    return this.http.get<AccountInfo>(`${this.apiUrl}/account/me`);
  }

  getBalance(): Observable<{ balance: number }> {
    return this.http.get<{ balance: number }>(`${this.apiUrl}/account/balance`);
  }

  getTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/account/history`);
  }

  // ─── operations ───

  deposit(amount: number): Observable<BalanceMutationResponse> {
    return this.http
      .post<BalanceMutationResponse>(`${this.apiUrl}/account/deposit`, { amount })
      .pipe(tap(() => this.openSnackBar('Depósito exitoso.', 'success-snackbar')));
  }

  withdraw(amount: number): Observable<BalanceMutationResponse> {
    return this.http
      .post<BalanceMutationResponse>(`${this.apiUrl}/account/withdraw`, { amount })
      .pipe(tap(() => this.openSnackBar('Retiro exitoso.', 'success-snackbar')));
  }

  transfer(request: TransferRequest): Observable<TransferResponse> {
    return this.http
      .post<TransferResponse>(`${this.apiUrl}/account/transfer`, request)
      .pipe(
        tap((response) =>
          this.openSnackBar(
            `Transferencia exitosa a ${response.recipient}.`,
            'success-snackbar'
          )
        )
      );
  }
    
  // ─── favorites ───

  loadFavorites(): Observable<FavoritesResponse> {
    return this.http
      .get<FavoritesResponse>(`${this.apiUrl}/account/favorites`)
      .pipe(
        tap((response) => this._favorites.set(response.favorites))
      );
  }

  addFavorite(username: string): Observable<FavoritesMutationResponse> {
    return this.http
      .post<FavoritesMutationResponse>(`${this.apiUrl}/account/favorites`, { username })
      .pipe(
        tap((response) => {
          this._favorites.set(response.favorites);
          this.openSnackBar('Favorito agregado.', 'success-snackbar');
        })
      );
  }

  removeFavorite(username: string): Observable<FavoritesMutationResponse> {
    return this.http
      .delete<FavoritesMutationResponse>(`${this.apiUrl}/account/favorites/${encodeURIComponent(username)}`)
      .pipe(
        tap((response) => {
          this._favorites.set(response.favorites);
          this.openSnackBar('Favorito eliminado.', 'success-snackbar');
        })
      );
  }

  isFavorite(username: string): boolean {
    return this._favorites().includes(username);
  }
}