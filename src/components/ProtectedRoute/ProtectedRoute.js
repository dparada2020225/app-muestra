// src/components/ProtectedRoute/ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';

const ProtectedRoute = ({ requireAdmin = false, requireTenant = false }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const { currentTenant, loading: tenantLoading } = useTenant();
  
  // Si está cargando, no mostrar nada aún
  if (loading || tenantLoading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Cargando...</div>;
  }
  
  // Si se requiere un tenant y no hay uno actual
  if (requireTenant && !currentTenant) {
    return <Navigate to="/login" />;
  }
  
  // Si requireAdmin es true, verificar que el usuario sea admin
  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }
  
  // Verificar si el usuario está autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // Si todo está bien, mostrar las rutas hijas
  return <Outlet />;
};

export default ProtectedRoute;