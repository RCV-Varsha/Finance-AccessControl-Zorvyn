const mongoose = require('mongoose');

/**
 * Financial Record Schema definition
 * Contains details about incomes and expenses.
 * Tied to a specific user optionally, but mostly acts as global tracking
 * in an organizational dashboard per requirements. We'll add a createdBy field
 * for better auditing.
 */
const recordSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0, 'Amount cannot be negative'] // Amounts should be positive, 'type' decides if income/expense
    },
    type: {
        type: String,
        required: [true, 'Type is required'],
        enum: ['income', 'expense']
    },
    category: {
        type: String,
        required: [true, 'Category is required'], // e.g. "Salary", "Rent", "Utilities"
        trim: true
    },
    date: {
        type: Date,
        required: [true, 'Date is required'],
        default: Date.now
    },
    description: {
        type: String,
        trim: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true // We want to know who created the record
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('FinancialRecord', recordSchema);
