import { MachineState } from '@overseer/common/lib/models';
import { Observable, Subject } from 'rxjs';

import { getActiveUser } from '../active-user.operations';

let webSocket: WebSocket;
const machineStateSubject: Subject<MachineState> = new Subject();
export const machineState$: Observable<MachineState> = machineStateSubject.asObservable();

function issueMonitoringCommand(command: string): void {
  webSocket.send(JSON.stringify({ command, token: getActiveUser()?.token }));
}

export async function enableMonitoring(): Promise<void> {
  if (webSocket) return;

  webSocket = new WebSocket(`ws://${window.location.host}/push`);

  webSocket.addEventListener('open', () => {
    issueMonitoringCommand('EnableMonitoring');
  });

  webSocket.addEventListener('message', (event: MessageEvent) => {
    const action = JSON.parse(event.data);
    switch (action.type) {
      case 'MachineState':
        machineStateSubject.next(action.payload);
    }
  });

  // TODO: add error handling and reconnect
}

export async function disableMonitoring(): Promise<void> {
  if (webSocket?.readyState === WebSocket.OPEN) {
    issueMonitoringCommand('DisableMonitoring');
  }

  webSocket?.close();
  webSocket = undefined;
}
