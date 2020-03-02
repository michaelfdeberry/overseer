import * as bodyParser from 'body-parser';

import App from './app';

const app = new App({
    port: 5000,
    controllers: [],
    middleWares: [bodyParser.json(), bodyParser.urlencoded({ extended: true })]
});

app.listen();
