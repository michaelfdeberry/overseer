import { NextFunction, Request, RequestHandler, Response } from 'express';

export default function asyncRequestHandler(innerRequestHandler: RequestHandler): RequestHandler {
  return (request: Request, response: Response, next: NextFunction) => {
    Promise.resolve(innerRequestHandler(request, response, next)).catch(next);
  };
}
