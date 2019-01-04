import { Component, Input } from "@angular/core";
import { ThemeService } from "../../services/theme.service";
import { FormGroup } from "@angular/forms";

@Component({
    selector: "app-theme-selector",
    templateUrl: "./theme-selector-component.html"
})
export class ThemeSelectorComponent {
    @Input()
    form: FormGroup;

    get availableThemes() {
        return this.themeService.themes;
    }

    get currentTheme() {
        return this.themeService.currentTheme;
    }

    constructor(private themeService: ThemeService) {}

    updateTheme(className: string) {
        this.themeService.applyTheme(className);
    }
}
