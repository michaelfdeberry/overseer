import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { MachineStatus } from '../../models/machine-status.model';
import { MonitoringService } from '../monitoring.service';

// This is used when the .net core host is used.
@Injectable({
  providedIn: 'root',
})
export class RemoteMonitoringService implements MonitoringService {
  public readonly statusEvent$ = new Subject<MachineStatus>();
  private hubConnection: HubConnection;
  private isConnected = false;

  constructor() {
    this.hubConnection = new HubConnectionBuilder().withUrl('/push/status').build();
    this.hubConnection.on('statusUpdate', (statusUpdate: MachineStatus) => this.statusEvent$.next(statusUpdate));
  }

  enableMonitoring() {
    if (this.isConnected) {
      return;
    }

    this.hubConnection.start().then(() => {
      this.hubConnection.invoke('startMonitoring');
      this.isConnected = true;
    });
  }

  disableMonitoring() {
    if (!this.isConnected) {
      return;
    }

    this.hubConnection.stop();
    this.isConnected = false;
  }
}
