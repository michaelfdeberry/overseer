import { Input, OnInit, OnDestroy } from "@angular/core";
import { FormGroup, FormControl, Validators, FormBuilder } from "@angular/forms";

export function machineFormFactory(builder: FormBuilder, controls?: any) {
    const form = builder.group({
        machineType: [null, []],
        name: [null, [Validators.required]]
    });

    if (controls) {
        Object.keys(controls).forEach(key => {
            form.addControl(key, controls[key]);
        });
    }

    return form;
}

export abstract class BaseMachineComponent implements OnInit, OnDestroy {
    @Input()
    machine: any;

    @Input()
    form: FormGroup;

    @Input()
    enableAdvancedSettings: boolean;

    advancedSettingsVisible = false;

    abstract onInit(): void;

    abstract onDestroy(): void;

    ngOnInit() {
        this.form.addControl("name", new FormControl(null, Validators.required));

        this.onInit();

        if (this.machine) {
            this.form.addControl("id", new FormControl());
            this.form.patchValue(this.machine);
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
