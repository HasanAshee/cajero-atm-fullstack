import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../services/account.service';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.css'
})
export class SettingsPageComponent {
  private accountService = inject(AccountService);

  userName = this.accountService.user;

  currentPin = signal('');
  newPin = signal('');
  confirmPin = signal('');

  showCurrent = signal(false);
  showNew = signal(false);
  showConfirm = signal(false);

  loading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  validationHint = computed(() => {
    const n = this.newPin();
    const c = this.confirmPin();
    const curr = this.currentPin();

    if (n && n.length < 4) {
      return 'El nuevo PIN debe tener al menos 4 caracteres.';
    }
    if (n && curr && n === curr) {
      return 'El nuevo PIN debe ser distinto al actual.';
    }
    if (n && c && n !== c) {
      return 'El nuevo PIN y la confirmación no coinciden.';
    }
    return null;
  });

  isInvalid = computed(() => {
    const curr = this.currentPin().trim();
    const n = this.newPin().trim();
    const c = this.confirmPin().trim();
    if (!curr || !n || !c) return true;
    if (n.length < 4) return true;
    if (n === curr) return true;
    if (n !== c) return true;
    return false;
  });

  onSubmit(): void {
    const currentPin = this.currentPin().trim();
    const newPin = this.newPin().trim();
    const confirmPin = this.confirmPin().trim();

    if (!currentPin || !newPin || !confirmPin) {
      this.errorMessage.set('Completá todos los campos.');
      return;
    }
    if (newPin.length < 4) {
      this.errorMessage.set('El nuevo PIN debe tener al menos 4 caracteres.');
      return;
    }
    if (newPin === currentPin) {
      this.errorMessage.set('El nuevo PIN debe ser distinto al actual.');
      return;
    }
    if (newPin !== confirmPin) {
      this.errorMessage.set('El nuevo PIN y la confirmación no coinciden.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.accountService.changePin({ currentPin, newPin }).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMessage.set('Tu PIN fue actualizado correctamente.');
        this.currentPin.set('');
        this.newPin.set('');
        this.confirmPin.set('');
      },
      error: (err) => {
        this.loading.set(false);
        const backendMessage = err?.error?.message;
        this.errorMessage.set(backendMessage || 'No pudimos actualizar el PIN.');
      }
    });
  }

  toggleShowCurrent(): void { this.showCurrent.update((v) => !v); }
  toggleShowNew(): void { this.showNew.update((v) => !v); }
  toggleShowConfirm(): void { this.showConfirm.update((v) => !v); }
}