import { MachineToolType } from './machine-tool.enum';

export const auxiliaryHeaterTypes = ['bed', 'chamber', 'cabinet'];

export interface MachineTool {
  type: MachineToolType;
  name: string;
  index: number;
}
