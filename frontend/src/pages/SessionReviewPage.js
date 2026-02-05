import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import proctorService from '../services/proctorService';
import MainLayout from '../components/common/MainLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Textarea from '../components/common/Textarea';
import './SessionReviewPage.css';

const SessionReviewPage = () => {
  const { id: sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verdict, setVerdict] = useState('');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const data = await proctorService.getSessionDetails(sessionId, token);
        setSession(data);
      } catch (error) {
        console.error('Failed to fetch session details', error);
      }
      setLoading(false);
    };

    fetchSessionDetails();
  }, [sessionId]);

  const handleSubmitVerdict = async (e) => {
    e.preventDefault();
    if (!verdict) {
      alert('Please select a verdict.');
      return;
    }
    if (window.confirm(`Are you sure you want to mark this session as ${verdict}? This action is final.`)) {
      try {
        const token = localStorage.getItem('token');
        await proctorService.submitVerdict(sessionId, verdict, remarks, token);
        alert('Verdict submitted successfully!');
        navigate('/proctor/dashboard');
      } catch (error) {
        console.error('Failed to submit verdict', error);
        alert('There was an error submitting the verdict.');
      }
    }
  };

  if (loading) {
    return <MainLayout><p>Loading session details...</p></MainLayout>;
  }

  if (!session) {
    return <MainLayout><p>Session not found.</p></MainLayout>;
  }

  return (
    <MainLayout>
      <h1>Review Session</h1>
      <div className="review-layout">
        <div className="details-column">
          <Card>
            <div className="session-info">
              <h2>Session Details</h2>
              <p><strong>Exam:</strong> {session.exam.title}</p>
              <p><strong>Candidate:</strong> {session.candidate.name} ({session.candidate.email})</p>
            </div>
          </Card>
          <Card>
            <form className="verdict-form" onSubmit={handleSubmitVerdict}>
              <h3>Submit Verdict</h3>
              <div className="form-group">
                <select value={verdict} onChange={(e) => setVerdict(e.target.value)} required>
                  <option value="">Select Verdict</option>
                  <option value="CLEARED">Cleared</option>
                  <option value="INVALIDATED">Invalidated</option>
                </select>
              </div>
              <div className="form-group">
                <Textarea 
                  placeholder="Remarks (optional)"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>
              <Button type="submit" variant="primary" disabled={!verdict}>Submit Final Verdict</Button>
            </form>
          </Card>
        </div>
        <div className="timeline-column">
          <h2>Integrity Events Timeline</h2>
          {session.integrityEvents.length > 0 ? (
            <ul className="event-list">
              {session.integrityEvents.map((event) => (
                <li key={event._id}>
                  <div className="event-item">
                    <strong>{event.source === 'ML_SIGNAL' ? 'INTEGRITY_SIGNAL' : event.eventType}</strong> detected at {new Date(event.timestamp).toLocaleString()}
                    {event.evidenceUrl && (
                      <div>
                        <a href={event.evidenceUrl} target="_blank" rel="noreferrer">View evidence</a>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <Card><p>No integrity events logged for this session.</p></Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default SessionReviewPage;
