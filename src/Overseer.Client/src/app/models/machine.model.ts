export const auxiliaryHeaterTypes = ['bed', 'chamber', 'cabinet'];

export type MachineToolType = 'Undetermined' | 'Heater' | 'Extruder';

export type MachineType = 'Unknown' | 'Octoprint' | 'RepRapFirmware';

export type WebCamOrientation = 'Default' | 'FlippedVertically' | 'FlippedHorizontally';

export type MachineTool = {
  toolType: MachineToolType;
  index: number;
  name: string;
};

// all the needed properties will just go on the machine
export type Machine = {
  machineType: MachineType;
  id: number;
  url: string;
  name: string;
  disabled: boolean;
  webCamUrl: string;
  webCamOrientation: WebCamOrientation;
  snapshotUrl: string;
  tools: MachineTool[];
  sortIndex: number;

  apiKey?: string;
  profile: string;
  availableProfiles: Map<string, string>;
};
