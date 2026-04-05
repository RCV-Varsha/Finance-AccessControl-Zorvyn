const FinancialRecord = require('../models/FinancialRecord');

/**
 * DashboardService
 * Handles complex MongoDB aggregations so controllers remain clean.
 * Mongoose aggregates are highly efficient for computing summaries.
 */
class DashboardService {
    /**
     * Get summary values (total income, total expenses, net balance)
     */
    static async getSummary() {
        // We use an aggregation pipeline to sum up all incomes and expenses
        const result = await FinancialRecord.aggregate([
            {
                $group: {
                    _id: "$type",
                    totalAmount: { $sum: "$amount" }
                }
            }
        ]);

        let totalIncome = 0;
        let totalExpense = 0;

        result.forEach(item => {
            if (item._id === 'income') totalIncome = item.totalAmount;
            if (item._id === 'expense') totalExpense = item.totalAmount;
        });

        return {
            totalIncome,
            totalExpense,
            netBalance: totalIncome - totalExpense
        };
    }

    /**
     * Get totals grouped by category
     */
    static async getCategoryTotals(type) {
        // Create match condition. If type is provided, filter by it; else match all.
        const matchStage = type ? { $match: { type } } : { $match: {} };

        return FinancialRecord.aggregate([
            matchStage,
            {
                $group: {
                    _id: "$category",
                    totalAmount: { $sum: "$amount" }
                }
            },
            { $sort: { totalAmount: -1 } } // Sort by highest amount first
        ]);
    }

    /**
     * Get Monthly Trends (income/expenses grouped by month)
     * For drawing charts on the frontend
     */
    static async getMonthlyTrends() {
        return FinancialRecord.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$date" },
                        month: { $month: "$date" },
                        type: "$type"
                    },
                    totalAmount: { $sum: "$amount" }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);
    }

    /**
     * Get recent transactions
     */
    static async getRecentTransactions(limit = 10) {
        return FinancialRecord.find()
            .sort({ date: -1 })
            .limit(limit)
            .populate('createdBy', 'name email');
    }
}

module.exports = DashboardService;
