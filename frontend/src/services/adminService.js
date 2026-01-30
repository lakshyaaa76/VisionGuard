import axios from 'axios';

const API_URL = 'http://localhost:5000';

const getAllUsers = async (token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };
  const response = await axios.get(`${API_URL}/admin/users`, config);
  return response.data;
};

const getAllSessions = async (token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };
  const response = await axios.get(`${API_URL}/admin/sessions`, config);
  return response.data;
};

const adminService = {
  getAllUsers,
  getAllSessions,
};

export default adminService;
