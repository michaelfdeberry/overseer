import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { SettingsService } from "../../services/settings.service";

@Component({
    templateUrl: "./about.component.html",
    styleUrls: [
        "../configuration.scss",
        "./about.component.scss"
    ]
})
export class AboutComponent implements OnInit {
    applicationInfo$: Observable<any>;
    currentYear = new Date().getFullYear();

    constructor(private settingsService: SettingsService) {
    }

    ngOnInit() {
        this.applicationInfo$ = this.settingsService.getApplicationInfo();
    }

    getKeys(obj) {
        return Object.keys(obj);
    }
}
