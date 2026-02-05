import axios from 'axios';

const API_URL = 'http://localhost:5000';

const logEvent = async (sessionId, eventType, details, token) => {
  if (!sessionId || !eventType || !token) return;

  try {
    await axios.post(
      `${API_URL}/integrity/event`,
      { sessionId, eventType, details },
      { headers: { 'x-auth-token': token } }
    );
  } catch (err) {
    if (err.response?.status !== 400) {
      console.error('Integrity logging failed:', err);
    }
  }
};

const logMlFrame = async (sessionId, image_base64, token) => {
  if (!sessionId || !image_base64 || !token) return;

  try {
    await axios.post(
      `${API_URL}/integrity/ml-frame`,
      { sessionId, image_base64 },
      { headers: { 'x-auth-token': token } }
    );
  } catch (err) {
    if (err.response?.status !== 400) {
      console.error('ML frame ingestion failed:', err);
    }
  }
};

const integrityService = {
  logEvent,
  logMlFrame,
};

export default integrityService;
