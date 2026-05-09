class AppError extends Error {
    constructor(message, code, details = {}) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.details = details;
        this.status = String(code).startsWith('4') ? 'fail' : 'error';
        // TODO: Learn this line
        this.isOperational = true;
        // TODO: Learn this line
        Error.captureStackTrace(this, this.constructor);
    }
}

export default AppError;
