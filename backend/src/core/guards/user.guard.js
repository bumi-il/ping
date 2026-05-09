import jwt from 'jsonwebtoken';
import { env } from '../../config/env.config.js';
import { HTTP_STATUS } from '../constants/httpStatus.constants.js';
import { MESSAGES } from '../constants/messages.constants.js';
import userRepository from '../repositories/user.repository.js';
import AppError from '../utils/AppError.utils.js';
import { isObjectId } from '../utils/mongoose.utils.js';
import { USER_STATUSES } from '../constants/user.constants.js';

const checkUser = async (req, _res, next) => {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader?.startsWith('Bearer ')) {
        throw new AppError(
            MESSAGES.AUTH.TOKEN_REQUIRED,
            HTTP_STATUS.UNAUTHORIZED,
        );
    }

    // TODO: Move this to config
    if (!env.JWT_SECRET) {
        throw new AppError(
            MESSAGES.AUTH.JWT_SECRET_MISSING,
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
        );
    }

    const token = authorizationHeader.split(' ')[1];
    if (typeof token !== 'string' || !token.trim()) {
        throw new AppError(
            MESSAGES.AUTH.TOKEN_REQUIRED,
            HTTP_STATUS.UNAUTHORIZED,
        );
    }

    let payload;

    try {
        payload = jwt.verify(token, env.JWT_SECRET);
    } catch (_error) {
        throw new AppError(
            MESSAGES.AUTH.TOKEN_INVALID,
            HTTP_STATUS.UNAUTHORIZED,
        );
    }

    if (!isObjectId(payload.sub)) {
        throw new AppError(
            MESSAGES.AUTH.TOKEN_INVALID,
            HTTP_STATUS.UNAUTHORIZED,
        );
    }

    const user = await userRepository.findById(payload.sub, {
        select: '-passwordHash -__v',
    });

    if (!user) {
        throw new AppError(MESSAGES.USER.NOT_FOUND, HTTP_STATUS.UNAUTHORIZED);
    }

    if (user.status !== USER_STATUSES.ACTIVE) {
        throw new AppError(MESSAGES.USER.DISABLED, HTTP_STATUS.FORBIDDEN);
    }

    req.user = user;

    next();
};

export { checkUser };
