// src/components/ProtectedRoute/ProtectedRoute.js - actualizado
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';

const ProtectedRoute = ({ 
  requireAdmin = false, 
  requireTenant = false,
  requireTenantAdmin = false,
  requireSuperAdmin = false,
  requireTenantManager = false
}) => {
  const { user, isAuthenticated, loading } = useAuth();
  const { currentTenant, loading: tenantLoading } = useTenant();
  
  // Si está cargando, no mostrar nada aún
  if (loading || tenantLoading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Cargando...</div>;
  }
  
  // Si se requiere un tenant y no hay uno actual
  if (requireTenant && !currentTenant) {
    console.log("Se requiere tenant pero no hay uno configurado");
    return <Navigate to="/login" />;
  }
  
  // Verificar si el usuario está autenticado
  if (!isAuthenticated) {
    console.log("Usuario no autenticado, redirigiendo a login");
    return <Navigate to="/login" />;
  }
  
  // Verificar los requisitos de rol específicos
  if (requireSuperAdmin && user?.role !== 'superAdmin') {
    console.log("Se requiere superAdmin pero el usuario no lo es:", user?.role);
    return <Navigate to="/dashboard" />;
  }
  
  // Si requireAdmin es true, verificar roles de administración
  if (requireAdmin && 
      user?.role !== 'admin' && 
      user?.role !== 'superAdmin' && 
      user?.role !== 'tenantAdmin') {
    console.log("Se requiere admin pero el usuario no lo es:", user?.role);
    return <Navigate to="/dashboard" />;
  }
  
  // Si requireTenantAdmin es true, verificar que el usuario sea tenantAdmin
  if (requireTenantAdmin && 
      user?.role !== 'tenantAdmin' && 
      user?.role !== 'superAdmin') {
    console.log("Se requiere tenant admin pero el usuario no lo es:", user?.role);
    return <Navigate to="/dashboard" />;
  }
  
  // Si requireTenantManager es true, verificar que el usuario sea tenantManager o superior
  if (requireTenantManager && 
      user?.role !== 'tenantManager' && 
      user?.role !== 'tenantAdmin' && 
      user?.role !== 'superAdmin') {
    console.log("Se requiere tenant manager pero el usuario no lo es:", user?.role);
    return <Navigate to="/dashboard" />;
  }
  
  // Si todo está bien, mostrar las rutas hijas
  return <Outlet />;
};

export default ProtectedRoute;