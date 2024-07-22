import { MachineStatus, idleStates, MachineState } from '../models/machine-status.model';
import { Machine, MachineType, MachineTool, MachineToolType, WebCamOrientation } from '../models/machine.model';
import { ApplicationSettings } from '../models/settings.model';

export class MachineMonitor implements Machine {
  machineType!: MachineType;
  id!: number;
  url!: string;
  name!: string;
  disabled!: boolean;
  webCamUrl!: string;
  webCamOrientation!: WebCamOrientation;
  snapshotUrl!: string;
  tools!: MachineTool[];
  sortIndex!: number;
  apiKey?: string | undefined;
  profile!: string;
  availableProfiles!: Map<string, string>;

  get machineTypeName() {
    return MachineType[this.machineType];
  }

  private statusBacking?: MachineStatus;

  constructor(
    machine: Machine,
    private settings: ApplicationSettings
  ) {
    Object.assign(this, machine);
  }

  get isVisible() {
    if (!this.settings) {
      return false;
    }

    if (this.settings.hideDisabledMachines && this.disabled) {
      return false;
    }

    if (this.settings.hideIdleMachines && idleStates.indexOf(this.currentState) >= 0) {
      return false;
    }

    return true;
  }

  get currentState(): MachineState {
    if (this.disabled) {
      return MachineState.Disabled;
    }

    return this.status ? this.status.state : MachineState.Connecting;
  }

  get currentStateName() {
    return MachineState[this.currentState];
  }

  get webCamOrientationName() {
    return WebCamOrientation[this.webCamOrientation];
  }

  get status(): MachineStatus | undefined {
    return this.statusBacking;
  }

  set status(value: MachineStatus) {
    if (value && value.machineId === this.id) {
      this.statusBacking = value;
    }
  }

  get heaters(): MachineTool[] {
    if (!this.tools) {
      return [];
    }

    return this.tools.filter((tool) => tool.toolType === MachineToolType.Heater);
  }

  get extruders(): MachineTool[] {
    if (!this.tools) {
      return [];
    }

    return this.tools.filter((tool) => tool.toolType === MachineToolType.Extruder);
  }
}
