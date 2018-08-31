import { Component, Input, ViewChild, OnInit, OnDestroy, ComponentFactoryResolver } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { Subscription } from "rxjs";
import { OctoprintConfigComponent } from "./octoprint-config.component";
import { RepRapFirmwareConfigComponent } from "./reprapfirmware-config.component";
import { PrinterConfigComponentBase } from "./printer-config-base.component";
import { PrinterConfigDirective } from "./printer-config.directive";

@Component({
    selector: "app-printer-config",
    templateUrl: "./printer-config.component.html"
})
export class PrinterConfigComponent implements OnInit, OnDestroy {
    constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

    @Input() form: FormGroup;

    @Input() printer: any;

    @ViewChild(PrinterConfigDirective) configHost: PrinterConfigDirective;

    private currentPrinterType: string;

    private printerTypeSubscription: Subscription;

    private printerTypeComponentMap = {
        Octoprint: OctoprintConfigComponent,
        RepRap: RepRapFirmwareConfigComponent
    };

    ngOnInit() {
        this.printerTypeSubscription = this.form.controls.printerType.valueChanges.subscribe(printerType => {
            if (this.currentPrinterType === printerType) { return; }

            this.currentPrinterType = printerType;

            const configComponentType = this.printerTypeComponentMap[printerType];
            if (!configComponentType) { return; }

            const componentFactory = this.componentFactoryResolver.resolveComponentFactory(configComponentType);
            this.configHost.viewContainerRef.clear();

            const componentRef = this.configHost.viewContainerRef.createComponent(componentFactory);
            const instance = (<PrinterConfigComponentBase>componentRef.instance);
            instance.form = this.form;
            instance.printer = this.printer;
        });
    }

    ngOnDestroy() {
        this.printerTypeSubscription.unsubscribe();
    }
}
