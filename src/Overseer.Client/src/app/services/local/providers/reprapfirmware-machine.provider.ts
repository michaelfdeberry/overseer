import { HttpClient } from '@angular/common/http';
import { Observable, throwError, forkJoin } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';

import { auxiliaryHeaterTypes, Machine, MachineTool, MachineToolType } from '../../../models/machine.model';
import { BaseMachineProvider } from './machine.provider';
import { MachineStatus, MachineState, TemperatureStatus } from '../../../models/machine-status.model';

export class RepRapFirmwareMachineProvider extends BaseMachineProvider {
  constructor(machine: Machine, private http: HttpClient) {
    super();
    this.machine = machine;
  }

  override cancelJob(): Observable<void> {
    return super.pauseJob().pipe(tap(() => super.cancelJob()));
  }

  override executeGcode(command: string): Observable<void> {
    return this.http.get<any>(this.getUrl('rr_gcode'), {
      params: { gcode: command },
    });
  }

  loadConfiguration(machine: Machine): Observable<Machine> {
    return this.http.get<any>(this.getUrl('rr_status'), { params: { type: '2' } }).pipe(
      tap((status) => {
        const tools: MachineTool[] = [];
        auxiliaryHeaterTypes.forEach((auxToolType) => {
          const auxTool = status.temps[auxToolType];
          if (auxTool != null) {
            tools.push({
              name: auxToolType,
              index: auxTool.heater,
              toolType: 'Heater',
            });
          }
        });

        status.tools.forEach((tool: any) => {
          tool.heaters.forEach((heaterIndex: number) => {
            tools.push({
              name: `heater ${heaterIndex}`,
              index: heaterIndex,
              toolType: 'Heater',
            });
          });

          tool.drives.forEach((extruderIndex: number) => {
            tools.push({
              name: `extruder ${extruderIndex}`,
              index: extruderIndex,
              toolType: 'Extruder',
            });
          });
        });

        machine.tools = tools;
        this.machine = machine;
        return machine;
      }),
      catchError(() => {
        return throwError(() => new Error('machine_connect_failure'));
      })
    );
  }

  acquireStatus(): Observable<MachineStatus> {
    return forkJoin([
      this.http.get<any>(this.getUrl('rr_status'), { params: { type: '2' } }),
      this.http.get<any>(this.getUrl('rr_status'), { params: { type: '3' } }),
      this.http.get<any>(this.getUrl('rr_fileinfo')),
    ]).pipe(
      map(([machineStatus, jobStatus, fileStatus]) => {
        const status: MachineStatus = {
          machineId: this.machine.id,
          state: 'Idle',
        };

        switch (machineStatus.status) {
          case 'P':
          case 'R':
            status.state = 'Operational';
            break;
          case 'D':
          case 'S':
            status.state = 'Paused';
            break;
        }

        status.temperatures = this.readTemperatures(machineStatus);

        if (status.state === 'Operational' || status.state === 'Paused') {
          const completion = this.calculateCompletion(jobStatus, fileStatus);
          status.progress = completion[0];
          status.estimatedTimeRemaining = completion[1];
          status.elapsedJobTime = jobStatus.printDuration;
          status.fanSpeed = this.readFanSpeed(jobStatus, machineStatus);
          status.feedRate = jobStatus.params.speedFactor;
          const factors = [...jobStatus.params.extrFactors];
          status.flowRates = factors.reduce<{ [key: number]: number }>((acc, factor, index) => {
            acc[index] = factor;
            return acc;
          }, {});
        }

        return status;
      })
    );
  }

  private readTemperatures(machineStatus: any): { [key: number]: TemperatureStatus } {
    const temperatures: { [key: number]: TemperatureStatus } = {};

    for (let heaterIndex = 0; heaterIndex < machineStatus.temps.current.length; heaterIndex++) {
      const currentHeater = this.machine.tools.find((tool) => tool.toolType === 'Heater' && tool.index === heaterIndex);
      if (!currentHeater) {
        continue;
      }

      if (auxiliaryHeaterTypes.indexOf(currentHeater.name) >= 0) {
        const auxTemp = machineStatus.temps[currentHeater.name];
        if (!auxTemp) {
          continue;
        }

        temperatures[currentHeater.index] = {
          heaterIndex: currentHeater.index,
          actual: auxTemp.current,
          target: auxTemp.active,
        };
      } else {
        for (let toolIndex = 0; toolIndex < machineStatus.tools.length; toolIndex++) {
          const tool = machineStatus.tools[toolIndex];
          const toolHeaterIndex = tool.heaters.indexOf(currentHeater.index);

          if (toolHeaterIndex < 0) {
            continue;
          }

          temperatures[currentHeater.index] = {
            heaterIndex: currentHeater.index,
            actual: machineStatus.temps.current[currentHeater.index],
            target: machineStatus.temps.tools.active[toolIndex][toolHeaterIndex],
          };
        }
      }
    }

    return temperatures;
  }

  readFanSpeed(jobStatus: any, machineStatus: any): number {
    if (!jobStatus.params.fanPercent) {
      return 0;
    }

    const currentTool = machineStatus.tools[jobStatus.currentTool];
    if (!currentTool) {
      return 0;
    }
    if (!currentTool.fans) {
      return 0;
    }

    let activeFanIndex: number | undefined;
    for (let fanIndex = 0; fanIndex < Math.min(machineStatus.controllableFans, jobStatus.params.fanPercent.length); fanIndex++) {
      // tslint:disable-next-line:no-bitwise
      if ((currentTool.fans & (1 << fanIndex)) !== 0) {
        activeFanIndex = fanIndex;
        break;
      }
    }

    if (!activeFanIndex) return 0;
    return jobStatus.params.fanPercent[activeFanIndex];
  }

  calculateCompletion(jobStatus: any, fileStatus: any): [number, number] {
    if (!fileStatus) {
      return [0, 0];
    }
    if (fileStatus.err !== 0) {
      return [0, 0];
    }

    try {
      if (fileStatus.filament.length > 0) {
        const filamentNeeded = fileStatus.filament.reduce((result: number, next: number) => result + next, 0);
        const filamentExtruded = fileStatus.extrRaw.reduce((result: number, next: number) => result + next, 0);
        const progress = (filamentExtruded / filamentNeeded) * 100;

        return [jobStatus.timesLeft.filament, Math.max(0, progress)];
      } else {
        const progress = (jobStatus.coords.xyz[2] / fileStatus.height) * 100;
        return [jobStatus.timesLeft.layer, Math.max(0, progress)];
      }
    } catch {
      // noop
    }

    return [jobStatus.timesLeft.file, jobStatus.fractionPrinted];
  }
}
