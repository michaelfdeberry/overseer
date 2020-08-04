import { SystemConfigurationService } from '@overseer/common/services';
import { NextFunction, Request, Response } from 'express';
import path from 'path';

export function createErrorHandler(configurationService: SystemConfigurationService) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function errorHandler(error: any, request: Request, response: Response, next: NextFunction): void {
    const isApiRequest = request.url.indexOf('/api') >= 0;

    if (error.statusCode === 404 && !isApiRequest) {
      response.status(200);
      response.sendFile(path.resolve(`${__dirname}/../public/index.html`));
      return;
    }

    if (isApiRequest) {
      response.status(500);
      response.json(typeof error.message === 'string' ? { error: error.message } : error.message);
    }

    configurationService.writeToLog({
      timestamp: Date.now(),
      level: 'ERROR',
      message: error.message,
      stack: error.stack
    });
    next();
  };
}
