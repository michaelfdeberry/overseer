import { LevelUp } from 'levelup';
import { v4 as uuid } from 'uuid';

import { Repository } from '../repository.interface';
import { getLevelValue, setLevelValue } from './level-utilities';

export class LevelRepository<T extends { id?: string }> implements Repository<T> {
  constructor(private db: LevelUp, private collection: string, private entityConstructor: new () => T) {}

  construct(obj: Partial<T>): T {
    return !obj ? undefined : Object.assign(new this.entityConstructor(), obj);
  }

  async add(value: T): Promise<string> {
    const ids = await getLevelValue<string[]>(this.db, this.collection, []);

    value.id = uuid();
    await setLevelValue<T>(this.db, value.id, value);
    await setLevelValue<string[]>(this.db, this.collection, [...ids, value.id]);

    return value.id;
  }

  async getById(id: string): Promise<T> {
    const entity = await getLevelValue<T>(this.db, id);

    return this.construct(entity);
  }

  async getByKey(predicate: (t: T) => boolean): Promise<T> {
    const entities = await this.getAll();
    return entities.find(predicate);
  }

  async getAll(): Promise<T[]> {
    const ids = await getLevelValue<string[]>(this.db, this.collection, []);
    const entities = await Promise.all(ids.map(id => getLevelValue<T>(this.db, id)));

    return entities.map(e => this.construct(e));
  }

  async update(value: T): Promise<T> {
    await setLevelValue(this.db, value.id, value);
    return value;
  }

  updateAll(entities: T[]): Promise<T[]> {
    return Promise.all(entities.map(entity => this.update(entity)));
  }

  async delete(id: string): Promise<void> {
    const ids = await getLevelValue<string[]>(this.db, this.collection, []);

    await setLevelValue(this.db, this.collection, [...ids.filter(x => x !== id)]);
    await this.db.del(id);
  }

  async deleteAll(ids: string[]): Promise<void> {
    const existingIds = await getLevelValue<string[]>(this.db, this.collection, []);

    await setLevelValue(
      this.db,
      this.collection,
      existingIds.filter(id => ids.indexOf(id) < 0)
    );
    await Promise.all(ids.map(id => this.db.del(id)));
  }

  async count(): Promise<number> {
    const ids: string[] = await getLevelValue(this.db, this.collection, []);
    return ids.length;
  }
}
