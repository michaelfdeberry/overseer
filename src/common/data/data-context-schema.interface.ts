import { Machine } from '../models/machines';
import { Certificate } from '../models/system/certificate.interface';
import { LogEntry } from '../models/system/logEntry.interface';
import { User } from '../models/users/user.class';

export interface ValueEntry {
  id?: number;
  key: string;
  value: any;
}

export interface DataContextSchema {
  values: ValueEntry[];
  machines: Machine[];
  users: User[];
  certificates: Certificate[];
  logs: LogEntry[];
}
