import { BehaviorSubject } from "rxjs";

export enum PrinterState {
    Disabled = -2,
    Connecting = -1,
    Offline,
    Idle,
    Paused,
    Printing
}

export const idleStates = [
    PrinterState.Disabled,
    PrinterState.Connecting,
    PrinterState.Offline,
    PrinterState.Idle,
];

export interface TemperatureStatus {
    name: string;
    actual: number;
    target: number;
}

export interface PrinterStatus {
    printerId: number;
    state: string;
    temperatures: { (key: string), TemperatureStatus };
    elapsedPrintTime: number;
    estimatedTimeRemaining: number;
    progress: number;
    fanSpeed: number;
    feedRate: number;
    flowRates: { (key: string), number };
}

export interface PrinterDimensions {
    width: number;
    height: number;
}

export class PrinterMonitor {
    id: number;
    name: string;
    disabled: boolean;
    printerType: string;
    config: any;

    private statusBacking: PrinterStatus;

    dimensions$ = new BehaviorSubject<PrinterDimensions>({ width: 0, height: 0 });

    constructor(printer: any, private settings: any) {
        Object.assign(this, printer);
    }

    get isVisible() {
        if (this.settings.hideDisabledPrinters && this.disabled) {
            return false;
        }

        if (this.settings.hideIdlePrinters && idleStates.indexOf(this.currentState) >= 0) {
            return false;
        }

        return true;
    }

    get currentState(): PrinterState {
        if (this.disabled) { return PrinterState.Disabled; }

        return this.status ? PrinterState[this.status.state] : PrinterState.Connecting;
    }

    get currentStateName() {
        return PrinterState[this.currentState];
    }

    get status(): PrinterStatus {
        return this.statusBacking;
    }

    set status(value: PrinterStatus) {
        if (value && value.printerId === this.id) {
            this.statusBacking = value;
        }
    }
}
