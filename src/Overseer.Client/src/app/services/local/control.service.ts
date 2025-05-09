import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { MachineToolType } from '../../models/machine.model';
import { ControlService } from '../control.service';
import { MachinesService } from '../machines.service';
import { MachineProviderService } from './providers/machine-provider.service';
import { MachineProvider } from './providers/machine.provider';
import { RequireAdministrator } from '../../decorators/require-admin.decorator';

@Injectable({ providedIn: 'root' })
export class LocalControlService implements ControlService {
  constructor(private machinesService: MachinesService, private machineProviderService: MachineProviderService) {}

  private getProvider(machineId: number): Observable<MachineProvider> {
    return this.machinesService.getMachine(machineId).pipe(map((machine) => this.machineProviderService.getProvider(machine)));
  }

  @RequireAdministrator()
  pauseJob(machineId: number): Observable<void> {
    return this.getProvider(machineId).pipe(mergeMap((provider) => provider.pauseJob()));
  }

  @RequireAdministrator()
  resumeJob(machineId: number): Observable<void> {
    return this.getProvider(machineId).pipe(mergeMap((provider) => provider.resumeJob()));
  }

  @RequireAdministrator()
  cancelJob(machineId: number): Observable<void> {
    return this.getProvider(machineId).pipe(mergeMap((provider) => provider.cancelJob()));
  }

  @RequireAdministrator()
  setFanSpeed(machineId: number, speedPercentage: number): Observable<void> {
    return this.getProvider(machineId).pipe(mergeMap((provider) => provider.setFanSpeed(speedPercentage)));
  }

  @RequireAdministrator()
  setFeedRate(machineId: number, speedPercentage: number): Observable<void> {
    return this.getProvider(machineId).pipe(mergeMap((provider) => provider.setFeedRate(speedPercentage)));
  }

  @RequireAdministrator()
  setTemperature(machineId: number, heaterIndex: number, temperature: number): Observable<void> {
    return this.machinesService.getMachine(machineId).pipe(
      mergeMap((machine) => {
        if (machine.tools.find((t) => t.toolType === 'Heater' && t.index === heaterIndex && t.name === 'bed')) {
          return this.getProvider(machineId).pipe(mergeMap((provider) => provider.setBedTemperature(temperature)));
        }

        return this.getProvider(machineId).pipe(mergeMap((provider) => provider.setToolTemperature(heaterIndex, temperature)));
      })
    );
  }

  @RequireAdministrator()
  setFlowRate(machineId: number, extruderIndex: number, flowRatePercentage: number): Observable<void> {
    return this.getProvider(machineId).pipe(mergeMap((provider) => provider.setFlowRate(extruderIndex, flowRatePercentage)));
  }
}
