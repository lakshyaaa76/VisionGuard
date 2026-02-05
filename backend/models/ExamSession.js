const mongoose = require('mongoose');

const ExamSessionSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true,
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  submittedTime: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['IN_PROGRESS', 'SUBMITTED', 'TERMINATED'],
    default: 'IN_PROGRESS',
  },
  responses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Response',
  }],
  academicEvaluation: {
    score: {
      type: Number,
      default: 0,
    },
    totalMarks: {
        type: Number,
    },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED'],
      default: 'PENDING',
    },
    manualScore: {
      type: Number,
      default: 0,
    },
    reviewStatus: {
      type: String,
      enum: ['NOT_REQUIRED', 'PENDING', 'COMPLETED'],
      default: 'NOT_REQUIRED',
    },
  },
  integrityEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'IntegrityEvent',
  }],
  integrity: {
    status: {
      type: String,
      enum: ['UNDER_REVIEW', 'CLEARED', 'INVALIDATED'],
      default: 'UNDER_REVIEW',
    },
    decidedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    decidedAt: {
      type: Date,
    },
    remarks: {
      type: String,
    },
  },
  mlReview: {
    status: {
      type: String,
      enum: ['AUTO_CLEARED', 'UNDER_REVIEW'],
      default: 'AUTO_CLEARED',
    },
    updatedAt: {
      type: Date,
    },
    lastSampleAt: {
      type: Date,
    },
    state: {
      type: Object,
    },
  },
  integrityEvaluation: {
    verdict: {
      type: String,
      enum: ['PENDING', 'CLEARED', 'INVALIDATED'],
      default: 'PENDING',
    },
    proctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    remarks: {
      type: String,
    },
  },
}, { timestamps: true });

ExamSessionSchema.index({ exam: 1, candidate: 1 }, { unique: true });

module.exports = mongoose.model('ExamSession', ExamSessionSchema);
