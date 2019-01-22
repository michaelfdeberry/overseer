import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { MachineStatus } from "../../models/machine-status.model";
import { MonitoringService } from "../monitoring.service";

export class OverseerWindow extends Window {
    $: any;
}

// This is used when the mono host is used.
@Injectable({
    providedIn: "root"
})
export class SignalrMonitoringService extends MonitoringService {
    public readonly statusEvent$ = new Subject<MachineStatus>();
    private hubConnection;
    private hubProxy;

    constructor(private window: OverseerWindow) {
        super();
        this.hubConnection = this.window.$.hubConnection();
        this.hubConnection.url = "/push";
    }
    enableMonitoring() {
        if (this.hubProxy) {
            return;
        }

        this.hubProxy = this.hubConnection.createHubProxy("statusHub");
        this.hubProxy.on("statusUpdate", statusUpdate => this.statusEvent$.next(statusUpdate));
        this.hubConnection
            .start()
            .done(() => {
                this.hubProxy.invoke("startMonitoring");
            });
    }
    disableMonitoring() {
        if (!this.hubProxy) {
            return;
        }

        this.hubConnection.stop();
        this.hubProxy = null;
    }
}
