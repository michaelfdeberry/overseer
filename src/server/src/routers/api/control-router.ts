import { AccessLevel } from '@overseer/common/models/users';
import { MachineControlService } from '@overseer/common/services';
import { Request, Response, Router } from 'express';

import asyncRequestHandler from '../utilities/async-request-handler';
import { RouteAuthorizer } from '../utilities/route-authorizers';

export function initialize(routeAuthorizer: RouteAuthorizer, machineControlService: MachineControlService): Router {
  const router: Router = Router();

  router.all('*', routeAuthorizer.requireAccessLevel(AccessLevel.Administrator));

  router.get(
    '/:machineId/pause',
    asyncRequestHandler(async function (request: Request, response: Response): Promise<void> {
      await machineControlService.pauseJob(request.params.machineId);
      response.sendStatus(200);
    })
  );

  router.get(
    '/:machineId/resume',
    asyncRequestHandler(async function (request: Request, response: Response): Promise<void> {
      await machineControlService.resumeJob(request.params.machineId);
      response.sendStatus(200);
    })
  );

  router.get(
    '/:machineId/cancel',
    asyncRequestHandler(async function (request: Request, response: Response): Promise<void> {
      await machineControlService.cancelJob(request.params.machineId);
      response.sendStatus(200);
    })
  );

  router.get(
    '/:machineId/feed/:value',
    asyncRequestHandler(async function (request: Request, response: Response): Promise<void> {
      await machineControlService.setFeedRate(request.params.machineId, parseInt(request.params.value, 10));
      response.sendStatus(200);
    })
  );

  router.get(
    '/:machineId/fan/:value',
    asyncRequestHandler(async function (request: Request, response: Response): Promise<void> {
      await machineControlService.setFanSpeed(request.params.machineId, parseInt(request.params.value, 10));
      response.sendStatus(200);
    })
  );

  router.get(
    '/:machineId/heater/:heaterIndex/temp/:value',
    asyncRequestHandler(async function (request: Request, response: Response): Promise<void> {
      await machineControlService.setTemperature(
        request.params.machineId,
        parseInt(request.params.heaterIndex, 10),
        parseInt(request.params.value, 10)
      );
      response.sendStatus(200);
    })
  );

  router.get(
    '/:machineId/extruder/:extruderIndex/flow/:value',
    asyncRequestHandler(async function (request: Request, response: Response): Promise<void> {
      await machineControlService.setFlowRate(
        request.params.machineId,
        parseInt(request.params.extruderIndex, 10),
        parseInt(request.params.value, 10)
      );
      response.sendStatus(200);
    })
  );

  return router;
}
