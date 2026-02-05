const http = require('http');
const https = require('https');

const DEFAULT_TIMEOUT_MS = 2500;

const postJson = async (urlStr, payload, timeoutMs = DEFAULT_TIMEOUT_MS) => {
  const { URL } = require('url');
  const u = new URL(urlStr);
  const lib = u.protocol === 'https:' ? https : http;

  const data = JSON.stringify(payload);

  return new Promise((resolve, reject) => {
    const req = lib.request(
      {
        hostname: u.hostname,
        port: u.port || (u.protocol === 'https:' ? 443 : 80),
        path: `${u.pathname}${u.search}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      },
      (res) => {
        let raw = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          raw += chunk;
        });
        res.on('end', () => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            return reject(new Error('ML service error'));
          }
          try {
            const parsed = raw ? JSON.parse(raw) : {};
            resolve(parsed);
          } catch (err) {
            reject(new Error('ML service error'));
          }
        });
      }
    );

    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error('ML service timeout'));
    });

    req.on('error', () => {
      reject(new Error('ML service error'));
    });

    req.write(data);
    req.end();
  });
};

const getMlBaseUrl = () => {
  return process.env.ML_SERVICE_URL || 'http://localhost:8001';
};

exports.inferFacePresence = async (image_base64) => {
  const url = `${getMlBaseUrl()}/infer/face-presence`;
  return postJson(url, { image_base64 });
};

exports.inferHeadPose = async (image_base64) => {
  const url = `${getMlBaseUrl()}/infer/head-pose`;
  return postJson(url, { image_base64 });
};
