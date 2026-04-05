const jwt = require('jsonwebtoken');
const UserService = require('../services/userService');

/**
 * Controller for handling authentication and user-related HTTP requests.
 * Extracts data from requests and uses UserService for business logic.
 */
class AuthController {
    /**
     * @desc    Register a newly created user (Defaults to Viewer role)
     * @route   POST /api/auth/register
     * @access  Public
     */
    static async register(req, res, next) {
        try {
            const { name, email, password } = req.body;

            // Check if user exists
            const userExists = await UserService.checkUserExists(email);
            if (userExists) {
                return res.status(400).json({ success: false, message: 'User already exists' });
            }

            // Create new user (Role defaults to Viewer per schema)
            const user = await UserService.createUser({ name, email, password });

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            next(error); // Pass to global error handler
        }
    }

    /**
     * @desc    Login and generate JWT
     * @route   POST /api/auth/login
     * @access  Public
     */
    static async login(req, res, next) {
        try {
            const { email, password } = req.body;

            // Find user explicitly with password for comparison
            const user = await UserService.findUserWithPassword(email);
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid email or password' });
            }
            
            // Reject login if user is inactive
            if (user.status === 'inactive') {
                return res.status(403).json({ success: false, message: 'Account is deactivated' });
            }

            // Check password
            const isMatch = await user.matchPassword(password);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Invalid email or password' });
            }

            // Generate JWT payload
            const payload = {
                user: {
                    id: user._id,
                    role: user.role
                }
            };

            // Sign token
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRES_IN || '1d'
            });

            res.status(200).json({
                success: true,
                message: 'Login successful',
                token
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Admin endpoint to change user role or status
     * @route   PUT /api/auth/users/:id
     * @access  Private/Admin
     */
    static async manageUser(req, res, next) {
        try {
            const { role, status } = req.body;
            const updateFields = {};

            if (role) updateFields.role = role;
            if (status) updateFields.status = status;

            const updatedUser = await UserService.updateUser(req.params.id, updateFields);
            
            if (!updatedUser) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            res.status(200).json({
                success: true,
                message: 'User updated successfully',
                data: updatedUser
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = AuthController;
