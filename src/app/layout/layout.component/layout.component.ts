import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.css']

})
export class LayoutComponent {
  public authService = inject(AuthService);

  onLogout(): void {
    this.authService.logout();
  }
}