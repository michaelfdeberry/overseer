import { AccessLevel } from '@overseer/common/lib/models/users';
import { MachineConfigurationService } from '@overseer/common/lib/services';
import { Request, Response, Router } from 'express';

import asyncRequestHandler from './utilities/async-request-handler';
import { RouteAuthorizer } from './utilities/route-authorizers';

export function create(routeAuthorizer: RouteAuthorizer, machineConfigurationService: MachineConfigurationService): Router {
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

  router.get('/config', function (_request: Request, response: Response): void {
    response.json(machineConfigurationService.getMachineTypes());
  });

  router.get('config/:machineType', function (request: Request, response: Response): void {
    response.json(machineConfigurationService.getMachineConfiguration(request.params.machineType));
  });

  router.put(
    '/',
    routeAuthorizer.requireAccessLevel(AccessLevel.Administrator),
    asyncRequestHandler(async function (request: Request, response: Response): Promise<void> {
      response.json(await machineConfigurationService.createMachine(request.body.machineType, request.body.configuration));
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
      response.json(await machineConfigurationService.sortMachines(request.body));
    })
  );

  return router;
}
