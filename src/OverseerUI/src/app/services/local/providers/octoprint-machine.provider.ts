import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Observable, throwError, forkJoin, defer, ObservableInput } from "rxjs";
import { tap, catchError, map } from "rxjs/operators";

import { BaseMachineProvider } from "./machine.provider";
import { Machine, MachineTool, MachineToolType } from "../../../models/machine.model";
import { MachineStatus, MachineState, TemperatureStatus } from "../../../models/machine-status.model";
import { processUrl } from "./url-processor";

export class OctoprintMachineProvider extends BaseMachineProvider {
    constructor(
        machine: Machine,
        private http: HttpClient
    ) {
        super();
        this.machine = machine;
    }

    get httpOptions() {
        return { headers: { "X-Api-Key": this.machine.apiKey } };
    }

    pauseJob(): Observable<any> {
        return this.http.post(this.getUrl("api/job"), { command: "pause", action: "pause" }, this.httpOptions);
    }

    resumeJob(): Observable<any> {
        return this.http.post(this.getUrl("api/job"), { command: "pause", action: "resume" }, this.httpOptions);
    }

    cancelJob(): Observable<any> {
        return this.http.post(this.getUrl("api/job"), { command: "cancel" }, this.httpOptions);
    }

    executeGcode(command: string): Observable<any> {
        return this.http.post(this.getUrl("api/printer/command"), { command: command }, this.httpOptions);
    }

    loadConfiguration(machine: Machine): Observable<any> {
        machine.url = processUrl(machine.url);

        return forkJoin(
            this.http.get<any>(processUrl(machine.url, "api/settings"), this.httpOptions),
            this.http.get<any>(processUrl(machine.url, "api/printerprofiles"), this.httpOptions)
        )
            .pipe(tap(results => {
                const settings = results[0];
                const profiles = results[1];

                if (!machine.webCamUrl) {
                    machine.webCamUrl = processUrl(machine.url, settings.webcam.streamUrl);
                }

                if (!machine.snapshotUrl) {
                    machine.snapshotUrl = processUrl(machine.url, settings.webcam.snapshotUrl);
                }

                machine.availableProfiles = new Map();
                for (const profileKey in profiles.profiles) {
                    if (!profiles.profiles.hasOwnProperty(profileKey)) {continue; }

                    const profile = profiles.profiles[profileKey];
                    machine.availableProfiles.set(profile.id, profile.name);

                    if (profile.current) {
                        const tools: MachineTool[] = [];

                        if (profile.heatedBed) {
                            tools.push({ toolType: MachineToolType.Heater, index: -1, name: "bed" });
                        }

                        if (profile.extruder.sharedNozzle) {
                            tools.push({ toolType: MachineToolType.Heater, index: 0, name: "heater 0" });
                        }

                        for (let index = 0; index < profile.extruder.count; index++) {
                            if (!profile.extruder.sharedNozzle) {
                                tools.push({ toolType: MachineToolType.Heater, index: index, name: `heater ${index}` });
                            }

                            tools.push({ toolType: MachineToolType.Extruder, index: index, name: `extruder ${index}` });
                        }

                        machine.tools = tools;
                        machine.profile = profile.name;
                    }
                }

                this.machine = machine;
            }))
            .pipe(catchError((err: HttpErrorResponse) => {
                if (err.message.indexOf("Invalid API key") >= 0) {
                    return throwError(new Error("octoprint_invalid_key"));
                }

                return throwError(new Error("machine_connect_failure"));
            }));
    }

    getHeaterIndex(heaterKey: string): number {
        if (heaterKey.toLowerCase() === "bed") { return -1; }
        return parseInt(heaterKey.replace("tool", ""), 10);
    }

    acquireStatus(): Observable<MachineStatus> {
        const self = this;
        const status: MachineStatus = {
            machineId: self.machine.id,
            state: MachineState.Idle,
            temperatures: {}
        };

        return defer(async function() {
            const machineState = await self.http.get<any>(self.getUrl("api/printer"), self.httpOptions).toPromise();

            // tslint:disable-next-line:forin
            for (const key in machineState.temperature) {
                const temp = machineState.temperature[key];
                const index = self.getHeaterIndex(key);

                status.temperatures[index] = {
                    heaterIndex: index,
                    actual: temp.actual,
                    target: temp.target
                };
            }

            const flags = machineState.state.flags;
            if (flags.paused || flags.pausing) {
                status.state = MachineState.Paused;
            } else if (flags.printing || flags.resuming) {
                status.state = MachineState.Operational;
            } else {
                status.state = MachineState.Idle;
            }

            if (status.state === MachineState.Operational || status.state === MachineState.Paused) {
                const jobStatus = await self.http.get<any>(self.getUrl("api/job"), self.httpOptions).toPromise();
                status.elapsedJobTime = jobStatus.progress.printTime;
                status.estimatedTimeRemaining = jobStatus.progress.printTimeLeft;
                status.progress = jobStatus.progress.completion;
                status.fanSpeed = 100;
                status.feedRate = 100;
                status.flowRates = self.machine.tools
                    .filter(tool => tool.toolType === MachineToolType.Extruder)
                    .reduce((obj, tool) => {
                        obj[tool.index] = 100;
                        return obj;
                    }, {});
            }

            return status;
        });
    }
}
