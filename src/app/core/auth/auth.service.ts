import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, tap, catchError, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthUser, LoginRequest, LoginResponse } from '../../features/models/auth.model/auth.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'auth_access_token';
  private readonly USER_KEY = 'auth_user';

  private readonly currentUserSignal = signal<AuthUser | null>(null);
  private readonly isInitializedSignal = signal<boolean>(false);

  public readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);
  public readonly currentUser = this.currentUserSignal.asReadonly();
  public readonly isInitialized = this.isInitializedSignal.asReadonly();

  public readonly userRole = computed(() => this.currentUserSignal()?.role ?? null);

  constructor(private http: HttpClient, private router: Router) {
    this.checkInitialSession();
  }

  private checkInitialSession(): void {
    const token = this.getToken();

    // S'il n'y a pas de token, on nettoie et on initialise l'état.
    // Si un token existe, on laisse /auth/me et NestJS déterminer sa validité.
    if (!token) {
      this.logoutLocal();
      this.isInitializedSignal.set(true);
      return;
    }

    // Pendant cette vérification, isInitializedSignal reste false (état d'attente / pas d'affichage du dashboard avec des données périmées).
    this.fetchUserProfile().subscribe({
      next: (user) => {
        this.currentUserSignal.set(user);
        sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
        this.isInitializedSignal.set(true);
      },
      error: (error) => {
        // En cas de 401, logoutLocal a été exécuté. En cas d'erreur réseau, on bloque l'accès privé mais on garde le token pour réessayer.
        if (error.status === 401) {
          this.logoutLocal();
        } else {
          this.currentUserSignal.set(null);
        }
        this.isInitializedSignal.set(true);
      }
    });
  }

  fetchUserProfile(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${this.apiUrl}/me`).pipe(
      map((user) => {
        if (!user || user.idUser === undefined || !user.username) {
          throw new Error('Format de profil utilisateur invalide.');
        }
        return user;
      }),
      tap((user) => {
        sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
        this.currentUserSignal.set(user);
      }),
      catchError((error: unknown) => {
        let userMessage = 'Impossible de récupérer le profil utilisateur.';
        if (error instanceof HttpErrorResponse && error.status === 401) {
          userMessage = 'Session expirée ou non autorisée.';
          this.logoutLocal();
        }

        return throwError(() => ({
          status: error instanceof HttpErrorResponse ? error.status : 0,
          message: userMessage,
          originalError: error
        }));
      })
    );
  }

  login(credentials: LoginRequest): Observable<AuthUser> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        if (!response || typeof response.accessToken !== 'string' || !response.user) {
          throw new Error('Format de réponse inattendu du serveur.');
        }
        if (response.user.idUser === undefined || !response.user.username) {
          throw new Error('Données utilisateur incomplètes dans la réponse du serveur.');
        }
        return response;
      }),
      tap((response) => {
        // Sauvegarde du token et de l'utilisateur dans le sessionStorage
        sessionStorage.setItem(this.TOKEN_KEY, response.accessToken);
        sessionStorage.setItem(this.USER_KEY, JSON.stringify(response.user));

        this.currentUserSignal.set(response.user);
        this.isInitializedSignal.set(true);
      }),
      map((response) => response.user),
      catchError((error: unknown) => {
        let userMessage = 'Une erreur technique est survenue lors de la connexion.';

        if (error instanceof HttpErrorResponse) {
          switch (error.status) {
            case 400:
              userMessage = 'Requête invalide : vérifiez les informations saisies (400).';
              break;
            case 401:
              userMessage = 'Identifiants incorrects. Veuillez réessayer (401).';
              break;
            case 0:
              userMessage = 'Impossible de contacter le serveur. Vérifiez votre réseau.';
              break;
            default:
              userMessage = `Erreur du serveur (Code : ${error.status}).`;
          }
        } else if (error instanceof Error) {
          userMessage = error.message;
        }

        return throwError(() => ({
          status: error instanceof HttpErrorResponse ? error.status : 0,
          message: userMessage,
          originalError: error
        }));
      })
    );
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  hasRole(requiredRole: string): boolean {
    const current = this.userRole();
    if (!current) return false;
    return current === requiredRole;
  }

  hasAnyRole(allowedRoles: string[]): boolean {
    const current = this.userRole();
    if (!current) return false;
    return allowedRoles.includes(current);
  }

  logout(): void {
    this.logoutLocal();
    this.router.navigate(['/login']);
  }

  private logoutLocal(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
    this.currentUserSignal.set(null);
  }
}