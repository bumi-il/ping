import { Server } from 'socket.io';
import { env } from './env.config.js';
import { setupSocketListeners } from '#core/services/websocket/websocket.helpers.js';
import websocketService from '#core/services/websocket/websocket.service.js';
import { authenticateSocket } from '#core/services/websocket/websocketAuth.helpers.js';

const initializeWebSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: env.CLIENT_ORIGIN,
        },
    });

    io.use(authenticateSocket);

    io.on('connection', setupSocketListeners);

    websocketService.setIO(io);
};

export { initializeWebSocket };
