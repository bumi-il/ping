import { SOCKET_AUTH_ERROR } from '#core/constants/socket.constants.js';
import authContextService from '#core/services/auth/authContext.service.js';

const getSocketToken = (socket) => {
    const authToken = socket.handshake.auth?.token;

    if (typeof authToken === 'string' && authToken.trim()) {
        return authToken.trim();
    }

    const authorizationHeader = socket.handshake.headers.authorization;

    if (typeof authorizationHeader === 'string' && authorizationHeader.startsWith('Bearer ')) {
        return authorizationHeader.split(' ')[1]?.trim();
    }

    return null;
};

const authenticateSocket = async (socket, next) => {
    try {
        const token = getSocketToken(socket);

        if (!token) {
            return next(new Error(SOCKET_AUTH_ERROR));
        }

        const { user } = await authContextService.authenticateToken(token);
        if (!user) {
            return next(new Error(SOCKET_AUTH_ERROR));
        }

        socket.user = user;

        return next();
    } catch (_error) {
        return next(new Error(SOCKET_AUTH_ERROR));
    }
};

export { authenticateSocket };
