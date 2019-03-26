import { ElementRef, Input, Directive, OnDestroy } from "@angular/core";
import { AccessLevel } from "../models/user.model";
import { AuthenticationService } from "../services/authentication.service";
import { Subscription } from "rxjs";

abstract class AuthorizationDirective implements OnDestroy {
    private accessLevelValue: AccessLevel;
    private authChangeSubscription: Subscription;

    set accessLevel(value: AccessLevel) {
        this.accessLevelValue = value;
        this.update();
    }

    get accessLevel() {
        return this.accessLevelValue;
    }

    constructor(private authenticationService: AuthenticationService) {
        this.authChangeSubscription = this.authenticationService.authenticationChangeEvent$
            .subscribe(() => this.update());
    }

    abstract accessApproved(): void;

    abstract accessDenied(): void;

    update(): void {
        const user = this.authenticationService.activeUser;

        if (!user || user.accessLevel <= this.accessLevel) {
            this.accessDenied();
        } else {
            this.accessApproved();
        }
    }

    ngOnDestroy() {
        if (this.authChangeSubscription) {
            this.authChangeSubscription.unsubscribe();
        }
    }
}

@Directive({
    selector: "[appHiddenFor]"
})
export class HiddenForDirective extends AuthorizationDirective {
    constructor(private elementRef: ElementRef, authenticationService: AuthenticationService) {
        super(authenticationService);
    }

    @Input()
    set appHiddenFor(value: "Readonly" | "Administrator") {
        this.accessLevel = AccessLevel[value];
    }

    accessApproved(): void {
        this.elementRef.nativeElement.classList.remove("authorize-hidden");
    }

    accessDenied(): void {
        this.elementRef.nativeElement.classList.add("authorize-hidden");
    }
}

@Directive({
    selector: "[appDisabledFor]"
})
export class DisabledForDirective extends AuthorizationDirective {
    constructor(private elementRef: ElementRef, authenticationService: AuthenticationService) {
        super(authenticationService);
    }

    @Input()
    set appDisabledFor(value: "Readonly" | "Administrator") {
        this.accessLevel = AccessLevel[value];
    }

    accessApproved(): void {
        this.elementRef.nativeElement.disabled = false;
    }

    accessDenied(): void {
        this.elementRef.nativeElement.disabled = false;
    }
}
