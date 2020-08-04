import { AccessLevel } from '@overseer/common/models/users';
import { SystemConfigurationService } from '@overseer/common/services';
import { Request, Response, Router } from 'express';
import { arch, platform, release } from 'os';

import asyncRequestHandler from './utilities/async-request-handler';
import { RouteAuthorizer } from './utilities/route-authorizers';

export function create(routeAuthorizer: RouteAuthorizer, systemConfigurationService: SystemConfigurationService): Router {
  const router: Router = Router();

  router.get(
    '/',
    routeAuthorizer.requireAuthentication,
    asyncRequestHandler(async function (_request: Request, response: Response): Promise<void> {
      response.json(await systemConfigurationService.getSystemSetting());
    })
  );

  router.post(
    '/',
    routeAuthorizer.requireAccessLevel(AccessLevel.Administrator),
    asyncRequestHandler(async function (request: Request, response: Response): Promise<void> {
      await systemConfigurationService.updateSystemSettings(request.body);
      response.sendStatus(200);
    })
  );

  router.put(
    '/certificate',
    routeAuthorizer.requireAccessLevel(AccessLevel.Administrator),
    asyncRequestHandler(async function (request: Request, response: Response): Promise<void> {
      response.json(await systemConfigurationService.addCertificateExclusion(request.body));
    })
  );

  router.get(
    '/about',
    asyncRequestHandler(async function (_request: Request, response: Response): Promise<void> {
      response.json({
        'Server Operating System': `${platform()} ${release()}`,
        'Platform Architecture': arch(),
        'Runtime Version Info': JSON.stringify(process.versions)
      });
    })
  );

  return router;
}
