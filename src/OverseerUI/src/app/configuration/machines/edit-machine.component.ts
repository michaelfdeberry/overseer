import { Component } from "@angular/core";
import { ActivatedRoute, Router, ParamMap } from "@angular/router";
import { FormGroup, FormControl, FormBuilder } from "@angular/forms";
import { Subscription, Observable } from "rxjs";

import { DialogService } from "../../dialogs/dialog.service";
import { CertificateErrorService } from "./certificate-error.service";
import { machineFormFactory } from "./shared/base-machine.component";
import { MachinesService } from "../../services/machines.service";

@Component({
    templateUrl: "./edit-machine.component.html",
    styleUrls: ["../configuration.scss"]
})
export class EditMachineComponent {
    routeSubscription: Subscription;

    form: FormGroup;

    machine;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private machinesService: MachinesService,
        private dialog: DialogService,
        private certificateErrorService: CertificateErrorService,
        formBuilder: FormBuilder
    ) {
        this.form = machineFormFactory(formBuilder, { disabled: new FormControl() });

        this.route.paramMap
            .subscribe((params: ParamMap) => {
                this.machinesService.getMachine(parseInt(params.get("id"), 10)).subscribe(machine => {
                    this.machine = machine;
                    // TODO: is this timeout needed? I think I added this to get rid of that binding error,
                    // but that was caused by something else.
                    setTimeout(() => {
                        this.form.patchValue(this.machine);
                    });
                });
            })
            .unsubscribe();
    }

    delete() {
        this.dialog.prompt({ messageKey: "deleteMachinePrompt" })
            .afterClosed()
            .subscribe(result => {
                if (result) {
                    this.handleNetworkAction(this.machinesService.deleteMachine(this.machine));
                }
            });
    }

    save() {
        this.handleNetworkAction(this.machinesService.updateMachine(this.form.value));
    }

    private handleNetworkAction(observable: Observable<any>) {
        this.form.disable();

        observable.subscribe(
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
