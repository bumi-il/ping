import jwt from 'jsonwebtoken';
import { env } from '#config/env.config.js';
import { HTTP_STATUS } from '#core/constants/httpStatus.constants.js';
import { MESSAGES } from '#core/constants/messages.constants.js';
import { USER_STATUSES } from '#core/constants/user.constants.js';
import userRepository from '#core/repositories/user.repository.js';
import AppError from '#core/utils/AppError.utils.js';
import { isObjectId } from '#core/utils/mongoose.utils.js';

const checkUser = async (req, _res, next) => {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader?.startsWith('Bearer ')) {
        throw new AppError(MESSAGES.AUTH.TOKEN_REQUIRED, HTTP_STATUS.UNAUTHORIZED);
    }

    const token = authorizationHeader.split(' ')[1];
    if (typeof token !== 'string' || !token.trim()) {
        throw new AppError(MESSAGES.AUTH.TOKEN_REQUIRED, HTTP_STATUS.UNAUTHORIZED);
    }

    let payload;

    try {
        payload = jwt.verify(token, env.JWT_SECRET);
    } catch (_error) {
        throw new AppError(MESSAGES.AUTH.TOKEN_INVALID, HTTP_STATUS.UNAUTHORIZED);
    }

    if (!isObjectId(payload.sub)) {
        throw new AppError(MESSAGES.AUTH.TOKEN_INVALID, HTTP_STATUS.UNAUTHORIZED);
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
