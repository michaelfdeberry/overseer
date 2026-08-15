import { User } from './user.model';

export type InitializationState = 'Admin' | 'Plugins' | 'Machines' | 'Initialized';

export type InitializationStatus = {
  state: InitializationState;
  user?: User;
};
