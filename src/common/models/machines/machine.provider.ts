import { MachineConfigurationCollection } from './machine-config.type';
import { MachineState } from './machine-state.interface';
import { Machine } from './machine.class';

export abstract class MachineProvider {
  machine: Machine;

  setToolTemperature(heaterIndex: number, targetTemperature: number): Promise<any> {
    return this.executeGcode(`M104 P${heaterIndex} S${targetTemperature}`);
  }

  setBedTemperature(targetTemperature: number): Promise<any> {
    return this.executeGcode(`M140 S${targetTemperature}`);
  }

  setFlowRate(extruderIndex: number, percentage: number): Promise<any> {
    return this.executeGcode(`M221 D${extruderIndex} S${percentage}`);
  }

  setFeedRate(percentage: number): Promise<any> {
    return this.executeGcode(`M220 S${percentage}`);
  }

  setFanSpeed(percentage: number): Promise<any> {
    return this.executeGcode(`M106 S${(255 * (percentage / 100)).toFixed(0)}`);
  }

  pauseJob(): Promise<any> {
    return this.executeGcode('M25');
  }

  resumeJob(): Promise<any> {
    return this.executeGcode('M24');
  }

  cancelJob(): Promise<any> {
    return this.executeGcode('M0');
  }

  abstract executeGcode(command: string): Promise<any>;

  abstract createMachine(configuration: MachineConfigurationCollection): Promise<Machine>;

  abstract getMachineState(): Promise<MachineState>;
}
