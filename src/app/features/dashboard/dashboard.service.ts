import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TeamDashboard, PlayerDashboard } from './dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/dashboard`;

  /**
   * Récupère le tableau de bord de l'équipe pour une saison donnée (GET /dashboard/team)
   */
  getTeamDashboard(seasonId: number | string): Observable<TeamDashboard> {
    const params = new HttpParams().set('seasonId', seasonId.toString());
    return this.http.get<TeamDashboard>(`${this.apiUrl}/team`, { params });
  }

  /**
   * Récupère le tableau de bord personnel du joueur connecté pour une saison donnée (GET /dashboard/me)
   */
  getMyDashboard(seasonId: number | string): Observable<PlayerDashboard> {
    const params = new HttpParams().set('seasonId', seasonId.toString());
    return this.http.get<PlayerDashboard>(`${this.apiUrl}/me`, { params });
  }
}