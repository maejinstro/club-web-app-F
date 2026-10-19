import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';

export const loggedGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isInitialized()) {
    return authService.isAuthenticated() ? true : router.createUrlTree(['/login']);
  }

  return toObservable(authService.isInitialized).pipe(
    filter(isInit => isInit),
    take(1),
    map(() => (authService.isAuthenticated() ? true : router.createUrlTree(['/login'])))
  );
};