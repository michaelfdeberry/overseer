import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatGridList, MatGridTile } from '@angular/material/grid-list';
import { Subscription, forkJoin } from 'rxjs';
import { MachinesService } from '../services/machines.service';
import { MonitoringService } from '../services/monitoring.service';
import { SettingsService } from '../services/settings.service';
import { machineSortFunctionFactory, simpleMachineSort } from '../shared/machine-sorts';
import { MachineMonitor } from './machine-monitor';
import { MachineMonitorFilterPipe } from './machine-monitor-filter.pipe';
import { MachineMonitorComponent } from './machine-monitor.component';

@Component({
  templateUrl: './monitoring.component.html',
  styleUrls: ['./monitoring.component.scss'],
  standalone: true,
  imports: [CommonModule, MatGridList, MatGridTile, MachineMonitorComponent, MachineMonitorFilterPipe],
})
export class MonitoringComponent implements OnInit, OnDestroy {
  constructor(
    private settingsService: SettingsService,
    private machinesService: MachinesService,
    private monitoringService: MonitoringService
  ) {}

  columns = 1;
  rowHeight = 'fit';
  settings: any;
  machines?: MachineMonitor[];
  machineStatusSubscription?: Subscription;
  mediaChangeSubscription?: Subscription;
  currentMediaSize?: string;
  resizeObserver?: ResizeObserver;

  setMachines(machines: MachineMonitor[]) {
    this.machines = machines.sort(simpleMachineSort);
  }

  ngOnInit() {
    forkJoin([this.settingsService.getSettings(), this.machinesService.getMachines()]).subscribe((results) => {
      this.settings = results[0];
      this.machines = results[1].map((machine) => new MachineMonitor(machine, this.settings)).sort(simpleMachineSort);

      this.monitoringService.enableMonitoring();
      this.machineStatusSubscription = this.monitoringService.statusEvent$.subscribe((status) => {
        this.machines = this.machines
          ?.map((machine: MachineMonitor) => {
            if (machine.id === status.machineId) {
              machine.status = status;
            }

            return machine;
          })
          .sort(machineSortFunctionFactory(this.settings));

        this.resizeMachinesGrid();
      });

      const handleResize = () => {
        if (document.body.clientWidth < 576) {
          this.currentMediaSize = 'xs';
        } else if (document.body.clientWidth < 768) {
          this.currentMediaSize = 'md';
        } else {
          this.currentMediaSize = 'lg';
        }
        this.resizeMachinesGrid();
      };
      this.resizeObserver = new ResizeObserver(handleResize);
      this.resizeObserver.observe(document.body);
      handleResize();
    });
  }

  private resizeMachinesGrid() {
    const count = this.machines?.filter((m) => m.isVisible).length || 0;
    if (['xs', 'sm'].indexOf(this.currentMediaSize ?? 'lg') >= 0) {
      this.columns = 1;
      this.rowHeight = '4:3';
    } else if (count >= 1 && count <= 9) {
      const base = this.currentMediaSize === 'md' ? 2 : 3;
      this.columns = Math.ceil(count / (Math.floor(count / base) + (count % base > 0 ? 1 : 0)));
      this.rowHeight = 'fit';
    } else {
      this.columns = 3;
      this.rowHeight = '4:3';
    }
  }

  ngOnDestroy() {
    this.machineStatusSubscription?.unsubscribe();
    this.mediaChangeSubscription?.unsubscribe();
    this.monitoringService.disableMonitoring();
  }
}
