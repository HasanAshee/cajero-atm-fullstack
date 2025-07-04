import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AccountService } from '../../services/account.service';


@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    RouterLink
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit {

  constructor(private accountService: AccountService) {}

  userName: string = '';

  ngOnInit(): void {
    this.userName = this.accountService.getUserName();
  }

  logout() {
    this.accountService.logout();
  }

}
