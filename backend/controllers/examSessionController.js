const ExamSession = require('../models/ExamSession');
const Exam = require('../models/Exam');
const Response = require('../models/Response');
const { validationResult } = require('express-validator');

// @route   POST /exam/start
// @desc    Start or resume an exam session (idempotent)
// @access  Private (CANDIDATE)
exports.startExamSession = async (req, res) => {
  const { examId } = req.body;

  try {
    const exam = await Exam.findById(examId);
    if (!exam || exam.status !== 'PUBLISHED') {
      return res.status(404).json({ msg: 'Published exam not found' });
    }

    const baseQuery = {
      exam: examId,
      candidate: req.user.id,
    };

    // Block re-attempt if exam already submitted
    const completedSession = await ExamSession.findOne({
      ...baseQuery,
      status: 'SUBMITTED',
    });

    if (completedSession) {
      return res.status(400).json({ msg: 'You have already completed this exam.' });
    }

    // Idempotent upsert for active session
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + exam.duration * 60000);

    const session = await ExamSession.findOneAndUpdate(
      {
        ...baseQuery,
        status: 'IN_PROGRESS', // 🔑 critical fix
      },
      {
        $setOnInsert: {
          startTime,
          endTime,
          status: 'IN_PROGRESS',
          integrity: { status: 'UNDER_REVIEW' },
        },
      },
      {
        new: true,
        upsert: true,
      }
    ).populate({
      path: 'exam',
      populate: { path: 'questions' },
    });

    res.json(session);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   POST /exam/submit
// @desc    Submit exam responses
// @access  Private (CANDIDATE)
exports.submitExam = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { sessionId, responses } = req.body;

  try {
    const session = await ExamSession.findById(sessionId);

    if (!session || session.candidate.toString() !== req.user.id) {
      return res.status(404).json({ msg: 'Exam session not found' });
    }

    if (session.status !== 'IN_PROGRESS') {
      return res.status(400).json({ msg: `Session is already ${session.status}` });
    }

    // Store responses
    const responseDocs = await Promise.all(
      responses.map(r =>
        new Response({
          examSession: sessionId,
          question: r.questionId,
          answer: r.answer,
        }).save()
      )
    );

    session.responses = responseDocs.map(r => r.id);
    session.status = 'SUBMITTED';
    session.submittedTime = new Date();
    await session.save();

    res.json({ msg: 'Exam submitted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET /exam/:sessionId/status
// @desc    Get the status of an exam session
// @access  Private (CANDIDATE)
exports.getExamSessionStatus = async (req, res) => {
  try {
    const session = await ExamSession.findById(req.params.sessionId);

    if (!session || session.candidate.toString() !== req.user.id) {
      return res.status(404).json({ msg: 'Exam session not found' });
    }

    res.json({
      status: session.status,
      startTime: session.startTime,
      endTime: session.endTime,
      submittedTime: session.submittedTime,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
