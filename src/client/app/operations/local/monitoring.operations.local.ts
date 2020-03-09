import { MachineState } from 'overseer_lib';
import { getLocalStorageDataContext } from 'overseer_lib/data';
import { MachineProviderService, MonitoringService } from 'overseer_lib/services';
import { defer, Observable, Subject } from 'rxjs';

let monitoringService: MonitoringService;
const machineStateSubject: Subject<MachineState> = new Subject();
export const machineState$: Observable<MachineState> = machineStateSubject.asObservable();

async function createMonitoringService(): Promise<void> {
  if (!monitoringService) {
    const context = await getLocalStorageDataContext();
    monitoringService = new MonitoringService(context, new MachineProviderService());
    monitoringService.machineStateUpdateEvent.on('MachineState', (stateUpdate: MachineState) => {
      machineStateSubject.next(stateUpdate);
    });
  }
}

export function enableMonitoring(): Observable<void> {
  return defer(async () => {
    await createMonitoringService();
    monitoringService.enable();
  });
}

export function disableMonitoring(): Observable<void> {
  return defer(async () => {
    await createMonitoringService();
    monitoringService.disable();
  });
}
