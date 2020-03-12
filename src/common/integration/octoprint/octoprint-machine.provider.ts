import Axios, { AxiosRequestConfig } from 'axios';

import { MachineState, MachineStateType } from '../../models/machines';
import { MachineConfigurationCollection, MachineSetting } from '../../models/machines/machine-config.type';
import { MachineToolType } from '../../models/machines/machine-tool.enum';
import { Machine } from '../../models/machines/machine.class';
import { MachineProvider } from '../../models/machines/machine.provider';
import { WebcamOrientationType } from '../../models/machines/webcam-orientation.enum';
import { ExceptionTimeoutContext, withExceptionTimeout } from '../utilities/exception-timeout.utility';
import processUrl from '../utilities/process-url.utility';

export class OctoprintMachineProvider extends MachineProvider implements ExceptionTimeoutContext {
  maxExceptionCount = 5;
  timeoutDuration: number = 1000 * 60 * 2;
  exceptionCount: number;
  lastException: number;

  private get url() {
    return this.machine.get('Url');
  }

  private get apiKey() {
    return this.machine.get('Api Key');
  }

  private get profiles() {
    return this.machine.getSetting('Profiles');
  }

  private set profiles(profiles: MachineSetting) {
    this.machine.patchSetting('Profiles', profiles);
  }

  private get profileOptions(): { text: string; value: string }[] {
    return this.profiles.options || [];
  }

  private set profileOptions(options: { text: string; value: string }[]) {
    this.profiles = { ...this.profiles, options };
  }

  private getHttpOptions(): AxiosRequestConfig {
    return { headers: { 'X-Api-Key': this.apiKey } };
  }

  private sendData(resource: string, data?: any): Promise<any> {
    return Axios.post(processUrl(this.url, resource), data, this.getHttpOptions());
  }

  private async getData(resource: string): Promise<any> {
    const response = await Axios.get(processUrl(this.url, resource), this.getHttpOptions());
    return response.data;
  }

  pauseJob(): Promise<any> {
    return this.sendData('api/job', { command: 'pause', action: 'pause' });
  }

  resumeJob(): Promise<any> {
    return this.sendData('api/job', { command: 'pause', action: 'resume' });
  }

  cancelJob(): Promise<any> {
    return this.sendData('api/job', { command: 'cancel' });
  }

  executeGcode(command: string): Promise<any> {
    return this.sendData('api/printer/command', { command: command });
  }

  async createMachine(configuration: MachineConfigurationCollection): Promise<Machine> {
    try {
      this.machine = new Machine(configuration);

      const settings = await this.getData('api/settings');
      const profiles = await this.getData('api/printerprofiles');

      if (!this.machine.webcamUrl) {
        this.machine.webcamUrl = processUrl(this.url, settings.webcam.streamUrl);

        if (settings.webcam.flipH) {
          this.machine.webcamOrientation = WebcamOrientationType.FlippedHorizontally;
        } else if (settings.flipV) {
          this.machine.webcamOrientation = WebcamOrientationType.FlippedVertically;
        } else {
          this.machine.webcamOrientation = WebcamOrientationType.Default;
        }
      }

      const profileOptions = this.profileOptions;
      for (const profileKey in profiles.profiles) {
        if (!profiles.profiles.hasOwnProperty(profileKey)) {
          continue;
        }

        const profile = profiles.profiles[profileKey];
        profileOptions.push({ text: profile.name, value: profile.id });

        if (profile.current) {
          if (profile.heatedBed) {
            this.machine.tools.push({ type: MachineToolType.Heater, index: -1, name: 'bed' });
          }

          if (profile.extruder.sharedNozzle) {
            this.machine.tools.push({ type: MachineToolType.Heater, index: 0, name: 'heater 0' });
          }

          for (let index = 0; index < profile.extruder.count; index++) {
            if (!profile.extruder.sharedNozzle) {
              this.machine.tools.push({
                type: MachineToolType.Heater,
                index: index,
                name: `heater ${index}`,
              });
            }

            this.machine.tools.push({
              type: MachineToolType.Extruder,
              index: index,
              name: `extruder ${index}`,
            });
          }
        }
      }

      this.profileOptions = profileOptions;

      return this.machine;
    } catch (err) {
      if (err.message.indexOf('Invalid API key') >= 0) {
        throw new Error('octoprint_invalid_key');
      }

      throw new Error('machine_connect_failure');
    }
  }

  getMachineState(): Promise<MachineState> {
    return withExceptionTimeout(
      this,
      async () => {
        const machineState = await this.getData('api/printer');
        const state: MachineState = {
          machineId: this.machine.id,
          type: MachineStateType.Idle,
          temperatures: {},
        };

        for (const key in machineState.temperature) {
          const temp = machineState.temperature[key];
          const index = key.toLowerCase() !== 'bed' ? parseInt(key.replace('tool', ''), 10) : -1;

          state.temperatures[index] = {
            actual: temp.actual,
            target: temp.target,
          };
        }

        const flags = machineState.state.flags;
        if (flags.paused || flags.pausing) {
          state.type = MachineStateType.Paused;
        } else if (flags.printing || flags.resuming) {
          state.type = MachineStateType.Operational;
        } else {
          state.type = MachineStateType.Idle;
        }

        if (state.type === MachineStateType.Operational || state.type === MachineStateType.Paused) {
          const jobStatus = await this.getData('api/job');

          state.elapsedTime = jobStatus.progress.printTime;
          state.estimatedRemainingTime = jobStatus.progress.printTimeLeft;
          state.progress = jobStatus.progress.completion;
          state.fanSpeed = 100;
          state.feedRate = 100;
          state.flowRates = this.machine.tools
            .filter(tool => tool.type === MachineToolType.Extruder)
            .reduce<{ [key: number]: number }>((obj, _tool, index) => {
              obj[index] = 100;
              return obj;
            }, {});
        }

        return state;
      },
      { machineId: this.machine.id, type: MachineStateType.Offline }
    );
  }
}
