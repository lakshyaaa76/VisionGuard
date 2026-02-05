const ExamSession = require('../models/ExamSession');
const { validationResult } = require('express-validator');
const { tryFinalizeSession } = require('../services/finalizationService');

// @route   GET /proctor/sessions
// @desc    Get all sessions requiring review
// @access  Private (PROCTOR)
exports.getSessionsForReview = async (req, res) => {
  try {
    await ExamSession.updateMany(
      { status: 'SUBMITTED', integrity: { $exists: false } },
      { $set: { integrity: { status: 'UNDER_REVIEW' } } }
    );

    const sessions = await ExamSession.find({
      status: 'SUBMITTED',
      'integrity.status': 'UNDER_REVIEW',
    })
      .sort({ submittedTime: -1, updatedAt: -1, createdAt: -1 })
      .populate('exam', 'title')
      .populate('candidate', 'name');

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
      .populate({ path: 'integrityEvents', options: { sort: { timestamp: 1 } } });

    if (!session) {
      return res.status(404).json({ msg: 'Exam session not found' });
    }

    if (!session.integrity) {
      session.integrity = { status: 'UNDER_REVIEW' };
      await session.save();
    }

    const integrityStatus = session.integrity.status;
    if (integrityStatus !== 'UNDER_REVIEW') {
      return res.status(400).json({ msg: 'Session is not under integrity review' });
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

        if (session.finalStatus) {
            return res.status(400).json({ msg: 'Session is already finalized' });
        }

        const integrityStatus = session.integrity?.status || 'UNDER_REVIEW';

        if (integrityStatus === 'CLEARED' || integrityStatus === 'INVALIDATED') {
            return res.status(400).json({ msg: 'A final verdict has already been submitted and cannot be changed' });
        }

        if (integrityStatus !== 'UNDER_REVIEW') {
            return res.status(400).json({ msg: 'Session is not under integrity review' });
        }

        session.integrity = {
          status: verdict,
          decidedBy: req.user.id,
          decidedAt: new Date(),
          remarks,
        };

        tryFinalizeSession(session);
        await session.save();

        res.json({ msg: 'Verdict submitted successfully', integrity: session.integrity });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
