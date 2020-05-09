import { Database } from 'sqlite3';

import { ValueStore } from '../value-store.interface';

export class SqliteValueStore implements ValueStore {
  constructor(private getDb: () => Promise<Database>) {}

  get<T>(name: string): Promise<T> {
    return new Promise(async (resolve, reject) => {
      const db = await this.getDb();
      db.get('SELECT value FROM value where id=?', name, (err, row) => {
        if (err) {
          reject(err.message);
        } else {
          resolve(row ? JSON.parse(row.value) : null);
        }
        db.close();
      });
    });
  }

  async getOrSet<T>(name: string, setAction: () => T): Promise<T> {
    let value = await this.get<T>(name);
    if (value) return value;

    value = setAction();
    await this.set(name, value);

    return value;
  }

  set<T>(name: string, value: T): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const db = await this.getDb();
      db.run('INSERT OR REPLACE INTO values (id, value) SET (?,?)', [name, JSON.stringify(value)], err => {
        if (err) {
          reject(err.message);
        } else {
          resolve();
        }
        db.close();
      });
    });
  }
}
