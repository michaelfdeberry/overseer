import { getLocalStorageDataContext } from 'overseer_lib/data';
import { MachineControlService, MachineProviderService } from 'overseer_lib/services';
import { defer, Observable } from 'rxjs';

async function withMachineControlService<T>(execute: (c: MachineControlService) => Promise<T>): Promise<T> {
  const context = await getLocalStorageDataContext();
  const service = new MachineControlService(context, new MachineProviderService());
  return execute(service);
}

export function pauseJob(machineId: number): Observable<void> {
  return defer(() => withMachineControlService(service => service.pauseJob(machineId)));
}

export function resumeJob(machineId: number): Observable<void> {
  return defer(() => withMachineControlService(service => service.resumeJob(machineId)));
}

export function cancelJob(machineId: number): Observable<void> {
  return defer(() => withMachineControlService(service => service.cancelJob(machineId)));
}

export function setFanSpeed(machineId: number, speedPercentage: number): Observable<void> {
  return defer(() => withMachineControlService(service => service.setFanSpeed(machineId, speedPercentage)));
}

export function setFeedRate(machineId: number, speedPercentage: number): Observable<void> {
  return defer(() => withMachineControlService(service => service.setFeedRate(machineId, speedPercentage)));
}

export function setTemperature(machineId: number, heaterIndex: number, temperature: number): Observable<void> {
  return defer(() => withMachineControlService(service => service.setTemperature(machineId, heaterIndex, temperature)));
}

export function setFlowRate(machineId: number, extruderIndex: number, flowRatePercentage: number): Observable<void> {
  return defer(() => withMachineControlService(service => service.setFlowRate(machineId, extruderIndex, flowRatePercentage)));
}
