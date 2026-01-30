const ExamSession = require('../models/ExamSession');
const { validationResult } = require('express-validator');

// @route   GET /proctor/sessions
// @desc    Get all sessions requiring review
// @access  Private (PROCTOR)
exports.getSessionsForReview = async (req, res) => {
  try {
    const sessions = await ExamSession.find({
      status: 'SUBMITTED',
      'integrityEvaluation.verdict': 'PENDING',
    }).populate('exam', 'title').populate('candidate', 'name');

    res.json(sessions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET /proctor/sessions/:id
// @desc    Get details of a single session for review
// @access  Private (PROCTOR)
exports.getSessionDetails = async (req, res) => {
  try {
    const session = await ExamSession.findById(req.params.id)
      .populate('exam', 'title description')
      .populate('candidate', 'name email')
      .populate('integrityEvents');

    if (!session) {
      return res.status(404).json({ msg: 'Exam session not found' });
    }

    res.json(session);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   POST /proctor/verdict
// @desc    Submit an integrity verdict for a session
// @access  Private (PROCTOR)
// @route   POST /proctor/sessions/:id/terminate
// @desc    Terminate an in-progress exam session
// @access  Private (PROCTOR, ADMIN)
exports.terminateSession = async (req, res) => {
  try {
    const session = await ExamSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ msg: 'Exam session not found' });
    }

    if (session.status !== 'IN_PROGRESS') {
      return res.status(400).json({ msg: 'Session is not in progress' });
    }

    session.status = 'TERMINATED';
    session.endTime = new Date(); // Log the time of termination
    await session.save();

    res.json({ msg: 'Session terminated successfully', session });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.submitVerdict = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { sessionId, verdict, remarks } = req.body;

    try {
        const session = await ExamSession.findById(sessionId);

        if (!session) {
            return res.status(404).json({ msg: 'Exam session not found' });
        }

        if (session.integrityEvaluation.verdict === 'CLEARED' || session.integrityEvaluation.verdict === 'INVALIDATED') {
            return res.status(400).json({ msg: 'A final verdict has already been submitted and cannot be changed' });
        }

        if (session.integrityEvaluation.verdict !== 'PENDING') {
            return res.status(400).json({ msg: 'Verdict has already been submitted' });
        }

        session.integrityEvaluation = {
            verdict,
            remarks,
            proctor: req.user.id,
        };

        await session.save();

        res.json({ msg: 'Verdict submitted successfully', integrityEvaluation: session.integrityEvaluation });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
