import { DBConfig } from 'ngx-indexed-db';
import { environment } from '../environments/environment.local';
import { Machine, WebCamOrientation } from './models/machine.model';
import { AccessLevel } from './models/user.model';

export function migrationFactory(): { [key: number]: (db: IDBDatabase, transaction: IDBTransaction) => void } {
  return {
    4: (db, transaction) => {
      const store = transaction.objectStore('users');
      const request = store.openCursor();

      // convert existing users to admins now that readonly users are supported.
      request.onsuccess = function (event: any) {
        const cursor: IDBCursorWithValue = event.target.result;

        if (cursor) {
          const user = cursor.value;
          if (user.accessLevel === undefined || user.accessLevel === null) {
            user.accessLevel = AccessLevel.Administrator;
          }

          cursor.update(user);
          cursor.continue();
        }
      };
    },
    7: (db, transaction) => {
      const store = transaction.objectStore('machines');
      const request = store.openCursor();

      request.onsuccess = function (event: any) {
        const cursor: IDBCursorWithValue = event.target.result;

        if (cursor) {
          const machine: Machine = cursor.value;
          machine.webCamOrientation = WebCamOrientation.Default;

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
