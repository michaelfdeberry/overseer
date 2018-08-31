import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { LoginComponent } from "./login/login.component";
import { MonitoringComponent } from "./monitoring/monitoring.component";
import { AuthenticationGuard } from "./shared/authentication-guard.service";

const appRoutes: Routes = [{
    path: "",
    component: MonitoringComponent,
    canActivate: [AuthenticationGuard]
}, {
    path: "login",
    component: LoginComponent
}, {
     path: "configuration",
     loadChildren: "./configuration/configuration.module#ConfigurationModule",
     canActivate: [AuthenticationGuard]
}];

@NgModule({
    imports: [
        RouterModule.forRoot(appRoutes, { enableTracing: false })
    ]
})
export class AppRoutingModule {}
