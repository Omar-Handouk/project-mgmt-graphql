import fs from 'fs';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import morgan from 'morgan';
import helmet from 'helmet';
import express from 'express';
import mongoose from 'mongoose';

import { graphqlHTTP } from 'express-graphql';
import { RESET_CONTENT, StatusCodes } from 'http-status-codes';

import config from './config/default.js';
import schema from './schema/schema.js';
import applicationRoutes from './routes/index.js';
import simpleLogger from './utils/simplelogger.js';

dotenv.config();
global.logger = simpleLogger;

const applicationHostAddress = process.env.HOST;
const applicationPort = parseInt(process.env.PORT);
const applicationEnv = process.env.NODE_ENV;
const databaseURI = process.env.MONGO_URI;
const databaseUser = process.env.MONGO_USER;
const databasePass = process.env.MONGO_PASS;
const databaseName = process.env.MONGO_DB_NAME;
const reactAppURL = process.env.REACT_APP_URL ?? 'http://127.0.0.1:3000/';
const buildPath = path.join(path.resolve(), 'build');
const morganOutputConfig = applicationEnv === 'dev' ? 'dev' : 'common';

const app = express();
const apiBasePath = config.apiBasePath;

app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production'
}));
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://0.0.0.0:3000'
    ]
}));
app.use(morgan(morganOutputConfig));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (applicationEnv === 'production') {
    app.use(express.static(buildPath));
}

app.use(apiBasePath, applicationRoutes);
app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: applicationEnv === 'dev'
}));

app.use('*', (_req, res) => {
    if (applicationEnv === 'dev') {
        return res.status(StatusCodes.MOVED_PERMANENTLY).redirect(reactAppURL);
    }

    if (fs.existsSync(buildPath)) {
        try {
            const indexPath = path.join(buildPath, 'index.html');
            if (!fs.existsSync(indexPath)) {
                throw new Error(`${indexPath} does not exist!`);
            }

            return res.status(StatusCodes.OK).sendFile(indexPath);
        } catch (e) {
            console.error(e);
            process.exit(1);
        }

    } else {
        throw new Error(`${buildPath} does not exist!`);
    }
});

(async () => {
    await new Promise((resolve, reject) => {
        global.logger(`Attempting to connect to database cluster ${databaseURI}`);

        try {
            mongoose.connect(databaseURI, {
                dbName: databaseName,
                user: databaseUser,
                pass: databasePass,
            });

            global.logger(`Connection to database cluster ${databaseURI} is successful`);
            resolve();
        } catch (e) {
            global.logger(e.stack, 'error');
            reject(e);
            process.exit(1);
        }
    });

    app.listen(applicationPort, applicationHostAddress, () => {
        global.logger(`Server is running @ http://${applicationHostAddress}:${applicationPort}`);
    });
})();