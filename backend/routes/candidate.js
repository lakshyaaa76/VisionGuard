const express = require('express');
const router = express.Router();
const { getMySessions, getMySessionResult } = require('../controllers/candidateController');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');

// @route   GET /candidate/sessions
// @desc    Get all exam sessions for the logged-in candidate
// @access  Private (CANDIDATE)
router.get('/candidate/sessions', [authenticateJWT, authorizeRoles('CANDIDATE')], getMySessions);

// @route   GET /candidate/sessions/:id/result
// @desc    Get the result of a single exam session for the logged-in candidate
// @access  Private (CANDIDATE)
router.get('/candidate/sessions/:id/result', [authenticateJWT, authorizeRoles('CANDIDATE')], getMySessionResult);

module.exports = router;
