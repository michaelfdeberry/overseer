import { AbstractControl, ValidatorFn } from '@angular/forms';

export function matchValidator(
  controlA: string,
  controlB: string,
): ValidatorFn {
  return (control: AbstractControl) => {
    const passwordControl = control.get(controlA);
    const confirmPasswordControl = control.get(controlB);

    if (!passwordControl) return null;
    if (!confirmPasswordControl) return null;

    if (passwordControl.value !== confirmPasswordControl.value) {
      confirmPasswordControl.setErrors({ MatchPassword: true });
    }

    return null;
  };
}
