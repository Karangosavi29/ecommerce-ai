class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        errorCode = undefined,
        stack = ""
    ) {
        super(message);
        this.statusCode = statusCode; // HTTP status code
        this.data = null;             // Optional payload (currently null)
        this.success =false;         // Indicates API failure
        this.errors = errors;         // Array for field-specific errors
        this.errorCode = errorCode;   // Stable machine-readable code, e.g. "TOKEN_EXPIRED"

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError };