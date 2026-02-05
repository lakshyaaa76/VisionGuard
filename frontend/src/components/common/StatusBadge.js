import React from 'react';
import './StatusBadge.css';

const StatusBadge = ({ status }) => {
  const getStatusClass = () => {
    switch (status) {
      // Exam/Session Statuses
      case 'CLEARED':
      case 'EVALUATED':
      case 'ACTIVE':
      case 'PUBLISHED':
        return 'status-cleared';
      case 'INVALIDATED':
      case 'BANNED':
      case 'TERMINATED':
        return 'status-invalidated';
      case 'PENDING':
      case 'UNDER_REVIEW':
      case 'SUSPENDED':
      case 'ARCHIVED':
        return 'status-review';
      // User Roles
      case 'ADMIN':
        return 'status-admin';
      case 'PROCTOR':
        return 'status-proctor';
      case 'CANDIDATE':
        return 'status-candidate';
      default:
        return 'status-default';
    }
  };

  return <span className={`status-badge ${getStatusClass()}`}>{status}</span>;
};

export default StatusBadge;
