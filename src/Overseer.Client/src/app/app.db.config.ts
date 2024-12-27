import { DBConfig } from 'ngx-indexed-db';
import { environment } from '../environments/environment';
import { Machine, MachineToolType, MachineType, WebCamOrientation } from './models/machine.model';
import { AccessLevel } from './models/user.model';
import { LogEntry, LogLevel } from './models/log-entry.model';

export function migrationFactory(): { [key: number]: (db: IDBDatabase, transaction: IDBTransaction) => void } {
  return {
    4: (_db, transaction) => {
      const store = transaction.objectStore('users');
      const request = store.openCursor();

      // convert existing users to admins now that readonly users are supported.
      request.onsuccess = function (event: any) {
        const cursor: IDBCursorWithValue = event.target.result;

        if (cursor) {
          const user = cursor.value;
          if (user.accessLevel === undefined || user.accessLevel === null) {
            user.accessLevel = 'Administrator';
          }

          cursor.update(user);
          cursor.continue();
        }
      };
    },
    7: (_db, transaction) => {
      const store = transaction.objectStore('machines');
      const request = store.openCursor();

      request.onsuccess = function (event: any) {
        const cursor: IDBCursorWithValue = event.target.result;

        if (cursor) {
          const machine: Machine = cursor.value;
          machine.webCamOrientation = 'Default';

          cursor.update(machine);
          cursor.continue();
        }
      };
    },
    11: (_db, transaction) => {
      const accessLevels: AccessLevel[] = ['Readonly', 'Administrator'];
      const logLevels: LogLevel[] = ['TRACE', 'DEBUG', 'INFO', 'LOG', 'WARN', 'ERROR', 'FATAL'];
      const machineTypes: MachineType[] = ['Unknown', 'Octoprint', 'RepRapFirmware'];
      const webCamOrientations: WebCamOrientation[] = ['Default', 'FlippedVertically', 'FlippedHorizontally'];
      const machineToolTypes: MachineToolType[] = ['Undetermined', 'Heater', 'Extruder'];
      const machines = transaction.objectStore('machines');
      const users = transaction.objectStore('users');
      const logging = transaction.objectStore('logging');

      const loggingRequest = logging.openCursor();
      loggingRequest.onsuccess = (event: any) => {
        const cursor: IDBCursorWithValue = event.target.result;

        if (cursor) {
          const log: LogEntry = cursor.value;
          if (typeof log.level === 'number') {
            log.level = logLevels[log.level];
          }

          cursor.update(log);
          cursor.continue();
        }
      };

      const usersRequest = users.openCursor();
      usersRequest.onsuccess = (event: any) => {
        const cursor: IDBCursorWithValue = event.target.result;

        if (cursor) {
          const user = cursor.value;

          if (typeof user.accessLevel === 'number') {
            user.accessLevel = accessLevels[user.accessLevel];
          }

          cursor.update(user);
          cursor.continue();
        }
      };

      const machinesRequest = machines.openCursor();
      machinesRequest.onsuccess = function (event: any) {
        const cursor: IDBCursorWithValue = event.target.result;

        if (cursor) {
          const machine: Machine = cursor.value;
          if (typeof machine.webCamOrientation === 'number') {
            machine.webCamOrientation = webCamOrientations[machine.webCamOrientation];
          }

          if (typeof machine.machineType === 'number') {
            machine.machineType = machineTypes[machine.machineType];
          }

          machine.tools.forEach((tool) => {
            if (typeof tool.toolType === 'number') {
              tool.toolType = machineToolTypes[tool.toolType];
            }
          });

          cursor.update(machine);
          cursor.continue();
        }
      };
    },
  };
}

export const dbConfig: DBConfig = {
  name: 'overseer',
  version: environment.dbVersion,
  objectStoresMeta: [
    {
      store: 'machines',
      storeConfig: { keyPath: 'id', autoIncrement: true },
      storeSchema: [],
    },
    {
      store: 'users',
      storeConfig: { keyPath: 'id', autoIncrement: true },
      storeSchema: [
        {
          name: 'username',
          keypath: 'username',
          options: { unique: true },
        },
      ],
    },
    {
      store: 'logging',
      storeConfig: { keyPath: 'id', autoIncrement: true },
      storeSchema: [],
    },
  ],
  migrationFactory,
};
