import { MachineProvider } from './machine.provider';

//used to determine if the input should display for add, edit, or both
export enum PersistenceModeType {
  add = 1,
  edit = 2,
  any = 3
}

// used to restrict certain settings to either the local or remote builds
export enum BuildRestrictionType {
  none,
  local,
  remote
}

export type MachineSetting = {
  type: 'url' | 'text' | 'number' | 'options';
  value?: string;
  isRequired?: boolean;
  options?: { text: string; value: string }[];
  mode: PersistenceModeType;
  restriction?: BuildRestrictionType;
};

export type MachineSettingGroup = {
  type: 'group';
  isExpanded?: boolean;
  settings: { [key: string]: MachineSetting };
  mode: PersistenceModeType;
  restriction?: BuildRestrictionType;
};

export type MachineConfiguration = MachineSetting | MachineSettingGroup;

export type MachineConfigurationCollection = { [key: string]: MachineConfiguration };

export type MachineConfigurationBuilder = {
  configuration: MachineConfigurationCollection;
  provider: new () => MachineProvider;
};
