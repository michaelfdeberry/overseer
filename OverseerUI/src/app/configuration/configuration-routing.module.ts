import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { ConfigurationComponent } from "./configuration.component";
import { ConfigurationGeneralComponent } from "./configuration-general/configuration-general.component";
import { ConfigurationUsersComponent } from "./configuration-users/configuration-users.component";
import { ConfigurationUsersAddComponent } from "./configuration-users/configuration-users-add.component";
import { ConfigurationUsersEditComponent } from "./configuration-users/configuration-users-edit.component";
import { ConfigurationPrintersComponent } from "./configuration-printers/configuration-printers.component";
import { ConfigurationPrintersAddComponent } from "./configuration-printers/configuration-printers-add.component";
import { ConfigurationPrintersEditComponent } from "./configuration-printers/configuration-printers-edit.component";
import { ConfigurationAboutComponent } from "./configuration-about/configuration-about.component";

const configurationRoutes: Routes = [
    {
        path: "",
        component: ConfigurationComponent,
        children: [
            { path: "", redirectTo: "general" },
            { path: "general", component: ConfigurationGeneralComponent, data: { routeIndex: 0 } },
            { path: "printers", component: ConfigurationPrintersComponent, data: { routeIndex: 1 } },
            { path: "users", component: ConfigurationUsersComponent, data: { routeIndex: 2 } },
            { path: "about", component: ConfigurationAboutComponent, data: { routerIndex: 3 }}
        ]
    },
    { path: "printers/add", component: ConfigurationPrintersAddComponent },
    { path: "printers/edit/:id", component: ConfigurationPrintersEditComponent },
    { path: "users/add", component: ConfigurationUsersAddComponent },
    { path: "users/edit/:id", component: ConfigurationUsersEditComponent }
];

@NgModule({
    imports: [
        RouterModule.forChild(configurationRoutes)
    ],
    exports: [RouterModule]
})
export class ConfigurationRoutingModule { }
