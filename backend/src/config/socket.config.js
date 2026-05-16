import { Server } from 'socket.io';
import { env } from './env.config.js';
import { createSocketListeners } from '#core/services/socket/socket.helpers.js';
import { authenticateSocket } from '#core/services/socket/socketAuth.helpers.js';
import socketService from '#core/services/socket/socket.service.js';

const createSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: env.CLIENT_ORIGIN,
        },
    });

    io.use(authenticateSocket);

    io.on('connection', createSocketListeners);

    socketService.setIO(io);
};

export { createSocket };
