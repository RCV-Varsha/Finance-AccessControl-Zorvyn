const User = require('../models/User');

/**
 * UserService
 * 
 * We extract database logic into a service layer so controllers just deal with 
 * HTTP requests and responses. This makes code more reusable and easier to test.
 */
class UserService {
    /**
     * Finds a user by email and explicitly includes the password field 
     * (since select: false was set in the schema)
     */
    static async findUserWithPassword(email) {
        return User.findOne({ email }).select('+password');
    }

    /**
     * Checks if a user already exists with the given email
     */
    static async checkUserExists(email) {
        const user = await User.findOne({ email });
        return !!user;
    }

    /**
     * Creates a new user
     */
    static async createUser(userData) {
        const user = new User(userData);
        await user.save();
        return user;
    }

    /**
     * Finds a user by ID
     */
    static async findUserById(userId) {
        return User.findById(userId);
    }

    /**
     * Gets all users (helpful for admin dashboards)
     */
    static async getAllUsers() {
        return User.find({});
    }

    /**
     * Updates user details like role or status
     */
    static async updateUser(userId, updateData) {
        // new: true returns the updated document rather than the old one
        // runValidators: true ensures updates respect schema rules
        return User.findByIdAndUpdate(userId, updateData, {
            new: true,
            runValidators: true
        });
    }
}

module.exports = UserService;
