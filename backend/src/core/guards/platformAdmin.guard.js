import { HTTP_STATUS } from '../constants/httpStatus.constants.js';
import { MESSAGES } from '../constants/messages.constants.js';
import AppError from '../utils/AppError.utils.js';

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
