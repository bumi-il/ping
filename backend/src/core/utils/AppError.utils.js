class AppError extends Error {
    constructor(message, code) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.status = String(code).startsWith('4') ? 'fail' : 'error';
        // TODO: Check this line
        this.isOperational = true;
        // TODO: Check this line
        Error.captureStackTrace(this, this.constructor);
    }
}

export default AppError;
