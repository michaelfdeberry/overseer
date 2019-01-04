import { Component, Input, ViewChild, OnInit, OnDestroy, ComponentFactoryResolver } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { Subscription } from "rxjs";
import { OctoprintMachineComponent } from "./octoprint-machine.component";
import { RepRapFirmwareMachineComponent } from "./reprapfirmware-machine.component";
import { BaseMachineComponent } from "./base-machine.component";
import { MachineHostDirective } from "./machine-host.directive";
import { MachineType } from "../../../models/machine.model";

@Component({
    selector: "app-machine",
    templateUrl: "./machine-host.component.html"
})
export class MachineHostComponent implements OnInit, OnDestroy {
    constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

    @Input() form: FormGroup;

    @Input() machine: any;

    @ViewChild(MachineHostDirective) machineHost: MachineHostDirective;

    private currentMachineType: MachineType;

    private machineTypeSubscription: Subscription;

    private machineTypeComponentMap = new Map([
        [MachineType.Octoprint, OctoprintMachineComponent],
        [MachineType.RepRapFirmware, RepRapFirmwareMachineComponent]
    ]);

    ngOnInit() {
        this.machineTypeSubscription = this.form.controls.machineType.valueChanges.subscribe((machineType: MachineType) => {
            if (this.currentMachineType === machineType) { return; }

            this.currentMachineType = machineType;
            const configComponentType = this.machineTypeComponentMap.get(machineType);
            if (!configComponentType) { return; }

            const componentFactory = this.componentFactoryResolver.resolveComponentFactory(configComponentType);
            this.machineHost.viewContainerRef.clear();

            const componentRef = this.machineHost.viewContainerRef.createComponent(componentFactory);
            const instance = (<BaseMachineComponent>componentRef.instance);
            instance.form = this.form;
            instance.machine = this.machine;
        });
    }

    ngOnDestroy() {
        this.machineTypeSubscription.unsubscribe();
    }
}
