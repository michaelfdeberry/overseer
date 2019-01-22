import { Pipe, PipeTransform } from "@angular/core";
import { MachineMonitor } from "./machine-monitor";

@Pipe({ name: "machineMonitorFilter"})
export class MachineMonitorFilterPipe implements PipeTransform {
    transform(machines: Array<MachineMonitor>): Array<MachineMonitor> {
        if (!machines) {
            return machines;
        }

        return machines.filter(machine => machine.isVisible);
    }
}
