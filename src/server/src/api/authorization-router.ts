import { AuthorizationService } from '@overseer/common/lib/services';
import { Request, Response, Router } from 'express';

import asyncRequestHandler from './utilities/async-request-handler';

export function create(authorizationService: AuthorizationService): Router {
  const router: Router = Router();

  router.get(
    '/',
    asyncRequestHandler(async function (request: Request, response: Response): Promise<void> {
      const activeUser = await authorizationService.authorize(request.headers.authorization);
      if (activeUser) {
        response.json(activeUser);
      } else {
        response.sendStatus(401);
      }
    })
  );

  router.get(
    '/setup',
    asyncRequestHandler(async function (_request: Request, response: Response): Promise<void> {
      const isSetupRequired = await authorizationService.requiresInitialSetup();
      response.sendStatus(isSetupRequired ? 412 : 200);
    })
  );

  return router;
}
