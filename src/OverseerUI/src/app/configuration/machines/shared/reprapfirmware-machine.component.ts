import { Component } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { BaseMachineComponent } from "./base-machine.component";
import { MachineType } from "../../../models/machine.model";

@Component({
    selector: "app-reprapfirmware",
    templateUrl: "./reprapfirmware-machine.component.html",
    styleUrls: ["../../configuration.scss"]
})
export class RepRapFirmwareMachineComponent extends BaseMachineComponent {
    onInit() {
        this.form.addControl("machineType", new FormControl(MachineType.RepRapFirmware));
        this.form.addControl("url", new FormControl(null, Validators.required));
        this.form.addControl("webCamUrl", new FormControl(null, Validators.required));
        this.form.addControl("snapshotUrl", new FormControl(null, Validators.required));
        this.form.addControl("clientCertificate", new FormControl());
    }

    onDestroy() {
        this.tryRemoveControl(this.form, "machineType");
        this.tryRemoveControl(this.form, "url");
        this.tryRemoveControl(this.form, "webCamUrl");
        this.tryRemoveControl(this.form, "snapshotUrl");
        this.tryRemoveControl(this.form, "clientCertificate");
    }
}
