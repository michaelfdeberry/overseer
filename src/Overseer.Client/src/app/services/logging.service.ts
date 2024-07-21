import { Injectable } from "@angular/core";
import { NGXLogger } from "ngx-logger";

@Injectable({ providedIn: "root" })
export abstract class LoggingService {
    abstract readonly logger: NGXLogger;
}
