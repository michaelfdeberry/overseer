import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { TranslateModule } from "@ngx-translate/core";
import { RouterTabModule } from "@zerohouse/router-tab";

import { AppMaterialModule } from "../shared/material-imports.module";
import { AuthenticationService } from "../shared/authentication.service";
import { ConfigurationService } from "../shared/configuration.service";

import { ConfigurationRoutingModule } from "./configuration-routing.module";
import { ConfigurationComponent } from "./configuration.component";
import { ConfigurationGeneralComponent } from "./configuration-general/configuration-general.component";
import { ConfigurationUsersComponent } from "./configuration-users/configuration-users.component";
import { ConfigurationUsersAddComponent } from "./configuration-users/configuration-users-add.component";
import { ConfigurationUsersEditComponent } from "./configuration-users/configuration-users-edit.component";
import { ConfigurationPrintersComponent } from "./configuration-printers/configuration-printers.component";
import { ConfigurationPrintersAddComponent } from "./configuration-printers/configuration-printers-add.component";
import { ConfigurationPrintersEditComponent } from "./configuration-printers/configuration-printers-edit.component";
import { PrinterConfigComponent } from "./configuration-printers/shared/printer-config.component";
import { PrinterConfigDirective } from "./configuration-printers/shared/printer-config.directive";
import { OctoprintConfigComponent } from "./configuration-printers/shared/octoprint-config.component";
import { RepRapFirmwareConfigComponent } from "./configuration-printers/shared/reprapfirmware-config.component";

import { CertificateErrorDialogComponent } from "./configuration-printers/certificate-error-dialog.component";
import { CertificateErrorService } from "./configuration-printers/certificate-error.service";
import { ConfigurationAboutComponent } from "./configuration-about/configuration-about.component";

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
        OctoprintConfigComponent,
        RepRapFirmwareConfigComponent
    ],
    declarations: [
        CertificateErrorDialogComponent,
        ConfigurationComponent,
        ConfigurationGeneralComponent,
        ConfigurationPrintersComponent,
        ConfigurationUsersComponent,
        ConfigurationUsersAddComponent,
        ConfigurationUsersEditComponent,
        ConfigurationPrintersAddComponent,
        ConfigurationPrintersEditComponent,
        ConfigurationAboutComponent,
        PrinterConfigComponent,
        OctoprintConfigComponent,
        RepRapFirmwareConfigComponent,
        PrinterConfigDirective
    ],
    providers: [
        AuthenticationService,
        ConfigurationService,
        CertificateErrorService
    ]
})
export class ConfigurationModule {}
