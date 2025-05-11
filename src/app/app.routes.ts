import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./pages/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
    canActivate: [() => import('./guards/auth.guard').then(m => m.authGuard)]
  },
  {
    path: 'injury-selector',
    loadComponent: () => import('./pages/injury-selector/injury-selector.component').then(m => m.InjurySelectorComponent),
    canActivate: [() => import('./guards/auth.guard').then(m => m.authGuard)]
  },
  {
    path: 'routines',
    loadComponent: () => import('./pages/routines/routines.component').then(m => m.RoutinesComponent),
    canActivate: [() => import('./guards/auth.guard').then(m => m.authGuard)]
  },
  {
    path: 'progress',
    loadComponent: () => import('./pages/progress/progress.component').then(m => m.ProgressComponent),
    canActivate: [() => import('./guards/auth.guard').then(m => m.authGuard)]
  },
  {
    path: 'statistics',
    loadComponent: () => import('./pages/statistics/statistics.component').then(m => m.StatisticsComponent),
    canActivate: [() => import('./guards/auth.guard').then(m => m.authGuard)]
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [() => import('./guards/auth.guard').then(m => m.authGuard)]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
