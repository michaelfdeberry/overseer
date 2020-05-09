import { IndexedDBContext } from '@overseer/common/data/indexeddb/indexeddb-context.class';
import { MachineControlService, MachineProviderService } from '@overseer/common/services';
import { defer, Observable } from 'rxjs';

async function withMachineControlService<T>(execute: (c: MachineControlService) => Promise<T>): Promise<T> {
  const context = new IndexedDBContext();
  const service = new MachineControlService(context, new MachineProviderService());
  return execute(service);
}

export function pauseJob(machineId: string): Observable<void> {
  return defer(() => withMachineControlService(service => service.pauseJob(machineId)));
}

export function resumeJob(machineId: string): Observable<void> {
  return defer(() => withMachineControlService(service => service.resumeJob(machineId)));
}

export function cancelJob(machineId: string): Observable<void> {
  return defer(() => withMachineControlService(service => service.cancelJob(machineId)));
}

export function setFanSpeed(machineId: string, speedPercentage: number): Observable<void> {
  return defer(() => withMachineControlService(service => service.setFanSpeed(machineId, speedPercentage)));
}

export function setFeedRate(machineId: string, speedPercentage: number): Observable<void> {
  return defer(() => withMachineControlService(service => service.setFeedRate(machineId, speedPercentage)));
}

export function setTemperature(machineId: string, heaterIndex: number, temperature: number): Observable<void> {
  return defer(() => withMachineControlService(service => service.setTemperature(machineId, heaterIndex, temperature)));
}

export function setFlowRate(machineId: string, extruderIndex: number, flowRatePercentage: number): Observable<void> {
  return defer(() => withMachineControlService(service => service.setFlowRate(machineId, extruderIndex, flowRatePercentage)));
}
