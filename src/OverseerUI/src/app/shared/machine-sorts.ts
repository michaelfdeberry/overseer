import { Machine } from "../models/machine.model";

export function simpleMachineSort(left: Machine, right: Machine): number {
    if (left.sortIndex < right.sortIndex) { return -1; }
    if (left.sortIndex > right.sortIndex) { return 1; }

    return 0;
}
