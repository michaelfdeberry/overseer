import { Directive, ViewContainerRef } from "@angular/core";
@Directive({
    selector: "[appMachineHost]"
})
export class MachineHostDirective {
    constructor(public viewContainerRef: ViewContainerRef) { }
}
