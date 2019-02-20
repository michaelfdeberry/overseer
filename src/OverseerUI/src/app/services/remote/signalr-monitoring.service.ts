import { Injectable, Inject } from "@angular/core";
import { Subject } from "rxjs";
import { MachineStatus } from "../../models/machine-status.model";
import { MonitoringService } from "../monitoring.service";
import { OverseerWindow } from "../../app.module";

// This is used when the mono host is used.
@Injectable({
    providedIn: "root"
})
export class SignalrMonitoringService implements MonitoringService {
    public readonly statusEvent$ = new Subject<MachineStatus>();
    private hubConnection;
    private hubProxy;

    constructor(@Inject(OverseerWindow)private window: OverseerWindow) {
        if (this.window.$ === undefined || this.window.$.hubConnection === undefined) {
            throw new Error("The variable '$' or the .hubConnection() function are not defined\
                ...please check the SignalR scripts have been loaded properly");
        }

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
