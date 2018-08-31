import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { HttpClientModule, HTTP_INTERCEPTORS, HttpClient } from "@angular/common/http";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgProgressModule } from "@ngx-progressbar/core";
import { WebStorageModule } from "ngx-store";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";

import { AppComponent } from "./app.component";
import { AppMaterialModule } from "./shared/material-imports.module";
import { NavigationComponent } from "./navigation/navigation.component";
import { MonitoringComponent } from "./monitoring/monitoring.component";
import { AuthenticationService } from "./shared/authentication.service";
import { ConfigurationService } from "./shared/configuration.service";
import { OverseerHttpInterceptor } from "./app-http-interceptor";
import { LoaderService } from "./shared/loader.service";
import { LoginComponent } from "./login/login.component";
import { AuthenticationGuard } from "./shared/authentication-guard.service";
import { ControlService } from "./shared/control.service";
import { MonitoringService, OverseerWindow } from "./monitoring/monitoring.service";
import { DialogService } from "./dialogs/dialog.service";
import { MonitoringPrinterComponent } from "./monitoring/monitoring-printer.component";
import { DurationPipe } from "./shared/duration.pipe";
import { PrinterFilterPipe } from "./monitoring/printer-monitor-filter.pipe";
import { MonitoringResizerPipe } from "./monitoring/monitoring-resizer.pipe";
import { MonitoringTuneDialogComponent, MonitoringTuneDialogService } from "./monitoring/monitoring-tune-dialog.component";
import { AlertDialogComponent } from "./dialogs/alert-dialog.component";
import { PromptDialogComponent } from "./dialogs/prompt-dialog.component";
import { ThemeService } from "./shared/theme.service";
import { AppRoutingModule } from "./app-routing.module";


export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http);
}

@NgModule({
    entryComponents: [
        AlertDialogComponent,
        PromptDialogComponent,
        MonitoringTuneDialogComponent,
    ],
    declarations: [
        AppComponent,
        NavigationComponent,
        MonitoringComponent,
        MonitoringPrinterComponent,
        MonitoringTuneDialogComponent,
        LoginComponent,
        DurationPipe,
        PrinterFilterPipe,
        MonitoringResizerPipe,
        AlertDialogComponent,
        PromptDialogComponent,
    ],
    imports: [
        AppRoutingModule,
        NgProgressModule.forRoot({
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
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        })
    ],
    providers: [
        LoaderService,
        AuthenticationGuard,
        AuthenticationService,
        ConfigurationService,
        ControlService,
        MonitoringService,
        DialogService,
        MonitoringTuneDialogService,
        ThemeService,
        { provide: HTTP_INTERCEPTORS, useClass: OverseerHttpInterceptor, multi: true },
        { provide: OverseerWindow, useValue: window }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
