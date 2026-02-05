import React, { useEffect, useReducer, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import examService from '../services/examService';
import useIntegrityEvents from '../hooks/useIntegrityEvents';
import useMlFrameSampling from '../hooks/useMlFrameSampling';
import Button from '../components/common/Button';
import Question from '../components/common/Question';
import './ExamPage.css';

const initialState = {
  session: null,
  exam: null,
  responses: {},
  timeLeft: null,
  loading: true,
  error: null,
};

function examReducer(state, action) {
  switch (action.type) {
    case 'SESSION_START_SUCCESS':
      return {
        ...state,
        session: action.payload,
        exam: action.payload.exam,
        timeLeft: new Date(action.payload.endTime) - new Date(),
        loading: false,
      };
    case 'SESSION_START_FAILURE':
      return { ...state, loading: false, error: action.payload };
    case 'SET_RESPONSE':
      return {
        ...state,
        responses: {
          ...state.responses,
          [action.payload.questionId]: action.payload.answer,
        },
      };
    case 'TICK':
      return { ...state, timeLeft: state.timeLeft - 1000 };
    default:
      return state;
  }
}

const ExamPage = () => {
  const { id: examId } = useParams();
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(examReducer, initialState);
  const { session, exam, responses, timeLeft, loading, error } = state;

  // ✅ Integrity events only activate AFTER session exists
  useIntegrityEvents(session ? session._id : null);
  useMlFrameSampling(session ? session._id : null);

  const handleSubmit = useCallback(
    async (currentResponses) => {
      if (!session) return;

      try {
        const token = localStorage.getItem('token');
        const formattedResponses = Object.entries(currentResponses).map(
          ([questionId, answer]) => ({ questionId, answer })
        );

        await examService.submitExam(session._id, formattedResponses, token);
        alert('Exam submitted successfully!');
        navigate('/dashboard');
      } catch (err) {
        console.error('Failed to submit exam', err);
        alert('There was an error submitting your exam.');
      }
    },
    [session, navigate]
  );

  useEffect(() => {
    const startSession = async () => {
      try {
        const token = localStorage.getItem('token');
        const sessionData = await examService.startExamSession(examId, token);
        dispatch({ type: 'SESSION_START_SUCCESS', payload: sessionData });
      } catch (err) {
        console.error('Failed to start exam session', err);
        const errorMessage =
          err.response?.data?.msg || 'Failed to start session.';
        dispatch({
          type: 'SESSION_START_FAILURE',
          payload: errorMessage,
        });
        alert(errorMessage);
        navigate('/dashboard');
      }
    };

    startSession();
  }, [examId, navigate]);

  useEffect(() => {
    if (timeLeft === null) return;

    if (timeLeft <= 0) {
      handleSubmit(responses);
      return;
    }

    const timer = setInterval(() => {
      dispatch({ type: 'TICK' });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, handleSubmit, responses]);


  const handleResponseChange = (questionId, answer) => {
    dispatch({
      type: 'SET_RESPONSE',
      payload: { questionId, answer },
    });
  };

  if (loading) {
    return <div className="exam-page">Starting your exam...</div>;
  }

  if (error) {
    return <div className="exam-page">Error: {error}</div>;
  }

  const formatTime = (ms) => {
    if (ms <= 0) return '00:00';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
      2,
      '0'
    )}`;
  };

  return (
    <div className="exam-page">
      <div className="exam-header">
        <div className="exam-title">{exam?.title}</div>
        <div className="timer">{formatTime(timeLeft)}</div>
      </div>

      <div className="exam-content">
        {exam?.questions.map((q) => (
          <Question
            key={q._id}
            question={q}
            onResponseChange={handleResponseChange}
          />
        ))}
      </div>

      <div className="exam-footer">
        <Button
          onClick={() => handleSubmit(responses)}
          variant="primary"
        >
          Submit Exam
        </Button>
      </div>
    </div>
  );
};

export default ExamPage;
