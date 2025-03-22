// src/components/ProtectedRoute/ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ requireAdmin = false }) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  // Si está cargando, no mostrar nada aún
  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Cargando...</div>;
  }
  
  // Si requireAdmin es true, verificar que el usuario sea admin
  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/" />;
  }
  
  // Verificar si el usuario está autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // Si todo está bien, mostrar las rutas hijas
  return <Outlet />;
};

export default ProtectedRoute;