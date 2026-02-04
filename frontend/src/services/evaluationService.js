import axios from 'axios';

const API_URL = 'http://localhost:5000';

const getAllSessionsForEvaluation = async (token) => {
  const config = {
    headers: { 'x-auth-token': token },
  };
  const response = await axios.get(`${API_URL}/sessions`, config);
  return response.data;
};

const evaluateSession = async (sessionId, token) => {
  const config = {
    headers: { 'x-auth-token': token },
  };
  const response = await axios.post(`${API_URL}/evaluate/${sessionId}`, {}, config);
  return response.data;
};

const getSessionForManualEvaluation = async (sessionId, token) => {
  const config = {
    headers: { 'x-auth-token': token },
  };
  const response = await axios.get(`${API_URL}/sessions/${sessionId}`, config);
  return response.data;
};

const submitSubjectiveScore = async (responseId, score, token) => {
  const config = {
    headers: { 'x-auth-token': token },
  };
  const response = await axios.post(`${API_URL}/response/${responseId}`, { score }, config);
  return response.data;
};

const finalizeEvaluation = async (sessionId, token) => {
    const config = {
        headers: { 'x-auth-token': token },
    };
    const response = await axios.post(`${API_URL}/finalize/${sessionId}`, {}, config);
    return response.data;
};

const getSessionResult = async (sessionId, token) => {
  const config = {
    headers: { 'x-auth-token': token },
  };
  const response = await axios.get(`${API_URL}/result/${sessionId}`, config);
  return response.data;
};


const evaluationService = {
  getAllSessionsForEvaluation,
  evaluateSession,
  getSessionForManualEvaluation,
  submitSubjectiveScore,
  finalizeEvaluation,
  getSessionResult,
};

export default evaluationService;
