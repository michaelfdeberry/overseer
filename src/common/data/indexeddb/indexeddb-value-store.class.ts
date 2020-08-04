import { IDBPDatabase } from 'idb';

import { ValueStore } from '../value-store.interface';
import { OverseerSchema } from './indexeddb-schema';

export class IndexedDBValueStore implements ValueStore {
  constructor(private getDb: () => Promise<IDBPDatabase<OverseerSchema>>) {}

  async get<T>(name: string): Promise<T> {
    const db = await this.getDb();
    const record = await db.get('values', name);

    return record?.value;
  }

  async getOrSet<T>(name: string, setAction: () => T): Promise<T> {
    let value: T = await this.get(name);
    if (value) return value;

    value = setAction();
    await this.set(name, value);

    return value;
  }

  async set<T>(name: string, value: T): Promise<void> {
    const db = await this.getDb();
    await db.put('values', { id: name, value });
  }
}
