import axios from 'axios';

const API_URL = 'http://localhost:5000/auth';

const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, {
    email,
    password,
  });

  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }

  return response.data;
};

const getCurrentUser = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    // In a real app, you would use a library like jwt-decode
    // For simplicity, we'll parse it manually. This is NOT secure for production.
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

const register = async (userData, token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };
  const response = await axios.post(`${API_URL}/register`, userData, config);
  return response.data;
};

const authService = {
  login,
  register,
  getCurrentUser,
};

export default authService;
