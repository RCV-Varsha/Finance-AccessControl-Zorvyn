const express = require('express');
const { check } = require('express-validator');
const AuthController = require('../controllers/authController');
const { validateRequest } = require('../utils/validator');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Validation schema for registration
const registerValidation = [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
];

// Validation schema for login
const loginValidation = [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
];

// @route   POST /api/auth/register
router.post('/register', registerValidation, validateRequest, AuthController.register);

// @route   POST /api/auth/login
router.post('/login', loginValidation, validateRequest, AuthController.login);

// @route   PUT /api/auth/users/:id
// Admin only: protect extracts user info from JWT, authorize enforces Admin role
router.put('/users/:id', protect, authorize('Admin'), AuthController.manageUser);

module.exports = router;
