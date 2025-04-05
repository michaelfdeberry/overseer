import { interval, Observable, of, ReplaySubject, Subscription } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { defaultPollInterval } from '../../../models/constants';
import { isIdle, MachineStatus } from '../../../models/machine-status.model';
import { ElegooMachine, Machine } from '../../../models/machine.model';
import { ApplicationSettings } from '../../../models/settings.model';
import { MachineProvider } from './machine.provider';

const pauseCommand = 129;
const cancelCommand = 130;
const resumeCommand = 131;
const printerCommand = 403;
const enableCameraCommand = 386;

const PreparingState = 1;
const PausingState = 5;
const PausedState = 6;
const PrintingState = 13;
const ResumingState = 20;

let retryCount = 0;
const maxRetries = 4;
const retryDelay = 1000; // 1 second

// TODO: refactor the front end providers to emit the status instead of returning it
// This was the a quick proof of concept to determine if the websocket connection could be established with issues
export class ElegooMachineProvider implements MachineProvider {
  private socket?: WebSocket;
  private lastMessage: any;
  private lastMessageTimestamp?: number;
  private status$?: ReplaySubject<MachineStatus>;
  private intervalSubscription?: Subscription;

  machine: ElegooMachine;

  constructor(machine: Machine) {
    this.machine = machine as ElegooMachine;
  }

  setToolTemperature(_heaterIndex: number, targetTemperature: number): Observable<void> {
    this.sendCommand(printerCommand, { TempTargetNozzle: targetTemperature });
    return of(undefined);
  }

  setBedTemperature(targetTemperature: number): Observable<void> {
    this.sendCommand(printerCommand, { TempTargetHotbed: targetTemperature });
    return of(undefined);
  }

  setFlowRate(_extruderIndex: number, _percentage: number): Observable<void> {
    return of(undefined);
  }

  setFeedRate(percentage: number): Observable<void> {
    this.sendCommand(printerCommand, { PrintSpeedPct: percentage });
    return of(undefined);
  }

  setFanSpeed(percentage: number): Observable<void> {
    if (this.lastMessage) {
      this.sendCommand(printerCommand, {
        ModelFan: percentage,
        AuxiliaryFan: this.lastMessage.Status.CurrentFanSpeed.AuxiliaryFan,
        BoxFan: this.lastMessage.Status.CurrentFanSpeed.BoxFan,
      });
    }
    return of(undefined);
  }

  pauseJob(): Observable<void> {
    this.sendCommand(pauseCommand);
    return of(undefined);
  }

  resumeJob(): Observable<void> {
    this.sendCommand(resumeCommand);
    return of(undefined);
  }

  cancelJob(): Observable<void> {
    this.sendCommand(cancelCommand);
    return of(undefined);
  }

  executeGcode(command: string): Observable<void> {
    return of(undefined);
  }

  loadConfiguration(machine: Machine): Observable<Machine> {
    if (machine.machineType !== 'Elegoo') return of(machine);

    machine.url = `http://${machine.ipAddress}/`;
    machine.webCamUrl = `http://${machine.ipAddress}:3031/video`;
    machine.webCamOrientation = 'Default';
    machine.tools = [
      { toolType: 'Heater', index: 0, name: 'bed' },
      { toolType: 'Heater', index: 1, name: 'heater 1' },
      { toolType: 'Extruder', index: 0, name: 'extruder 0' },
    ];

    this.machine = machine as ElegooMachine;
    return of(machine);
  }

  private receiveMessage(event: MessageEvent): void {
    const message = JSON.parse(event.data);

    if (!message.Status) return;

    const status: MachineStatus = {
      machineId: this.machine.id,
      state: 'Idle',
    };

    switch (message.Status.PrintInfo.Status) {
      case PausingState:
      case PausedState:
        status.state = 'Paused';
        break;
      case PreparingState:
      case PrintingState:
      case ResumingState:
        status.state = 'Operational';
        break;
      default:
        status.state = 'Idle';
    }

    status.temperatures = {
      0: { heaterIndex: 0, actual: message.Status.TempOfHotbed, target: message.Status.TempTargetHotbed },
      1: { heaterIndex: 1, actual: message.Status.TempOfNozzle, target: message.Status.TempTargetNozzle },
    };

    if (!isIdle(status.state)) {
      status.progress = message.Status.PrintInfo.Progress;
      status.estimatedTimeRemaining = message.Status.PrintInfo.TotalTicks - message.Status.PrintInfo.CurrentTicks;
      status.elapsedJobTime = message.Status.PrintInfo.CurrentTicks;
      status.feedRate = message.Status.PrintInfo.PrintSpeedPct;
      status.fanSpeed = message.Status.CurrentFanSpeed.ModelFan;
      status.flowRates = { 0: 100 };
    }

    this.lastMessage = message;
    this.lastMessageTimestamp = Date.now();
    this.status$?.next(status);
  }

  private sendCommand(command: number, data?: unknown): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      this.connect();
    }

    const message = JSON.stringify({
      Id: '',
      Data: {
        Cmd: command,
        Data: data ?? {},
        RequestId: uuid(),
        Timestamp: Date.now(),
        From: '1',
      },
    });
    this.socket?.send(message);
  }

  listen$(settings: ApplicationSettings): Observable<MachineStatus> {
    if (this.status$ && this.socket?.readyState === WebSocket.OPEN) {
      this.receiveMessage(this.lastMessage);
      return this.status$.asObservable();
    }

    const currentInterval = settings.interval ?? defaultPollInterval;
    this.intervalSubscription = interval(currentInterval).subscribe(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        // if there hasn't been an update, request one
        if (this.lastMessageTimestamp && Date.now() - this.lastMessageTimestamp > currentInterval) {
          this.sendCommand(0);
        }
      } else {
        // if the socket closed since the last message, reconnect
        this.connect();
      }
    });

    return this.connect();
  }

  private disconnect(): void {
    this.socket?.close(1000, 'Disconnecting');
    this.socket = undefined;
    this.status$?.complete();
    this.status$ = undefined;
    this.intervalSubscription?.unsubscribe();
    this.intervalSubscription = undefined;
  }

  private connect(): Observable<MachineStatus> {
    if (this.socket?.readyState === WebSocket.OPEN && !this.status$) {
      // shouldn't really happen, but just in case
      this.socket.close(1000, 'Already connected');
    }

    this.status$ = new ReplaySubject<MachineStatus>(1);
    this.socket = new WebSocket(`ws://${this.machine.ipAddress}:3030/websocket`);
    this.socket.addEventListener('open', () => {
      retryCount = 0;
      this.sendCommand(0);
      this.sendCommand(enableCameraCommand, { enable: true });
    });

    this.socket.addEventListener('message', (event) => {
      if (this.status$ && !this.status$.observed) {
        this.disconnect();
      } else {
        this.receiveMessage(event);
      }
    });

    this.socket.addEventListener('close', (event) => {
      if (event.wasClean) {
        console.log(`Connection closed cleanly, code=${event.code} reason=${event.reason}`);
      } else {
        const tryReconnect = () => {
          if (retryCount < maxRetries) {
            console.log(`Connection lost, attempting reconnect ${retryCount + 1}/${maxRetries}`);
            retryCount++;
            setTimeout(() => this.connect(), retryDelay * Math.pow(2, retryCount - 1));
          } else {
            console.error('Connection failed after maximum retries');
          }
        };

        tryReconnect();
      }
    });

    return this.status$.asObservable();
  }
}
