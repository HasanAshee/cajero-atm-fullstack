import { Component, inject, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { AccountService } from '../../services/account.service';
import {
  BalanceMutationDialogComponent,
  BalanceMutationDialogData
} from '../balance-mutation-dialog/balance-mutation-dialog.component';
import {
  TransferDialogComponent,
  TransferDialogData
} from '../transfer-dialog/transfer-dialog.component';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {
  private dialog = inject(MatDialog);
  private accountService = inject(AccountService);

  static readonly balanceChanged$ = new Subject<void>();

  openDeposit(): void {
    this.accountService.getMe().subscribe({
      next: (info) => {
        const dialogRef = this.dialog.open(BalanceMutationDialogComponent, {
          data: {
            mode: 'deposit',
            currentBalance: info.balance
          } as BalanceMutationDialogData,
          autoFocus: 'first-tabbable',
          restoreFocus: true
        });

        dialogRef.afterClosed().subscribe((result) => {
          if (result?.success) {
            MainLayoutComponent.balanceChanged$.next();
          }
        });
      }
    });
  }

  openWithdraw(): void {
    this.accountService.getMe().subscribe({
      next: (info) => {
        const dialogRef = this.dialog.open(BalanceMutationDialogComponent, {
          data: {
            mode: 'withdraw',
            currentBalance: info.balance
          } as BalanceMutationDialogData,
          autoFocus: 'first-tabbable',
          restoreFocus: true
        });

        dialogRef.afterClosed().subscribe((result) => {
          if (result?.success) {
            MainLayoutComponent.balanceChanged$.next();
          }
        });
      }
    });
  }

  openTransfer(): void {
    this.accountService.getMe().subscribe({
      next: (info) => {
        const dialogRef = this.dialog.open(TransferDialogComponent, {
          data: {
            currentBalance: info.balance,
            currentUsername: this.accountService.user() ?? ''
          } as TransferDialogData,
          autoFocus: 'first-tabbable',
          restoreFocus: true
        });

        dialogRef.afterClosed().subscribe((result) => {
          if (result?.success) {
            MainLayoutComponent.balanceChanged$.next();
          }
        });
      }
    });
  }
}