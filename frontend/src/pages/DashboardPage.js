import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import candidateService from '../services/candidateService';
import MainLayout from '../components/common/MainLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import './DashboardPage.css';

const CandidateDashboard = ({ name }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMySessions = async () => {
      try {
        const token = localStorage.getItem('token');
        const data = await candidateService.getMySessions(token);
        setSessions(data);
      } catch (error) {
        console.error('Failed to fetch sessions', error);
      }
      setLoading(false);
    };

    fetchMySessions();
  }, []);

  return (
    <MainLayout>
      <div className="dashboard-header">
        <h1>Hello, {name}</h1>
        <Link to="/exams">
          <Button variant="primary">View Available Exams</Button>
        </Link>
      </div>
      
      <Card>
        <h2>My Exam History</h2>
        {loading ? (
          <p>Loading sessions...</p>
        ) : sessions.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Exam Title</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session._id}>
                  <td>{session.exam.title}</td>
                  <td><StatusBadge status={session.candidateStatus} /></td>
                  <td>
                    {session.candidateStatus === 'EVALUATED' && (
                      <Link to={`/session/result/${session._id}`}>
                        <Button variant="secondary">View Result</Button>
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>You have not taken any exams yet.</p>
        )}
      </Card>
    </MainLayout>
  );
};

const DashboardPage = () => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />;

  const decoded = jwtDecode(token);
  const userRole = decoded.role;

  if (userRole === 'ADMIN') {
    return <Navigate to="/admin/dashboard" />;
  }

  if (userRole === 'PROCTOR') {
    return <Navigate to="/proctor/dashboard" />;
  }

    const userName = decoded.name || 'Candidate';
  return <CandidateDashboard name={userName} />;
};

export default DashboardPage;
