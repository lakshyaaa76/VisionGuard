const IntegrityEvent = require('../models/IntegrityEvent');
const ExamSession = require('../models/ExamSession');
const { validationResult } = require('express-validator');

// @route   POST /integrity/event
// @desc    Log an integrity event
// @access  Private (CANDIDATE)
exports.logEvent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { sessionId, eventType, details } = req.body;

  try {
    const session = await ExamSession.findById(sessionId);

    if (!session || session.candidate.toString() !== req.user.id) {
      return res.status(404).json({ msg: 'Exam session not found' });
    }

    if (session.status !== 'IN_PROGRESS') {
      return res.status(400).json({ msg: 'Exam session is not in progress' });
    }

    const newEvent = new IntegrityEvent({
      examSession: sessionId,
      eventType,
      details,
    });

    const event = await newEvent.save();

    session.integrityEvents.push(event.id);
    await session.save();

    res.status(201).json({ msg: 'Event logged successfully' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
