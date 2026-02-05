const computeFinalStatus = (session) => {
  const verdict = session?.integrity?.status;
  if (verdict !== 'CLEARED' && verdict !== 'INVALIDATED') return null;

  if (session?.academicEvaluation?.status !== 'COMPLETED') return null;
  if (session?.academicEvaluation?.reviewStatus === 'PENDING') return null;

  return verdict === 'CLEARED' ? 'EVALUATED' : 'INVALIDATED';
};

exports.tryFinalizeSession = async (session) => {
  if (!session) return false;
  if (session.finalStatus) return false;

  const finalStatus = computeFinalStatus(session);
  if (!finalStatus) return false;

  session.finalStatus = finalStatus;
  return true;
};
