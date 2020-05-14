import { Machine, MachineState, MachineStateType } from '@overseer/common/models';

type MachineStateSortType = [Machine, MachineState];
export function machineStateSort(left: MachineStateSortType, right: MachineStateSortType): number {
  const [leftMachine, leftState] = left;
  const [rightMachine, rightState] = right;
  const indexSortResult = leftMachine.sortIndex > rightMachine.sortIndex ? 1 : -1;

  if (!leftState && !rightState) return indexSortResult;
  if (leftState && !rightState) return -1;
  if (!leftState && rightState) return 1;
  if (leftState.type <= MachineStateType.Idle && rightState.type <= MachineStateType.Idle) return indexSortResult;
  if (leftState.type > MachineStateType.Idle && rightState.type <= MachineStateType.Idle) return -1;
  if (leftState.type <= MachineStateType.Idle && rightState.type > MachineStateType.Idle) return 1;

  const minute = 60000;
  const etrLeft = (leftState.estimatedRemainingTime || 0) / minute;
  const etrRight = (rightState.estimatedRemainingTime || 0) / minute;

  if (etrLeft < etrRight) return -1;
  if (etrLeft > etrRight) return 1;

  return 0;
}
