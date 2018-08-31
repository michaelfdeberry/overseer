import { Component, Inject, Injectable } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from "@angular/material";
import { Observable } from "rxjs";

import { ControlService } from "../shared/control.service";
import { PrinterMonitor } from "./printer-monitor.type";
import { DialogService } from "../dialogs/dialog.service";

@Injectable()
export class MonitoringTuneDialogService {
    constructor(private dialog: MatDialog) {}

    open(printer: PrinterMonitor) {
        this.dialog.open(MonitoringTuneDialogComponent, { panelClass: "tune", data: printer });
    }
}

@Component({
    selector: "app-monitoring-tune",
    templateUrl: "./monitoring-tune-dialog.component.html",
    styleUrls: ["./monitoring-tune-dialog.component.scss"]
})
export class MonitoringTuneDialogComponent {
    disabled = false;

    constructor(
        public dialogRef: MatDialogRef<MonitoringTuneDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: PrinterMonitor,
        private controlService: ControlService,
        private dialog: DialogService
    ) {}

    get status() {
        return this.data.status;
    }

    pause() {
        this.disableUi(this.controlService.pausePrint(this.data.id));
    }

    resume() {
        this.disableUi(this.controlService.resumePrint(this.data.id));
    }

    cancel() {
        this.dialog.prompt({
            titleKey: "cancelPrintTitle",
            messageKey: "cancelPrintMessage"
         })
            .afterClosed()
            .subscribe(result => {
                if (result) {
                    this.disableUi(this.controlService.cancelPrint(this.data.id));
                    this.dialogRef.close();
                }
            });
    }

    increaseTemp(toolName: string) {
        this.disableUi(this.controlService.setTemperature(
            this.data.id,
            toolName,
            this.status.temperatures[toolName].target += 1
        ));
    }

    decreaseTemp(toolName: string) {
        this.disableUi(this.controlService.setTemperature(
            this.data.id,
            toolName,
            this.status.temperatures[toolName].target -= 1
        ));
    }

    setFeedRate(feedRate: number) {
        this.disableUi(this.controlService.setFeedRate(this.data.id, feedRate));
    }

    setFlowRate(toolName: string, flowRate: number) {
        this.disableUi(this.controlService.setFlowRate(this.data.id, toolName, flowRate));
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
