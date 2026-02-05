const express = require('express');
const router = express.Router();
const { getSessionsForReview, getSessionDetails, submitVerdict, terminateSession } = require('../controllers/proctorController');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');
const { check } = require('express-validator');

// @route   GET /proctor/sessions
// @desc    Get all sessions requiring review
// @access  Private (PROCTOR)
router.get('/proctor/sessions', [authenticateJWT, authorizeRoles('PROCTOR')], getSessionsForReview);

// @route   GET /proctor/sessions/:id
// @desc    Get details of a single session for review
// @access  Private (PROCTOR)
router.get('/proctor/sessions/:id', [authenticateJWT, authorizeRoles('PROCTOR')], getSessionDetails);

// @route   POST /proctor/verdict
// @desc    Submit an integrity verdict for a session
// @access  Private (PROCTOR)
router.post('/proctor/verdict', [authenticateJWT, authorizeRoles('PROCTOR'), [
    check('sessionId', 'Session ID is required').not().isEmpty(),
    check('verdict', 'Verdict is required').isIn(['CLEARED', 'INVALIDATED'])
]], submitVerdict);

// @route   POST /proctor/sessions/:id/terminate
// @desc    Terminate an in-progress exam session
// @access  Private (PROCTOR)
router.post('/proctor/sessions/:id/terminate', [authenticateJWT, authorizeRoles('PROCTOR')], terminateSession);

module.exports = router;
