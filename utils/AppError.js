class AppError extends Error {
    constructor(statusCode, code, message, meta = {}) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.meta = meta;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
