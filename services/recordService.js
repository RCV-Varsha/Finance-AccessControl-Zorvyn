const FinancialRecord = require('../models/FinancialRecord');

/**
 * RecordService
 * Extracts complex MongoDB filtering logic away from the controller.
 */
class RecordService {
    /**
     * Create a new record
     */
    static async createRecord(data) {
        const record = new FinancialRecord(data);
        return await record.save();
    }

    /**
     * Get records with optional filtering (date range, category, type)
     * For Analyst and Admin to view. Viewer can view too.
     */
    static async getRecords(filters = {}) {
        let query = {};

        // Build MongoDB query dynamically based on provided filters
        if (filters.type) {
            query.type = filters.type;
        }
        
        if (filters.category) {
            query.category = filters.category;
        }

        if (filters.startDate || filters.endDate) {
            query.date = {};
            if (filters.startDate) query.date.$gte = new Date(filters.startDate);
            if (filters.endDate) query.date.$lte = new Date(filters.endDate);
        }

        // Sort by date descending
        return FinancialRecord.find(query).sort({ date: -1 }).populate('createdBy', 'name email');
    }

    /**
     * Finds a specific record by ID
     */
    static async getRecordById(id) {
        return FinancialRecord.findById(id).populate('createdBy', 'name email');
    }

    /**
     * Updates an existing record
     */
    static async updateRecord(id, updateData) {
        return FinancialRecord.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        });
    }

    /**
     * Deletes a record from the database
     */
    static async deleteRecord(id) {
        return FinancialRecord.findByIdAndDelete(id);
    }
}

module.exports = RecordService;
