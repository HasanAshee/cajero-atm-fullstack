import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AccountService } from '../../services/account.service';

@Component({
  selector: 'app-favorites-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './favorites-dialog.component.html',
  styleUrl: './favorites-dialog.component.css'
})
export class FavoritesDialogComponent implements OnInit {
  private accountService = inject(AccountService);
  private dialogRef = inject(MatDialogRef<FavoritesDialogComponent>);

  favorites = this.accountService.favorites;

  newUsername = signal('');
  loadingList = signal(true);
  adding = signal(false);
  removingUser = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  isAddInvalid = computed(() => {
    const u = this.newUsername().trim();
    return !u || this.adding();
  });

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.loadingList.set(true);
    this.errorMessage.set(null);

    this.accountService.loadFavorites().subscribe({
      next: () => {
        this.loadingList.set(false);
      },
      error: () => {
        this.loadingList.set(false);
        this.errorMessage.set('No pudimos cargar tus favoritos.');
      }
    });
  }

  onAdd(): void {
    const username = this.newUsername().trim();
    if (!username) return;

    this.adding.set(true);
    this.errorMessage.set(null);

    this.accountService.addFavorite(username).subscribe({
      next: () => {
        this.adding.set(false);
        this.newUsername.set('');
      },
      error: (err) => {
        this.adding.set(false);
        const backendMessage = err?.error?.message;
        this.errorMessage.set(backendMessage || 'No pudimos agregar el favorito.');
      }
    });
  }

  onRemove(username: string): void {
    this.removingUser.set(username);
    this.errorMessage.set(null);

    this.accountService.removeFavorite(username).subscribe({
      next: () => {
        this.removingUser.set(null);
      },
      error: (err) => {
        this.removingUser.set(null);
        const backendMessage = err?.error?.message;
        this.errorMessage.set(backendMessage || 'No pudimos eliminar el favorito.');
      }
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }
}