import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import examService from '../services/examService';
import MainLayout from '../components/common/MainLayout';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Textarea from '../components/common/Textarea';
import './QuestionManagementPage.css';

const QuestionManagementPage = () => {
  const { id: examId } = useParams();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    questionText: '',
    questionType: 'MCQ',
    options: ['', '', '', ''],
    correctOption: 0,
    marks: 1,
    language: 'javascript',
    boilerplate: '',
  });

  const fetchExamDetails = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const data = await examService.getExamById(examId, token);
      setExam(data);
    } catch (err) {
      console.error('Failed to fetch exam details', err);
      setError('Failed to fetch exam details.');
    }
    setLoading(false);
  }, [examId]);

  useEffect(() => {
    fetchExamDetails();
  }, [fetchExamDetails]);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      await examService.addQuestionToExam(examId, formData, token);
      // Reset form
      setFormData({
        questionText: '',
        questionType: 'MCQ',
        options: ['', '', '', ''],
        correctOption: 0,
        marks: 1,
        language: 'javascript',
        boilerplate: '',
      });
      fetchExamDetails(); // Refresh the list
    } catch (err) {
      const message = err.response?.data?.msg || 'Failed to add question.';
      setError(message);
    }
  };

  if (loading) return <MainLayout><p>Loading...</p></MainLayout>;

  return (
    <MainLayout>
      <div className="page-header">
        <h1>Manage Questions for: {exam?.title}</h1>
        <Link to="/admin/exams"><Button variant="secondary">Back to Exams</Button></Link>
      </div>
      <div className="question-management-content">
        <div className="question-list">
          <Card>
            <h2>Existing Questions</h2>
            {exam?.questions.length > 0 ? (
              <ul>
                {exam.questions.map((q, index) => (
                  <li key={q._id}>{index + 1}. {q.questionText} ({q.questionType})</li>
                ))}
              </ul>
            ) : (
              <p>No questions have been added yet.</p>
            )}
          </Card>
        </div>
        <div className="question-create">
          <Card>
            <h2>Add New Question</h2>
            <form onSubmit={onSubmit} className="question-form">
              {error && <p className="error-message">{error}</p>}
              <div className="form-group">
                <label htmlFor="questionText">Question Text</label>
                <Textarea id="questionText" name="questionText" value={formData.questionText} onChange={onChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="questionType">Question Type</label>
                <select id="questionType" name="questionType" value={formData.questionType} onChange={onChange}>
                  <option value="MCQ">MCQ</option>
                  <option value="SUBJECTIVE">Subjective</option>
                  <option value="CODING">Coding</option>
                </select>
              </div>

              {formData.questionType === 'MCQ' && (
                <>
                  <div className="form-group">
                    <label>Options</label>
                    {formData.options.map((opt, index) => (
                      <Input key={index} value={opt} onChange={(e) => onOptionChange(index, e.target.value)} placeholder={`Option ${index + 1}`} required />
                    ))}
                  </div>
                  <div className="form-group">
                    <label htmlFor="correctOption">Correct Option</label>
                    <select id="correctOption" name="correctOption" value={formData.correctOption} onChange={onChange}>
                      {formData.options.map((opt, index) => (
                        <option key={index} value={index}>Option {index + 1}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {formData.questionType === 'CODING' && (
                <>
                  <div className="form-group">
                    <label htmlFor="language">Language</label>
                    <Input id="language" name="language" value={formData.language} onChange={onChange} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="boilerplate">Boilerplate Code</label>
                    <Textarea id="boilerplate" name="boilerplate" value={formData.boilerplate} onChange={onChange} />
                  </div>
                </>
              )}

              <div className="form-group">
                <label htmlFor="marks">Marks</label>
                <Input id="marks" type="number" name="marks" value={formData.marks} onChange={onChange} required min="1" />
              </div>

              <Button type="submit" variant="primary">Add Question</Button>
            </form>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default QuestionManagementPage;
