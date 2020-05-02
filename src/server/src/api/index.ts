import { Router } from 'express';

import { ServiceDependencies } from '../services';
import * as authenticationRouter from './authentication-router';
import * as authorizationRouter from './authorization-router';
import * as configurationNRouter from './configuration-router';
import * as controlRouter from './control-router';
import * as machinesRouter from './machines-router';
import * as usersRouter from './users-router';
import createRouterAuthorizer, { RouteAuthorizer } from './utilities/route-authorizers';

export function createApiRouter(services: ServiceDependencies): Router {
  const router = Router();
  const routeAuthorizer: RouteAuthorizer = createRouterAuthorizer(services.authorizationService);

  router.use(
    '/auth',
    authenticationRouter.create(routeAuthorizer, services.authenticationService),
    authorizationRouter.create(services.authorizationService)
  );
  router.use('/config', configurationNRouter.create(routeAuthorizer, services.systemConfigurationService));
  router.use('/control', controlRouter.create(routeAuthorizer, services.machineControlService));
  router.use('/machines', machinesRouter.create(routeAuthorizer, services.machineConfigurationService));
  router.use('/users', usersRouter.create(routeAuthorizer, services.userConfigurationService));

  const apiRouter = Router();
  apiRouter.use('/api', router);
  return apiRouter;
}
