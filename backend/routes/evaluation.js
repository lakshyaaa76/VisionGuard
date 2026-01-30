const express = require('express');
const router = express.Router();
const { evaluateSession, getSessionResult, getSessionForManualEvaluation, submitSubjectiveScore } = require('../controllers/evaluationController');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');

// @route   POST /admin/evaluate/:sessionId
// @desc    Evaluate an exam session
// @access  Private (ADMIN)
router.post('/admin/evaluate/:sessionId', [authenticateJWT, authorizeRoles('ADMIN')], evaluateSession);

// @route   GET /exam/:sessionId/result
// @desc    Get the result of an exam session
// @access  Private (ADMIN)
router.get('/exam/:sessionId/result', [authenticateJWT, authorizeRoles('ADMIN')], getSessionResult);

// @route   GET /admin/evaluation/:sessionId
// @desc    Get session details for manual evaluation
// @access  Private (ADMIN)
router.get('/admin/evaluation/:sessionId', [authenticateJWT, authorizeRoles('ADMIN')], getSessionForManualEvaluation);

// @route   POST /admin/evaluation/response/:responseId
// @desc    Submit score for a subjective response
// @access  Private (ADMIN)
router.post('/admin/evaluation/response/:responseId', [authenticateJWT, authorizeRoles('ADMIN')], submitSubjectiveScore);

module.exports = router;
