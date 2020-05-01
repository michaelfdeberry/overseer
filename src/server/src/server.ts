import { DataContext, getFileDataContext } from '@overseer/common/data';
import { MachineState } from '@overseer/common/models/machines';
import {
  AuthenticationService,
  AuthorizationService,
  MachineConfigurationService,
  MachineControlService,
  MachineProviderService,
  MonitoringService,
  SystemConfigurationService,
  UserConfigurationService
} from '@overseer/common/services';
import * as bodyParser from 'body-parser';
import express, { Application, NextFunction, Request, Response, Router } from 'express';
import { createServer } from 'http';
import * as WebSocket from 'ws';

import * as IndexRouter from './routers';
import * as apiRoutes from './routers/api';
import createRouterAuthorizer, { RouteAuthorizer } from './routers/utilities/route-authorizers';

getFileDataContext().then((context: DataContext) => {
  const machineProviderService = new MachineProviderService();
  const authorizationService = new AuthorizationService(context);
  const authenticationService = new AuthenticationService(context);
  const systemConfigurationService = new SystemConfigurationService(context);
  const machineControlService = new MachineControlService(context, machineProviderService);
  const machineConfigurationService = new MachineConfigurationService(context, machineProviderService);
  const monitoringService = new MonitoringService(context, machineProviderService);
  const userConfigurationService = new UserConfigurationService(context);

  systemConfigurationService.getSystemSetting().then((settings) => {
    const app: Application = express();
    const server = createServer(app);

    // configuration routes
    const router = Router();
    router.use('/', IndexRouter.initialize());
    router.use(
      '/api/auth',
      apiRoutes.authenticationRouter.initialize(routeAuthorizer, authenticationService),
      apiRoutes.authorizationRouter.initialize(authorizationService)
    );
    router.use('/api/config', apiRoutes.configurationNRouter.initialize(routeAuthorizer, systemConfigurationService));
    router.use('/api/control', apiRoutes.controlRouter.initialize(routeAuthorizer, machineControlService));
    router.use('/api/machines', apiRoutes.machinesRouter.initialize(routeAuthorizer, machineConfigurationService));
    router.use('/api/users', apiRoutes.usersRouter.initialize(routeAuthorizer, userConfigurationService));
    app.use(router);

    // configure assets
    app.use(express.static('public'));

    // configure middlewares
    app.use(bodyParser.json());

    // configure error handler
    app.use(function (error: any, request: Request, response: Response, next: NextFunction) {
      console.log(error);
      if (error.statusCode === 404 && request.url.indexOf('/api') < 0) {
        response.sendFile('public/index.html');
      }
    });

    // configure web socket //TODO: relocate this
    const webSocketServer = new WebSocket.Server({ server, path: 'push' });
    webSocketServer.on('connection', (ws: WebSocket & { isAlive: boolean }) => {
      ws.on('pong', () => {
        ws.isAlive = true;
      });

      ws.on('data', (data) => {
        const request = JSON.parse(data);
        if (authorizationService.authorize(request.token)) {
          switch (request.command) {
            case 'EnableMonitoring':
              monitoringService.enable();
              break;
            case 'DisableMonitoring':
              monitoringService.disable();
              break;
          }
        }
      });

      monitoringService.machineStateEventEmitter.on('MachineState', (state: MachineState) => {
        ws.send({ type: 'MachineState', payload: state });
      });
    });

    setInterval(() => {
      webSocketServer.clients.forEach((ws: WebSocket & { isAlive: boolean }) => {
        if (!ws.isAlive) {
          ws.terminate();
          return;
        }

        ws.isAlive = false;
        ws.ping(null, false);
      });
    }, 10000);

    // start the web server
    server.listen(settings.localPort);
  });

  const routeAuthorizer: RouteAuthorizer = createRouterAuthorizer(authorizationService);
});
