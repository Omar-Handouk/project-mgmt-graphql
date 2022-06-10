import dotenv from 'dotenv';
import morgan from 'morgan';
import helmet from 'helmet';
import express from 'express';

import config from './config/default.js';
import applicationRoutes from './routes/index.js';
import simpleLogger from './utils/simplelogger.js';

dotenv.config();
global.logger = simpleLogger;

const applicationHostAddress    = process.env.HOST;
const applicationPort           = parseInt(process.env.PORT);
const applicationEnv            = process.env.NODE_ENV;
const morganOutputConfig        = applicationEnv === 'dev' ? 'dev' : 'common';
const app                       = express();
const apiBasePath               = config.apiBasePath;

app.use(helmet());
app.use(morgan(morganOutputConfig));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(apiBasePath, applicationRoutes);

app.listen(applicationPort, applicationHostAddress, () => {
    global.logger(`Server is running @ http://${applicationHostAddress}:${applicationPort}`);
});