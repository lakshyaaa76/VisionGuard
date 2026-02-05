const DEFAULTS = {
  sampleIntervalMs: 1500,
  noFaceStreakFrames: 3,
  multipleFaceStreakFrames: 2,
  poseUnavailableStreakFrames: 4,
  lookingAwayStreakFrames: 3,
  yawAbsThresholdDeg: 25,
  pitchAbsThresholdDeg: 20,
  eventCooldownMs: 10000,
  underReviewEventCountThreshold: 3,
};

const getRuleConfig = () => {
  return {
    ...DEFAULTS,
    sampleIntervalMs: parseInt(process.env.ML_SAMPLE_INTERVAL_MS || DEFAULTS.sampleIntervalMs, 10),
    noFaceStreakFrames: parseInt(process.env.ML_NO_FACE_STREAK_FRAMES || DEFAULTS.noFaceStreakFrames, 10),
    multipleFaceStreakFrames: parseInt(process.env.ML_MULTIPLE_FACE_STREAK_FRAMES || DEFAULTS.multipleFaceStreakFrames, 10),
    poseUnavailableStreakFrames: parseInt(process.env.ML_POSE_UNAVAILABLE_STREAK_FRAMES || DEFAULTS.poseUnavailableStreakFrames, 10),
    lookingAwayStreakFrames: parseInt(process.env.ML_LOOKING_AWAY_STREAK_FRAMES || DEFAULTS.lookingAwayStreakFrames, 10),
    yawAbsThresholdDeg: parseFloat(process.env.ML_YAW_ABS_THRESHOLD_DEG || DEFAULTS.yawAbsThresholdDeg),
    pitchAbsThresholdDeg: parseFloat(process.env.ML_PITCH_ABS_THRESHOLD_DEG || DEFAULTS.pitchAbsThresholdDeg),
    eventCooldownMs: parseInt(process.env.ML_EVENT_COOLDOWN_MS || DEFAULTS.eventCooldownMs, 10),
    underReviewEventCountThreshold: parseInt(process.env.ML_UNDER_REVIEW_EVENT_COUNT_THRESHOLD || DEFAULTS.underReviewEventCountThreshold, 10),
  };
};

const defaultState = () => ({
  status: 'AUTO_CLEARED',
  streaks: {
    NO_FACE: 0,
    MULTIPLE_FACE: 0,
    POSE_UNAVAILABLE: 0,
    LOOKING_AWAY: 0,
  },
  lastEventAt: {
    NO_FACE: null,
    MULTIPLE_FACE: null,
    POSE_UNAVAILABLE: null,
    LOOKING_AWAY: null,
  },
  eventCounts: {
    NO_FACE: 0,
    MULTIPLE_FACE: 0,
    POSE_UNAVAILABLE: 0,
    LOOKING_AWAY: 0,
  },
  totalEvents: 0,
});

const shouldCooldownBlock = (lastEventAt, nowMs, cooldownMs) => {
  if (!lastEventAt) return false;
  const lastMs = new Date(lastEventAt).getTime();
  return nowMs - lastMs < cooldownMs;
};

exports.getDefaultMlReview = () => ({
  status: 'AUTO_CLEARED',
  updatedAt: null,
  lastSampleAt: null,
  state: defaultState(),
});
exports.getRuleConfig = getRuleConfig;

exports.evaluateSignals = ({ facesDetected, yaw, pitch, roll, priorState }) => {
  const cfg = getRuleConfig();
  const now = new Date();
  const nowMs = now.getTime();

  const state = priorState ? JSON.parse(JSON.stringify(priorState)) : defaultState();
  state.updatedAt = now;

  const poseAvailable = yaw !== null && pitch !== null && roll !== null;

  if (facesDetected === 0) {
    state.streaks.NO_FACE += 1;
  } else {
    state.streaks.NO_FACE = 0;
  }

  if (facesDetected === 2) {
    state.streaks.MULTIPLE_FACE += 1;
  } else {
    state.streaks.MULTIPLE_FACE = 0;
  }

  if (!poseAvailable) {
    state.streaks.POSE_UNAVAILABLE += 1;
    state.streaks.LOOKING_AWAY = 0;
  } else {
    state.streaks.POSE_UNAVAILABLE = 0;
    const lookingAway =
      Math.abs(yaw) >= cfg.yawAbsThresholdDeg || Math.abs(pitch) >= cfg.pitchAbsThresholdDeg;
    if (lookingAway) {
      state.streaks.LOOKING_AWAY += 1;
    } else {
      state.streaks.LOOKING_AWAY = 0;
    }
  }

  const triggered = [];

  if (
    state.streaks.NO_FACE >= cfg.noFaceStreakFrames &&
    !shouldCooldownBlock(state.lastEventAt.NO_FACE, nowMs, cfg.eventCooldownMs)
  ) {
    triggered.push({ eventType: 'NO_FACE', metadata: { streakFrames: state.streaks.NO_FACE } });
  }

  if (
    state.streaks.MULTIPLE_FACE >= cfg.multipleFaceStreakFrames &&
    !shouldCooldownBlock(state.lastEventAt.MULTIPLE_FACE, nowMs, cfg.eventCooldownMs)
  ) {
    triggered.push({ eventType: 'MULTIPLE_FACE', metadata: { streakFrames: state.streaks.MULTIPLE_FACE } });
  }

  if (
    state.streaks.POSE_UNAVAILABLE >= cfg.poseUnavailableStreakFrames &&
    !shouldCooldownBlock(state.lastEventAt.POSE_UNAVAILABLE, nowMs, cfg.eventCooldownMs)
  ) {
    triggered.push({ eventType: 'POSE_UNAVAILABLE', metadata: { streakFrames: state.streaks.POSE_UNAVAILABLE } });
  }

  if (
    state.streaks.LOOKING_AWAY >= cfg.lookingAwayStreakFrames &&
    !shouldCooldownBlock(state.lastEventAt.LOOKING_AWAY, nowMs, cfg.eventCooldownMs)
  ) {
    triggered.push({ eventType: 'LOOKING_AWAY', metadata: { streakFrames: state.streaks.LOOKING_AWAY } });
  }

  triggered.forEach((ev) => {
    state.lastEventAt[ev.eventType] = now;
    state.eventCounts[ev.eventType] = (state.eventCounts[ev.eventType] || 0) + 1;
    state.totalEvents += 1;
  });

  if (state.status !== 'UNDER_REVIEW') {
    const reviewCount =
      (state.eventCounts.NO_FACE || 0) +
      (state.eventCounts.MULTIPLE_FACE || 0) +
      (state.eventCounts.LOOKING_AWAY || 0);

    if (reviewCount >= cfg.underReviewEventCountThreshold) {
      state.status = 'UNDER_REVIEW';
    }
  }

  return { state, triggeredEvents: triggered };
};
