import { HTTP_STATUS } from '#core/constants/httpStatus.constants.js';
import { MESSAGES } from '#core/constants/messages.constants.js';
import AppError from '#core/utils/AppError.utils.js';
import { errorResponse } from '#core/utils/response.utils.js';

const notFoundHandler = (req, _res, next) => {
    next(
        new AppError(
            MESSAGES.ROUTE.NOT_FOUND(req.originalUrl),
            HTTP_STATUS.NOT_FOUND,
        ),
    );
};

const errorHandler = (error, _req, res, _next) => {
    if (error instanceof AppError) {
        return errorResponse(res, error.code, error.message, error.details);
    }

    return errorResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        MESSAGES.SERVER.INTERNAL_ERROR,
    );
};

export { notFoundHandler, errorHandler };
