const ExamSession = require('../models/ExamSession');

const getCandidateStatus = (session) => {
  if (session.integrity?.status === 'INVALIDATED') {
    return 'INVALIDATED';
  }
  if (session.integrity?.status !== 'CLEARED') {
    return 'UNDER_REVIEW';
  }
  if (session.academicEvaluation.status === 'COMPLETED' && session.academicEvaluation.reviewStatus !== 'PENDING') {
    return 'EVALUATED';
  }
  return 'UNDER_REVIEW';
};

// @route   GET /candidate/sessions
// @desc    Get all exam sessions for the logged-in candidate
// @access  Private (CANDIDATE)
exports.getMySessions = async (req, res) => {
  try {
    const sessions = await ExamSession.find({ candidate: req.user.id })
      .populate('exam', 'title');

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

    const candidateStatus = getCandidateStatus(session);

    if (candidateStatus !== 'EVALUATED') {
      return res.status(403).json({ msg: `Result is not available. Status: ${candidateStatus}` });
    }

    res.json({
      score: session.academicEvaluation.score,
      totalMarks: session.academicEvaluation.totalMarks,
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
