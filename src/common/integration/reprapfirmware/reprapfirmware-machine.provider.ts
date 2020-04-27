import Axios, { AxiosRequestConfig } from 'axios';

import {
  auxiliaryHeaterTypes,
  Machine,
  MachineConfigurationCollection,
  MachineState,
  MachineStateType,
  MachineToolType
} from '../../models/machines';
import { MachineProvider } from '../../models/machines/machine.provider';
import { ExceptionTimeoutContext, withExceptionTimeout } from '../utilities/exception-timeout.utility';
import processUrl from '../utilities/process-url.utility';

export class RepRapFirmwareMachineProvider extends MachineProvider implements ExceptionTimeoutContext {
  maxExceptionCount = 5;
  timeoutDuration: number = 1000 * 60 * 2;
  exceptionCount: number = 0;
  lastException: number;

  private async getData(resource: string, options?: AxiosRequestConfig): Promise<any> {
    const response = await Axios.get(processUrl(this.machine.get('Url'), resource), options);
    return response.data;
  }

  executeGcode(command: string): Promise<any> {
    return this.getData('rr_gcode', { params: { gcode: command } });
  }

  async createMachine(configuration: MachineConfigurationCollection): Promise<Machine> {
    try {
      this.machine = new Machine('RepRapFirmware', configuration);
      const status = await this.getData('rr_status', { params: { type: '2' } });

      auxiliaryHeaterTypes.forEach((auxToolType: string) => {
        const auxTool = status.temps[auxToolType];
        if (auxTool != null) {
          this.machine.tools.push({ name: auxToolType, index: auxTool.heater, type: MachineToolType.Heater });
        }
      });

      status.tools.forEach((tool: any) => {
        tool.heaters.forEach((heaterIndex: number) => {
          this.machine.tools.push({
            name: 'nozzle',
            index: heaterIndex,
            type: MachineToolType.Heater,
          });
        });

        tool.drives.forEach((extruderIndex: number) => {
          this.machine.tools.push({
            name: `extruder ${extruderIndex}`,
            index: extruderIndex,
            type: MachineToolType.Extruder,
          });
        });
      });

      return this.machine;
    } catch {
      throw new Error('machine_connect_failure');
    }
  }

  getMachineState(): Promise<MachineState> {
    return withExceptionTimeout(
      this,
      async () => {
        const machineStatus = await this.getData('rr_status', { params: { type: '2' } });

        const status: MachineState = { machineId: this.machine.id, type: MachineStateType.Idle };

        switch (machineStatus.status) {
          case 'P':
          case 'R':
            status.type = MachineStateType.Operational;
            break;
          case 'D':
          case 'S':
            status.type = MachineStateType.Paused;
            break;
        }

        status.temperatures = this.readTemperatures(this.machine, machineStatus);

        if (status.type === MachineStateType.Operational || status.type === MachineStateType.Paused) {
          const jobStatus = await this.getData('rr_status', { params: { type: '3' } });
          const fileStatus = await this.getData('rr_fileinfo');
          const { estimatedRemainingTime, progress } = this.calculateCompletion(jobStatus, fileStatus);

          status.progress = progress;
          status.elapsedTime = jobStatus.printDuration;
          status.estimatedRemainingTime = estimatedRemainingTime;
          status.fanSpeed = this.readFanSpeed(jobStatus, machineStatus);
          status.feedRate = jobStatus.params.speedFactor;
          status.flowRates = jobStatus.params.extrFactors.reduce((rates: { [key: number]: number }, factor: number, index: number) => {
            rates[index] = factor;
            return rates;
          }, {} as { [key: number]: number });
        }

        return status;
      },
      { machineId: this.machine.id, type: MachineStateType.Offline }
    );
  }

  readTemperatures(machine: Machine, machineStatus: any): { [key: number]: { actual: number; target: number } } {
    const temperatures: { [key: number]: { actual: number; target: number } } = {};

    for (let heaterIndex = 0; heaterIndex < machineStatus.temps.current.length; heaterIndex++) {
      const currentHeater = machine.tools.find(tool => tool.type === MachineToolType.Heater && tool.index === heaterIndex);
      if (!currentHeater) {
        continue;
      }

      if (auxiliaryHeaterTypes.indexOf(currentHeater.name) >= 0) {
        const auxTemp = machineStatus.temps[currentHeater.name];
        if (!auxTemp) {
          continue;
        }

        temperatures[currentHeater.index] = {
          actual: auxTemp.current,
          target: auxTemp.active,
        };
      } else {
        // Overseer doesn't have a concept of tools similar to RRF, just heaters and drives.
        // So no matter the configuration it will just list all the heaters and drives. So,
        // something like a tool changing system with 2 tool heads each configured with
        // a dual extruder setup it will show up as 4 heaters and 4 drives. Or, 2 heaters and 4 drives
        // in a shared nozzle configuration.
        for (let toolIndex = 0; toolIndex < machineStatus.tools.length; toolIndex++) {
          const tool = machineStatus.tools[toolIndex];
          const toolHeaterIndex = tool.heaters.indexOf(currentHeater.index);

          if (toolHeaterIndex < 0) {
            continue;
          }

          // This finds the position of the heater index in the heater configuration section,
          // so if tool 0 has is configured to use to use heater 1 as it's only heater, then
          // then 1, specifying the heater index, will be in the 0 position. That position, 0,
          // will correspond to the position of the active temp for that heater in the active
          // temps section.
          temperatures[currentHeater.index] = {
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

    let activeFanIndex: number;
    for (let fanIndex = 0; fanIndex < Math.min(machineStatus.controllableFans, jobStatus.params.fanPercent.length); fanIndex++) {
      if ((currentTool.fans & (1 << fanIndex)) !== 0) {
        activeFanIndex = fanIndex;
        break;
      }
    }

    return jobStatus.params.fanPercent[activeFanIndex];
  }

  calculateCompletion(jobStatus: any, fileStatus: any): { estimatedRemainingTime: number; progress: number } {
    if (!fileStatus) {
      return;
    }
    if (fileStatus.err !== 0) {
      return;
    }

    try {
      if (fileStatus.filament.length > 0) {
        const filamentNeeded = fileStatus.filament.reduce((result: number, next: number) => result + next, 0);
        const filamentExtruded = fileStatus.extrRaw.reduce((result: number, next: number) => result + next, 0);
        const progress = (filamentExtruded / filamentNeeded) * 100;

        return {
          estimatedRemainingTime: jobStatus.timesLeft.filament,
          progress: Math.max(0, progress),
        };
      } else {
        const progress = (jobStatus.coords.xyz[2] / fileStatus.height) * 100;
        return {
          estimatedRemainingTime: jobStatus.timesLeft.layer,
          progress: Math.max(0, progress),
        };
      }
    } catch {
      // noop
    }

    return {
      estimatedRemainingTime: jobStatus.timesLeft.file,
      progress: Math.max(0, jobStatus.fractionPrinted),
    };
  }
}
