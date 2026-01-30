const mongoose = require('mongoose');

const integrityEventSchema = new mongoose.Schema({
  examSession: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExamSession',
    required: true,
  },
  eventType: {
    type: String,
    enum: ['TAB_SWITCH', 'FOCUS_LOSS'],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  details: {
    type: Object,
  },
});

module.exports = mongoose.model('IntegrityEvent', integrityEventSchema);
