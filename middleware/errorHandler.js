/**
 * Global Error Handler Middleware
 * 
 * Captures all errors thrown in routes/services and shapes them into a 
 * consistent JSON response. This provides the client with standard error objects.
 */
const errorHandler = (err, req, res, next) => {
    console.error(`[Error] ${err.message}`); // Log for debugging purposes on the server side

    // If the error has a predetermined status code, use it; otherwise default to 500
    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',
        // Provide the stack trace only in development to prevent leaking sensitive details
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};

module.exports = errorHandler;
