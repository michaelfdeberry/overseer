import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { Observable, ReplaySubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { defaultPollInterval } from '../../models/constants';
import { MachineStatus } from '../../models/machine-status.model';
import { MonitoringService } from '../monitoring.service';

// This is used when the .net core host is used.
@Injectable({
  providedIn: 'root',
})
export class RemoteMonitoringService implements MonitoringService {
  private statusEvent$ = new ReplaySubject<MachineStatus>(10, defaultPollInterval, { now: () => Date.now() });
  private hubConnection: HubConnection;
  private isConnected = false;

  constructor() {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${environment.apiHost}/push/status`, { withCredentials: environment.production })
      .build();

    this.hubConnection.on('statusUpdate', (statusUpdate: MachineStatus) => this.statusEvent$.next(statusUpdate));
  }

  enableMonitoring(): Observable<MachineStatus> {
    if (this.isConnected) return this.statusEvent$;
    if (this.hubConnection.state === HubConnectionState.Connecting) return this.statusEvent$;
    if (this.hubConnection.state === HubConnectionState.Connected) {
      this.isConnected = true;
      return this.statusEvent$;
    }

    if (this.hubConnection.state === HubConnectionState.Disconnected) {
      this.hubConnection.start().then(() => {
        this.hubConnection.invoke('startMonitoring');
        this.isConnected = true;
      });
    }

    return this.statusEvent$;
  }

  disableMonitoring() {
    if (!this.isConnected) return;

    this.hubConnection.stop();
    this.isConnected = false;
  }
}
