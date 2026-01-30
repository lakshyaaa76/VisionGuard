import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import proctorService from '../services/proctorService';
import MainLayout from '../components/common/MainLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import './ProctorDashboardPage.css';

const ProctorDashboardPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('token');
      // A real implementation might need a dedicated endpoint to get IN_PROGRESS sessions too
      const data = await proctorService.getSessionsForReview(token);
      setSessions(data);
    } catch (error) {
      console.error('Failed to fetch sessions', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleTerminate = async (sessionId) => {
    if (window.confirm('Are you sure you want to terminate this session?')) {
      try {
        const token = localStorage.getItem('token');
        await proctorService.terminateSession(sessionId, token);
        fetchSessions(); // Refresh the list
      } catch (error) {
        console.error('Failed to terminate session', error);
        alert('Failed to terminate session.');
      }
    }
  };

  return (
    <MainLayout>
      <h1>Proctor Dashboard</h1>
      {loading ? (
        <p>Loading sessions...</p>
      ) : sessions.length > 0 ? (
        <div className="sessions-grid">
          {sessions.map((session) => (
            <Card key={session._id} className="session-item">
              <h3>{session.exam.title}</h3>
              <p>Candidate: {session.candidate.name}</p>
              <StatusBadge status={session.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : session.integrityEvaluation.verdict} />
              <div className="button-group">
                <Link to={`/proctor/review/${session._id}`}>
                  <Button variant="primary">Review</Button>
                </Link>
                {session.status === 'IN_PROGRESS' && (
                  <Button onClick={() => handleTerminate(session._id)} variant="secondary">Terminate</Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <p>No sessions available for review.</p>
      )}
    </MainLayout>
  );
};


export default ProctorDashboardPage;
