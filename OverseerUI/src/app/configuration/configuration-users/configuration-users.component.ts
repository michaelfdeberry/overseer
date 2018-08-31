import { Component, OnInit } from "@angular/core";
import { ConfigurationService } from "../../shared/configuration.service";
import { Observable } from "rxjs";

@Component({
    templateUrl: "./configuration-users.component.html",
    styleUrls: ["../configuration.scss"]
})
export class ConfigurationUsersComponent implements OnInit {
    constructor(private configurationService: ConfigurationService) {}

    users$: Observable<any>;

    ngOnInit() {
        this.users$ = this.configurationService.getUsers();
    }
}
