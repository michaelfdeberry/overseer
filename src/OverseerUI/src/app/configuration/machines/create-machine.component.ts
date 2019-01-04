import { Component, Input, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { machineTypes } from "../display-option.type";

@Component({
    selector: "app-create-machine",
    templateUrl: "./create-machine.component.html"
})
export class CreateMachineComponent {
    @Input()
    form: FormGroup;

    machineTypes = machineTypes;
}
