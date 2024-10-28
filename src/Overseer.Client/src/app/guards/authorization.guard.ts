import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { AccessLevel } from '../models/user.model';

export function authorizationGuard(): CanActivateFn {
  return () => {
    const authenticationService = inject(AuthenticationService);
    const user = authenticationService.activeUser();
    if (!user) return false;

    return user.accessLevel === 'Administrator';
  };
}
