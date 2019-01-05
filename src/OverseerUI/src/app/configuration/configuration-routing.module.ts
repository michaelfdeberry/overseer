import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { ConfigurationComponent } from "./configuration.component";
import { GeneralSettingsComponent } from "./general/general-settings.component";
import { UsersComponent } from "./users/users.component";
import { AddUserComponent } from "./users/add-user.component";
import { EditUserComponent } from "./users/edit-user.component";
import { MachinesComponent } from "./machines/machines.component";
import { AddMachineComponent } from "./machines/add-machine.component";
import { EditMachineComponent } from "./machines/edit-machine.component";
import { AboutComponent } from "./about/about.component";
import { SetupComponent } from "./setup/setup.component";
import { AuthenticationGuard } from "../shared/authentication-guard";

const configurationRoutes: Routes = [
    {
        path: "",
        component: ConfigurationComponent,
        children: [
            {
                path: "",
                redirectTo: "general",
                canActivate: [AuthenticationGuard]
            },
            {
                path: "general",
                component: GeneralSettingsComponent,
                canActivate: [AuthenticationGuard]
            },
            {
                path: "machines",
                component: MachinesComponent,
                canActivate: [AuthenticationGuard]
            },
            {
                path: "users",
                component: UsersComponent,
                canActivate: [AuthenticationGuard]
            },
            {
                path: "about",
                component: AboutComponent,
                canActivate: [AuthenticationGuard]
            }
        ]
    },
    {
        path: "machines/add",
        component: AddMachineComponent,
        canActivate: [AuthenticationGuard]
    },
    {
        path: "machines/edit/:id",
        component: EditMachineComponent,
        canActivate: [AuthenticationGuard]
    },
    {
        path: "users/add",
        component: AddUserComponent,
        canActivate: [AuthenticationGuard]
    },
    {
        path: "users/edit/:id",
        component: EditUserComponent,
        canActivate: [AuthenticationGuard]
    },
    {
        path: "setup",
        component: SetupComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(configurationRoutes)],
    exports: [RouterModule]
})
export class ConfigurationRoutingModule {}
