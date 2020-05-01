import { AuthorizationService } from '@overseer/common/services';
import { Request, Response, Router } from 'express';

import asyncRequestHandler from '../utilities/async-request-handler';

export function initialize(authorizationService: AuthorizationService): Router {
  const router: Router = Router();

  router.get(
    '/',
    asyncRequestHandler(async function (request: Request, response: Response): Promise<void> {
      const isAuthorized = await authorizationService.authorize(request.headers.authorization);
      response.sendStatus(isAuthorized ? 200 : 401);
    })
  );

  router.get(
    '/setup',
    asyncRequestHandler(async function (_request: Request, response: Response): Promise<void> {
      const isSetupRequired = await authorizationService.requiresInitialSetup();
      response.sendStatus(isSetupRequired ? 400 : 200);
    })
  );

  return router;
}
