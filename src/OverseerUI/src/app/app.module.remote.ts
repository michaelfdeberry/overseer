import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { ErrorHandler, NgModule } from "@angular/core";
import { FlexLayoutModule } from "@angular/flex-layout";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule } from "@angular/router";
import { NgProgressModule } from "@ngx-progressbar/core";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { LoggerModule, NgxLoggerLevel } from "ngx-logger";
import { WebStorageModule } from "ngx-store";
import { OverseerHttpInterceptor } from "./app-http-interceptor";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { AlertDialogComponent } from "./dialogs/alert-dialog.component";
import { DialogService } from "./dialogs/dialog.service";
import { PromptDialogComponent } from "./dialogs/prompt-dialog.component";
import { LoginComponent } from "./login/login.component";
import { SsoComponent } from "./login/sso.component";
import { AppMaterialModule } from "./material-imports.module";
import { MachineMonitorFilterPipe } from "./monitoring/machine-monitor-filter.pipe";
import { MachineMonitorComponent } from "./monitoring/machine-monitor.component";
import { MonitoringComponent } from "./monitoring/monitoring.component";
import { TuneDialogComponent } from "./monitoring/tune-dialog.component";
import { TuneDialogService } from "./monitoring/tune-dialog.service";
import { NavigationComponent } from "./navigation/navigation.component";
import { AuthenticationService } from "./services/authentication.service";
import { ControlService } from "./services/control.service";
import { OverseerErrorHandler } from "./services/error-handler.service";
import { LoaderService } from "./services/loader.service";
import { LoggingService } from "./services/logging.service";
import { MachinesService } from "./services/machines.service";
import { MonitoringService } from "./services/monitoring.service";
import { RemoteAuthenticationService } from "./services/remote/authentication.service";
import { RemoteControlService } from "./services/remote/control.service";
import { RemoteLoggingService } from "./services/remote/logging.service";
import { RemoteMachinesService } from "./services/remote/machines.service";
import { RemoteSettingsService } from "./services/remote/settings.service";
import { SignalrCoreMonitoringService } from "./services/remote/signalr-core-monitoring.service";
import { RemoteUsersService } from "./services/remote/users.service";
import { WindowService } from "./services/remote/window.service";
import { SettingsService } from "./services/settings.service";
import { ThemeService } from "./services/theme.service";
import { UsersService } from "./services/users.service";
import { AccessLevelGuard, AuthenticationGuard } from "./shared/authentication-guard";
import { DisabledForDirective, HiddenForDirective } from "./shared/authorization.directive";
import { DurationPipe } from "./shared/duration.pipe";
import { LetDirective } from "./shared/let.directive";

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
        SsoComponent,
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
        LoggerModule.forRoot({
            level: NgxLoggerLevel.DEBUG,
            serverLogLevel: NgxLoggerLevel.INFO
        })
    ],
    providers: [
        LoaderService,
        AuthenticationGuard,
        AccessLevelGuard,
        DialogService,
        TuneDialogService,
        ThemeService,
        { provide: HTTP_INTERCEPTORS, useClass: OverseerHttpInterceptor, multi: true },
        { provide: MonitoringService, useClass: SignalrCoreMonitoringService },
        { provide: AuthenticationService, useClass: RemoteAuthenticationService },
        { provide: ControlService, useClass: RemoteControlService },
        { provide: MachinesService, useClass: RemoteMachinesService },
        { provide: SettingsService, useClass: RemoteSettingsService },
        { provide: UsersService, useClass: RemoteUsersService },
        { provide: LoggingService, useClass: RemoteLoggingService },
        { provide: ErrorHandler, useClass: OverseerErrorHandler },
        { provide: WindowService, useValue: window }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
