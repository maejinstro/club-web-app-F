import { Routes } from '@angular/router';
import { loggedGuard } from './core/guards/logged-guard';
import { adminGuard } from './core/guards/admin-guard';
import { quitGuard } from './core/guards/quit-guard';
import { LayoutComponent } from './layout/layout.component/layout.component';
import { DashboardComponent } from './features/dashboard/dashboard';
import { NotFound } from './features/errors/not-found/not-found';
import { unauthorized } from './features/errors/unauthorized/unauthorized';
import { AdminComponent } from './features/admin/admin.component';

export const routes: Routes = [
  // Page de login publique (protégée par quitGuard)
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [quitGuard]
  },

  // Routes imbriquées dans le Layout principal
  {
    path: '',
    component: LayoutComponent,
    canActivate: [loggedGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then(m => DashboardComponent)
      },
      {
        path: 'admin',
        component: AdminComponent,
        canActivate: [adminGuard]
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  {
    path: 'unauthorized',
    component: unauthorized
  },

  // Route inconnue (404) : Traitement explicite avec le composant NotFound
  {
    path: '**',
    component: NotFound
  }
];