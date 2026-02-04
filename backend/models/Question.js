const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true,
  },
  questionText: {
    type: String,
    required: true,
  },
  questionType: {
    type: String,
    enum: ['MCQ', 'CODING', 'SUBJECTIVE'],
    required: true,
  },
  // For MCQ
  options: [{ type: String }],
  correctOption: { type: Number },
  // For CODING
  functionName: { type: String }, // The name of the function to call for grading
  language: { type: String },
  boilerplate: { type: String },
  testCases: [
    {
      input: { type: String, required: true },
      output: { type: String, required: true },
    },
  ],
  marks: {
    type: Number,
    required: true,
    default: 1
  },
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
