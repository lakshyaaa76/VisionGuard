import React from 'react';
import './Input.css';

const Input = ({ type = 'text', placeholder, name, value, onChange, required = false }) => {
  return (
    <input
      className="input-field"
      type={type}
      placeholder={placeholder}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
    />
  );
};

export default Input;
