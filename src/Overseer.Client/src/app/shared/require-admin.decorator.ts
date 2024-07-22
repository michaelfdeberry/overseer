import { AccessLevel } from '../models/user.model';

export function RequireAdministrator(): MethodDecorator {
  return function (
    _target: Object,
    _propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    const originalFn = descriptor.value;

    descriptor.value = function () {
      // since the decorator is a typescript thing the injection service
      // can't be accessed here. So the user configuration has to be gotten
      // from the local storage directly.
      const userJson = localStorage.getItem('ngx_activeUser');
      if (!userJson) {
        throw new Error('unauthorized');
      }

      const user = JSON.parse(userJson);
      if (user.accessLevel !== AccessLevel.Administrator) {
        throw new Error('unauthorized');
      }

      return originalFn.apply(this, arguments);
    };
  };
}
