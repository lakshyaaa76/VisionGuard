const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');
const { check } = require('express-validator');

// @route   POST /auth/register
// @desc    Register a user
// @access  Public for CANDIDATE, Private (ADMIN) for PROCTOR/ADMIN
router.post('/register', [authenticateJWT, 
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], register);

// @route   POST /auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
], login);

// @route   GET /auth/me
// @desc    Get logged in user
// @access  Private
router.get('/me', authenticateJWT, getMe);

module.exports = router;
