import React from 'react';
import { Editor } from '@monaco-editor/react';
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
          <Editor
            height="300px"
            language={question.language || 'javascript'}
            theme="vs-dark"
            defaultValue={question.boilerplate || ''}
            onChange={(value) => onResponseChange(question._id, value)}
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
