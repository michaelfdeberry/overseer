import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { FormGroup } from "@angular/forms";

import { ConfigurationService } from "../../shared/configuration.service";

import { printerTypes } from "../display-option.type";
import { CertificateErrorService } from "./certificate-error.service";
import { printerConfigFormFactory } from "./shared/printer-config-base.component";

@Component({
    templateUrl: "./configuration-printers-add.component.html",
    styleUrls: ["../configuration.scss"]
})
export class ConfigurationPrintersAddComponent {
    form: FormGroup;
    printerTypes = printerTypes;

    constructor(
        private router: Router,
        private configurationService: ConfigurationService,
        private certificateErrorService: CertificateErrorService
    ) {
        this.form = printerConfigFormFactory();
    }

    save() {
        this.configurationService.createPrinter(this.form.value)
            .subscribe(
                () => this.router.navigate(["/configuration/printers"]),
                ex => {
                    this.form.enable();
                    this.certificateErrorService
                        .handleCertificateException(ex)
                        .subscribe(exceptionAdded => {
                            if (exceptionAdded) {
                                this.save();
                            }
                        });
                }
            );
    }
}
