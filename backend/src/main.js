import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { createServer } from 'http';
import { env } from '#config/env.config.js';
import { errorHandler, notFoundHandler } from '#core/middlewares/errorHandler.middleware.js';
import api from '#api/api.routes.js';
import { connectDB } from '#config/db.config.js';
import { NODE_ENVS } from '#core/constants/constants.js';
import logService from '#core/services/log/log.service.js';
import { initializeWebSocket } from '#config/websocket.config.js';

const MORGAN_FORMAT = env.NODE_ENV === NODE_ENVS.PROD ? 'combined' : 'dev';

const createApp = () => {
    const app = express();

    app.use(express.json());
    app.use(cors({ origin: env.CLIENT_ORIGIN }));
    // TODO: Learn morgan params - https://www.npmjs.com/package/morgan
    app.use(morgan(MORGAN_FORMAT));

    app.use('/api', logService.requestLogger(), api);

    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
};

const start = async () => {
    await connectDB();

    const app = createApp();
    const server = createServer(app);

    initializeWebSocket(server);

    server.listen(env.PORT, () => {
        console.log(`Server is running on port ${env.PORT}`);
    });
};

start().catch((error) => {
    console.error(error);
    process.exit(1);
});
