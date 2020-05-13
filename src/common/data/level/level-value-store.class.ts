import { LevelUp } from 'levelup';
import { v4 as uuid } from 'uuid';

import { ValueStore } from '../value-store.interface';
import { getLevelValue, setLevelValue } from './level-utilities';

export class LevelValueStore implements ValueStore {
  constructor(private db: LevelUp) {}

  private async getId(name: string): Promise<string> {
    const nameKeyMapper = await getLevelValue<{ [key: string]: string }>(this.db, 'values', {});
    return nameKeyMapper[name];
  }

  private async generateId(name: string): Promise<string> {
    const id = uuid();
    const nameKeyMapper = await getLevelValue<{ [key: string]: string }>(this.db, 'values', {});
    await setLevelValue(this.db, 'values', { ...nameKeyMapper, [name]: id });
    return id;
  }

  async get<T>(name: string): Promise<T> {
    const id = await this.getId(name);
    const value = id ? await getLevelValue<T>(this.db, id) : undefined;

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
    let id = await this.getId(name);
    if (!id) {
      id = await this.generateId(name);
    }

    await setLevelValue<T>(this.db, id, value);
  }
}
