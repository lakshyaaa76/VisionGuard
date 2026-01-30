import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import evaluationService from '../services/evaluationService';
import candidateService from '../services/candidateService';
import { jwtDecode } from 'jwt-decode';
import MainLayout from '../components/common/MainLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import './SessionResultPage.css';

const SessionResultPage = () => {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResult = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found, please log in.');
        setLoading(false);
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const userRole = decoded.role;
        let data;

        if (userRole === 'ADMIN') {
          data = await evaluationService.getSessionResult(id, token);
        } else {
          data = await candidateService.getMySessionResult(id, token);
        }
        setResult(data);
      } catch (err) {
        console.error('Failed to fetch result', err);
        setError(err.response?.data?.msg || 'Failed to fetch result.');
      }
      setLoading(false);
    };

    fetchResult();
  }, [id]);

  return (
    <MainLayout>
      <div className="page-header">
        <h1>Exam Result</h1>
        <Link to="/dashboard"><Button variant="secondary">Back to Dashboard</Button></Link>
      </div>
      <Card>
        {loading ? (
          <p>Loading result...</p>
        ) : result ? (
          <div className="result-details">
            <h2>Score</h2>
            <p className="score">{result.score} / {result.totalMarks}</p>
          </div>
        ) : (
          <p className="error-message">{error || 'Result not available.'}</p>
        )}
      </Card>
    </MainLayout>
  );
};

export default SessionResultPage;
