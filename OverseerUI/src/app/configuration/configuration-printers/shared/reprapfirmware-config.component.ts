import { Component } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { PrinterConfigComponentBase } from "./printer-config-base.component";

@Component({
    selector: "app-reprapfirmware",
    templateUrl: "./reprapfirmware-config.component.html",
    styleUrls: ["../../configuration.scss"]
})
export class RepRapFirmwareConfigComponent extends PrinterConfigComponentBase {
    onInit() {
        this.configGroup.addControl("printerType", new FormControl("RepRap"));
        this.configGroup.addControl("url", new FormControl(null, Validators.required));
        this.configGroup.addControl("webCamUrl", new FormControl(null, Validators.required));
        this.configGroup.addControl("snapshotUrl", new FormControl(null, Validators.required));
        this.configGroup.addControl("clientCertificate", new FormControl());
    }

    onDestroy() {
        this.tryRemoveControl(this.configGroup, "printerType");
        this.tryRemoveControl(this.configGroup, "url");
        this.tryRemoveControl(this.configGroup, "webCamUrl");
        this.tryRemoveControl(this.configGroup, "snapshotUrl");
        this.tryRemoveControl(this.configGroup, "clientCertificate");
    }
}
