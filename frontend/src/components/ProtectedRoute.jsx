import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading authentication state...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRole && user?.role !== allowedRole) {
    // Redirect user to their own dashboard based on their current role
    if (user?.role === 'ROLE_DONOR') return <Navigate to="/donor/dashboard" replace />;
    if (user?.role === 'ROLE_NGO') return <Navigate to="/ngo/dashboard" replace />;
    if (user?.role === 'ROLE_VOLUNTEER') return <Navigate to="/volunteer/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};
