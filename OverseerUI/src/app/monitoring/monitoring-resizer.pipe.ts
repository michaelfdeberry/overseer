import { Pipe, PipeTransform, OnDestroy } from "@angular/core";
import { PrinterMonitor, PrinterDimensions } from "./printer-monitor.type";
import { OverseerWindow } from "./monitoring.service";

@Pipe({ name: "resizer"})
export class MonitoringResizerPipe implements PipeTransform, OnDestroy {
    dimensions: PrinterDimensions;
    printers: Array<PrinterMonitor>;

    constructor(private window: OverseerWindow) {
        window.addEventListener("resize", this.handleResize.bind(this), false);
    }

    ngOnDestroy() {
        this.window.removeEventListener("resize", this.handleResize.bind(this), false);
    }

    handleResize() {
        this.calculate(this.printers);
    }

    transform(visiblePrinters: Array<PrinterMonitor>): Array<PrinterMonitor> {
        this.calculate(visiblePrinters);
        // cache the currently visible printer reference so they are available
        // in the case of resizes.
        this.printers = visiblePrinters;

        return visiblePrinters;
    }

    calculate(printers: Array<PrinterMonitor>) {
        if (!printers || !printers.length) {
            return;
        }

        const count = printers.length;
        const body = this.window.document.body;
        const nav = this.window.document.querySelector("app-navigation");
        const availableHeight = body.clientHeight - Math.max(nav.clientHeight, 64);
        const aspectRatio = 16 / 9;
        const pixelRatio = this.window.devicePixelRatio || 1;
        let width: number;
        let height: number;

        if (body.clientWidth / pixelRatio < 960) {
            width = 100;
            height = body.clientWidth / (4 / 3);
        } else {
            let rows = 1;
            if (count > 2 && count <= 4) {
                rows = 2;
            } else if (count > 4) {
                rows = Math.floor(count / 4) + (count % 4 > 0 ? 1 : 0);
            }

            const columns = Math.ceil(count / rows);
            width = 100 / columns;
            height = rows > 4 ? body.clientWidth / columns / aspectRatio : availableHeight / rows;
        }

        this.dimensions = {
            height: height,
            width: width
        };

        printers.forEach(printer => printer.dimensions$.next(this.dimensions));
    }
}
