require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Setup the HTTP server
const server = http.createServer(app);

// Connect to MongoDB
connectDB().then(() => {
    console.log('Database connected, starting server...');
    // Start the server only if the database connection is successful
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch((error) => {
    console.error('Failed to connect to the database. Exiting...', error);
    process.exit(1);
});
