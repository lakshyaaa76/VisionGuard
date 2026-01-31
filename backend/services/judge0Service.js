const axios = require('axios');

const JUDGE0_API_URL = 'https://judge0-ce.p.rapidapi.com';

// A mapping from common language names to Judge0 language IDs
// See https://ce.judge0.com/languages for a full list
const LANGUAGE_MAPPING = {
  javascript: 93, // Node.js
  python: 71,     // Python 3.8.1
  java: 62,       // Java 15.0.2
  c: 50,          // C (GCC 9.2.0)
  cpp: 54,        // C++ (GCC 9.2.0)
};

/**
 * Creates a new submission on Judge0.
 * @param {string} sourceCode The source code to execute.
 * @param {string} language The programming language.
 * @param {string} stdin The standard input for the code.
 * @returns {Promise<string>} The token of the created submission.
 */
const createSubmission = async (sourceCode, language, stdin) => {
  const languageId = LANGUAGE_MAPPING[language.toLowerCase()];
  if (!languageId) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const options = {
    method: 'POST',
    url: `${JUDGE0_API_URL}/submissions`,
    params: { base64_encoded: 'false', wait: 'false' },
    headers: {
      'Content-Type': 'application/json',
      // In a real application, you would use an API key for a service like RapidAPI
      // 'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
      // 'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
    },
    data: {
      language_id: languageId,
      source_code: sourceCode,
      stdin: stdin,
    },
  };

  try {
    const response = await axios.request(options);
    return response.data.token;
  } catch (error) {
    console.error('Error creating Judge0 submission:', error.response?.data || error.message);
    throw new Error('Failed to create code submission.');
  }
};

/**
 * Retrieves a submission result from Judge0.
 * @param {string} token The submission token.
 * @returns {Promise<object>} The submission result object.
 */
const getSubmission = async (token) => {
  const options = {
    method: 'GET',
    url: `${JUDGE0_API_URL}/submissions/${token}`,
    params: { base64_encoded: 'false', fields: '*' },
    headers: {
      // 'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
      // 'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
    },
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error('Error fetching Judge0 submission:', error.response?.data || error.message);
    throw new Error('Failed to fetch submission result.');
  }
};

/**
 * A helper function to create a submission and poll for its result.
 * @param {string} sourceCode The source code to execute.
 * @param {string} language The programming language.
 * @param {string} stdin The standard input for the code.
 * @returns {Promise<object>} The final submission result.
 */
const executeCode = async (sourceCode, language, stdin) => {
  const token = await createSubmission(sourceCode, language, stdin);

  return new Promise((resolve, reject) => {
    const poll = setInterval(async () => {
      try {
        const result = await getSubmission(token);
        // Status IDs: 1=In Queue, 2=Processing
        if (result.status_id > 2) {
          clearInterval(poll);
          resolve(result);
        }
      } catch (error) {
        clearInterval(poll);
        reject(error);
      }
    }, 2000); // Poll every 2 seconds
  });
};

module.exports = { executeCode };
