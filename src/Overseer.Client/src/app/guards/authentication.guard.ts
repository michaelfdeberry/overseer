import { CanActivateFn } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { inject } from '@angular/core';

export function authenticationGuard(): CanActivateFn {
  return () => {
    const authenticationService = inject(AuthenticationService);
    return authenticationService.requiresLogin();
  };
}
