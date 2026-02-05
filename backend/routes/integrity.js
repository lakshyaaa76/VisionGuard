const express = require('express');
const router = express.Router();
const { logEvent, logMlFrame } = require('../controllers/integrityController');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');
const { check } = require('express-validator');

// @route   POST /integrity/event
// @desc    Log an integrity event
// @access  Private (CANDIDATE)
router.post('/integrity/event', [authenticateJWT, authorizeRoles('CANDIDATE'), [
    check('sessionId', 'Session ID is required').not().isEmpty(),
    check('eventType', 'Event type is required').isIn(['TAB_SWITCH', 'FOCUS_LOSS']),
    check('evidenceUrl').optional().isString(),
]], logEvent);

// @route   POST /integrity/ml-frame
// @desc    Ingest a sampled frame (base64) and derive ML-signal integrity events
// @access  Private (CANDIDATE)
router.post('/integrity/ml-frame', [authenticateJWT, authorizeRoles('CANDIDATE'), [
    check('sessionId', 'Session ID is required').not().isEmpty(),
    check('image_base64', 'image_base64 is required').isString().not().isEmpty(),
]], logMlFrame);

module.exports = router;
