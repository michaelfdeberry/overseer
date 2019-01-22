import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { MachinesService } from "../../services/machines.service";
import { MachineType } from "../../models/machine.model";

@Component({
    templateUrl: "./machines.component.html",
    styleUrls: ["../configuration.scss"]
})
export class MachinesComponent implements OnInit {
    constructor(private machinesService: MachinesService) {}

    machines$: Observable<any[]>;

    getMachineTypeName(machineType: MachineType) {
        return MachineType[machineType];
    }

    ngOnInit() {
        this.machines$ = this.machinesService.getMachines();
    }
}
