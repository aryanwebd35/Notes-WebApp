/**
 * Not Found Middleware
 * Handles requests to non-existent routes
 */
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

/**
 * Error Handler Middleware
 * Centralized error handling for all routes
 * 
 * Provides consistent error response format:
 * {
 *   message: "Error description",
 *   stack: "Stack trace (only in development)"
 * }
 * 
 * Status Codes:
 * - 400: Bad Request (validation errors)
 * - 401: Unauthorized (auth errors)
 * - 404: Not Found
 * - 500: Server Error (default)
 */
const errorHandler = (err, req, res, next) => {
    // If status code is 200 (success), change to 500 (server error)
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    res.status(statusCode).json({
        message: err.message,
        // Only show stack trace in development
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    });
};

export { notFound, errorHandler };
