import { IDBPDatabase, openDB, StoreNames } from 'idb';
import { v4 as uuid } from 'uuid';

import { LogEntry, Machine, SystemSettings, User } from '../../models';
import { DataContext } from '../data-context.interface';
import { Repository } from '../repository.interface';
import { ValueStore } from '../value-store.interface';
import { IndexedDBRepository } from './indexeddb-repository.class';
import { OverseerSchema, StoreValueType } from './indexeddb-schema';
import { IndexedDBValueStore } from './indexeddb-value-store.class';

export class IndexedDBContext implements DataContext {
  get values(): ValueStore {
    return new IndexedDBValueStore(this.createDb);
  }

  get machines(): Repository<Machine> {
    return this.createRepository('machines', Machine) as Repository<Machine>;
  }

  get users(): Repository<User> {
    return this.createRepository('users', User) as Repository<User>;
  }

  get logs(): Repository<LogEntry> {
    return this.createRepository('logging', LogEntry) as Repository<LogEntry>;
  }

  private async createDb(): Promise<IDBPDatabase<OverseerSchema>> {
    return await openDB<OverseerSchema>('overseer', 200, {
      async upgrade(db, oldVersion, _newVersion, transaction) {
        const dbParameters = { keyPath: 'id' };
        if (!db.objectStoreNames.contains('machines')) {
          db.createObjectStore('machines', dbParameters);
        }

        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', dbParameters);
          userStore.createIndex('username', 'username', { unique: true });
        }

        if (!db.objectStoreNames.contains('logging')) {
          db.createObjectStore('logging', dbParameters);
        }

        if (!db.objectStoreNames.contains('values')) {
          db.createObjectStore('values', dbParameters);
        }

        if (oldVersion < 200) {
          await transaction.objectStore('logging').clear();

          const settingsJson = localStorage.getItem('ngx_settings');
          if (settingsJson) {
            const settings: SystemSettings = JSON.parse(settingsJson);
            await transaction.objectStore('values').put({ id: 'SystemSettings', value: settings });
          }

          const machineCursor = await transaction.objectStore('machines').openCursor();
          while (machineCursor) {
            const machine = machineCursor.value;
            machine.id = uuid();
            machineCursor.update(machine);
            await machineCursor.continue();
          }

          const userCursor = await transaction.objectStore('users').openCursor();
          while (userCursor) {
            const user = userCursor.value;
            user.id = uuid();
            userCursor.update(user);
            await userCursor.continue();
          }
        }
      }
    });
  }

  private createRepository(store: StoreNames<OverseerSchema>, objConstructor: new () => StoreValueType): Repository<StoreValueType> {
    return new IndexedDBRepository(this.createDb, store, objConstructor);
  }
}
