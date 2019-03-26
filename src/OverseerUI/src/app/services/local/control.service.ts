import { Injectable } from "@angular/core";
import { ControlService } from "../control.service";
import { Observable } from "rxjs";
import { MachineProviderService } from "./providers/machine-provider.service";
import { MachineToolType } from "../../models/machine.model";
import { MachineProvider } from "./providers/machine.provider";
import { MachinesService } from "../machines.service";
import { map, flatMap } from "rxjs/operators";
import { RequireAdministrator } from "../../shared/require-admin.decorator";

@Injectable({ providedIn: "root" })
export class LocalControlService implements ControlService {
    constructor(private machinesService: MachinesService, private machineProviderService: MachineProviderService) {}

    private getProvider(machineId: number): Observable<MachineProvider> {
        return this.machinesService.getMachine(machineId)
            .pipe(map(machine => this.machineProviderService.getProvider(machine)));
    }

    @RequireAdministrator()
    pauseJob(machineId: number): Observable<Object> {
        return this.getProvider(machineId).pipe(flatMap(provider => provider.pauseJob()));
    }

    @RequireAdministrator()
    resumeJob(machineId: number): Observable<Object> {
        return this.getProvider(machineId).pipe(flatMap(provider => provider.resumeJob()));
    }

    @RequireAdministrator()
    cancelJob(machineId: number): Observable<Object> {
        return this.getProvider(machineId).pipe(flatMap(provider => provider.cancelJob()));
    }

    @RequireAdministrator()
    setFanSpeed(machineId: number, speedPercentage: number): Observable<Object> {
        return this.getProvider(machineId).pipe(flatMap(provider => provider.setFanSpeed(speedPercentage)));
    }

    @RequireAdministrator()
    setFeedRate(machineId: number, speedPercentage: number): Observable<Object> {
        return this.getProvider(machineId).pipe(flatMap(provider => provider.setFeedRate(speedPercentage)));
    }

    @RequireAdministrator()
    setTemperature(machineId: number, heaterIndex: number, temperature: number): Observable<Object> {
        const self = this;
        return self.machinesService.getMachine(machineId).
            pipe(flatMap(function(machine) {
                if (machine.tools.find(t => t.toolType === MachineToolType.Heater && t.index === heaterIndex && t.name === "bed")) {
                    return self.getProvider(machineId)
                        .pipe(flatMap(provider => provider.setBedTemperature(temperature)));
                }

                return self.getProvider(machineId)
                    .pipe(flatMap(provider => provider.setToolTemperature(heaterIndex, temperature)));
            }));
    }

    @RequireAdministrator()
    setFlowRate(machineId: number, extruderIndex: number, flowRatePercentage: number): Observable<Object> {
        return this.getProvider(machineId).pipe(flatMap(provider => provider.setFlowRate(extruderIndex, flowRatePercentage)));
    }
}
