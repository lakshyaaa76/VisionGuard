import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import evaluationService from '../services/evaluationService';
import MainLayout from '../components/common/MainLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import './SubjectiveReviewPage.css';

const SubjectiveReviewPage = () => {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState({});

  const fetchSessionDetails = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const data = await evaluationService.getSessionForManualEvaluation(id, token);
      setSession(data);
    } catch (error) {
      console.error('Failed to fetch session details', error);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchSessionDetails();
  }, [fetchSessionDetails]);

  const handleScoreChange = (responseId, value) => {
    setScores({ ...scores, [responseId]: value });
  };

  const handleSubmitScore = async (responseId) => {
    const score = scores[responseId];
    if (score === undefined || score === '') return;

    try {
      const token = localStorage.getItem('token');
      await evaluationService.submitSubjectiveScore(responseId, score, token);
      fetchSessionDetails(); // Refresh to show updated score
    } catch (error) {
      console.error('Failed to submit score', error);
      alert('Failed to submit score.');
    }
  };

  if (loading) return <MainLayout><p>Loading session details...</p></MainLayout>;
  if (!session) return <MainLayout><p>Session not found.</p></MainLayout>;

  const subjectiveResponses = session.responses.filter(r => r.markedForReview);

  return (
    <MainLayout>
      <div className="page-header">
        <h1>Subjective Answer Review</h1>
        <Link to="/admin/dashboard"><Button variant="secondary">Back to Dashboard</Button></Link>
      </div>
      {subjectiveResponses.length > 0 ? (
        <div className="review-grid">
          {subjectiveResponses.map(response => (
            <Card key={response._id}>
              <div className="question-details">
                <strong>Question:</strong>
                <p>{response.question.questionText}</p>
              </div>
              <div className="answer-details">
                <strong>Candidate's Answer:</strong>
                <p>{response.answer}</p>
              </div>
              <div className="scoring-details">
                <p>Score: {response.score} / {response.question.marks}</p>
                <div className="score-input-group">
                  <Input 
                    type="number" 
                    min="0" 
                    max={response.question.marks} 
                    placeholder="Enter score" 
                    onChange={(e) => handleScoreChange(response._id, e.target.value)} 
                  />
                  <Button onClick={() => handleSubmitScore(response._id)}>Save Score</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <p>No subjective answers to review for this session.</p>
      )}
    </MainLayout>
  );
};

export default SubjectiveReviewPage;
