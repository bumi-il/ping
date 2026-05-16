import { AUTH_CONTEXT_FAILURES } from '#core/constants/auth.constants.js';
import { HTTP_STATUS } from '#core/constants/httpStatus.constants.js';
import { MESSAGES } from '#core/constants/messages.constants.js';
import authContextService from '#core/services/auth/authContext.service.js';
import AppError from '#core/utils/AppError.utils.js';

const AUTH_CONTEXT_ERRORS = {
    [AUTH_CONTEXT_FAILURES.USER_NOT_FOUND]: {
        message: MESSAGES.USER.NOT_FOUND,
        status: HTTP_STATUS.UNAUTHORIZED,
    },
    [AUTH_CONTEXT_FAILURES.USER_DISABLED]: {
        message: MESSAGES.USER.DISABLED,
        status: HTTP_STATUS.FORBIDDEN,
    },
    [AUTH_CONTEXT_FAILURES.EMAIL_VERIFICATION_REQUIRED]: {
        message: MESSAGES.AUTH.EMAIL_VERIFICATION_REQUIRED,
        status: HTTP_STATUS.FORBIDDEN,
    },
};

const checkUser = async (req, _res, next) => {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader?.startsWith('Bearer ')) {
        throw new AppError(MESSAGES.AUTH.TOKEN_REQUIRED, HTTP_STATUS.UNAUTHORIZED);
    }

    const token = authorizationHeader.split(' ')[1];
    if (typeof token !== 'string' || !token.trim()) {
        throw new AppError(MESSAGES.AUTH.TOKEN_REQUIRED, HTTP_STATUS.UNAUTHORIZED);
    }

    const { user, failure } = await authContextService.authenticateToken(token);
    if (!user) {
        const error = AUTH_CONTEXT_ERRORS[failure] || {
            message: MESSAGES.AUTH.TOKEN_INVALID,
            status: HTTP_STATUS.UNAUTHORIZED,
        };

        throw new AppError(error.message, error.status);
    }

    req.user = user;

    next();
};

export { checkUser };
