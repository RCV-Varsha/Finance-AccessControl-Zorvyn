const express = require('express');
const { check } = require('express-validator');
const RecordController = require('../controllers/recordController');
const { validateRequest } = require('../utils/validator');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Validation rules for creating/updating a record
const recordValidation = [
    check('amount', 'Amount is required and must be a number').isNumeric(),
    check('type', 'Type must be either income or expense').isIn(['income', 'expense']),
    check('category', 'Category is required').not().isEmpty(),
    check('date', 'Valid date is required').optional().isISO8601()
];

// Apply protection to all routes in this file (must be logged in)
router.use(protect);

// GET /api/records - Accessible by Viewer, Analyst, Admin
router.route('/')
    .get(RecordController.getRecords)
    // POST /api/records - Accessible by Admin only
    .post(authorize('Admin'), recordValidation, validateRequest, RecordController.createRecord);

// Single record operations
router.route('/:id')
    // PUT /api/records/:id - Accessible by Admin only
    .put(authorize('Admin'), recordValidation, validateRequest, RecordController.updateRecord)
    // DELETE /api/records/:id - Accessible by Admin only
    .delete(authorize('Admin'), RecordController.deleteRecord);

module.exports = router;
