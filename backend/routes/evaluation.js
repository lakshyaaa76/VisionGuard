const express = require('express');
const router = express.Router();
const { 
  evaluateSession, 
  getSessionResult, 
  getSessionForManualEvaluation, 
  submitSubjectiveScore, 
  finalizeEvaluation, 
  getAllSessionsForEvaluation 
} = require('../controllers/evaluationController');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');

// @route   GET /sessions
// @desc    Get all submitted sessions for evaluation
// @access  Private (ADMIN)
router.get('/sessions', [authenticateJWT, authorizeRoles('ADMIN')], getAllSessionsForEvaluation);

// @route   POST /evaluate/:sessionId
// @desc    Run initial auto-evaluation for a session
// @access  Private (ADMIN)
router.post('/evaluate/:sessionId', [authenticateJWT, authorizeRoles('ADMIN')], evaluateSession);

// @route   GET /sessions/:sessionId
// @desc    Get a specific session for manual evaluation
// @access  Private (ADMIN)
router.get('/sessions/:sessionId', [authenticateJWT, authorizeRoles('ADMIN')], getSessionForManualEvaluation);

// @route   POST /response/:responseId
// @desc    Submit a score for a single subjective response
// @access  Private (ADMIN)
router.post('/response/:responseId', [authenticateJWT, authorizeRoles('ADMIN')], submitSubjectiveScore);

// @route   POST /finalize/:sessionId
// @desc    Finalize the evaluation for a session after manual review
// @access  Private (ADMIN)
router.post('/finalize/:sessionId', [authenticateJWT, authorizeRoles('ADMIN')], finalizeEvaluation);

// @route   GET /result/:sessionId 
// @desc    Get the result of an exam session
// @access  Private (ADMIN)
router.get('/result/:sessionId', [authenticateJWT, authorizeRoles('ADMIN')], getSessionResult);

module.exports = router;
