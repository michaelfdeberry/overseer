export type MachineToolType = 'Undetermined' | 'Heater' | 'Extruder';

export type MachineType = 'Unknown' | 'Octoprint' | 'RepRapFirmware' | 'Bambu';

export type WebCamOrientation = 'Default' | 'FlippedVertically' | 'FlippedHorizontally';

export type MachineTool = {
  toolType: MachineToolType;
  index: number;
  name: string;
};

type MachineBase = {
  machineType: MachineType;
  id: number;
  url: string;
  name: string;
  disabled: boolean;
  webCamUrl: string;
  webCamOrientation: WebCamOrientation;
  tools: MachineTool[];
  sortIndex: number;
};

export type OctoprintMachine = MachineBase & {
  machineType: 'Octoprint';
  apiKey: string;
  profile: string;
  availableProfiles: Map<string, string>;
};

export type RepRapFirmwareMachine = MachineBase & {
  machineType: 'RepRapFirmware';
  password: string;
};

export type BambuMachine = MachineBase & {
  machineType: 'Bambu';
  serial: string;
  accessCode: string;
};

// all the needed properties will just go on the machine
export type Machine = OctoprintMachine | RepRapFirmwareMachine | BambuMachine;
