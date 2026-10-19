import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const injector = inject(Injector);
  const token = sessionStorage.getItem('auth_access_token');

  // Vérifie si la requête est destinée à notre API (base URL ou chemin relatif géré par le proxy/environnement)
  const isApiUrl = req.url.startsWith(environment.apiUrl) || req.url.startsWith('/');

  // Exclut les endpoints d'authentification (login, register) pour éviter d'envoyer un token inutilement
  const isAuthEndpoint = req.url.includes('/auth/login') || req.url.includes('/auth/register');

  // Si un token existe, que la requête cible notre API et que ce n'est pas le login/register
  if (token && isApiUrl && !isAuthEndpoint) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        // Empêche un faux positif de déconnexion si le 401 provient d'une tentative de login échouée (mauvais mot de passe)
        if (!req.url.includes('/auth/login')) {
          injector.get(AuthService).logout();
        }
      }
      // Pour un HTTP 403, la session est conservée et l'erreur est simplement propagée au composant/guard
      return throwError(() => error);
    })
  );
};