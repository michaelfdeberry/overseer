import { getLocalStorageDataContext } from '@overseer/common/data';
import { MachineState } from '@overseer/common/models';
import { MachineProviderService, MonitoringService } from '@overseer/common/services';
import { Observable, Subject } from 'rxjs';

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

export async function enableMonitoring(): Promise<void> {
  await createMonitoringService();
  monitoringService.enable();
}

export async function disableMonitoring(): Promise<void> {
  await createMonitoringService();
  monitoringService.disable();
}
