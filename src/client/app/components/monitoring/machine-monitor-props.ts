import { Machine, MachineState } from '@overseer/common/models';

export type MachineMonitorProps = {
  machine: Machine;
  machineState: MachineState;
};
