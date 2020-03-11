import * as lodashId from 'lodash-id';

import { Machine } from '../models/machines/machine.class';
import { Certificate } from '../models/system/certificate.interface';
import { LogEntry } from '../models/system/logEntry.interface';
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
    return this.createRepository<Machine>('machines');
  }

  get users() {
    return this.createRepository<User>('users');
  }

  get certificates() {
    return this.createRepository<Certificate>('certificates');
  }

  get logs() {
    return this.createRepository<LogEntry>('logs');
  }

  constructor(private db: any) {
    db._.mixin(lodashId);
    db.defaults(this.defaultData).write();
  }

  private createRepository<T>(name: keyof DataContextSchema): Repository<T> {
    return new Repository<T>(this.db.get(name));
  }
}
