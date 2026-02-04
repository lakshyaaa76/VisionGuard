import axios from 'axios';

const API_URL = 'http://localhost:5000';

const getPublishedExams = async () => {
  const response = await axios.get(`${API_URL}/exams`);
  return response.data;
};

const startExamSession = async (examId, token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };
    const response = await axios.post(`${API_URL}/exam/start`, { examId }, config);
  return response.data;
};

const submitExam = async (sessionId, responses, token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };
  const response = await axios.post(`${API_URL}/exam/submit`, { sessionId, responses }, config);
  return response.data;
};

const createExam = async (examData, token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };
  const response = await axios.post(`${API_URL}/admin/exams`, examData, config);
  return response.data;
};

const getAllExams = async (token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };
  // This route will need to be created in the backend
  const response = await axios.get(`${API_URL}/admin/exams`, config);
  return response.data;
};

const archiveExam = async (examId, token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };
  const response = await axios.post(`${API_URL}/admin/exams/${examId}/archive`, {}, config);
  return response.data;
};

const updateExam = async (examId, examData, token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };
  const response = await axios.put(`${API_URL}/admin/exams/${examId}`, examData, config);
  return response.data;
};

const getExamById = async (examId, token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };
  const response = await axios.get(`${API_URL}/admin/exams/${examId}`, config);
  return response.data;
};

const addQuestionToExam = async (examId, questionData, token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };
  const response = await axios.post(`${API_URL}/admin/exams/${examId}/questions`, questionData, config);
  return response.data;
};

const unarchiveExam = async (examId, token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };
  const response = await axios.post(`${API_URL}/admin/exams/${examId}/unarchive`, {}, config);
  return response.data;
};

const publishExam = async (examId, token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };
  const response = await axios.post(`${API_URL}/admin/exams/${examId}/publish`, {}, config);
  return response.data;
};


const examService = {
  getPublishedExams,
  startExamSession,
  submitExam,
  createExam,
  getAllExams,
  archiveExam,
  updateExam,
  getExamById,
  addQuestionToExam,
  unarchiveExam,
  publishExam
};

export default examService;
