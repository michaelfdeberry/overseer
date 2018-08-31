import { Input, OnInit, OnDestroy } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";

export function printerConfigFormFactory(controls?: any) {
    const form = new FormGroup({
        printerType: new FormControl(),
        name: new FormControl(null, Validators.required),
        config: new FormGroup({})
    });

    if (controls) {
        Object.keys(controls).forEach(key => {
            form.addControl(key, controls[key]);
        });
    }

    return form;
}

export abstract class PrinterConfigComponentBase implements OnInit, OnDestroy {
    @Input()
    printer: any;

    @Input()
    form: FormGroup;

    configGroup: FormGroup;

    advancedSettingsVisible = false;

    abstract onInit();

    abstract onDestroy();

    ngOnInit() {
        this.configGroup = this.form.controls.config as FormGroup;
        this.form.addControl("name", new FormControl(null, Validators.required));

        this.onInit();

        if (this.printer) {
            this.form.addControl("id", new FormControl());
            this.form.patchValue(this.printer);
        }
    }

    ngOnDestroy() {
        this.tryRemoveControl(this.form, "id");
        this.tryRemoveControl(this.form, "name");

        this.onDestroy();
    }

    tryRemoveControl(form: FormGroup, name: string) {
        if (form && form.controls[name]) {
            form.removeControl(name);
        }
    }
}
