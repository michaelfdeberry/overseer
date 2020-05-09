import { DBSchema, StoreNames, StoreValue } from 'idb';

import { LogEntry, Machine, User } from '../../models';

export interface OverseerSchema extends DBSchema {
  values: {
    key: string;
    value: {
      id: string;
      value: any;
    };
  };
  machines: {
    key: string;
    value: Machine;
  };
  users: {
    key: string;
    value: User;
    indexes: { username: string };
  };
  logging: {
    key: string;
    value: LogEntry;
  };
}

export type StoreValueType = StoreValue<OverseerSchema, StoreNames<OverseerSchema>>;
