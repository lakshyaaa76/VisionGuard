import React, { useState, useEffect } from 'react';
import Input from './Input';
import Button from './Button';
import './EditExamModal.css';

const EditExamModal = ({ exam, onClose, onSave }) => {
  const [formData, setFormData] = useState({ ...exam });

  useEffect(() => {
    setFormData({ ...exam });
  }, [exam]);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!exam) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit Exam</h2>
        <form onSubmit={handleSubmit}>
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
          <div className="modal-actions">
            <Button type="submit" variant="primary">Save Changes</Button>
            <Button onClick={onClose} variant="secondary">Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditExamModal;
