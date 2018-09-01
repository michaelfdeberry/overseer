import { Component, OnInit, OnDestroy, Renderer2 } from "@angular/core";
import { ThemeService } from "./shared/theme.service";
import { Subscription } from "rxjs";
import { TranslateService } from "@ngx-translate/core";

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
