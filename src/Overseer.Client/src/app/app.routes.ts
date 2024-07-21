import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MonitoringComponent } from './monitoring/monitoring.component';
import { AuthenticationGuard } from './shared/authentication-guard';
import { SsoComponent } from './login/sso.component';

export const routes: Routes = [
  {
    path: '',
    component: MonitoringComponent,
    canActivate: [AuthenticationGuard],
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'sso',
    component: SsoComponent,
  },
  {
    path: 'configuration',
    // loadChildren: "./configuration/configuration.module#ConfigurationModule"
  },
];
