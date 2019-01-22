import { Injectable } from "@angular/core";
import { forkJoin, merge, Observable, Subject, Subscription, timer } from "rxjs";
import { MachineStatus } from "../../models/machine-status.model";
import { MachinesService } from "../machines.service";
import { MonitoringService } from "../monitoring.service";
import { SettingsService } from "../settings.service";
import { MachineProviderService } from "./providers/machine-provider.service";

@Injectable({
    providedIn: "root"
})
export class LocalMonitoringService implements MonitoringService {
    public readonly statusEvent$ = new Subject<MachineStatus>();

    private timer: Observable<any>;
    private timerSubscription: Subscription;

    constructor (
        private settingsService: SettingsService,
        private machineService: MachinesService,
        private machineProviders: MachineProviderService,
    ) {}

    enableMonitoring(): void {
        if (this.timer) { return; }

        forkJoin(
            this.settingsService.getSettings(),
            this.machineService.getMachines()
        )
        .subscribe(results => {
            const settings = results[0];
            const machines = results[1];

            this.timer = timer(0, settings.interval);
            this.timerSubscription = this.timer.subscribe(() => {
                const providers = this.machineProviders.getProviders(machines);
                merge(...providers.map(provider => provider.getStatus())).subscribe(status => {
                    this.statusEvent$.next(status);
                });
            });
        });
    }

    disableMonitoring(): void {
        if (!this.timer) { return; }

        this.timerSubscription.unsubscribe();
        this.timerSubscription = null;
        this.timer = null;
    }
}
