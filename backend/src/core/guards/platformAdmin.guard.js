import { HTTP_STATUS } from '#core/constants/httpStatus.constants.js';
import { MESSAGES } from '#core/constants/messages.constants.js';
import AppError from '#core/utils/AppError.utils.js';

const checkPlatformAdmin = (req, _res, next) => {
    if (!req.user.isPlatformAdmin) {
        throw new AppError(
            MESSAGES.ADMIN.ACCESS_REQUIRED,
            HTTP_STATUS.FORBIDDEN,
        );
    }

    next();
};

export { checkPlatformAdmin };
