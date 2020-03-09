import { Machine, MachineConfiguration } from 'overseer_lib';
import { getLocalStorageDataContext } from 'overseer_lib/data';
import { MachineConfigurationService, MachineProviderService } from 'overseer_lib/services';
import { defer, Observable } from 'rxjs';

async function withMachineConfigurationService<T>(execute: (machineService: MachineConfigurationService) => Promise<T>): Promise<T> {
  const context = await getLocalStorageDataContext();
  const service = new MachineConfigurationService(context, new MachineProviderService());
  return await execute(service);
}

export function getMachines(): Observable<Machine[]> {
  return defer(() => withMachineConfigurationService(service => service.getMachines()));
}

export function getMachine(machineId: number): Observable<Machine> {
  return defer(() => withMachineConfigurationService(service => service.getMachine(machineId)));
}

export function createMachine(machineType: string, configuration: Map<string, MachineConfiguration>): Observable<Machine> {
  return defer(() => withMachineConfigurationService(service => service.createMachine(machineType, configuration)));
}

export function updateMachine(machine: Machine): Observable<Machine> {
  return defer(() => withMachineConfigurationService(service => service.updateMachine(machine)));
}

export function deleteMachine(machine: Machine): Observable<void> {
  return defer(() => withMachineConfigurationService(service => service.deleteMachine(machine.id)));
}

export function sortMachines(sortOrder: number[]): Observable<void> {
  return defer(() => withMachineConfigurationService(service => service.sortMachines(sortOrder)));
}
