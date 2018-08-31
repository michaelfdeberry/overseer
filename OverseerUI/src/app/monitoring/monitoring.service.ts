import { Injectable, Inject } from "@angular/core";
import { Subject } from "rxjs";
import { PrinterStatus } from "./printer-monitor.type";

export class OverseerWindow extends Window {
    $: any;
}

@Injectable({
    providedIn: "root"
})
export class MonitoringService {
    public statusEvent$ = new Subject<PrinterStatus>();
    private hubConnection;
    private hubProxy;

    constructor(@Inject(OverseerWindow) private window: OverseerWindow) {
        this.hubConnection = this.window.$.hubConnection();
        this.hubConnection.url = "/push";
    }

    enableMonitoring() {
        if (this.hubProxy) { return; }

        this.statusEvent$ = new Subject<PrinterStatus>();
        this.hubProxy = this.hubConnection.createHubProxy("statusHub");
        this.hubProxy.on("statusUpdate", statusUpdate => this.statusEvent$.next(statusUpdate));
        this.hubConnection
            .start()
            .done(() => {
                this.hubProxy.invoke("startMonitoring");
            });
    }

    disableMonitoring() {
        if (!this.hubProxy) { return; }

        this.hubConnection.stop();
        this.statusEvent$.complete();
        this.hubProxy = null;
    }
}
