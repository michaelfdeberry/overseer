import { Pipe, PipeTransform } from "@angular/core";
import { PrinterMonitor } from "./printer-monitor.type";

@Pipe({ name: "visibilityFilter"})
export class PrinterFilterPipe implements PipeTransform {
    transform(printers: Array<PrinterMonitor>): Array<PrinterMonitor> {
        if (!printers) {
            return printers;
        }

        return printers.filter(printer => printer.isVisible);
    }
}
