const { validationResult } = require('express-validator');

/**
 * Common Express Validator wrapper.
 * Checks the validation results from previous express-validator middlewares.
 * If there are errors, it formats them and sends a 400 Bad Request response.
 */
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    // If we have express-validator errors, shape them nicely to return to the user
    if (!errors.isEmpty()) {
        const extractedErrors = [];
        // Map over the errors to keep it clean: [{ "email": "Invalid email" }]
        errors.array().forEach(err => {
            // Depending on express-validator version, param or path might be used.
            const fieldName = err.path || err.param || 'unknown_field';
            extractedErrors.push({ [fieldName]: err.msg });
        });

        // 400 status code means Bad Request (invalid data)
        return res.status(400).json({
            success: false,
            errors: extractedErrors
        });
    }
    
    // Proceed to the actual route handler if validation passes
    next();
};

module.exports = {
    validateRequest
};
