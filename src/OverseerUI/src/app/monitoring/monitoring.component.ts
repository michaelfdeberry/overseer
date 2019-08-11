import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription, forkJoin } from "rxjs";
import { MonitoringService } from "../services/monitoring.service";
import { MachineMonitor } from "./machine-monitor";
import { MachinesService } from "../services/machines.service";
import { SettingsService } from "../services/settings.service";
import { MediaObserver, MediaChange } from "@angular/flex-layout";
import { simpleMachineSort, machineSortFunctionFactory } from "../shared/machine-sorts";

@Component({
    templateUrl: "./monitoring.component.html",
    styleUrls: ["./monitoring.component.scss"]
})
export class MonitoringComponent implements OnInit, OnDestroy {
    constructor(
        private settingsService: SettingsService,
        private machinesService: MachinesService,
        private monitoringService: MonitoringService,
        private mediaObserver: MediaObserver
    ) {}

    columns = 1;
    rowHeight = "fit";
    settings: any;
    machines: MachineMonitor[];
    machineStatusSubscription: Subscription;
    mediaChangeSubscription: Subscription;
    currentMediaSize: string;

    setMachines(machines: MachineMonitor[]) {
        this.machines = machines.sort(simpleMachineSort);
    }

    ngOnInit() {
        forkJoin([
            this.settingsService.getSettings(),
            this.machinesService.getMachines()
        ])
            .subscribe(results => {
                this.settings = results[0];
                this.machines = results[1]
                    .map(machine => new MachineMonitor(machine, this.settings))
                    .sort(simpleMachineSort);

                this.monitoringService.enableMonitoring();
                this.machineStatusSubscription = this.monitoringService.statusEvent$.subscribe(status => {
                    this.machines = this.machines
                        .map(machine => {
                            if (machine.id === status.machineId) {
                                machine.status = status;
                            }

                            return machine;
                        })
                        .sort(machineSortFunctionFactory(this.settings));

                    this.resizeMachinesGrid();
                });

                this.mediaChangeSubscription = this.mediaObserver.media$.subscribe((change: MediaChange) => {
                    this.currentMediaSize = change.mqAlias;
                    this.resizeMachinesGrid();
                });
            });
    }

    private resizeMachinesGrid() {
        const count = this.machines.filter(m => m.isVisible).length;
        if (["xs", "sm"].indexOf(this.currentMediaSize) >= 0) {
            this.columns = 1;
            this.rowHeight = "4:3";
        } else if (count >= 1 && count <= 9) {
            const base = this.currentMediaSize === "md" ? 2 : 3;
            this.columns = Math.ceil(count / (Math.floor(count / base) + (count % base > 0 ? 1 : 0)));
            this.rowHeight = "fit";
        } else {
            this.columns = 3;
            this.rowHeight = "4:3";
        }
    }

    ngOnDestroy() {
        this.machineStatusSubscription.unsubscribe();
        this.mediaChangeSubscription.unsubscribe();
        this.monitoringService.disableMonitoring();
    }
}
