import { Component, OnInit } from "@angular/core";

import { ConfigurationService } from "../../shared/configuration.service";
import { Observable } from "rxjs";

@Component({
    templateUrl: "./configuration-printers.component.html",
    styleUrls: ["../configuration.scss"]
})
export class ConfigurationPrintersComponent implements OnInit {
    constructor(private configurationService: ConfigurationService) {}

    printers$: Observable<any[]>;

    ngOnInit() {
        this.printers$ = this.configurationService.getPrinters();
    }
}
