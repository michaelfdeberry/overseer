import { Input } from "@angular/core";
import { FormGroup } from "@angular/forms";
export abstract class PrinterConfigComponentBase {
    @Input()
    printer: any;
    @Input()
    form: FormGroup;
    configGroup: FormGroup;
    onInit() {
        this.configGroup = this.form.controls.config as FormGroup;
    }
    tryRemoveControl(form: FormGroup, name: string) {
        if (form && form.controls[name]) {
            form.removeControl(name);
        }
    }
}
