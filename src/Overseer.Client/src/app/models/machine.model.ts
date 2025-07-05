export type MachineToolType = 'Undetermined' | 'Heater' | 'Extruder';

export type MachineType = 'Unknown' | 'Octoprint' | 'RepRapFirmware' | 'Bambu' | 'Elegoo' | 'Moonraker';

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

export type BambuLabMachine = MachineBase & {
  machineType: 'Bambu';
  serial: string;
  accessCode: string;
};

export type ElegooMachine = MachineBase & {
  machineType: 'Elegoo';
  ipAddress: string;
};

export type MoonrakerMachine = MachineBase & {
  machineType: 'Moonraker';
  ipAddress: string;
  availableWebCams: Record<string, string>;
};

// all the needed properties will just go on the machine
export type Machine = OctoprintMachine | RepRapFirmwareMachine | BambuLabMachine | ElegooMachine | MoonrakerMachine;
