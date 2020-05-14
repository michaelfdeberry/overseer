import { AccessLevel } from '@overseer/common/models/users';
import { AuthorizationService } from '@overseer/common/services';
import { NextFunction, Request, RequestHandler, Response } from 'express';

export type RouteAuthorizer = {
  requireAuthentication: RequestHandler;
  requireAccessLevel: (...accessLevels: AccessLevel[]) => RequestHandler;
  requireAccessLevelAfterSetup: (...accessLevels: AccessLevel[]) => RequestHandler;
};

export default function create(authorizationService: AuthorizationService): RouteAuthorizer {
  const routeAuthorizer: RouteAuthorizer = {
    async requireAuthentication(request: Request, response: Response, next: NextFunction): Promise<void> {
      try {
        const user = await authorizationService.authorize(request.headers.authorization);
        if (!user) {
          response.sendStatus(401);
          return;
        }

        next();
      } catch {
        response.sendStatus(500);
      }
    },
    requireAccessLevel(...accessLevels: AccessLevel[]) {
      return async function (request: Request, response: Response, next: NextFunction) {
        try {
          const user = await authorizationService.authorize(request.headers.authorization);
          if (!user) {
            response.sendStatus(401);
            return;
          }

          if (!accessLevels.some((level: AccessLevel) => level === user.accessLevel)) {
            response.sendStatus(401);
            return;
          }

          next();
        } catch {
          response.sendStatus(500);
        }
      };
    },
    requireAccessLevelAfterSetup(...accessLevels: AccessLevel[]) {
      return async function (request: Request, response: Response, next: NextFunction) {
        try {
          const isSetupRequest = await authorizationService.requiresInitialSetup();
          if (isSetupRequest) {
            next();
          } else {
            routeAuthorizer.requireAccessLevel(...accessLevels)(request, response, next);
          }
        } catch {
          response.sendStatus(500);
        }
      };
    }
  };

  return routeAuthorizer;
}
