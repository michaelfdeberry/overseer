import { AccessLevel } from '@overseer/common/lib/models/users';
import { UserConfigurationService } from '@overseer/common/lib/services';
import { Request, Response, Router } from 'express';

import asyncRequestHandler from './utilities/async-request-handler';
import { RouteAuthorizer } from './utilities/route-authorizers';

export function create(routeAuthorizer: RouteAuthorizer, userConfigurationService: UserConfigurationService): Router {
  const router: Router = Router();

  router.get(
    '/',
    routeAuthorizer.requireAccessLevel(AccessLevel.Administrator),
    asyncRequestHandler(async function (_request: Request, response: Response): Promise<void> {
      response.json(await userConfigurationService.getUsers());
    })
  );

  router.get(
    '/:userId',
    routeAuthorizer.requireAccessLevel(AccessLevel.Administrator),
    asyncRequestHandler(async function (request: Request, response: Response): Promise<void> {
      response.json(await userConfigurationService.getUser(request.params.userId));
    })
  );

  router.put(
    '/',
    routeAuthorizer.requireAccessLevelAfterSetup(AccessLevel.Administrator),
    asyncRequestHandler(async function (request: Request, response: Response): Promise<void> {
      response.json(await userConfigurationService.createUser(request.body));
    })
  );

  router.post(
    '/',
    routeAuthorizer.requireAccessLevel(AccessLevel.Administrator),
    asyncRequestHandler(async function (request: Request, response: Response): Promise<void> {
      response.json(await userConfigurationService.updateUser(request.body));
    })
  );

  router.delete(
    '/:userId',
    routeAuthorizer.requireAccessLevel(AccessLevel.Administrator),
    asyncRequestHandler(async function (request: Request, response: Response): Promise<void> {
      response.json(await userConfigurationService.deleteUser(request.params.userId));
    })
  );

  router.post(
    '/password',
    routeAuthorizer.requireAccessLevel(AccessLevel.Administrator),
    asyncRequestHandler(async function (request: Request, response: Response): Promise<void> {
      response.json(await userConfigurationService.changePassword(request.body));
    })
  );

  return router;
}
