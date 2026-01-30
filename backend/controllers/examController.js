const Exam = require('../models/Exam');
const Question = require('../models/Question');
const { validationResult } = require('express-validator');

// @route   POST /admin/exams
// @desc    Create an exam
// @access  Private (ADMIN)
exports.createExam = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, duration } = req.body;

  try {
    const newExam = new Exam({
      title,
      description,
      duration,
      createdBy: req.user.id,
    });

    const exam = await newExam.save();
    res.json(exam);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   POST /admin/exams/:id/questions
// @desc    Add a question to an exam
// @access  Private (ADMIN)
exports.addQuestionToExam = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ msg: 'Exam not found' });
    }

    if (exam.status === 'PUBLISHED') {
      return res.status(400).json({ msg: 'Cannot add questions to a published exam' });
    }

    const newQuestion = new Question({
      exam: req.params.id,
      ...req.body,
    });

    const question = await newQuestion.save();

    exam.questions.push(question.id);
    await exam.save();

    res.json(question);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   POST /admin/exams/:id/publish
// @desc    Publish an exam
// @access  Private (ADMIN)
exports.publishExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ msg: 'Exam not found' });
    }

    if (exam.status === 'PUBLISHED') {
      return res.status(400).json({ msg: 'Exam is already published' });
    }

    exam.status = 'PUBLISHED';
    await exam.save();

    res.json(exam);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET /exams
// @desc    Get all published exams
// @access  Public
// @route   GET /admin/exams
// @desc    Get all exams (for admins)
// @access  Private (ADMIN)
exports.getAllExams = async (req, res) => {
  try {
    const exams = await Exam.find().populate('questions');
    res.json(exams);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   POST /admin/exams/:id/archive
// @desc    Archive an exam
// @access  Private (ADMIN)
// @route   PUT /admin/exams/:id
// @desc    Update an exam
// @access  Private (ADMIN)
// @route   GET /admin/exams/:id
// @desc    Get a single exam by ID
// @access  Private (ADMIN)
exports.getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate('questions');
    if (!exam) {
      return res.status(404).json({ msg: 'Exam not found' });
    }
    res.json(exam);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.updateExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ msg: 'Exam not found' });
    }

    if (exam.status !== 'DRAFT') {
      return res.status(400).json({ msg: `Cannot update an exam that is ${exam.status}` });
    }

    const { title, description, duration } = req.body;
    const updatedExam = await Exam.findByIdAndUpdate(
      req.params.id,
      { $set: { title, description, duration } },
      { new: true }
    );

    res.json(updatedExam);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   POST /admin/exams/:id/unarchive
// @desc    Unarchive an exam
// @access  Private (ADMIN)
exports.unarchiveExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ msg: 'Exam not found' });
    }

    if (exam.status !== 'ARCHIVED') {
      return res.status(400).json({ msg: 'Exam is not archived' });
    }

    exam.status = 'DRAFT';
    await exam.save();

    res.json(exam);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.archiveExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ msg: 'Exam not found' });
    }

    exam.status = 'ARCHIVED';
    await exam.save();

    res.json(exam);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getPublishedExams = async (req, res) => {
  try {
    const exams = await Exam.find({ status: 'PUBLISHED' }).sort({ createdAt: -1 }).populate('questions');
    res.json(exams);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
