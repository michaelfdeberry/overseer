import { IndexedDBContext } from '@overseer/common/data/indexeddb/indexeddb-context.class';
import { Machine, MachineConfigurationCollection } from '@overseer/common/models';
import { MachineConfigurationService, MachineProviderService } from '@overseer/common/services';
import { defer, Observable } from 'rxjs';

async function withMachineConfigurationService<T>(execute: (machineService: MachineConfigurationService) => Promise<T>): Promise<T> {
  const context = new IndexedDBContext();
  const service = new MachineConfigurationService(context, new MachineProviderService());
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
