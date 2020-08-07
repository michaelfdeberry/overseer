import { IndexedDBContext } from '@overseer/common/lib/data/indexeddb/indexeddb-context.class';
import { Machine, MachineConfigurationCollection } from '@overseer/common/lib/models';
import { MachineConfigurationService } from '@overseer/common/lib/services';
import { defer, Observable } from 'rxjs';

async function withMachineConfigurationService<T>(execute: (machineService: MachineConfigurationService) => Promise<T>): Promise<T> {
  const context = new IndexedDBContext();
  const service = new MachineConfigurationService(context);
  return await execute(service);
}

export function getMachines(): Observable<Machine[]> {
  return defer(() => withMachineConfigurationService((service) => service.getMachines()));
}

export function getMachine(machineId: string): Observable<Machine> {
  return defer(() => withMachineConfigurationService((service) => service.getMachine(machineId)));
}

export function createMachine(machineType: string, configuration: MachineConfigurationCollection): Observable<Machine> {
  return defer(() => withMachineConfigurationService((service) => service.createMachine(machineType, configuration)));
}

export function updateMachine(machine: Machine): Observable<Machine> {
  return defer(() => withMachineConfigurationService((service) => service.updateMachine(machine)));
}

export function deleteMachine(machine: Machine): Observable<void> {
  return defer(() => withMachineConfigurationService((service) => service.deleteMachine(machine.id)));
}

export function sortMachines(sortOrder: string[]): Observable<Machine[]> {
  return defer(() => withMachineConfigurationService((service) => service.sortMachines(sortOrder)));
}

export function getMachineTypes(): Observable<string[]> {
  return defer(() => withMachineConfigurationService((service) => Promise.resolve(service.getMachineTypes())));
}

export function getMachineConfig(machineType: string): Observable<MachineConfigurationCollection> {
  return defer(() => withMachineConfigurationService((service) => Promise.resolve(service.getMachineConfiguration(machineType))));
}
