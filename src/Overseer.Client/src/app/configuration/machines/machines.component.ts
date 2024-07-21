import { Component, OnInit } from "@angular/core";
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";

import { MachinesService } from "../../services/machines.service";
import { MachineType, Machine } from "../../models/machine.model";
import { simpleMachineSort } from "../../shared/machine-sorts";

@Component({
    templateUrl: "./machines.component.html",
    styleUrls: ["../configuration.scss"]
})
export class MachinesComponent implements OnInit {
    constructor(private machinesService: MachinesService) {}

    machines: Machine[];

    getMachineTypeName(machineType: MachineType) {
        return MachineType[machineType];
    }

    ngOnInit() {
        this.machinesService.getMachines()
            .subscribe(machines => this.machines = machines.sort(simpleMachineSort));
    }

    moveUp(index: number) {
        if (index <= 0) { return; }

        this.move(index, --index);
    }

    moveDown(index: number) {
        if (index >= this.machines.length) { return; }

        this.move(index, ++index);
    }

    move(previousIndex: number, currentIndex: number) {
        moveItemInArray(this.machines, previousIndex, currentIndex);
        this.machinesService.sortMachines(this.machines.map(m => m.id)).subscribe();
    }

    drop(event: CdkDragDrop<string[]>) {
        this.move(event.previousIndex, event.currentIndex);
    }
}
