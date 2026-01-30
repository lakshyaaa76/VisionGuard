const express = require('express');
const router = express.Router();
const { logEvent } = require('../controllers/integrityController');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');
const { check } = require('express-validator');

// @route   POST /integrity/event
// @desc    Log an integrity event
// @access  Private (CANDIDATE)
router.post('/integrity/event', [authenticateJWT, authorizeRoles('CANDIDATE'), [
    check('sessionId', 'Session ID is required').not().isEmpty(),
    check('eventType', 'Event type is required').isIn(['TAB_SWITCH', 'FOCUS_LOSS']),
]], logEvent);

module.exports = router;
