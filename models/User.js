const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema definition
 * 
 * We keep the schema clean and use Mongoose middleware (pre-save) 
 * so that any time a password is saved, it is automatically hashed. 
 * This prevents plain-text passwords from ever being recorded.
 */
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        // Basic regex for email format validation
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
        select: false // Exclude password from query results by default for security
    },
    role: {
        type: String,
        enum: ['Viewer', 'Analyst', 'Admin'],
        default: 'Viewer'
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, {
    timestamps: true // Automatically creates createdAt and updatedAt fields
});

// Middleware to hash the password before saving
userSchema.pre('save', async function() {
    // Only hash if the password was actually modified, avoiding double hashing
    if (!this.isModified('password')) return;

    // Generate a salt with 10 rounds, which is a good balance between security and speed
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Instance method to check if provided password matches the hashed password in db
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
