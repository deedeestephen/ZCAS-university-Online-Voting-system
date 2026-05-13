/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages will be imported here
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import OTPVerification from './pages/auth/OTPVerification';
import UploadId from './pages/auth/UploadId';
import SelfieCapture from './pages/auth/SelfieCapture';
import StudentDashboard from './pages/student/Dashboard';
import VotingPage from './pages/student/VotingPage';
import VoteConfirmation from './pages/student/VoteConfirmation';
import Guidelines from './pages/student/Guidelines';
import VerificationStatus from './pages/student/VerificationStatus';
import AdminDashboard from './pages/admin/Analytics';
import ManageCandidates from './pages/admin/Candidates';
import ManageStudents from './pages/admin/Students';
import VerificationReview from './pages/admin/VerificationReview';
import AdminSettings from './pages/admin/Settings';

const ProtectedRoute = ({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) => {
  const { user, isAdmin } = useAuth();
  
  if (!user) return <Navigate to="/" />;
  if (requireAdmin && !isAdmin) return <Navigate to="/dashboard" />;
  if (!requireAdmin && isAdmin) return <Navigate to="/admin" />;
  
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin } = useAuth();
  
  if (user) {
    if (isAdmin) return <Navigate to="/admin" />;
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public / Auth Routes */}
          <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<Register />} />
          <Route path="/otp" element={<ProtectedRoute><OTPVerification /></ProtectedRoute>} />
          <Route path="/upload-id" element={<ProtectedRoute><UploadId /></ProtectedRoute>} />
          <Route path="/selfie" element={<ProtectedRoute><SelfieCapture /></ProtectedRoute>} />

          {/* Student Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
          <Route path="/guidelines" element={<ProtectedRoute><Guidelines /></ProtectedRoute>} />
          <Route path="/verify-status" element={<ProtectedRoute><VerificationStatus /></ProtectedRoute>} />
          <Route path="/vote/:position" element={<ProtectedRoute><VotingPage /></ProtectedRoute>} />
          <Route path="/vote-confirmation" element={<ProtectedRoute><VoteConfirmation /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/candidates" element={<ProtectedRoute requireAdmin><ManageCandidates /></ProtectedRoute>} />
          <Route path="/admin/students" element={<ProtectedRoute requireAdmin><ManageStudents /></ProtectedRoute>} />
          <Route path="/admin/reviews" element={<ProtectedRoute requireAdmin><VerificationReview /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute requireAdmin><AdminSettings /></ProtectedRoute>} />
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </AuthProvider>
  );
}
