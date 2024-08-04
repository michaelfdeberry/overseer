import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccessLevelGuard, AuthenticationGuard } from '../shared/authentication-guard';
import { AboutComponent } from './about/about.component';
import { ConfigurationComponent } from './configuration.component';
import { GeneralSettingsComponent } from './general/general-settings.component';
import { AddMachineComponent } from './machines/add-machine.component';
import { EditMachineComponent } from './machines/edit-machine.component';
import { MachinesComponent } from './machines/machines.component';
import { SetupComponent } from './setup/setup.component';
import { AddUserComponent } from './users/add-user.component';
import { EditUserComponent } from './users/edit-user.component';
import { UsersComponent } from './users/users.component';

const configurationRoutes: Routes = [
  {
    path: '',
    component: ConfigurationComponent,
    children: [
      {
        path: '',
        redirectTo: 'general',
        pathMatch: 'full',
      },
      {
        path: 'general',
        component: GeneralSettingsComponent,
        canActivate: [AuthenticationGuard, AccessLevelGuard],
      },
      {
        path: 'machines',
        component: MachinesComponent,
        canActivate: [AuthenticationGuard, AccessLevelGuard],
      },
      {
        path: 'users',
        component: UsersComponent,
        canActivate: [AuthenticationGuard, AccessLevelGuard],
      },
      {
        path: 'about',
        component: AboutComponent,
        canActivate: [AuthenticationGuard, AccessLevelGuard],
      },
    ],
  },
  {
    path: 'machines/add',
    component: AddMachineComponent,
    canActivate: [AuthenticationGuard, AccessLevelGuard],
  },
  {
    path: 'machines/edit/:id',
    component: EditMachineComponent,
    canActivate: [AuthenticationGuard, AccessLevelGuard],
  },
  {
    path: 'users/add',
    component: AddUserComponent,
    canActivate: [AuthenticationGuard, AccessLevelGuard],
  },
  {
    path: 'users/edit/:id',
    component: EditUserComponent,
    canActivate: [AuthenticationGuard, AccessLevelGuard],
  },
  {
    path: 'setup',
    component: SetupComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(configurationRoutes)],
  exports: [RouterModule],
})
export class ConfigurationRoutingModule {}
