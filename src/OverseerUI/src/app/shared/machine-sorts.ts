import { Machine } from "../models/machine.model";
import { ApplicationSettings } from "../models/settings.model";
import { MachineMonitor } from "../monitoring/machine-monitor";
import { isIdle } from "../models/machine-status.model";

export function simpleMachineSort(left: Machine, right: Machine): number {
    if (left.sortIndex < right.sortIndex) { return -1; }
    if (left.sortIndex > right.sortIndex) { return 1; }

    return 0;
}

export function timeRemainingMachineSort(left: MachineMonitor, right: MachineMonitor) {
    if (!left.status || !right.status) {
         return simpleMachineSort(left, right);
    }

    if (left.status && !right.status) { return -1; }
    if (!left.status && right.status) { return 1; }

    if (isIdle(left.status.state) && isIdle(right.status.state)) {
        return simpleMachineSort(left, right);
    }

    if (!isIdle(left.status.state) && isIdle(right.status.state)) { return -1; }
    if (isIdle(left.status.state) && !isIdle(right.status.state)) { return 1; }

    const minute = 60000;
    let etrLeft = left.status.estimatedTimeRemaining;
    let etrRight = right.status.estimatedTimeRemaining;
    if (!etrLeft && !etrRight) { return simpleMachineSort(left, right); }
    if (etrLeft && !etrRight) { return -1; }
    if (!etrLeft && etrRight) { return 1; }

    etrLeft /= minute;
    etrRight /= minute;

    if (etrLeft < etrRight) { return -1; }
    if (etrLeft > etrRight) { return 1; }

    return simpleMachineSort(left, right);
}

export function machineSortFunctionFactory(settings: ApplicationSettings): (a: MachineMonitor, b: MachineMonitor) => number {
    if (settings.sortByTimeRemaining) {
        return timeRemainingMachineSort;
    }

    return simpleMachineSort;
}
