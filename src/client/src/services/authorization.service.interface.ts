import { DisplayUser } from 'overseer_lib';
import { Observable } from 'rxjs';

export abstract class AuthorizationService {
  abstract requiresAuthorization(): Observable<boolean>;

  abstract authorize(token: string): Observable<DisplayUser | null>;
}
