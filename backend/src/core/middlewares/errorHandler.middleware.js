import { errorResponse } from '../utils/response.utils.js';
import AppError from '../utils/AppError.utils.js';

const notFoundHandler = (req, _res, next) => {
    next(new AppError(`Route ${req.originalUrl} was not found`, 404));
};

const errorHandler = (error, _req, res, _next) => {
    if (error instanceof AppError) {
        return errorResponse(res, error.code, error.message);
    }

    return errorResponse(res, 500, error.message);
};

export { notFoundHandler, errorHandler };
