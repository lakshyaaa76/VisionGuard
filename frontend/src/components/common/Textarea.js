import React from 'react';
import './Textarea.css';

const Textarea = ({ placeholder, name, value, onChange, rows = 4 }) => {
  return (
    <textarea
      className="textarea-field"
      placeholder={placeholder}
      name={name}
      value={value}
      onChange={onChange}
      rows={rows}
    />
  );
};

export default Textarea;
