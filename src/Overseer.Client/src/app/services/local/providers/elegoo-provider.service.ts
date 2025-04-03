import { Observable, of } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { isIdle, MachineStatus } from '../../../models/machine-status.model';
import { ElegooMachine, Machine } from '../../../models/machine.model';
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
  private lastStatus?: MachineStatus;
  private lastMessage: any;

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
    if (this.lastStatus) {
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

  getStatus(): Observable<MachineStatus> {
    if (this.socket?.readyState !== WebSocket.OPEN) {
      this.connect();
    }

    if (!this.lastStatus) {
      this.lastStatus = { machineId: this.machine.id, state: 'Offline' };
    }

    return of(this.lastStatus);
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

    this.lastStatus = status;
    this.lastMessage = message;
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

  private connect(): void {
    if (this.socket?.readyState === WebSocket.OPEN) return;

    this.socket = new WebSocket(`ws://${this.machine.ipAddress}:3030/websocket`);

    this.socket.addEventListener('open', () => {
      this.sendCommand(0);
      this.sendCommand(enableCameraCommand, { enable: true });
    });

    this.socket.addEventListener('message', (event) => {
      this.receiveMessage(event);
    });

    this.socket.addEventListener('close', (event) => {
      if (event.wasClean) {
        console.log(`Connection closed cleanly, code=${event.code} reason=${event.reason}`);
      } else {
        const tryReconnect = () => {
          if (retryCount < maxRetries) {
            console.log(`Connection lost, attempting reconnect ${retryCount + 1}/${maxRetries}`);
            retryCount++;
            setTimeout(() => this.connect(), retryDelay);
          } else {
            console.error('Connection failed after maximum retries');
          }
        };

        tryReconnect();
      }
    });
  }
}
