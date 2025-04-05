import { interval, Observable, of, Subscription } from 'rxjs';
import { catchError, mergeMap, startWith, tap } from 'rxjs/operators';
import { defaultPollInterval } from '../../../models/constants';
import { MachineStatus } from '../../../models/machine-status.model';
import { Machine } from '../../../models/machine.model';
import { ApplicationSettings } from '../../../models/settings.model';

export interface MachineProvider {
  readonly machine: Machine;

  setToolTemperature(heaterIndex: number, targetTemperature: number): Observable<void>;

  setBedTemperature(targetTemperature: number): Observable<void>;

  setFlowRate(extruderIndex: number, percentage: number): Observable<void>;

  setFeedRate(percentage: number): Observable<void>;

  setFanSpeed(percentage: number): Observable<void>;

  pauseJob(): Observable<void>;

  resumeJob(): Observable<void>;

  cancelJob(): Observable<void>;

  executeGcode(command: string): Observable<void>;

  loadConfiguration(machine: Machine): Observable<Machine>;

  listen$(settings: ApplicationSettings): Observable<MachineStatus>;
}

export abstract class PollingMachineProvider<TMachine extends Machine> implements MachineProvider {
  maxExceptionCount = 5;
  exceptionTimeout = 1000 * 60 * 2; // 2 minutes
  exceptionCount = 0;
  exceptionTimestamp?: number;
  timerSubscription?: Subscription;

  machine!: TMachine;

  setToolTemperature(heaterIndex: number, targetTemperature: number): Observable<void> {
    return this.executeGcode(`M104 P${heaterIndex} S${targetTemperature}`);
  }

  setBedTemperature(targetTemperature: number): Observable<void> {
    return this.executeGcode(`M140 S${targetTemperature}`);
  }

  setFlowRate(extruderIndex: number, percentage: number): Observable<void> {
    return this.executeGcode(`M221 D${extruderIndex} S${percentage}`);
  }

  setFeedRate(percentage: number): Observable<void> {
    return this.executeGcode(`M220 S${percentage}`);
  }

  setFanSpeed(percentage: number): Observable<void> {
    return this.executeGcode(`M106 S${(255 * (percentage / 100)).toFixed(0)}`);
  }

  pauseJob(): Observable<void> {
    return this.executeGcode('M25');
  }

  resumeJob(): Observable<void> {
    return this.executeGcode('M24');
  }

  cancelJob(): Observable<void> {
    return this.executeGcode('M0');
  }

  abstract executeGcode(command: string): Observable<void>;

  abstract loadConfiguration(machine: Machine): Observable<Machine>;

  abstract acquireStatus(): Observable<MachineStatus>;

  listen$(settings: ApplicationSettings): Observable<MachineStatus> {
    return interval(settings.interval ?? defaultPollInterval).pipe(
      startWith(0),
      mergeMap(() => {
        const offlineStatus: MachineStatus = { machineId: this.machine.id, state: 'Offline' };
        if (this.exceptionTimestamp && Date.now() - this.exceptionTimestamp < this.exceptionTimeout) {
          return of(offlineStatus);
        }

        return this.acquireStatus()
          .pipe(
            tap((status) => {
              this.exceptionCount = 0;
              this.exceptionTimestamp = undefined;

              return status;
            })
          )
          .pipe(
            catchError((ex) => {
              if (++this.exceptionCount >= this.maxExceptionCount) {
                this.exceptionTimestamp = Date.now();
              }

              return of(offlineStatus);
            })
          );
      })
    );
  }
}
