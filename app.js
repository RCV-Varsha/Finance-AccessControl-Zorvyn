const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const recordRoutes = require('./routes/recordRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to enable CORS
app.use(cors());

// Global API Rate Limiter Configuration
// Limits each IP to 100 requests per 15 minutes
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after 15 minutes.'
    }
});

// Apply the rate limiter to all API routes
app.use('/api/', apiLimiter);

// Root Route for browser deployment landing page
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Finance Backend API</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; color: #333; margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                .container { background-color: #fff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 600px; width: 100%; box-sizing: border-box; }
                h1 { color: #2c3e50; margin-top: 0; }
                p { line-height: 1.6; }
                .endpoints { background-color: #ecf0f1; padding: 15px; border-radius: 5px; margin: 20px 0; }
                ul { list-style-type: none; padding-left: 0; }
                li { margin-bottom: 10px; font-family: monospace; font-size: 14px; background: #e0e6ed; padding: 8px 10px; border-radius: 3px; display: inline-block; width: 100%; box-sizing: border-box; }
                .note { border-left: 4px solid #e74c3c; padding-left: 15px; margin-top: 20px; font-size: 14px; color: #555; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Finance Backend API is Running 🚀</h1>
                <p>Welcome to the Finance Data Processing and Access Control Backend. This API supports strict Role-Based Access Control, JWT authentication, and secure financial record management.</p>
                <p><strong>How to test:</strong> Please use <a href="https://www.postman.com/" target="_blank">Postman</a> or any other API testing tool to interact with this service.</p>
                
                <div class="endpoints">
                    <strong>Key API Endpoints:</strong>
                    <ul>
                        <li>POST /api/auth/register</li>
                        <li>POST /api/auth/login</li>
                        <li>GET /api/records</li>
                        <li>GET /api/dashboard/summary</li>
                    </ul>
                </div>
                
                <div class="note">
                    <strong>Security Note:</strong> JWT authentication is strictly required for accessing protected routes. Include your token as a Bearer Token in the Authorization header.
                </div>
            </div>
        </body>
        </html>
    `);
});

// Basic health check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is running healthily' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Global Error Handler Middleware
// We use a middleware here to centralize err handling instead of repeating try-catch error logic
app.use(errorHandler);

module.exports = app;
