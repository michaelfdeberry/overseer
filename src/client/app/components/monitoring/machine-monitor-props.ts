import { Machine, MachineState } from '@overseer/common/lib/models';

export type MachineMonitorProps = {
  machine: Machine;
  machineState: MachineState;
};
