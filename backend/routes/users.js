const express = require('express');
const router = express.Router();
const { getAllUsers } = require('../controllers/userController');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');

// @route   GET /admin/users
// @desc    Get all users
// @access  Private (ADMIN)
router.get('/admin/users', [authenticateJWT, authorizeRoles('ADMIN')], getAllUsers);

module.exports = router;
