import { AbstractControl, ValidatorFn, Validators } from "@angular/forms";

export function matchValidator(controlA: string, controlB: string): ValidatorFn {
    return (control: AbstractControl) => {
        const passwordControl = control.get(controlA);
        const confirmPasswordControl = control.get(controlB);

        if (passwordControl.value !== confirmPasswordControl.value) {
            confirmPasswordControl.setErrors({ MatchPassword: true });
        } else {
            return null;
        }
    };
}
