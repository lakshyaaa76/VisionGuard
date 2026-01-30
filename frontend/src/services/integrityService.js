import axios from 'axios';

const logEvent = async (data, token) => {
  if (!data || !data.sessionId || !data.type) return;

  try {
    await axios.post(
      '/api/integrity/log',
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (err) {
    if (err.response?.status !== 400) {
      console.error('Integrity logging failed:', err);
    }
  }
};

const integrityService = {
  logEvent,
};

export default integrityService;
