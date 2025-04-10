// src/components/TenantRedirect/TenantRedirect.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '../../context/TenantContext';
import { useAuth } from '../../context/AuthContext';

const TenantRedirect = () => {
  const { currentTenant, loading } = useTenant();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (loading || authLoading) return;
    
    // Si estamos en un subdominio (tenant específico)
    if (currentTenant) {
      // Si el usuario está autenticado, ir al dashboard
      if (isAuthenticated) {
        navigate('/dashboard');
      } else {
        // Si no está autenticado, ir a la página pública del tenant
        navigate('/public');
      }
    } else {
      // Si estamos en el dominio principal, mostrar la página de registro de tenants
      navigate('/register-tenant');
    }
  }, [currentTenant, isAuthenticated, loading, authLoading, navigate]);
  
  // Mientras se carga, mostrar un indicador
  if (loading || authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Cargando...</div>
      </div>
    );
  }
  
  return null;
};

export default TenantRedirect;