import { Component, OnInit, OnDestroy, Input } from "@angular/core";
import { Subscription } from "rxjs";

import { ControlService } from "../shared/control.service";
import { DialogService } from "../dialogs/dialog.service";
import { PrinterMonitor, PrinterState } from "./printer-monitor.type";
import { MonitoringTuneDialogService } from "./monitoring-tune-dialog.component";

@Component({
    selector: "app-monitoring-printer",
    templateUrl: "monitoring-printer.component.html",
    styleUrls: ["monitoring-printer.component.scss"]
})
export class MonitoringPrinterComponent implements OnInit, OnDestroy {
    @Input() printer: PrinterMonitor;

    height: number;
    width: number;
    status: any;
    zoomState = false;
    dimensionsSubscription: Subscription;

    constructor(
        private controlService: ControlService,
        private dialog: DialogService,
        private tuneDialogService: MonitoringTuneDialogService
    ) {}

    get progressMode() {
        if (this.printer.currentState === PrinterState.Connecting) {
            return "indeterminate";
        }

        return "determinate";
    }

    ngOnInit() {
        this.dimensionsSubscription = this.printer.dimensions$.subscribe(dimensions => {
            this.height = dimensions.height;
            this.width = dimensions.width;
        });
    }

    ngOnDestroy() {
        this.dimensionsSubscription.unsubscribe();
    }

    toggleZoom() {
        this.zoomState = !this.zoomState;
    }

    tune() {
        this.tuneDialogService.open(this.printer);
    }

    pause() {
        this.controlService.pausePrint(this.printer.id).subscribe();
    }

    resume() {
        this.controlService.resumePrint(this.printer.id).subscribe();
    }

    cancel() {
        this.dialog.prompt({
            titleKey: "cancelPrintTitle",
            messageKey: "cancelPrintMessage"
         })
            .afterClosed().subscribe(result => {
                if (result) {
                    this.controlService.cancelPrint(this.printer.id).subscribe();
                }
            });
    }
}
