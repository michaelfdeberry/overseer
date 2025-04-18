import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';

import { MachineStatus } from '../../../models/machine-status.model';
import { Machine, MachineTool, OctoprintMachine } from '../../../models/machine.model';
import { PollingMachineProvider } from './machine.provider';
import { processUrl } from './url-processor';

export class OctoprintMachineProvider extends PollingMachineProvider<OctoprintMachine> {
  constructor(
    machine: Machine,
    private http: HttpClient
  ) {
    super();
    this.machine = machine as OctoprintMachine;
  }

  get httpOptions(): { headers?: { [header: string]: string | string[] } } {
    return { headers: { 'X-Api-Key': this.machine.apiKey ?? '' } };
  }

  override pauseJob(): Observable<void> {
    return this.http.post<void>(processUrl(this.machine.url, 'api/job'), { command: 'pause', action: 'pause' }, this.httpOptions);
  }

  override resumeJob(): Observable<void> {
    return this.http.post<void>(processUrl(this.machine.url, 'api/job'), { command: 'pause', action: 'resume' }, this.httpOptions);
  }

  override cancelJob(): Observable<void> {
    return this.http.post<void>(processUrl(this.machine.url, 'api/job'), { command: 'cancel' }, this.httpOptions);
  }

  override executeGcode(command: string): Observable<void> {
    return this.http.post<void>(processUrl(this.machine.url, 'api/printer/command'), { command: command }, this.httpOptions);
  }

  loadConfiguration(machine: Machine): Observable<Machine> {
    if (machine.machineType !== 'Octoprint') return of(machine);

    machine.url = processUrl(machine.url);

    return forkJoin([
      this.http.get<any>(processUrl(machine.url, 'api/settings'), this.httpOptions),
      this.http.get<any>(processUrl(machine.url, 'api/printerprofiles'), this.httpOptions),
    ]).pipe(
      map(([settings, profiles]) => {
        if (!machine.webCamUrl) {
          machine.webCamUrl = processUrl(machine.url, settings.webcam.streamUrl);

          if (settings.webcam.flipH) {
            machine.webCamOrientation = 'FlippedHorizontally';
          } else if (settings.webcam.flipV) {
            machine.webCamOrientation = 'FlippedVertically';
          } else {
            machine.webCamOrientation = 'Default';
          }
        }

        machine.availableProfiles = new Map();
        for (const profileKey in profiles.profiles) {
          if (!profiles.profiles.hasOwnProperty(profileKey)) {
            continue;
          }

          const profile = profiles.profiles[profileKey];
          machine.availableProfiles.set(profile.id, profile.name);

          if (profile.current) {
            const tools: MachineTool[] = [];

            if (profile.heatedBed) {
              tools.push({
                toolType: 'Heater',
                index: -1,
                name: 'bed',
              });
            }

            if (profile.extruder.sharedNozzle) {
              tools.push({
                toolType: 'Heater',
                index: 0,
                name: 'heater 0',
              });
            }

            for (let index = 0; index < profile.extruder.count; index++) {
              if (!profile.extruder.sharedNozzle) {
                tools.push({
                  toolType: 'Heater',
                  index: index,
                  name: `heater ${index}`,
                });
              }

              tools.push({
                toolType: 'Extruder',
                index: index,
                name: `extruder ${index}`,
              });
            }

            machine.tools = tools;
            machine.profile = profile.name;
          }
        }

        this.machine = machine;
        return machine;
      }),
      catchError((err: Error) => {
        if (err.message.indexOf('Invalid API key') >= 0) {
          return throwError(() => new Error('octoprint_invalid_key'));
        }

        return throwError(() => new Error('machine_connect_failure'));
      })
    );
  }

  getHeaterIndex(heaterKey: string): number {
    if (heaterKey.toLowerCase() === 'bed') {
      return -1;
    }
    return parseInt(heaterKey.replace('tool', ''), 10);
  }

  acquireStatus(): Observable<MachineStatus> {
    const status: MachineStatus = {
      machineId: this.machine.id,
      state: 'Idle',
      temperatures: {},
    };

    return this.http.get<any>(processUrl(this.machine.url, 'api/printer'), this.httpOptions).pipe(
      mergeMap((machineState) => {
        status.temperatures = {};
        for (const key in machineState.temperature) {
          const temp = machineState.temperature[key];
          const index = this.getHeaterIndex(key);

          status.temperatures[index] = {
            heaterIndex: index,
            actual: temp.actual,
            target: temp.target,
          };
        }

        const flags = machineState.state.flags;
        if (flags.paused || flags.pausing) {
          status.state = 'Paused';
        } else if (flags.printing || flags.resuming) {
          status.state = 'Operational';
        } else {
          status.state = 'Idle';
        }

        if (status.state === 'Operational' || status.state === 'Paused') {
          return this.http.get<any>(processUrl(this.machine.url, 'api/job'), this.httpOptions).pipe(
            map((jobStatus) => {
              status.elapsedJobTime = jobStatus.progress.printTime;
              status.estimatedTimeRemaining = jobStatus.progress.printTimeLeft;
              status.progress = jobStatus.progress.completion;
              status.fanSpeed = 100;
              status.feedRate = 100;
              status.flowRates = this.machine.tools
                .filter((tool) => tool.toolType === 'Extruder')
                .reduce<{ [key: number]: number }>((obj, tool) => {
                  obj[tool.index] = 100;
                  return obj;
                }, {});

              return status;
            })
          );
        }

        return of(status);
      })
    );
  }
}
