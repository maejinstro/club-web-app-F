import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';

export const quitGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const checkQuit = () => {
    return authService.isAuthenticated() ? router.createUrlTree(['/dashboard']) : true;
  };

  if (authService.isInitialized()) {
    return checkQuit();
  }

  return toObservable(authService.isInitialized).pipe(
    filter(isInit => isInit),
    take(1),
    map(() => checkQuit())
  );
};