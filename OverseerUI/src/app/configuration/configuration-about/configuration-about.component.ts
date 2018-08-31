import { Component, OnInit } from "@angular/core";
import { ConfigurationService } from "../../shared/configuration.service";
import { Observable } from "rxjs";

@Component({
    selector: "app-configuration-about",
    templateUrl: "./configuration-about.component.html",
    styleUrls: ["./configuration-about.component.scss"]
})
export class ConfigurationAboutComponent implements OnInit {
    applicationInfo$: Observable<any>;
    currentYear = new Date().getFullYear();

    constructor(private configurationService: ConfigurationService) {
    }

    ngOnInit() {
        this.applicationInfo$ = this.configurationService.getApplicationInfo();
    }

    getKeys(obj) {
        return Object.keys(obj);
    }
}
