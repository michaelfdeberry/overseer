import * as lodashId from 'lodash-id';

import { Machine } from '../models/machines/machine.class';
import { Certificate } from '../models/system/certificate.class';
import { LogEntry } from '../models/system/logEntry.class';
import { User } from '../models/users/user.class';
import { DataContextSchema } from './data-context-schema.interface';
import { Repository } from './repository.class';
import { ValueStore } from './value-store.class';

export class DataContext {
  defaultData: DataContextSchema = {
    certificates: [],
    logs: [],
    machines: [],
    users: [],
    values: [],
  };

  get values() {
    return new ValueStore(this.db.get('values'));
  }

  get machines() {
    return this.createRepository<Machine>('machines', Machine);
  }

  get users() {
    return this.createRepository<User>('users', User);
  }

  get certificates() {
    return this.createRepository<Certificate>('certificates', Certificate);
  }

  get logs() {
    return this.createRepository<LogEntry>('logs', LogEntry);
  }

  constructor(private db: any) {
    db._.mixin(lodashId);
    db.defaults(this.defaultData).write();
  }

  private createRepository<T>(name: keyof DataContextSchema, objConstructor: new () => T): Repository<T> {
    return new Repository<T>(this.db.get(name), objConstructor);
  }
}
