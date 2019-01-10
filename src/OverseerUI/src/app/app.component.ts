import { Component, OnDestroy, OnInit, Renderer2 } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Subscription } from "rxjs";
import { ThemeService } from "./services/theme.service";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html"
})
export class AppComponent implements OnInit, OnDestroy {
    themeSubscription: Subscription;

    constructor(
        private themeService: ThemeService,
        private renderer: Renderer2,
        translate: TranslateService
    ) {
        translate.setDefaultLang("en");
        translate.use(translate.getBrowserLang() || "en");
    }

    get primaryColor() {
        return this.themeService.primaryColor;
    }

    ngOnInit() {
        this.themeSubscription = this.themeService.theme$.subscribe(theme => {
            if (theme.previous) {
                this.renderer.removeClass(document.body, theme.previous);
            }
            this.renderer.addClass(document.body, theme.current);
        });
    }

    ngOnDestroy() {
        this.themeSubscription.unsubscribe();
    }
}
