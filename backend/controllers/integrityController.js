const IntegrityEvent = require('../models/IntegrityEvent');
const ExamSession = require('../models/ExamSession');
const { validationResult } = require('express-validator');
const { inferFacePresence, inferHeadPose } = require('../services/mlInferenceClient');
const { evaluateSignals, getDefaultMlReview, getRuleConfig } = require('../services/mlRuleEngine');

// @route   POST /integrity/event
// @desc    Log an integrity event
// @access  Private (CANDIDATE)
exports.logEvent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { sessionId, eventType, details, evidenceUrl } = req.body;

  try {
    const session = await ExamSession.findById(sessionId);

    if (!session || session.candidate.toString() !== req.user.id) {
      return res.status(404).json({ msg: 'Exam session not found' });
    }

    if (session.status !== 'IN_PROGRESS') {
      return res.status(400).json({ msg: 'Exam session is not in progress' });
    }

    const newEvent = new IntegrityEvent({
      examSession: sessionId,
      eventType,
      evidenceUrl,
      details,
    });

    const event = await newEvent.save();

    session.integrityEvents.push(event.id);
    await session.save();

    res.status(201).json({ msg: 'Event logged successfully' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   POST /integrity/ml-frame
// @desc    Ingest a sampled frame and derive ML-signal integrity events
// @access  Private (CANDIDATE)
exports.logMlFrame = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { sessionId, image_base64 } = req.body;

  try {
    const session = await ExamSession.findById(sessionId);

    if (!session || session.candidate.toString() !== req.user.id) {
      return res.status(404).json({ msg: 'Exam session not found' });
    }

    if (session.status !== 'IN_PROGRESS') {
      return res.status(400).json({ msg: 'Exam session is not in progress' });
    }

    const cfg = getRuleConfig();
    const now = new Date();

    if (session.mlReview?.lastSampleAt) {
      const lastMs = new Date(session.mlReview.lastSampleAt).getTime();
      if (now.getTime() - lastMs < cfg.sampleIntervalMs - 50) {
        return res.status(204).send();
      }
    }

    session.mlReview = session.mlReview || getDefaultMlReview();
    session.mlReview.lastSampleAt = now;

    const [faceRes, poseRes] = await Promise.all([
      inferFacePresence(image_base64),
      inferHeadPose(image_base64),
    ]);

    const facesDetected = typeof faceRes?.faces_detected === 'number' ? faceRes.faces_detected : 0;
    const yaw = poseRes?.yaw === null || poseRes?.yaw === undefined ? null : poseRes.yaw;
    const pitch = poseRes?.pitch === null || poseRes?.pitch === undefined ? null : poseRes.pitch;
    const roll = poseRes?.roll === null || poseRes?.roll === undefined ? null : poseRes.roll;

    const priorState = session.mlReview.state || getDefaultMlReview().state;
    const { state, triggeredEvents } = evaluateSignals({
      facesDetected,
      yaw,
      pitch,
      roll,
      priorState,
    });

    session.mlReview.status = state.status;
    session.mlReview.updatedAt = now;
    session.mlReview.state = state;

    if (triggeredEvents.length > 0) {
      const docs = triggeredEvents.map((ev) => ({
        examSession: sessionId,
        eventType: ev.eventType,
        source: 'ML_SIGNAL',
        details: ev.metadata,
      }));

      const saved = await IntegrityEvent.insertMany(docs);
      saved.forEach((doc) => {
        session.integrityEvents.push(doc._id);
      });
    }

    await session.save();

    return res.status(204).send();
  } catch (err) {
    return res.status(500).send('Server Error');
  }
};
