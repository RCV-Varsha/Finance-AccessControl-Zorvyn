const RecordService = require('../services/recordService');

/**
 * Record Controller
 * Manages incoming requests for financial records, handling req/res cycles.
 */
class RecordController {
    /**
     * @desc    Create new financial record
     * @route   POST /api/records
     * @access  Private (Admin only)
     * Note: Per requirements, Analysts cannot create/delete. Admins have full access.
     */
    static async createRecord(req, res, next) {
        try {
            // Attach the User ID from the JWT token
            const recordData = {
                ...req.body,
                createdBy: req.user.id
            };

            const record = await RecordService.createRecord(recordData);

            res.status(201).json({
                success: true,
                message: 'Record created successfully',
                data: record
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Get all financial records (with filters, search, and pagination)
     * @route   GET /api/records
     * @access  Private (Viewer, Analyst, Admin)
     */
    static async getRecords(req, res, next) {
        try {
            // Extract standard filters plus new page, limit, and search parameters
            const { type, category, startDate, endDate, search, page, limit } = req.query;
            
            // The service now returns both standard records and pagination info
            const result = await RecordService.getRecords({ type, category, startDate, endDate, search, page, limit });

            res.status(200).json({
                success: true,
                count: result.records.length,
                pagination: result.pagination,
                data: result.records
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Update a financial record
     * @route   PUT /api/records/:id
     * @access  Private (Admin only)
     */
    static async updateRecord(req, res, next) {
        try {
            const updatedRecord = await RecordService.updateRecord(req.params.id, req.body);

            if (!updatedRecord) {
                return res.status(404).json({ success: false, message: 'Record not found' });
            }

            res.status(200).json({
                success: true,
                message: 'Record updated successfully',
                data: updatedRecord
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Delete a financial record
     * @route   DELETE /api/records/:id
     * @access  Private (Admin only)
     */
    static async deleteRecord(req, res, next) {
        try {
            const deletedRecord = await RecordService.deleteRecord(req.params.id);

            if (!deletedRecord) {
                return res.status(404).json({ success: false, message: 'Record not found' });
            }

            res.status(200).json({
                success: true,
                message: 'Record deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = RecordController;
