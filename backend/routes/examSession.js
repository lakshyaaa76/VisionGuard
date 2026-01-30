const express = require('express');
const router = express.Router();
const { startExamSession, submitExam, getExamSessionStatus } = require('../controllers/examSessionController');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');
const { check } = require('express-validator');

// @route   POST /exam/start
// @desc    Start an exam session
// @access  Private (CANDIDATE)
router.post('/exam/start', [authenticateJWT, authorizeRoles('CANDIDATE'), [
    check('examId', 'Exam ID is required').not().isEmpty(),
]], startExamSession);

// @route   POST /exam/submit
// @desc    Submit exam responses
// @access  Private (CANDIDATE)
router.post('/exam/submit', [authenticateJWT, authorizeRoles('CANDIDATE'), [
    check('sessionId', 'Session ID is required').not().isEmpty(),
    check('responses', 'Responses are required').isArray({ min: 1 }),
]], submitExam);

// @route   GET /exam/:sessionId/status
// @desc    Get the status of an exam session
// @access  Private (CANDIDATE)
router.get('/exam/:sessionId/status', [authenticateJWT, authorizeRoles('CANDIDATE')], getExamSessionStatus);

module.exports = router;
