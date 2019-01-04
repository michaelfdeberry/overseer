import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { RouterTabModule } from "@zerohouse/router-tab";
import { AppMaterialModule } from "../material-imports.module";
import { AboutComponent } from "./about/about.component";
import { ConfigurationRoutingModule } from "./configuration-routing.module";
import { ConfigurationComponent } from "./configuration.component";
import { GeneralSettingsComponent } from "./general/general-settings.component";
import { ThemeSelectorComponent } from "./general/theme-selector.component";
import { AddMachineComponent } from "./machines/add-machine.component";
import { CertificateErrorDialogComponent } from "./machines/certificate-error-dialog.component";
import { CertificateErrorService } from "./machines/certificate-error.service";
import { CreateMachineComponent } from "./machines/create-machine.component";
import { EditMachineComponent } from "./machines/edit-machine.component";
import { MachinesComponent } from "./machines/machines.component";
import { MachineHostComponent } from "./machines/shared/machine-host.component";
import { MachineHostDirective } from "./machines/shared/machine-host.directive";
import { OctoprintMachineComponent } from "./machines/shared/octoprint-machine.component";
import { RepRapFirmwareMachineComponent } from "./machines/shared/reprapfirmware-machine.component";
import { SetupComponent } from "./setup/setup.component";
import { AddUserComponent } from "./users/add-user.component";
import { CreateUserComponent } from "./users/create-user.component";
import { EditUserComponent } from "./users/edit-user.component";
import { UsersComponent } from "./users/users.component";

@NgModule({
    imports: [
        ConfigurationRoutingModule,
        AppMaterialModule,
        ReactiveFormsModule,
        FormsModule,
        CommonModule,
        RouterTabModule,
        TranslateModule.forChild()
    ],
    entryComponents: [
        CertificateErrorDialogComponent,
        OctoprintMachineComponent,
        RepRapFirmwareMachineComponent
    ],
    declarations: [
        ConfigurationComponent,
        GeneralSettingsComponent,
        MachinesComponent,
        UsersComponent,
        AboutComponent,
        AddUserComponent,
        EditUserComponent,
        AddMachineComponent,
        EditMachineComponent,
        CreateMachineComponent,
        ThemeSelectorComponent,
        MachineHostComponent,
        MachineHostDirective,
        OctoprintMachineComponent,
        RepRapFirmwareMachineComponent,
        CreateUserComponent,
        CreateMachineComponent,
        ThemeSelectorComponent,
        CertificateErrorDialogComponent,
        SetupComponent
    ],
    providers: [
        CertificateErrorService
    ]
})
export class ConfigurationModule {}
