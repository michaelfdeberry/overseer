import { HttpClient, HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FlexLayoutModule } from "@angular/flex-layout";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule } from "@angular/router";
import { NgProgressModule } from "@ngx-progressbar/core";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { WebStorageModule } from "ngx-store";
import { providers } from "./app-providers-remote";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { AlertDialogComponent } from "./dialogs/alert-dialog.component";
import { PromptDialogComponent } from "./dialogs/prompt-dialog.component";
import { LoginComponent } from "./login/login.component";
import { AppMaterialModule } from "./material-imports.module";
import { MachineMonitorFilterPipe } from "./monitoring/machine-monitor-filter.pipe";
import { MachineMonitorComponent } from "./monitoring/machine-monitor.component";
import { MonitoringComponent } from "./monitoring/monitoring.component";
import { TuneDialogComponent } from "./monitoring/tune-dialog.component";
import { NavigationComponent } from "./navigation/navigation.component";
import { WindowService } from "./services/remote/window.service";
import { DurationPipe } from "./shared/duration.pipe";
import { LetDirective } from "./shared/let.directive";
import { HiddenForDirective, DisabledForDirective } from "./shared/authorization.directive";

export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http);
}

@NgModule({
    entryComponents: [
        AlertDialogComponent,
        PromptDialogComponent,
        TuneDialogComponent
    ],
    declarations: [
        AppComponent,
        NavigationComponent,
        MonitoringComponent,
        MachineMonitorComponent,
        LoginComponent,
        DurationPipe,
        MachineMonitorFilterPipe,
        AlertDialogComponent,
        PromptDialogComponent,
        TuneDialogComponent,
        LetDirective,
        HiddenForDirective,
        DisabledForDirective
    ],
    imports: [
        AppRoutingModule,
        NgProgressModule.withConfig({
            spinner: false,
            thick: true
        }),
        RouterModule,
        HttpClientModule,
        BrowserModule,
        BrowserAnimationsModule,
        AppMaterialModule,
        WebStorageModule,
        FormsModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
    ],
    providers: [
        ...providers,
        { provide: WindowService, useValue: window }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
