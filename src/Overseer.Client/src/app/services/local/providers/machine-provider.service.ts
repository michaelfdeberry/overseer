import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Machine } from '../../../models/machine.model';
import { ElegooMachineProvider } from './elegoo-provider.service';
import { MachineProvider } from './machine.provider';
import { OctoprintMachineProvider } from './octoprint-machine.provider';
import { RepRapFirmwareMachineProvider } from './reprapfirmware-machine.provider';

@Injectable({
  providedIn: 'root',
})
export class MachineProviderService {
  providerCache = new Map<number, MachineProvider>();

  constructor(private http: HttpClient) {}

  getProvider(machine: Machine): MachineProvider {
    let provider = this.providerCache.get(machine.id);

    if (!provider) {
      switch (machine.machineType) {
        case 'Octoprint':
          provider = new OctoprintMachineProvider(machine, this.http);
          break;
        case 'RepRapFirmware':
          provider = new RepRapFirmwareMachineProvider(machine, this.http);
          break;
        case 'Elegoo':
          provider = new ElegooMachineProvider(machine);
          break;
        default:
          throw new Error('invalid_machine_type');
      }

      if (machine.id && machine.id > 0) {
        this.providerCache.set(machine.id, provider);
      }
    }

    return provider;
  }

  getProviders(machines: Machine[]): MachineProvider[] {
    return machines.filter((machine) => !machine.disabled).map((machine) => this.getProvider(machine));
  }

  clearCache() {
    this.providerCache.clear();
  }
}
