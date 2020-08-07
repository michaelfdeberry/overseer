import EncodingDown from 'encoding-down';
import LevelDOWN from 'leveldown';
import LevelUp, { LevelUp as LevelUpDb } from 'levelup';

import { Repository, ValueStore } from '..';
import { Certificate, LogEntry, Machine, User } from '../../models';
import { DataContext } from '../data-context.interface';
import { LevelRepository } from './level-repository.class';
import { LevelValueStore } from './level-value-store.class';

export function createDb(): Promise<LevelUpDb> {
  return new Promise((resolve, reject) => {
    const db = LevelUp(EncodingDown(LevelDOWN('overseer.db')), {}, (err: Error) => {
      if (err) {
        reject(err);
      } else {
        resolve(db);
      }
    });
  });
}

export class LevelContext implements DataContext {
  get values(): ValueStore {
    return new LevelValueStore(this.db);
  }

  get machines(): Repository<Machine> {
    return new LevelRepository(this.db, 'machines', Machine);
  }

  get users(): Repository<User> {
    return new LevelRepository(this.db, 'users', User);
  }

  get logs(): Repository<LogEntry> {
    return new LevelRepository(this.db, 'logging', LogEntry);
  }

  get certificates(): Repository<Certificate> {
    return new LevelRepository(this.db, 'certificates', Certificate);
  }

  constructor(private db: LevelUpDb) {}
}
