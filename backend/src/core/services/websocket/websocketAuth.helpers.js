import { env } from '#config/env.config.js';
import jwt from 'jsonwebtoken';
import userRepository from '#core/repositories/user.repository.js';
import { USER_STATUSES } from '#core/constants/user.constants.js';
import { SOCKET_AUTH_ERROR } from '#core/constants/websocket.constants.js';
import { isObjectId } from '#core/utils/mongoose.utils.js';

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

        const payload = jwt.verify(token, env.JWT_SECRET);

        if (!isObjectId(payload.sub)) {
            return next(new Error(SOCKET_AUTH_ERROR));
        }

        const user = await userRepository.findById(payload.sub, {
            select: '-passwordHash -__v',
        });

        if (!user || user.status !== USER_STATUSES.ACTIVE) {
            return next(new Error(SOCKET_AUTH_ERROR));
        }

        socket.user = user;
        return next();
    } catch (_error) {
        return next(new Error(SOCKET_AUTH_ERROR));
    }
};

export { authenticateSocket };
