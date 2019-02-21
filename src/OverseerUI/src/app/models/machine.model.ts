export const auxiliaryHeaterTypes = ["bed", "chamber", "cabinet"];

export enum MachineToolType {
    Undetermined,
    Heater,
    Extruder
}

export enum MachineType {
    Unknown,
    Octoprint,
    RepRapFirmware
}

export interface MachineTool {
    toolType: MachineToolType;
    index: number;
    name: string;
}

// all the needed properties will just go on the machine
export interface Machine {
    machineType: MachineType;
    id: number;
    url: string;
    name: string;
    disabled: boolean;
    webCamUrl: string;
    snapshotUrl: string;
    tools: MachineTool[];
    sortIndex: number;

    apiKey?: string;
    profile: string;
    availableProfiles: Map<string, string>;
}
