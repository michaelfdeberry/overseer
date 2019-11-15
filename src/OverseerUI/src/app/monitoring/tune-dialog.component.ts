import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Observable } from "rxjs";

import { ControlService } from "../services/control.service";
import { MachineMonitor } from "./machine-monitor";
import { DialogService } from "../dialogs/dialog.service";

@Component({
    selector: "app-monitoring-tune",
    templateUrl: "./tune-dialog.component.html",
    styleUrls: ["./tune-dialog.component.scss"]
})
export class TuneDialogComponent {
    disabled = false;

    constructor(
        public dialogRef: MatDialogRef<TuneDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: MachineMonitor,
        private controlService: ControlService,
        private dialog: DialogService
    ) {}

    get status() {
        return this.data.status;
    }

    pause() {
        this.disableUi(this.controlService.pauseJob(this.data.id));
    }

    resume() {
        this.disableUi(this.controlService.resumeJob(this.data.id));
    }

    cancel() {
        this.dialog.prompt({
            titleKey: "cancelJobTitle",
            messageKey: "cancelJobMessage"
         })
            .afterClosed()
            .subscribe(result => {
                if (result) {
                    this.disableUi(this.controlService.cancelJob(this.data.id));
                    this.dialogRef.close();
                }
            });
    }

    increaseTemp(heaterIndex: number) {
        this.disableUi(this.controlService.setTemperature(
            this.data.id,
            heaterIndex,
            this.status.temperatures[heaterIndex].target += 1
        ));
    }

    decreaseTemp(heaterIndex: number) {
        this.disableUi(this.controlService.setTemperature(
            this.data.id,
            heaterIndex,
            this.status.temperatures[heaterIndex].target -= 1
        ));
    }

    setFeedRate(feedRate: number) {
        this.disableUi(this.controlService.setFeedRate(this.data.id, feedRate));
    }

    setFlowRate(extruderIndex: number, flowRate: number) {
        this.disableUi(this.controlService.setFlowRate(this.data.id, extruderIndex, flowRate));
    }

    setFanSpeed(fanSpeed: number) {
        this.disableUi(this.controlService.setFanSpeed(this.data.id, fanSpeed));
    }

    private disableUi(observable: Observable<object>) {
        this.disabled = true;
        const enableUi = () => this.disabled = false;
        observable.subscribe(enableUi, enableUi);
    }
}
