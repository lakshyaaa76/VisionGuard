import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import examService from '../services/examService';
import MainLayout from '../components/common/MainLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import './AvailableExamsPage.css';

const AvailableExamsPage = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const data = await examService.getPublishedExams();
        setExams(data);
      } catch (error) {
        console.error('Failed to fetch exams', error);
      }
      setLoading(false);
    };

    fetchExams();
  }, []);

  return (
    <MainLayout>
      <div className="page-header">
        <h1>Available Exams</h1>
        <Link to="/dashboard"><Button variant="secondary">Back to Dashboard</Button></Link>
      </div>
      {loading ? (
        <p>Loading exams...</p>
      ) : exams.length > 0 ? (
        <div className="exams-grid">
          {exams.map((exam) => (
            <Card key={exam._id} className="exam-item">
              <h2>{exam.title}</h2>
              <p>{exam.description}</p>
              <p>Duration: {exam.duration} minutes</p>
              <Link to={`/exam/${exam._id}`}>
                <Button variant="primary">Start Exam</Button>
              </Link>
            </Card>
          ))}
        </div>
      ) : (
        <p>No exams are available at the moment.</p>
      )}
    </MainLayout>
  );
};

export default AvailableExamsPage;
