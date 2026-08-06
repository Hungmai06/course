import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
  const accessToken = localStorage.getItem('accessToken');
  const roleName = localStorage.getItem('roleName');
  
 
  if (!accessToken) {
   
    return <Navigate to="/login" replace />;
  }
  
  
  if (requiredRole && roleName !== requiredRole) {
   if (roleName === 'ADMIN') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }
  
  return children;
};

export default ProtectedRoute;
