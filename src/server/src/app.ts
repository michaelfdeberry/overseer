import { NextHandleFunction } from 'connect';
import express, { Application } from 'express';

import { Controller } from './controllers/controller.interface';

export default class App {
    public app: Application;
    public port: number;

    constructor(appInit: { port: number; middleWares: NextHandleFunction[]; controllers: Controller[] }) {
        this.app = express();
        this.port = appInit.port;

        this.middlewares(appInit.middleWares);
        this.routes(appInit.controllers);
        this.assets();
        this.template();
    }

    public listen() {
        this.app.listen(this.port, () => {
            // tslint:disable-next-line: no-console
            console.log(`App listening on the http://localhost:${this.port}`);
        });
    }

    private middlewares(middleWares: NextHandleFunction[]) {
        middleWares.forEach((middleWare) => {
            this.app.use(middleWare);
        });
    }

    private routes(controllers: Controller[]) {
        controllers.forEach((controller) => {
            this.app.use('/', controller.router);
        });
    }

    private assets() {
        this.app.use(express.static('public'));
        this.app.use(express.static('views'));
    }

    private template() {
        this.app.set('view engine', 'pug');
    }
}
