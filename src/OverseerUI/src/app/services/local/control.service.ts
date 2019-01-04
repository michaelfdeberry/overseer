import { Injectable } from "@angular/core";
import { ControlService } from "../control.service";
import { Observable } from "rxjs";
import { LocalStorageService } from "ngx-store";
import { MachineProviderService } from "./providers/machine-provider.service";
import { Machine, MachineToolType } from "../../models/machine.model";
import { MachineProvider } from "./providers/machine.provider";

@Injectable({ providedIn: "root" })
export class LocalControlService implements ControlService {
    constructor(private localStorage: LocalStorageService, private machineProviderService: MachineProviderService) {}

    getMachine(machineId: number): Machine {
        const machines: Machine[] = this.localStorage.get("machines");
        return machines.find(m => m.id === machineId);
    }

    getProvider(machineId: number): MachineProvider {
        return this.machineProviderService.getProvider(this.getMachine(machineId));
    }

    pauseJob(machineId: number): Observable<Object> {
        return this.getProvider(machineId).pauseJob();
    }

    resumeJob(machineId: number): Observable<Object> {
        return this.getProvider(machineId).resumeJob();
    }

    cancelJob(machineId: number): Observable<Object> {
        return this.getProvider(machineId).cancelJob();
    }

    setFanSpeed(machineId: number, speedPercentage: number): Observable<Object> {
        return this.getProvider(machineId).setFanSpeed(speedPercentage);
    }

    setFeedRate(machineId: number, speedPercentage: number): Observable<Object> {
        return this.getProvider(machineId).setFeedRate(speedPercentage);
    }

    setTemperature(machineId: number, heaterIndex: number, temperature: number): Observable<Object> {
        const machine = this.getMachine(machineId);
        if (machine.tools.find(t => t.toolType === MachineToolType.Heater && t.index === heaterIndex && t.name === "bed")) {
            return this.getProvider(machineId).setBedTemperature(temperature);
        }

        return this.getProvider(machineId).setToolTemperature(heaterIndex, temperature);
    }

    setFlowRate(machineId: number, extruderIndex: number, flowRatePercentage: number): Observable<Object> {
        return this.getProvider(machineId).setFlowRate(extruderIndex, flowRatePercentage);
    }
}
