const ExamSession = require('../models/ExamSession');
const { tryFinalizeSession } = require('../services/finalizationService');

const getCandidateStatus = (session) => {
  if (session.finalStatus === 'INVALIDATED') return 'INVALIDATED';
  if (session.finalStatus === 'EVALUATED') return 'EVALUATED';
  return 'UNDER_REVIEW';
};

// @route   GET /candidate/sessions
// @desc    Get all exam sessions for the logged-in candidate
// @access  Private (CANDIDATE)
exports.getMySessions = async (req, res) => {
  try {
    const sessions = await ExamSession.find({ candidate: req.user.id })
      .populate('exam', 'title');

    await Promise.all(
      sessions.map(async (s) => {
        if (s.finalStatus) return;
        const changed = tryFinalizeSession(s);
        if (changed) {
          await s.save();
        }
      })
    );

    const sessionsWithStatus = sessions.map(session => ({
      ...session.toObject(),
      candidateStatus: getCandidateStatus(session),
    }));

    res.json(sessionsWithStatus);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET /candidate/sessions/:id/result
// @desc    Get the result of a single exam session for the logged-in candidate
// @access  Private (CANDIDATE)
exports.getMySessionResult = async (req, res) => {
  try {
    const session = await ExamSession.findOne({
      _id: req.params.id,
      candidate: req.user.id
    });

    if (!session) {
      return res.status(404).json({ msg: 'Session not found' });
    }

    if (!session.finalStatus) {
      const changed = tryFinalizeSession(session);
      if (changed) {
        await session.save();
      }
    }

    const candidateStatus = getCandidateStatus(session);

    if (candidateStatus === 'EVALUATED') {
      return res.json({
        finalStatus: 'EVALUATED',
        score: session.academicEvaluation.score,
        totalMarks: session.academicEvaluation.totalMarks,
      });
    }

    if (candidateStatus === 'INVALIDATED') {
      return res.json({ finalStatus: 'INVALIDATED' });
    }

    return res.json({ status: 'UNDER_REVIEW' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
