const mongoose = require('mongoose');

/**
 * Connects to the MongoDB database using Mongoose.
 * This is kept in a separate file to decouple DB logic from the main server setup.
 */
const connectDB = async () => {
    try {
        // Ensuring MONGO_URI is defined in the environment
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is not defined in the environment variables");
        }

        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        throw error;
    }
};

module.exports = connectDB;
