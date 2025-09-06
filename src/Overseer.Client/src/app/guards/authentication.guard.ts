import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';

export function authenticationGuard(): CanActivateFn {
  return () => {
    const authenticationService = inject(AuthenticationService);
    return authenticationService.checkLogin();
  };
}
