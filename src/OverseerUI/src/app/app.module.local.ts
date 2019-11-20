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
import { LocalAuthenticationService } from "./services/local/authentication.service";
import { LocalControlService } from "./services/local/control.service";
import { LocalLoggingService } from "./services/local/logging.service";
import { LocalMachinesService } from "./services/local/machines.service";
import { LocalMonitoringService } from "./services/local/monitoring.service";
import { LocalSettingsService } from "./services/local/settings.service";
import { LocalUsersService } from "./services/local/users.service";
import { LoggingService } from "./services/logging.service";
import { MachinesService } from "./services/machines.service";
import { MonitoringService } from "./services/monitoring.service";
import { SettingsService } from "./services/settings.service";
import { ThemeService } from "./services/theme.service";
import { UsersService } from "./services/users.service";
import { AccessLevelGuard, AuthenticationGuard } from "./shared/authentication-guard";
import { DisabledForDirective, HiddenForDirective } from "./shared/authorization.directive";
import { DurationPipe } from "./shared/duration.pipe";
import { LetDirective } from "./shared/let.directive";
import { NgxIndexedDBModule } from "ngx-indexed-db";
import { AccessLevel } from "./models/user.model";
import { environment } from "../environments/environment";
import { Machine, WebCamOrientation } from "./models/machine.model";

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
        }),
        NgxIndexedDBModule.forRoot({
            name: "overseer",
            version: environment.dbVersion,
            objectStoresMeta: [{
                store: "machines",
                storeConfig: { keyPath: "id", autoIncrement: true },
                storeSchema: []
            }, {
                store: "users",
                storeConfig: { keyPath: "id", autoIncrement: true },
                storeSchema: [{
                    name: "username", keypath: "username", options: { unique: true }
                }]
            }, {
                store: "logging",
                storeConfig: { keyPath: "id", autoIncrement: true },
                storeSchema: []
            }],
            objectStoresMigration: {
                4: (db, transaction) => {
                    const store = transaction.objectStore("users");
                    const request = store.openCursor();

                    // convert existing users to admins now that readonly users are supported.
                    request.onsuccess = function(event: any) {
                        const cursor: IDBCursorWithValue = event.target.result;

                        if (cursor) {
                            const user = cursor.value;
                            if (user.accessLevel === undefined || user.accessLevel === null) {
                                user.accessLevel = AccessLevel.Administrator;
                            }

                            cursor.update(user);
                            cursor.continue();
                        }
                    };
                },
                7: (db, transaction) => {
                    const store = transaction.objectStore("machines");
                    const request = store.openCursor();

                    request.onsuccess = function(event: any) {
                        const cursor: IDBCursorWithValue = event.target.result;

                        if (cursor) {
                            const machine: Machine = cursor.value;
                            machine.webCamOrientation = WebCamOrientation.Default;

                            cursor.update(machine);
                            cursor.continue();
                        }
                    };
                }
            }
        })
    ],
    providers: [
        LoaderService,
        AuthenticationGuard,
        AccessLevelGuard,
        DialogService,
        TuneDialogService,
        ThemeService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: OverseerHttpInterceptor,
            multi: true
        },
        {
            provide: MonitoringService,
            useClass: LocalMonitoringService
        },
        {
            provide: AuthenticationService,
            useClass: LocalAuthenticationService
        },
        {
            provide: ControlService,
            useClass: LocalControlService
        },
        {
            provide: MachinesService,
            useClass: LocalMachinesService
        },
        {
            provide: SettingsService,
            useClass: LocalSettingsService
        },
        {
            provide: UsersService,
            useClass: LocalUsersService
        },
        {
            provide: LoggingService,
            useClass: LocalLoggingService
        },
        {
            provide: ErrorHandler,
            useClass: OverseerErrorHandler
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
