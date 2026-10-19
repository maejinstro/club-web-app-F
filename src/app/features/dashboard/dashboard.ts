import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { DashboardService } from './dashboard.service';
import { TeamDashboard, PlayerDashboard } from './dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  public authService = inject(AuthService);
  private dashboardService = inject(DashboardService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Saison sélectionnée (signal pour la réactivité)
  public selectedSeasonId = signal<number>(1);

  // Liste des rôles autorisés à changer la saison
  private allowedRoles = ['admin', 'coach', 'coach_player', 'staff'];

  // Données des deux API
  public teamData = signal<TeamDashboard | null>(null);
  public playerData = signal<PlayerDashboard | null>(null);

  // États de chargement et d'erreur
  public isLoadingTeam = signal<boolean>(true);
  public isLoadingPlayer = signal<boolean>(true);
  public teamError = signal<string | null>(null);
  public playerError = signal<string | null>(null);

  /**
   * Vérifie si l'utilisateur a un rôle lui permettant de modifier la saison
   */
  public canChangeSeason(): boolean {
    const userRole = this.authService.currentUser()?.role;
    return !!userRole && this.allowedRoles.includes(userRole);
  }

  ngOnInit(): void {
    // Écouter les queryParams de l'URL (?seasonId=X)
    this.route.queryParams.subscribe((params) => {
      const seasonParam = Number(params['seasonId']);
      if (seasonParam && !isNaN(seasonParam) && seasonParam > 0) {
        this.selectedSeasonId.set(seasonParam);
      } else {
        this.selectedSeasonId.set(1);
      }
      this.loadDashboardData(this.selectedSeasonId());
    });
  }

  /**
   * Déclenché lors d'un changement de saison depuis le frontend
   */
  public onSeasonChange(newSeasonId: number | string): void {
    const seasonNum = Number(newSeasonId);
    if (!seasonNum || isNaN(seasonNum) || seasonNum <= 0) return;

    // Mise à jour de l'URL avec le queryParam ?seasonId=...
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { seasonId: seasonNum },
      queryParamsHandling: 'merge'
    });
  }

  loadDashboardData(seasonId: number): void {
    this.isLoadingTeam.set(true);
    this.isLoadingPlayer.set(true);
    this.teamError.set(null);
    this.playerError.set(null);

    // Chargement des données d'équipe (Zone 1 & Zone 2)
    this.dashboardService.getTeamDashboard(seasonId).subscribe({
      next: (data) => {
        this.teamData.set(data);
        this.isLoadingTeam.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoadingTeam.set(false);
        if (err.status === 401) {
          this.authService.logout?.();
          this.router.navigate(['/login']);
          return;
        }
        this.teamError.set('API indisponible : impossible de récupérer les données de l\'équipe.');
      }
    });

    // Chargement des données du joueur connecté (Zone 3)
    this.dashboardService.getMyDashboard(seasonId).subscribe({
      next: (data) => {
        this.playerData.set(data);
        this.isLoadingPlayer.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoadingPlayer.set(false);
        if (err.status === 401) {
          this.authService.logout?.();
          this.router.navigate(['/login']);
          return;
        }
        this.playerError.set('API indisponible : impossible de récupérer vos statistiques.');
      }
    });
  }
}