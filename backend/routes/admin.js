const express = require('express');
const router = express.Router();
const { getAllSessions } = require('../controllers/adminController');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');

// @route   GET /admin/sessions
// @desc    Get all submitted sessions for admin review and evaluation
// @access  Private (ADMIN)
router.get('/admin/sessions', [authenticateJWT, authorizeRoles('ADMIN')], getAllSessions);

module.exports = router;
