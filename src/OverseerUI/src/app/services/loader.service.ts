import { Injectable } from "@angular/core";
import { NgProgress, NgProgressRef } from "@ngx-progressbar/core";

@Injectable({
    providedIn: "root"
})
export class LoaderService {
    private loading = 0;
    private loaderTimeout: any;
    private ngProgress: NgProgressRef;

    constructor(ngProgress: NgProgress) {
        this.ngProgress = ngProgress.ref();
    }

    start() {
        if (!this.loading) {
            this.loading++;
            this.ngProgress.start();

            // if the request is taking longer than 30 sec.
            // something is wrong, but just cancel the loader
            // here.
            this.loaderTimeout = setTimeout(() => {
                this.loading = 0;
                this.ngProgress.complete();
            }, 30 * 1000);
        }
    }

    stop() {
        if (--this.loading <= 0) {
            clearTimeout(this.loaderTimeout);

            this.loading = 0;
            this.loaderTimeout = null;

            // when running locally the request finish fast enough
            // where the loader won't be displayed. The slight delay
            // allows for a quick flash of the loader
            setTimeout(() => {
                this.ngProgress.complete();
            }, 50);
        }
    }
}
