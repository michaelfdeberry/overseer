import { IndexedDBContext } from '@overseer/common/data/indexeddb/indexeddb-context.class';
import { MachineState } from '@overseer/common/models';
import { MachineProviderService, MonitoringService } from '@overseer/common/services';
import { Observable, Subject } from 'rxjs';

let monitoringService: MonitoringService;
const machineStateSubject: Subject<MachineState> = new Subject();
export const machineState$: Observable<MachineState> = machineStateSubject.asObservable();

async function createMonitoringService(): Promise<void> {
  if (!monitoringService) {
    const context = new IndexedDBContext();
    monitoringService = new MonitoringService(context, new MachineProviderService());
    monitoringService.machineStateEventEmitter.on('MachineState', (stateUpdate: MachineState) => {
      machineStateSubject.next(stateUpdate);
    });
  }
}

export function enableMonitoring(): void {
  createMonitoringService().then(() => monitoringService.enable());
}

export async function disableMonitoring(): Promise<void> {
  createMonitoringService().then(() => monitoringService.disable());
}
