import { IndexedDBContext } from '@overseer/common/lib/data/indexeddb/indexeddb-context.class';
import { MachineState } from '@overseer/common/lib/models';
import { MachineConfigurationService, MonitoringService, SystemConfigurationService } from '@overseer/common/lib/services';
import { Observable, Subject } from 'rxjs';

let monitoringService: MonitoringService;
const machineStateSubject: Subject<MachineState> = new Subject();
export const machineState$: Observable<MachineState> = machineStateSubject.asObservable();

async function createMonitoringService(): Promise<void> {
  if (!monitoringService) {
    const context = new IndexedDBContext();
    monitoringService = new MonitoringService(new MachineConfigurationService(context), new SystemConfigurationService(context));
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
