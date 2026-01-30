import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../../services/authService';

const ProtectedRoute = ({ children, roles }) => {
  const currentUser = authService.getCurrentUser();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(currentUser.role)) {
    // Redirect if user's role is not in the allowed roles
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default ProtectedRoute;
