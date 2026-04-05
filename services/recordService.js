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
     * Get records with pagination, search, and optional filtering
     * For Analyst and Admin to view. Viewer can view too.
     */
    static async getRecords(filters = {}) {
        let query = {};

        // 1. Basic Filters
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

        // 2. Search Functionality
        if (filters.search) {
            // Use regex for case-insensitive partial match on description or category
            query.$or = [
                { description: { $regex: filters.search, $options: 'i' } },
                { category: { $regex: filters.search, $options: 'i' } }
            ];
        }

        // 3. Pagination Configuration
        const page = parseInt(filters.page) || 1;
        const limit = parseInt(filters.limit) || 10;
        const skip = (page - 1) * limit;

        // 4. Execute Queries
        const total = await FinancialRecord.countDocuments(query);
        const records = await FinancialRecord.find(query)
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit)
            .populate('createdBy', 'name email');

        return {
            records,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        };
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
