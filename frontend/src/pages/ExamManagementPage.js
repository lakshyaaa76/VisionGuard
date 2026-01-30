import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import examService from '../services/examService';
import MainLayout from '../components/common/MainLayout';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import EditExamModal from '../components/common/EditExamModal';
import './ExamManagementPage.css';

const ExamManagementPage = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 60,
  });
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [editingExam, setEditingExam] = useState(null);

  const fetchExams = async () => {
    try {
      const token = localStorage.getItem('token');
      const data = await examService.getAllExams(token);
      setExams(data);
    } catch (err) {
      console.error('Failed to fetch exams', err);
      setError('Failed to fetch exams.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

      const handleSaveExam = async (updatedExam) => {
    setActionError('');
    try {
      const token = localStorage.getItem('token');
      await examService.updateExam(updatedExam._id, updatedExam, token);
      setEditingExam(null);
      fetchExams(); // Refresh the list
    } catch (err) {
      const message = err.response?.data?.msg || 'Failed to update exam.';
      setActionError(message);
    }
  };

    const handleUnarchive = async (examId) => {
    setActionError('');
    if (window.confirm('Are you sure you want to unarchive this exam? It will be returned to a DRAFT state.')) {
      try {
        const token = localStorage.getItem('token');
        await examService.unarchiveExam(examId, token);
        fetchExams(); // Refresh the list
      } catch (err) {
        const message = err.response?.data?.msg || 'Failed to unarchive exam.';
        setActionError(message);
      }
    }
  };

    const handlePublish = async (examId) => {
    setActionError('');
    if (window.confirm('Are you sure you want to publish this exam? This will make it visible to candidates and it can no longer be edited.')) {
      try {
        const token = localStorage.getItem('token');
        await examService.publishExam(examId, token);
        fetchExams(); // Refresh the list
      } catch (err) {
        const message = err.response?.data?.msg || 'Failed to publish exam.';
        setActionError(message);
      }
    }
  };

  const handleArchive = async (examId) => {
    setActionError('');
    if (window.confirm('Are you sure you want to archive this exam? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        await examService.archiveExam(examId, token);
        fetchExams(); // Refresh the list
      } catch (err) {
        const message = err.response?.data?.msg || 'Failed to archive exam.';
        setActionError(message);
      }
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      await examService.createExam(formData, token);
      setFormData({ title: '', description: '', duration: 60 });
      fetchExams(); // Refresh the list
    } catch (err) {
      const message = err.response?.data?.msg || 'Failed to create exam.';
      setError(message);
    }
  };

  return (
    <MainLayout>
      <div className="page-header">
        <h1>Exam Management</h1>
        <Link to="/admin/dashboard">
          <Button variant="secondary">Back to Dashboard</Button>
        </Link>
      </div>
      <div className="exam-management-content">
        <div className="exam-list">
          <Card>
            <h2>Existing Exams</h2>
            {actionError && <p className="error-message">{actionError}</p>}
            {loading ? (
              <p>Loading exams...</p>
            ) : exams.length > 0 ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Questions</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {exams.map((exam) => (
                    <tr key={exam._id}>
                      <td>{exam.title}</td>
                      <td><StatusBadge status={exam.status} /></td>
                      <td>{exam.questions.length}</td>
                      <td>
                        <div className="button-group">
                          <Link to={`/admin/exams/${exam._id}/questions`}>
                            <Button variant="primary">Manage Questions</Button>
                          </Link>
                          {exam.status === 'DRAFT' && (
                            <>
                              <Button onClick={() => setEditingExam(exam)} variant="secondary">Edit</Button>
                              <Button onClick={() => handlePublish(exam._id)} variant="primary" disabled={exam.questions.length === 0}>Publish</Button>
                            </>
                          )}
                          {exam.status !== 'ARCHIVED' ? (
                            <Button onClick={() => handleArchive(exam._id)} variant="secondary">Archive</Button>
                          ) : (
                            <Button onClick={() => handleUnarchive(exam._id)} variant="secondary">Unarchive</Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No exams found.</p>
            )}
          </Card>
        </div>
        <div className="exam-create">
          <Card>
            <h2>Create New Exam</h2>
            <form onSubmit={onSubmit} className="exam-form">
              {error && <p className="error-message">{error}</p>}
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <Input id="title" name="title" value={formData.title} onChange={onChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <Input id="description" name="description" value={formData.description} onChange={onChange} />
              </div>
              <div className="form-group">
                <label htmlFor="duration">Duration (minutes)</label>
                <Input id="duration" type="number" name="duration" value={formData.duration} onChange={onChange} required />
              </div>
              <Button type="submit" variant="primary">Create Exam</Button>
            </form>
          </Card>
        </div>
      </div>
          {editingExam && (
        <EditExamModal 
          exam={editingExam} 
          onClose={() => setEditingExam(null)} 
          onSave={handleSaveExam} 
        />
      )}
    </MainLayout>
  );
};

export default ExamManagementPage;
