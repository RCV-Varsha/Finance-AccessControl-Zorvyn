const DashboardService = require('../services/dashboardService');

/**
 * DashboardController
 * Serves summary endpoints. Accessible by Analysts and Admins.
 */
class DashboardController {
    /**
     * @desc    Get overall financial summary
     * @route   GET /api/dashboard/summary
     * @access  Private (Analyst, Admin)
     */
    static async getSummary(req, res, next) {
        try {
            const summary = await DashboardService.getSummary();
            res.status(200).json({ success: true, data: summary });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Get category-wise totals filterable by type
     * @route   GET /api/dashboard/categories
     * @access  Private (Analyst, Admin)
     */
    static async getCategoryTotals(req, res, next) {
        try {
            const { type } = req.query; // 'income' or 'expense'
            const categories = await DashboardService.getCategoryTotals(type);
            res.status(200).json({ success: true, count: categories.length, data: categories });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Get monthly aggregated trends
     * @route   GET /api/dashboard/trends
     * @access  Private (Analyst, Admin)
     */
    static async getMonthlyTrends(req, res, next) {
        try {
            const trends = await DashboardService.getMonthlyTrends();
            res.status(200).json({ success: true, count: trends.length, data: trends });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Get recent transactions
     * @route   GET /api/dashboard/recent
     * @access  Private (Analyst, Admin)
     */
    static async getRecentTransactions(req, res, next) {
        try {
            const limit = parseInt(req.query.limit, 10) || 10;
            const recent = await DashboardService.getRecentTransactions(limit);
            res.status(200).json({ success: true, count: recent.length, data: recent });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = DashboardController;
