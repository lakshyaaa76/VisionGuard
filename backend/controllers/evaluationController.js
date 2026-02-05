const ExamSession = require('../models/ExamSession');
const Question = require('../models/Question');
const Response = require('../models/Response');
const mongoose = require('mongoose');
const { tryFinalizeSession } = require('../services/finalizationService');

const evaluateSession = async (req, res) => {
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

    if (session.finalStatus) {
      return res.status(400).json({ msg: 'Session is finalized' });
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

    tryFinalizeSession(session);

    await session.save();

    res.json({ msg: 'Evaluation complete', evaluation: session.academicEvaluation });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

const getSessionForManualEvaluation = async (req, res) => {
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

const submitSubjectiveScore = async (req, res) => {
  const { score } = req.body;
  try {
    const response = await Response.findById(req.params.responseId);
    if (!response) {
      return res.status(404).json({ msg: 'Response not found' });
    }

    response.score = score;
    await response.save();

    const session = await ExamSession.findById(response.examSession).populate('responses');
    if (session.finalStatus) {
      return res.status(400).json({ msg: 'Session is finalized' });
    }
    const totalScore = session.responses.reduce((total, r) => total + (r.score || 0), 0);
    session.academicEvaluation.score = totalScore;
    
    const allReviewed = session.responses
      .filter(r => r.markedForReview)
      .every(r => r.score !== undefined);

    if (allReviewed) {
      session.academicEvaluation.reviewStatus = 'COMPLETED';
    }

    tryFinalizeSession(session);

    await session.save();

    res.json(session.academicEvaluation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

const getSessionResult = async (req, res) => {
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

const getAllSessionsForEvaluation = async (req, res) => {
  try {
    const sessions = await ExamSession.find({ status: 'SUBMITTED' })
      .sort({ submittedTime: -1, updatedAt: -1, createdAt: -1 })
      .populate('candidate', 'name email')
      .populate('exam', 'title');
    res.json(sessions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

const finalizeEvaluation = async (req, res) => {
    try {
        const session = await ExamSession.findById(req.params.sessionId);
        if (!session) {
            return res.status(404).json({ msg: 'Session not found' });
        }

        if (session.finalStatus) {
            return res.status(400).json({ msg: 'Session is finalized' });
        }

        session.academicEvaluation.reviewStatus = 'COMPLETED';

        tryFinalizeSession(session);
        await session.save();

        res.json({ msg: 'Evaluation finalized successfully.', evaluation: session.academicEvaluation });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = {
  evaluateSession,
  getSessionForManualEvaluation,
  submitSubjectiveScore,
  getSessionResult,
  getAllSessionsForEvaluation,
  finalizeEvaluation,
};
