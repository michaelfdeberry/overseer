import { HttpClient } from "@angular/common/http";
import { Observable, throwError, forkJoin } from "rxjs";
import { catchError, tap, map } from "rxjs/operators";

import { auxiliaryHeaterTypes, Machine, MachineTool, MachineToolType } from "../../../models/machine.model";
import { BaseMachineProvider } from "./machine.provider";
import { MachineStatus, MachineState, TemperatureStatus } from "../../../models/machine-status.model";

export class RepRapFirmwareMachineProvider extends BaseMachineProvider {

    constructor(machine: Machine, private http: HttpClient) {
        super();
        this.machine = machine;
    }

    cancelJob() {
        return super.pauseJob().pipe(tap(() => super.cancelJob()));
    }

    executeGcode(command: string): Observable<any> {
        return this.http.get<any>(this.getUrl("rr_gcode"), { params: { "gcode": command }});
    }

    loadConfiguration(machine: Machine): Observable<any> {
        return this.http.get<any>(this.getUrl("rr_status"), { params: { "type": "2" }})
            .pipe(tap(status => {
                const tools: MachineTool[] = [];
                auxiliaryHeaterTypes.forEach(auxToolType => {
                    const auxTool = status.temps[auxToolType];
                    if (auxTool != null) {
                        tools.push({name: auxToolType, index: auxTool.heater, toolType: MachineToolType.Heater });
                    }
                });

                status.tools.forEach((tool: any) => {
                    tool.heaters.forEach((heaterIndex: number) => {
                        tools.push({name: `heater ${heaterIndex}`, index: heaterIndex, toolType: MachineToolType.Heater});
                    });

                    tool.drives.forEach((extruderIndex: number) => {
                        tools.push({name: `extruder ${extruderIndex}`, index: extruderIndex, toolType: MachineToolType.Extruder});
                    });
                });

                machine.tools = tools;
                this.machine = machine;
            }))
            .pipe(catchError(err => {
                return throwError(new Error("machine_connect_failure"));
            }));
    }

    acquireStatus(): Observable<MachineStatus> {
        return forkJoin(
            this.http.get<any>(this.getUrl("rr_status"), { params: { "type": "2" }}),
            this.http.get<any>(this.getUrl("rr_status"), { params: { "type": "3" }}),
            this.http.get<any>(this.getUrl("rr_fileinfo"))
        )
            .pipe(map(results => {
                const machineStatus = results[0];
                const jobStatus = results[1];
                const fileStatus = results[2];
                const status: MachineStatus = { machineId: this.machine.id, state: MachineState.Idle };

                switch (machineStatus.status) {
                    case "P":
                    case "R":
                        status.state = MachineState.Operational;
                        break;
                    case "D":
                    case "S":
                        status.state = MachineState.Paused;
                        break;
                }

                status.temperatures = this.readTemperatures(machineStatus);

                if (status.state === MachineState.Operational || status.state === MachineState.Paused) {
                    const completion = this.calculateCompletion(jobStatus, fileStatus);
                    status.progress = completion[0];
                    status.estimatedTimeRemaining = completion[1];
                    status.elapsedJobTime = jobStatus.printDuration;
                    status.fanSpeed = this.readFanSpeed(jobStatus, machineStatus);
                    status.feedRate = jobStatus.params.speedFactor;
                    status.flowRates = {};
                    jobStatus.params.extrFactors.forEach((factor: number, index: number) => {
                        status.flowRates[index] = factor;
                    });
                }

                return status;
            }));
    }

    readTemperatures(machineStatus: any): { [key: number]: TemperatureStatus } {
        const temperatures: { [key: number]: TemperatureStatus } = {};

        for (let heaterIndex = 0; heaterIndex < machineStatus.temps.current.length; heaterIndex++) {
            const currentHeater = this.machine.tools.find(tool => tool.toolType === MachineToolType.Heater && tool.index === heaterIndex);
            if (!currentHeater) { continue; }

            if (auxiliaryHeaterTypes.indexOf(currentHeater.name) >= 0) {
                const auxTemp = machineStatus.temps[currentHeater.name];
                if (!auxTemp) { continue; }

                temperatures[currentHeater.index] = {
                    heaterIndex: currentHeater.index,
                    actual: auxTemp.current,
                    target: auxTemp.active
                };
            } else {
                for (let toolIndex = 0; toolIndex < machineStatus.tools.length; toolIndex++) {
                    const tool = machineStatus.tools[toolIndex];
                    const toolHeaterIndex = tool.heaters.indexOf(currentHeater.index);

                    if (toolHeaterIndex < 0) { continue; }

                    temperatures[currentHeater.index] = {
                        heaterIndex: currentHeater.index,
                        actual: machineStatus.temps.current[currentHeater.index],
                        target: machineStatus.temps.tools.active[toolIndex][toolHeaterIndex]
                    };
                }
            }
        }

        return temperatures;
    }

    readFanSpeed(machineStatus: any, jobStatus: any): number {
        if (!jobStatus.params.fanPercent) { return 0; }

        const currentTool = machineStatus.tools[jobStatus.currentTool];
        if (!currentTool) { return 0; }
        if (!currentTool.fans) { return 0; }

        let activeFanIndex: number;
        for (let fanIndex = 0; fanIndex < Math.min(machineStatus.controllableFans, jobStatus.params.fanPercent.length); fanIndex++) {
            // tslint:disable-next-line:no-bitwise
            if ((currentTool.fans & (1 << fanIndex)) !== 0) {
                activeFanIndex = fanIndex;
                break;
            }
        }

        return jobStatus.params.fanPercent[activeFanIndex];
    }

    calculateCompletion(jobStatus: any, fileStatus: any): [number, number] {
        if (!fileStatus) { return; }
        if (fileStatus.err !== 0) { return; }

        try {
            if (fileStatus.filament.length > 0) {
                const filamentNeeded = fileStatus.filament.reduce((result: number, next: number) => result + next, 0);
                const filamentExtruded = fileStatus.extrRaw.reduce((result: number, next: number) => result + next, 0);
                const progress = filamentExtruded  / filamentNeeded * 100;

                return [jobStatus.timesLeft.filament, Math.max(0, progress)];
            } else {
                const progress = jobStatus.coords.xyz[2] / fileStatus.height * 100;
                return [jobStatus.timesLeft.layer, Math.max(0, progress)];
            }
        } catch {
            // noop
        }

        return [jobStatus.timesLeft.file, jobStatus.fractionPrinted];
    }
}
