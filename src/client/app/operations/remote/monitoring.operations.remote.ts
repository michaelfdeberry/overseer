import { NEVER, Observable } from 'rxjs';

export function enableMonitoring(): Observable<void> {
  return NEVER;
}

export function disableMonitoring(): Observable<void> {
  return NEVER;
}
