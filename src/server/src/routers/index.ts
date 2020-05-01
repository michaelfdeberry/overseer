import { Router } from 'express';

export function initialize(): Router {
  const router: Router = Router();

  // router.get('/', (request: Request, response: Response) => {
  //   response.sendFile(path.join(`${__dirname}/../../../public/index.html`));
  // });

  return router;
}
