import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { UsersService } from "../../services/users.service";
import { AccessLevel, User } from "../../models/user.model";

@Component({
    templateUrl: "./users.component.html",
    styleUrls: ["../configuration.scss"]
})
export class UsersComponent implements OnInit {
    constructor(private usersService: UsersService) {}

    users$: Observable<User[]>;

    ngOnInit() {
        this.users$ = this.usersService.getUsers();
    }

    getUserAccessLevelName(accessLevel: AccessLevel) {
        return AccessLevel[accessLevel];
    }
}
