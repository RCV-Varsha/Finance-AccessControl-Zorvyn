const jwt = require('jsonwebtoken');

/**
 * Middleware to protect routes.
 * Ensures the user has a valid JWT token in their Authorization header.
 * If valid, req.user is populated with the decoded token data (id, role).
 */
const protect = (req, res, next) => {
    let token;

    // Check if Authorization header exists and follows 'Bearer <token>' format
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized to access this route, token missing' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach decoded user portion of the payload to request object
        req.user = decoded.user;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
};

/**
 * Middleware for Role-Based Access Control (RBAC).
 * Returns a middleware function that checks if the req.user's role exists 
 * in the allowed roles array.
 * Note: Must be placed AFTER the protect middleware so req.user is populated.
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: `User role '${req.user ? req.user.role : 'Unknown'}' is not authorized to access this route`
            });
        }
        next();
    };
};

module.exports = {
    protect,
    authorize
};
