import axios from 'axios';

const API_URL = 'http://localhost:5000';

const evaluateSession = async (sessionId, token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };
  const response = await axios.post(`${API_URL}/admin/evaluate/${sessionId}`, {}, config);
  return response.data;
};

const getSessionResult = async (sessionId, token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };
  const response = await axios.get(`${API_URL}/exam/${sessionId}/result`, config);
  return response.data;
};

const getSessionForManualEvaluation = async (sessionId, token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };
  const response = await axios.get(`${API_URL}/admin/evaluation/${sessionId}`, config);
  return response.data;
};

const submitSubjectiveScore = async (responseId, score, token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };
  const response = await axios.post(`${API_URL}/admin/evaluation/response/${responseId}`, { score }, config);
  return response.data;
};

const evaluationService = {
  evaluateSession,
  getSessionResult,
  getSessionForManualEvaluation,
  submitSubjectiveScore,
};

export default evaluationService;
