import React from 'react';
import Textarea from './Textarea';
import './Question.css';

const Question = ({ question, onResponseChange }) => {
  const renderQuestionBody = () => {
    switch (question.questionType) {
      case 'MCQ':
        return (
          <div className="mcq-options">
            {question.options.map((option, index) => (
              <div key={index} className="mcq-option">
                <input 
                  type="radio" 
                  id={`${question._id}-${index}`} 
                  name={question._id} 
                  value={index} 
                  onChange={(e) => onResponseChange(question._id, e.target.value)} 
                />
                <label htmlFor={`${question._id}-${index}`}>{option}</label>
              </div>
            ))}
          </div>
        );
      case 'SUBJECTIVE':
        return (
          <Textarea 
            onChange={(e) => onResponseChange(question._id, e.target.value)} 
            placeholder="Type your answer here..."
          />
        );
      case 'CODING':
        return (
          <Textarea 
            className="code-input"
            onChange={(e) => onResponseChange(question._id, e.target.value)} 
            placeholder="Write your code here..."
            defaultValue={question.boilerplate || ''}
          />
        );
      default:
        return <p>Unsupported question type.</p>;
    }
  };

  return (
    <div className="question-container">
      <p className="question-text">{question.questionText}</p>
      {renderQuestionBody()}
    </div>
  );
};

export default Question;
