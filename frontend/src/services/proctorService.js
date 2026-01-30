import axios from 'axios';

const API_URL = 'http://localhost:5000/proctor';

const getSessionsForReview = async (token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };
  const response = await axios.get(`${API_URL}/sessions`, config);
  return response.data;
};

const getSessionDetails = async (sessionId, token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };
  const response = await axios.get(`${API_URL}/sessions/${sessionId}`, config);
  return response.data;
};

const submitVerdict = async (sessionId, verdict, remarks, token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };
  const response = await axios.post(`${API_URL}/verdict`, { sessionId, verdict, remarks }, config);
  return response.data;
};

const terminateSession = async (sessionId, token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };
  const response = await axios.post(`${API_URL}/proctor/sessions/${sessionId}/terminate`, {}, config);
  return response.data;
};

const proctorService = {
  getSessionsForReview,
  getSessionDetails,
  submitVerdict,
  terminateSession,
};

export default proctorService;
