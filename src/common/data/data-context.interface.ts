import { Certificate, LogEntry, Machine, User } from '../models';
import { Repository } from './repository.interface';
import { ValueStore } from './value-store.interface';

export interface DataContext {
  readonly values: ValueStore;
  readonly machines: Repository<Machine>;
  readonly users: Repository<User>;
  readonly logs: Repository<LogEntry>;
  readonly certificates?: Repository<Certificate>;
}
