import axios from 'axios';

const API_URL = 'http://localhost:5000';

const getMySessions = async (token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };
  const response = await axios.get(`${API_URL}/candidate/sessions`, config);
  return response.data;
};

const getMySessionResult = async (sessionId, token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };
  const response = await axios.get(`${API_URL}/candidate/sessions/${sessionId}/result`, config);
  return response.data;
};

const candidateService = {
  getMySessions,
  getMySessionResult,
};

export default candidateService;
