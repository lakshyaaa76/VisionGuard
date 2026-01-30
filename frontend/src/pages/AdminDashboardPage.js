import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../services/adminService';
import evaluationService from '../services/evaluationService';
import MainLayout from '../components/common/MainLayout';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import './AdminDashboardPage.css';

const AdminDashboardPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('token');
      // Placeholder: A real implementation would have a dedicated admin endpoint.
      const data = await adminService.getAllSessions(token);
      setSessions(data);
    } catch (error) {
      console.error('Failed to fetch sessions', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleEvaluate = async (sessionId) => {
    if (window.confirm('Are you sure you want to run the academic evaluation for this session?')) {
      try {
        const token = localStorage.getItem('token');
        await evaluationService.evaluateSession(sessionId, token);
        alert('Evaluation complete!');
        fetchSessions();
      } catch (error) {
        console.error('Failed to evaluate session', error);
        alert('Failed to evaluate session.');
      }
    }
  };

  return (
    <MainLayout>
      <div className="dashboard-header">
        <h1>Academic Evaluation</h1>
        <div className="header-buttons">
          <Link to="/admin/exams">
            <Button variant="primary">Manage Exams</Button>
          </Link>
          <Link to="/admin/users">
            <Button variant="secondary">Manage Users</Button>
          </Link>
        </div>
      </div>
      {loading ? (
        <p>Loading sessions...</p>
      ) : sessions.length > 0 ? (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Exam</th>
              <th>Integrity Verdict</th>
              <th>Academic Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session._id}>
                <td>{session.candidate.name}</td>
                <td>{session.exam.title}</td>
                <td><StatusBadge status={session.integrityEvaluation.verdict} /></td>
                <td><StatusBadge status={session.academicEvaluation?.status || 'PENDING'} /></td>
                <td>
                  <div className="button-group">
                    {session.academicEvaluation?.status !== 'COMPLETED' ? (
                      <Button onClick={() => handleEvaluate(session._id)} variant="primary">Evaluate</Button>
                    ) : (
                      <Link to={`/session/result/${session._id}`}>
                        <Button variant="secondary">View Result</Button>
                      </Link>
                    )}
                    {session.academicEvaluation?.reviewStatus === 'PENDING' && (
                      <Link to={`/admin/evaluation/${session._id}`}>
                        <Button variant="primary">Review Answers</Button>
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No submitted sessions found.</p>
      )}
    </MainLayout>
  );
};

export default AdminDashboardPage;
