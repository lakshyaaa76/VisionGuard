const ExamSession = require('../models/ExamSession');
const Question = require('../models/Question');
const Response = require('../models/Response');
const mongoose = require('mongoose');

// @route   POST /admin/evaluate/:sessionId
// @desc    Evaluate an exam session
// @access  Private (ADMIN)
exports.evaluateSession = async (req, res) => {
  try {
    const session = await ExamSession.findById(req.params.sessionId)
      .populate({ 
        path: 'exam', 
        populate: { path: 'questions' } 
      })
      .populate('responses');

    if (!session) {
      return res.status(404).json({ msg: 'Exam session not found' });
    }

    if (session.status !== 'SUBMITTED') {
      return res.status(400).json({ msg: 'Session has not been submitted' });
    }

    if (session.academicEvaluation.status === 'COMPLETED') {
        return res.status(400).json({ msg: 'Session has already been evaluated' });
    }

    let score = 0;
    const totalMarks = session.exam.questions.reduce((total, q) => total + q.marks, 0);
    const questionMap = new Map(session.exam.questions.map(q => [q.id.toString(), q]));

    let hasSubjective = false;
    for (const response of session.responses) {
      const question = questionMap.get(response.question.toString());
      if (question) {
        if (question.questionType === 'MCQ') {
          if (parseInt(response.answer, 10) === question.correctOption) {
            response.score = question.marks;
            score += question.marks;
          }
        } else if (question.questionType === 'SUBJECTIVE' || question.questionType === 'CODING') {
          hasSubjective = true;
          response.markedForReview = true;
        }
        await response.save();
      }
    }

    session.academicEvaluation = {
      score,
      totalMarks,
      status: 'COMPLETED',
      reviewStatus: hasSubjective ? 'PENDING' : 'COMPLETED',
    };

    await session.save();

    res.json({ msg: 'Evaluation complete', evaluation: session.academicEvaluation });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET /exam/:sessionId/result
// @desc    Get the result of an exam session
// @access  Private (ADMIN)
exports.getSessionForManualEvaluation = async (req, res) => {
  try {
    const session = await ExamSession.findById(req.params.sessionId)
      .populate({
        path: 'responses',
        populate: { path: 'question' }
      });

    if (!session) {
      return res.status(404).json({ msg: 'Exam session not found' });
    }

    res.json(session);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.submitSubjectiveScore = async (req, res) => {
  const { score } = req.body;
  try {
    const response = await Response.findById(req.params.responseId);
    if (!response) {
      return res.status(404).json({ msg: 'Response not found' });
    }

    response.score = score;
    await response.save();

    // Recalculate total score for the session
    const session = await ExamSession.findById(response.examSession).populate('responses');
    const totalScore = session.responses.reduce((total, r) => total + r.score, 0);
    session.academicEvaluation.score = totalScore;
    
    // Check if all subjective questions are scored
    const allReviewed = session.responses
      .filter(r => r.markedForReview)
      .every(r => r.score > 0 || (r.score === 0 && r.markedForReview)); // Allows scoring 0

    if (allReviewed) {
      session.academicEvaluation.reviewStatus = 'COMPLETED';
    }

    await session.save();

    res.json(session.academicEvaluation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getSessionResult = async (req, res) => {
  try {
    const session = await ExamSession.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).json({ msg: 'Exam session not found' });
    }

    if (session.academicEvaluation.status !== 'COMPLETED') {
        return res.status(400).json({ msg: 'Evaluation is not yet complete' });
    }

    res.json(session.academicEvaluation);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
