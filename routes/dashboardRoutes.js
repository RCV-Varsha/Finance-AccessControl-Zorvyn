const express = require('express');
const DashboardController = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply protection to all dashboard routes
router.use(protect);
// Dashboard limits access to Analyst and Admin roles
router.use(authorize('Analyst', 'Admin'));

// Summary endpoints
router.get('/summary', DashboardController.getSummary);
router.get('/categories', DashboardController.getCategoryTotals);
router.get('/trends', DashboardController.getMonthlyTrends);
router.get('/recent', DashboardController.getRecentTransactions);

module.exports = router;
