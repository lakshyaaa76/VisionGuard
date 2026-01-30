import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ExamPage from './pages/ExamPage';
import ProctorDashboardPage from './pages/ProctorDashboardPage';
import SessionReviewPage from './pages/SessionReviewPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import SessionResultPage from './pages/SessionResultPage';
import UserManagementPage from './pages/UserManagementPage';
import ExamManagementPage from './pages/ExamManagementPage';
import SubjectiveReviewPage from './pages/SubjectiveReviewPage';
import QuestionManagementPage from './pages/QuestionManagementPage';
import AvailableExamsPage from './pages/AvailableExamsPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/proctor/dashboard" 
            element={
              <ProtectedRoute roles={['PROCTOR']}>
                <ProctorDashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/proctor/review/:id" 
            element={
              <ProtectedRoute roles={['PROCTOR']}>
                <SessionReviewPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/exams" 
            element={
              <ProtectedRoute roles={['CANDIDATE']}>
                <AvailableExamsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/exam/:id" 
            element={
              <ProtectedRoute>
                <ExamPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/session/result/:id" 
            element={
              <ProtectedRoute>
                <SessionResultPage />
              </ProtectedRoute>
            } 
          />
                    <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <UserManagementPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/evaluation/:id" 
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <SubjectiveReviewPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/exams/:id/questions" 
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <QuestionManagementPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/exams" 
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <ExamManagementPage />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
