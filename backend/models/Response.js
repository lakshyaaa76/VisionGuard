const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  examSession: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExamSession',
    required: true,
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
  },
  answer: { type: String },
  score: {
    type: Number,
    default: 0,
  },
  markedForReview: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('Response', responseSchema);
