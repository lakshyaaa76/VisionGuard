const mongoose = require('mongoose');

const integrityEventSchema = new mongoose.Schema({
  examSession: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExamSession',
    required: true,
  },
  eventType: {
    type: String,
    enum: ['TAB_SWITCH', 'FOCUS_LOSS', 'NO_FACE', 'MULTIPLE_FACE', 'LOOKING_AWAY', 'POSE_UNAVAILABLE'],
    required: true,
  },
  source: {
    type: String,
    enum: ['CLIENT', 'ML_SIGNAL'],
    default: 'CLIENT',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  evidenceUrl: {
    type: String,
  },
  details: {
    type: Object,
  },
});

module.exports = mongoose.model('IntegrityEvent', integrityEventSchema);
