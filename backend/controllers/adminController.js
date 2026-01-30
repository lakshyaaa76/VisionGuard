const ExamSession = require('../models/ExamSession');

// @route   GET /admin/sessions
// @desc    Get all submitted sessions for admin review and evaluation
// @access  Private (ADMIN)
exports.getAllSessions = async (req, res) => {
  try {
    const sessions = await ExamSession.find({ status: { $in: ['SUBMITTED', 'TERMINATED'] } })
      .populate('exam', 'title')
      .populate('candidate', 'name');
    res.json(sessions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
