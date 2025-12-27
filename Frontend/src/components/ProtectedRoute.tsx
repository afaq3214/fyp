import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'admin';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole = 'user',
}) => {
  const { user } = useContext(UserContext);
  const location = useLocation();
  const token = localStorage.getItem('token');

  if (!token) {
    // Redirect to login page with the return url
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check if user has the required role
  if (requiredRole === 'admin' && (!user || user.role !== 'admin')) {
    // Redirect to home page if not admin
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole="admin">
    {children}
  </ProtectedRoute>
);
