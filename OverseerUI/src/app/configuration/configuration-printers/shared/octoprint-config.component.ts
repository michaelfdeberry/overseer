import { Component } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { PrinterConfigComponentBase } from "./printer-config-base.component";

@Component({
    selector: "app-octoprint",
    templateUrl: "./octoprint-config.component.html",
    styleUrls: ["../../configuration.scss"]
})
export class OctoprintConfigComponent extends PrinterConfigComponentBase {
    onInit() {
        this.configGroup.addControl("printerType", new FormControl("Octoprint"));
        this.configGroup.addControl("url", new FormControl(null, Validators.required));
        this.configGroup.addControl("apiKey", new FormControl(null, Validators.required));
        this.configGroup.addControl("clientCertificate", new FormControl());

        if (this.printer) {
            this.configGroup.addControl("profile", new FormControl(null, Validators.required));
            this.configGroup.addControl("webCamUrl", new FormControl(null, Validators.required));
            this.configGroup.addControl("snapshotUrl", new FormControl(null, Validators.required));
        }
    }

    onDestroy() {
        this.tryRemoveControl(this.configGroup, "printerType");
        this.tryRemoveControl(this.configGroup, "url");
        this.tryRemoveControl(this.configGroup, "apiKey");
        this.tryRemoveControl(this.configGroup, "profile");
        this.tryRemoveControl(this.configGroup, "webCamUrl");
        this.tryRemoveControl(this.configGroup, "snapshotUrl");
        this.tryRemoveControl(this.configGroup, "clientCertificate");
    }

    compareProfiles(profileA: any, profileB: any): boolean {
        return profileA && profileB && profileA.id === profileB.id;
    }
}
