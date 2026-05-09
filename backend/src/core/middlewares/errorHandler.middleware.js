import { errorResponse } from '../utils/response.utils.js';
import AppError from '../utils/AppError.utils.js';
import { HTTP_STATUS } from '../constants/httpStatus.constants.js';
import { MESSAGES } from '../constants/messages.constants.js';

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
        return errorResponse(res, error.code, error.message);
    }

    return errorResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        MESSAGES.SERVER.INTERNAL_ERROR,
    );
};

export { notFoundHandler, errorHandler };
