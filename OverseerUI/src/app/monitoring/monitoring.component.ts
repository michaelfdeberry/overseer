import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";
import { ConfigurationService } from "../shared/configuration.service";
import { MonitoringService } from "./monitoring.service";
import { PrinterMonitor } from "./printer-monitor.type";
import { map } from "rxjs/operators";

@Component({
    templateUrl: "./monitoring.component.html",
    styleUrls: ["./monitoring.component.scss"]
})
export class MonitoringComponent implements OnInit, OnDestroy {
    constructor(
        private configurationService: ConfigurationService,
        private monitoringService: MonitoringService
    ) {}

    settings: any;
    printers: PrinterMonitor[];
    statusUpdateSubscription: Subscription;

    ngOnInit() {
        this.configurationService.getSettings().subscribe(settings => this.initialize(settings));
    }

    private initialize(settings: any) {
        this.settings = settings;
        this.configurationService
            .getPrinters()
            .pipe(map(printers => {
                return printers.map(p => new PrinterMonitor(p, this.settings));
            }))
            .subscribe(printers => this.printers = printers);

        this.monitoringService.enableMonitoring();
        this.subscribeToUpdates();
    }

    private subscribeToUpdates() {
        this.statusUpdateSubscription = this.monitoringService.statusEvent$.subscribe(status => {
            // The reference to printers needs to change to trigger the filter pipe
            this.printers = this.printers.map(printer => {
                printer.status = status;
                return printer;
            });
        });
    }

    ngOnDestroy() {
        this.statusUpdateSubscription.unsubscribe();
        this.monitoringService.disableMonitoring();
    }
}
