import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { FormGroup, FormBuilder } from "@angular/forms";

import { CertificateErrorService } from "./certificate-error.service";
import { MachinesService } from "../../services/machines.service";
import { machineFormFactory } from "./shared/base-machine.component";
import { machineTypes } from "../display-option.type";

@Component({
    templateUrl: "./add-machine.component.html",
    styleUrls: ["../configuration.scss"]
})
export class AddMachineComponent {
    form: FormGroup;

    machineTypes = machineTypes;

    constructor(
        private router: Router,
        private machinesService: MachinesService,
        private certificateErrorService: CertificateErrorService,
        formBuilder: FormBuilder
    ) {
        this.form = machineFormFactory(formBuilder);
    }

    save() {
        this.machinesService.createMachine(this.form.value)
            .subscribe(
                () => this.router.navigate(["/configuration/machines"]),
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
