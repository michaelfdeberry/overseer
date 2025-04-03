import { HttpClient } from '@angular/common/http';
import ObjectModel, { GCodeFileInfo, Heat, Move, Tool } from '@duet3d/objectmodel';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { isIdle, MachineStatus, TemperatureStatus } from '../../../models/machine-status.model';
import { Machine, MachineTool, RepRapFirmwareMachine } from '../../../models/machine.model';
import { BaseMachineProvider } from './machine.provider';
import { processUrl } from './url-processor';

export class RepRapFirmwareMachineProvider extends BaseMachineProvider<RepRapFirmwareMachine> {
  constructor(
    machine: Machine,
    private http: HttpClient
  ) {
    super();
    this.machine = machine as RepRapFirmwareMachine;
  }

  override cancelJob(): Observable<void> {
    return super.pauseJob().pipe(switchMap(() => super.cancelJob()));
  }

  override executeGcode(command: string): Observable<void> {
    return this.login().pipe(
      switchMap((headers) =>
        this.http.get<any>(processUrl(this.machine.url, 'rr_gcode'), {
          params: { gcode: command },
          headers,
        })
      )
    );
  }

  private login(): Observable<Record<string, string>> {
    return this.http
      .get<{
        sessionKey: string;
      }>(processUrl(this.machine.url, 'rr_connect'), { params: { password: this.machine.password ?? 'reprap', sessionKey: 'yes' } })
      .pipe(map(({ sessionKey }) => ({ 'X-Session-Key': sessionKey })));
  }

  loadConfiguration(machine: Machine): Observable<Machine> {
    if (machine.machineType !== 'RepRapFirmware') return of(machine);

    return this.login().pipe(
      switchMap((headers) =>
        forkJoin([
          this.http.get<{ result: Tool[] }>(processUrl(this.machine.url, 'rr_model'), { params: { key: 'tools' }, headers }),
          this.http.get<{ result: Heat }>(processUrl(this.machine.url, 'rr_model'), { params: { key: 'heat' }, headers }),
        ]).pipe(
          map(([{ result: tools }, { result: heat }]) => {
            const machineTools: MachineTool[] = [];
            heat.bedHeaters.filter((b) => b >= 0).forEach((b) => machineTools.push({ index: b, toolType: 'Heater', name: 'bed' }));
            heat.chamberHeaters.filter((c) => c >= 0).forEach((c) => machineTools.push({ index: c, toolType: 'Heater', name: 'chamber' }));
            tools.forEach((tool) => {
              tool.heaters.forEach((h) => machineTools.push({ index: h, toolType: 'Heater', name: `heater ${h}` }));
              tool.extruders.forEach((e) => machineTools.push({ index: e, toolType: 'Extruder', name: `extruder ${e}` }));
            });

            machine.tools = machineTools;
            this.machine = machine;
            return machine;
          }),
          catchError(() => {
            return throwError(() => new Error('machine_connect_failure'));
          })
        )
      ),
      catchError(() => {
        return throwError(() => new Error('machine_connect_failure'));
      })
    );
  }

  acquireStatus(): Observable<MachineStatus> {
    return this.login().pipe(
      switchMap((headers) =>
        forkJoin([
          this.http.get<{ result: ObjectModel }>(processUrl(this.machine.url, 'rr_model'), { params: { flags: 'd99fno' }, headers }),
          this.http.get<{ result: Tool[] }>(processUrl(this.machine.url, 'rr_model'), { params: { key: 'tools' }, headers }),
          this.http.get<{ result: Move }>(processUrl(this.machine.url, 'rr_model'), { params: { key: 'move' }, headers }),
          this.http.get<{ result: GCodeFileInfo }>(processUrl(this.machine.url, 'rr_model'), { params: { key: 'job.file' }, headers }),
        ]).pipe(
          map(([{ result: model }, { result: tools }, { result: move }, { result: file }]) => {
            const status: MachineStatus = {
              machineId: this.machine.id,
              state: 'Idle',
            };

            switch (model.state.status) {
              case 'processing':
              case 'resuming':
                status.state = 'Operational';
                break;
              case 'paused':
              case 'pausing':
                status.state = 'Paused';
                break;
            }

            status.temperatures = this.readTemperatures(model);
            if (!isIdle(status.state)) {
              const [timeLeft, progress] = this.calculateCompletion(model, file);
              const activeTool = tools.find((t) => t.state === 'active');
              const fanIndex = activeTool?.fans[0] ?? 0;

              status.progress = progress;
              status.estimatedTimeRemaining = timeLeft;
              status.elapsedJobTime = model.job.duration ?? 0;
              status.fanSpeed = (model.fans.at(fanIndex)?.requestedValue ?? 1) * 100;
              status.feedRate = move.speedFactor * 100;
              status.flowRates = this.machine.tools
                .filter((t) => t.toolType === 'Extruder')
                .reduce((a, n) => ({ ...a, [n.index]: move.extruders[n.index].factor * 100 }), {});
            }

            return status;
          })
        )
      )
    );
  }

  private readTemperatures(model: ObjectModel): { [key: number]: TemperatureStatus } {
    return this.machine.tools
      .filter((t) => t.toolType === 'Heater')
      .reduce((a, n) => {
        const heater = model.heat.heaters[n.index];
        return { ...a, [n.index]: { heaterIndex: n.index, actual: heater?.current ?? 0, target: heater?.active ?? 0 } };
      }, {});
  }

  calculateCompletion(model: ObjectModel, file: GCodeFileInfo): [number, number] {
    if (file?.filament?.length) {
      const filamentNeeded = file.filament.reduce((r, n) => r + n, 0);
      const filamentExtruded = model.move.extruders.reduce((r, n) => r + n.rawPosition, 0);
      const progress = (filamentExtruded / filamentNeeded) * 100;
      return [model.job.timesLeft.filament ?? 0, progress];
    }

    if (model.job.timesLeft.slicer) {
      const estimatedTotal = (model.job.duration ?? 0) + model.job.timesLeft.slicer;
      const progress = model.job.timesLeft.slicer / estimatedTotal;
      return [model.job.timesLeft.slicer, progress];
    }

    if (model.job.filePosition && model.job.file?.size) {
      const fractionPrinted = (model.job.filePosition as number) / (model.job.file.size as number);
      return [model.job.timesLeft.file ?? 0, fractionPrinted * 100];
    }

    return [0, 0];
  }
}
