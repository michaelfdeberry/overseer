import { MachineConfigurationCollection, MachineSetting, MachineSettingGroup } from './machine-config.type';
import { MachineTool } from './machine-tool.interface';

export class Machine {
  id: string;
  type: string;
  disabled: boolean;
  tools: MachineTool[] = [];
  sortIndex: number;
  configuration: MachineConfigurationCollection;

  get name() {
    return this.get('Name');
  }

  set name(value: string) {
    this.patch('Name', value);
  }

  get webcamUrl() {
    return this.get('Webcam Url');
  }

  set webcamUrl(value: string) {
    this.patch('Webcam Url', value);
  }

  get webcamOrientation() {
    return this.get('Webcam Orientation');
  }

  set webcamOrientation(value: string) {
    this.patch('Webcam Orientation', value);
  }

  constructor(configuration: MachineConfigurationCollection = {}) {
    this.configuration = configuration;
  }

  getSetting(settingName: string): MachineSetting {
    return this.configuration[settingName] as MachineSetting;
  }

  patchSetting(settingName: string, setting: MachineSetting): void {
    this.configuration = { ...this.configuration, [settingName]: setting };
  }

  getSettingFromGroup(groupName: string, settingName: string): MachineSetting {
    const group = this.configuration[groupName] as MachineSettingGroup;
    return group?.settings[settingName];
  }

  patchGroupSetting(groupName: string, settingName: string, setting: MachineSetting) {
    const group = this.configuration[groupName] as MachineSettingGroup;
    group.settings[settingName] = setting;
  }

  get(settingName: string): string {
    return this.getSetting(settingName).value;
  }

  patch(settingName: string, value: string): void {
    this.patchSetting(settingName, { ...this.getSetting(settingName), value: value });
  }

  getFromGroup(groupName: string, settingName: string): string {
    return this.getSettingFromGroup(groupName, settingName)?.value;
  }

  patchGroup(groupName: string, settingName: string, value: string): void {
    this.patchGroupSetting(groupName, settingName, { ...this.getSettingFromGroup(groupName, settingName), value: value });
  }
}
