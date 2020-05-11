import { LevelUp } from 'levelup';
import { v4 as uuid } from 'uuid';

import { ValueStore } from '../value-store.interface';
import { getLevelValue, setLevelValue } from './level-utilities';

export class LevelValueStore implements ValueStore {
  constructor(private getDb: () => Promise<LevelUp>) {}

  private async getId(db: LevelUp, name: string): Promise<string> {
    const nameKeyMapper = await getLevelValue<{ [key: string]: string }>(db, 'values', {});
    return nameKeyMapper[name];
  }

  private async generateId(db: LevelUp, name: string): Promise<string> {
    const id = uuid();
    const nameKeyMapper = await getLevelValue<{ [key: string]: string }>(db, 'values', {});
    await setLevelValue(db, 'values', { ...nameKeyMapper, [name]: id });
    return id;
  }

  async get<T>(name: string): Promise<T> {
    const db = await this.getDb();
    const id = await this.getId(db, name);
    const value = id ? await getLevelValue<T>(db, id) : undefined;

    await db.close();

    return value;
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
    let id = await this.getId(db, name);
    if (!id) {
      id = await this.generateId(db, name);
    }

    await setLevelValue<T>(db, id, value);
    await db.close();
  }
}
