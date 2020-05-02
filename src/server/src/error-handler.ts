import { NextFunction, Request, Response } from 'express';
import path from 'path';

export function errorHandler(error: any, request: Request, response: Response, next: NextFunction): void {
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

  next();
}
