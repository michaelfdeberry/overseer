import { MachineProvider } from './machine.provider';

export enum ContextType {
    add = 1 << 0,
    edit = 1 << 1
}

export type MachineSetting = {
    type: 'url' | 'text' | 'number' | 'options';
    contextType: ContextType;
    value?: string;
    options?: { key: string; value: string }[];
    isRequired?: boolean;
};

export type MachineSettingGroup = {
    type: 'group';
    contextType: ContextType;
    isExpanded?: boolean;
    settings: Map<string, MachineSetting>;
};

export type MachineConfiguration = MachineSetting | MachineSettingGroup;

export type MachineConfigurationBuilder = {
    configuration: Map<string, MachineConfiguration>;
    provider: new () => MachineProvider;
};

export const machineConfigurationBuilder: Map<string, MachineConfigurationBuilder> = new Map();
