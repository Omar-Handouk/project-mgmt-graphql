import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import helmet from 'helmet';
import express from 'express';
import mongoose from 'mongoose';

import { graphqlHTTP } from 'express-graphql';

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
const morganOutputConfig = applicationEnv === 'dev' ? 'dev' : 'common';
const app = express();
const apiBasePath = config.apiBasePath;

app.use(helmet({
    contentSecurityPolicy: (process.env.NODE_ENV === 'production') ? undefined : false
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

app.use(apiBasePath, applicationRoutes);
app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: applicationEnv === 'dev'
}));

(async () => {
    await new Promise((resolve, reject) => {
        global.logger(`Attempting to connect to database cluster ${databaseURI}`);

        try {
            mongoose.connect(databaseURI, {
                dbName: 'dev',
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