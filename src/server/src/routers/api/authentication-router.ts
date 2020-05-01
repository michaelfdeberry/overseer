import { AccessLevel } from '@overseer/common/models/users';
import { AuthenticationService } from '@overseer/common/services';
import { Request, Response, Router } from 'express';

import asyncRequestHandler from '../utilities/async-request-handler';
import { RouteAuthorizer } from '../utilities/route-authorizers';

export function initialize(routeAuthorizer: RouteAuthorizer, authenticationService: AuthenticationService) {
  const router: Router = Router();

  router.post(
    '/login',
    asyncRequestHandler(async function (request: Request, response: Response): Promise<void> {
      response.json(await authenticationService.authenticateUser(request.body));
    })
  );

  router.delete(
    '/logout',
    routeAuthorizer.requireAuthentication,
    asyncRequestHandler(async function (request: Request, response: Response): Promise<void> {
      response.json(await authenticationService.deauthenticateToken(request.headers.authorization));
    })
  );

  router.post(
    '/logout/:userId',
    routeAuthorizer.requireAccessLevel(AccessLevel.Administrator),
    asyncRequestHandler(async function (request: Request, response: Response): Promise<void> {
      response.json(await authenticationService.deauthenticateUser(request.params.userId));
    })
  );

  router.get(
    '/sso/:userId',
    routeAuthorizer.requireAccessLevel(AccessLevel.Administrator),
    asyncRequestHandler(async function (request: Request, response: Response): Promise<void> {
      response.json(await authenticationService.preauthenticate(request.params.userId));
    })
  );

  router.post(
    '/sso',
    asyncRequestHandler(async function (request: Request, response: Response): Promise<void> {
      response.json(await authenticationService.authenticatePreauthorization(request.body));
    })
  );

  return router;
}
