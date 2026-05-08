import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env.config.js';
import {
    errorHandler,
    notFoundHandler,
} from './core/middlewares/errorHandler.middleware.js';
import api from './api/index.js';
import { connectDB } from './config/db.config.js';

const createApp = () => {
    const app = express();

    app.use(express.json());
    app.use(cors({ origin: env.CLIENT_ORIGIN }));
    // TODO: Check morgan params - https://www.npmjs.com/package/morgan
    app.use(morgan('dev'));

    app.use('/api', api);

    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
};

const start = async () => {
    await connectDB();

    const app = createApp();

    app.listen(env.PORT, () => {
        console.log(`Server is running on port ${env.PORT}`);
    });
};

start().catch((error) => {
    console.error(error);
    process.exit(1);
});
