import { LevelUp } from 'levelup';
import { v4 as uuid } from 'uuid';

import { Repository } from '../repository.interface';
import { getLevelValue, setLevelValue } from './level-utilities';

export class LevelRepository<T extends { id?: string }> implements Repository<T> {
  constructor(private getDb: () => Promise<LevelUp>, private collection: string) {}

  async add(value: T): Promise<string> {
    const db = await this.getDb();
    const ids = await getLevelValue<string[]>(db, this.collection, []);

    value.id = uuid();
    await setLevelValue<T>(db, value.id, value);
    await setLevelValue<string[]>(db, this.collection, [...ids, value.id]);
    await db.close();

    return value.id;
  }

  async getById(id: string): Promise<T> {
    const db = await this.getDb();
    const entity = await getLevelValue<T>(db, id);

    await db.close();

    return entity;
  }

  async getByKey(predicate: (t: T) => boolean): Promise<T> {
    const entities = await this.getAll();
    return entities.find(predicate);
  }

  async getAll(): Promise<T[]> {
    const db = await this.getDb();
    const ids = await getLevelValue<string[]>(db, this.collection, []);
    const entities = await Promise.all(ids.map(id => getLevelValue<T>(db, id)));

    await db.close();

    return entities;
  }

  async update(value: T): Promise<T> {
    const db = await this.getDb();

    await setLevelValue(db, value.id, value);
    await db.close();

    return value;
  }

  updateAll(entities: T[]): Promise<T[]> {
    return Promise.all(entities.map(entity => this.update(entity)));
  }

  async delete(id: string): Promise<void> {
    const db = await this.getDb();
    const ids = await getLevelValue<string[]>(db, this.collection, []);

    await setLevelValue(db, this.collection, [...ids.filter(x => x !== id)]);
    await db.del(id);
    await db.close();
  }

  async count(): Promise<number> {
    const db = await this.getDb();
    const ids: string[] = await getLevelValue(db, this.collection, []);

    await db.close();

    return ids.length;
  }
}
