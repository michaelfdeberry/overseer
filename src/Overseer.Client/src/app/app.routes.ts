import { Routes } from '@angular/router';
import { authenticationGuard } from './guards/authentication.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authenticationGuard()],
    loadComponent: () => import('./pages/monitoring/monitoring.component').then((m) => m.MonitoringComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'sso',
    loadComponent: () => import('./pages/sso/sso.component').then((m) => m.SsoComponent),
  },
  {
    path: 'setup',
    loadComponent: () => import('./pages/setup/setup.component').then((m) => m.SetupComponent),
  },
  // {
  //   path: 'configuration',
  //   loadComponent: () => import('./components/configuration/configuration.component').then((m) => m.AppConfigurationComponent),
  //   children: [{}],
  // },
];
