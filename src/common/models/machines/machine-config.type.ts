import { MachineProvider } from './machine.provider';

export enum ContextType {
  add = 1 << 0,
  edit = 1 << 1,
}

export type MachineSetting = {
  type: 'url' | 'text' | 'number' | 'options';
  contextType: ContextType;
  value?: string;
  options?: { text: string; value: string }[];
  isRequired?: boolean;
};

export type MachineSettingGroup = {
  type: 'group';
  contextType: ContextType;
  isExpanded?: boolean;
  settings: { [key: string]: MachineSetting };
};

export type MachineConfiguration = MachineSetting | MachineSettingGroup;

export type MachineConfigurationCollection = { [key: string]: MachineConfiguration };

export type MachineConfigurationBuilder = {
  configuration: MachineConfigurationCollection;
  provider: new () => MachineProvider;
};

export const machineConfigurationBuilder: Map<string, MachineConfigurationBuilder> = new Map();
