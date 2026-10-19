// src/app/core/auth/admin.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Vérifie si le rôle actualisé est bien 'admin'
  if (authService.userRole() === 'admin') {
    return true;
  }

  // Refuse l'accès et redirige vers le dashboard sans déconnecter l'utilisateur
  router.navigate(['/dashboard']);
  return false;
};