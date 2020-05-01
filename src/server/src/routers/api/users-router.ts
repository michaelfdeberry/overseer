import { AccessLevel } from '@overseer/common/models/users';
import { UserConfigurationService } from '@overseer/common/services';
import { Request, Response, Router } from 'express';

import asyncRequestHandler from '../utilities/async-request-handler';
import { RouteAuthorizer } from '../utilities/route-authorizers';

export function initialize(routerAuthorizer: RouteAuthorizer, userConfigurationService: UserConfigurationService): Router {
  const router: Router = Router();

  router.all('*', routerAuthorizer.requireAccessLevel(AccessLevel.Administrator));

  router.get(
    '/',
    asyncRequestHandler(async function (_request: Request, response: Response): Promise<void> {
      response.json(await userConfigurationService.getUsers());
    })
  );

  router.get(
    '/:userId',
    asyncRequestHandler(async function (request: Request, response: Response): Promise<void> {
      response.json(await userConfigurationService.getUser(request.params.userId));
    })
  );

  router.put(
    '/',
    asyncRequestHandler(async function (request: Request, response: Response): Promise<void> {
      response.json(await userConfigurationService.createUser(request.body));
    })
  );

  router.post(
    '/',
    asyncRequestHandler(async function (request: Request, response: Response): Promise<void> {
      response.json(await userConfigurationService.updateUser(request.body));
    })
  );

  router.delete(
    '/:userId',
    asyncRequestHandler(async function (request: Request, response: Response): Promise<void> {
      response.json(await userConfigurationService.deleteUser(request.params.userId));
    })
  );

  router.post(
    '/password',
    asyncRequestHandler(async function (request: Request, response: Response): Promise<void> {
      response.json(await userConfigurationService.changePassword(request.body));
    })
  );

  return router;
}
