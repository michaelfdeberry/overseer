import { Component } from "@angular/core";
import { ActivatedRoute, Router, ParamMap } from "@angular/router";
import { FormGroup, FormControl } from "@angular/forms";
import { Subscription, Observable } from "rxjs";

import { ConfigurationService } from "../../shared/configuration.service";
import { DialogService } from "../../dialogs/dialog.service";
import { CertificateErrorService } from "./certificate-error.service";
import { printerConfigFormFactory } from "./shared/printer-config-base.component";

@Component({
    templateUrl: "./configuration-printers-edit.component.html",
    styleUrls: ["../configuration.scss"]
})
export class ConfigurationPrintersEditComponent {
    routeSubscription: Subscription;

    form: FormGroup;

    printer;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private configurationService: ConfigurationService,
        private dialog: DialogService,
        private certificateErrorService: CertificateErrorService
    ) {
        this.form = printerConfigFormFactory({ disabled: new FormControl() });

        this.route.paramMap
            .subscribe((params: ParamMap) => {
                this.configurationService.getPrinter(parseInt(params.get("id"), 10)).subscribe(printer => {
                    this.printer = printer;
                    setTimeout(() => {
                        this.form.patchValue(this.printer);
                    });
                });
            })
            .unsubscribe();
    }

    delete() {
        this.dialog.prompt({ messageKey: "deletePrinterPrompt" })
            .afterClosed()
            .subscribe(result => {
                if (result) {
                    this.handleNetworkAction(this.configurationService.deletePrinter(this.printer));
                }
            });
    }

    save() {
        this.handleNetworkAction(this.configurationService.updatePrinter(this.form.value));
    }

    private handleNetworkAction(observable: Observable<any>) {
        this.form.disable();

        observable.subscribe(
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
