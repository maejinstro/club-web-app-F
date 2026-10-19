import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-container">
      <h2>Espace d'Administration</h2>
      <p class="subtitle">Zone hautement sécurisée réservée aux administrateurs du club.</p>

      @if (authService.currentUser(); as user) {
        <div class="admin-card">
          <h3>Profil Administrateur Connecté</h3>
          <p><strong>Nom :</strong> {{ user.username }}</p>
          <p><strong>Identifiant :</strong> {{ user.idUser }}</p>
          <p class="role-tag">Rôle : {{ user.role }}</p>
        </div>
      }

      <div class="admin-actions">
        <h4>Gestion du Club</h4>
        <p>Ici, vous pouvez gérer les membres, valider les inscriptions ou modifier les configurations.</p>
        <!-- Exemple d'action réservée -->
        <button class="action-btn" (click)="onPerformAdminAction()">
          Effectuer une action administrative
        </button>
      </div>
    </div>
  `,
  styles: [`
    .admin-container { padding: 20px; background: #fff8f8; border: 1px solid #f5c6cb; border-radius: 8px; }
    h2 { color: #721c24; margin-bottom: 5px; }
    .subtitle { color: #6c757d; margin-bottom: 20px; }
    .admin-card { background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #dc3545; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
    .role-tag { display: inline-block; background: #dc3545; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
    .admin-actions { background: white; padding: 15px; border-radius: 6px; border: 1px solid #dee2e6; }
    .action-btn { background-color: #dc3545; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; font-weight: bold; }
    .action-btn:hover { background-color: #bd2130; }
  `]
})
export class AdminComponent {
  public authService = inject(AuthService);

  onPerformAdminAction(): void {
    // Exemple d'appel vers une API protégée par rôle côté NestJS
    alert('Action administrative déclenchée avec succès.');
  }
}