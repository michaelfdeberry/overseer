import { Directive, ViewContainerRef } from "@angular/core";
@Directive({
    selector: "[appConfigHost]"
})
export class PrinterConfigDirective {
    constructor(public viewContainerRef: ViewContainerRef) { }
}