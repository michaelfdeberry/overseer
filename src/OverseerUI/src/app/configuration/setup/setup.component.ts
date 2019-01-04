import { FormGroup, FormBuilder } from "@angular/forms";
import { AuthenticationService } from "../../services/authentication.service";
import { Component, ViewChild } from "@angular/core";
import { machineFormFactory } from "../machines/shared/base-machine.component";
import { MatHorizontalStepper, MatStep } from "@angular/material";
import { MachinesService } from "../../services/machines.service";
import { CertificateErrorService } from "../machines/certificate-error.service";
import { DialogService } from "../../dialogs/dialog.service";

@Component({
    templateUrl: "./setup.component.html",
    styleUrls: ["./setup.component.scss"]
})
export class SetupComponent {
    busy = false;
    clientForm: FormGroup;
    userForm: FormGroup;
    machineForm: FormGroup;
    themeForm: FormGroup;
    machines: any[];

    @ViewChild("stepper")
    stepper: MatHorizontalStepper;

    @ViewChild("createMachineStep")
    createMachineStep: MatStep;

    get machineFormDisabled() {
        if (!this.machineForm) { return true; }

        // if machines have been added allow the user to click next without
        // completing the form
        if (this.machines && this.machines.length) { return false; }

        return this.busy || this.machineForm.invalid;
    }

    constructor(
        formBuilder: FormBuilder,
        private authService: AuthenticationService,
        private machinesService: MachinesService,
        private certErrorService: CertificateErrorService,
        private dialogService: DialogService
    ) {
        this.clientForm = formBuilder.group({});
        this.userForm = formBuilder.group({});
        this.themeForm = formBuilder.group({});
        this.machineForm = machineFormFactory(formBuilder);
    }

    configureClient() {
    }

    createUser() {
        this.busy = true;

        const user = this.userForm.value;
        this.authService.createInitialUser(user).subscribe(() => {
            this.authService.login(user).subscribe(() => {
                // With version 1.0.0 anonymous users are no longer support,
                // and the password encryption library used was changed, and  because of this
                // the user will be forced to create a new user. However, if there are machines
                // in the database then give the user the option to skip step 2.
                // this has to be done after the user is logged in to access the machines.
                this.machinesService.getMachines().subscribe(m => {
                    if (m.length) {
                        this.dialogService.prompt({
                            titleKey: "setup.existingMachinesTitle",
                            messageKey: "setup.existingMachinesMessage",
                            positiveActionTextKey: "setup.skip",
                            negativeActionTextKey: "addMachine"
                        })
                            .afterClosed().subscribe(result => {
                                this.busy = false;

                                if (result) {
                                    // skip creating machines since some exist
                                    this.skipMachines();
                                } else {
                                    // create machine
                                    this.stepper.selectedIndex = 1;
                                }
                            });

                    } else {
                        // no machines found, create machine
                        this.busy = false;
                        this.stepper.selectedIndex = 1;
                    }
                });
            });
        }, () => this.busy = false);
    }

    private skipMachines() {
        this.createMachineStep.stepControl = null;
        this.createMachineStep.completed = true;
        this.stepper.selectedIndex = 2;
    }

    createMachine(clearAndStay: boolean) {
        // The form is invalid, but the user has already added machines
        // so allow them to progress.
        if (this.machineForm.invalid && this.machines.length) {
            // TODO: check if there is any data on the form and if so prompt the user.

            if (this.machineForm.touched) {
                alert("Touched!!!");
            }

            this.skipMachines();
            return;
        }

        this.busy = true;
        this.machinesService
            .createMachine(this.machineForm.value).subscribe(result => {
                if (!this.machines) {
                    this.machines = [result];
                } else {
                    this.machines.push(result);
                }

                this.busy = false;
                if (clearAndStay) {
                    const machineType = this.machineForm.controls.machineType.value;
                    this.machineForm.reset();
                    this.machineForm.controls.machineType.setValue(machineType);
                } else {
                    this.stepper.selectedIndex = 2;
                }
            }, ex => {
                this.certErrorService
                    .handleCertificateException(ex)
                    .subscribe((exclusionAdded) => {
                        if (exclusionAdded) {
                            this.createMachine(false);
                        }

                        this.busy = false;
                    });
            });
    }
}
