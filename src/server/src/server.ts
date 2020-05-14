import { createDb, LevelContext } from '@overseer/common/data/level/level-context.class';
import initializeIntegration from '@overseer/common/integration/initialize-integration.function';
import { MachineState } from '@overseer/common/models';
import compression from 'compression';
import express, { Application } from 'express';
import { createServer, Server } from 'http';
import * as WebSocket from 'ws';

import { createApiRouter } from './api';
import { errorHandler } from './error-handler';
import { createServices } from './services';

initializeIntegration();

createDb().then(async (db) => {
  const context = new LevelContext(db);
  const services = createServices(context);
  const settings = await services.systemConfigurationService.getSystemSetting();
  const httpServer: Application = express();
  const webServer: Server = createServer(httpServer);

  httpServer.on('close', () => db.close());
  httpServer.use(compression());
  httpServer.use(express.json());
  httpServer.use(createApiRouter(services));
  httpServer.use(express.static('public', { fallthrough: false }));
  httpServer.use(errorHandler);

  const webSocketServer = new WebSocket.Server({ server: webServer, path: '/push' });
  webSocketServer.on('connection', (ws: WebSocket & { isAlive: boolean }) => {
    ws.isAlive = true;

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', (message: string) => {
      const request = JSON.parse(message);
      if (services.authorizationService.authorize(request.token)) {
        switch (request.command) {
          case 'EnableMonitoring':
            services.monitoringService.enable();
            break;
          case 'DisableMonitoring':
            services.monitoringService.disable();
            break;
        }
      }
    });

    services.monitoringService.machineStateEventEmitter.on('MachineState', (state: MachineState) => {
      ws.send(JSON.stringify({ type: 'MachineState', payload: state }));
    });
  });

  webSocketServer.on('error', (ws: WebSocket, error: Error) => {
    console.log(error);
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
  webServer.listen(settings.localPort);
});
