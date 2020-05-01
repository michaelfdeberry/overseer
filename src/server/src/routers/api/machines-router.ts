import { AccessLevel } from '@overseer/common/models/users';
import { MachineConfigurationService } from '@overseer/common/services';
import { Request, Response, Router } from 'express';

import asyncRequestHandler from '../utilities/async-request-handler';
import { RouteAuthorizer } from '../utilities/route-authorizers';

export function initialize(routeAuthorizer: RouteAuthorizer, machineConfigurationService: MachineConfigurationService): Router {
  const router: Router = Router();

  router.all('*', routeAuthorizer.requireAuthentication);

  router.get(
    '/',
    asyncRequestHandler(async function (_request: Request, response: Response): Promise<void> {
      response.json(await machineConfigurationService.getMachines());
    })
  );

  router.get(
    '/:machineId',
    asyncRequestHandler(async function (request: Request, response: Response): Promise<void> {
      response.json(await machineConfigurationService.getMachine(request.params.machineId));
    })
  );

  router.put(
    '/',
    routeAuthorizer.requireAccessLevel(AccessLevel.Administrator),
    asyncRequestHandler(async function (request: Request, response: Response): Promise<void> {
      response.json(await machineConfigurationService.createMachine(request.body.type, request.body.configuration));
    })
  );

  router.post(
    '/',
    routeAuthorizer.requireAccessLevel(AccessLevel.Administrator),
    asyncRequestHandler(async function (request: Request, response: Response): Promise<void> {
      response.json(await machineConfigurationService.updateMachine(request.body));
    })
  );

  router.delete(
    '/:machineId',
    routeAuthorizer.requireAccessLevel(AccessLevel.Administrator),
    asyncRequestHandler(async function (request: Request, response: Response): Promise<void> {
      response.json(await machineConfigurationService.deleteMachine(request.params.machineId));
    })
  );

  router.post(
    '/sort',
    routeAuthorizer.requireAccessLevel(AccessLevel.Administrator),
    asyncRequestHandler(async function (request: Request, response: Response): Promise<void> {
      await machineConfigurationService.sortMachines(request.body);
      response.sendStatus(200);
    })
  );

  return router;
}
