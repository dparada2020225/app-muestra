// src/components/TenantRedirect/TenantRedirect.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '../../context/TenantContext';
import { useAuth } from '../../context/AuthContext';

const TenantRedirect = () => {
  const { currentTenant, loading, switchTenant } = useTenant();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log("TenantRedirect - Estado:", {
      tenantLoading: loading,
      authLoading,
      isAuthenticated,
      currentTenant: currentTenant?.name,
      user: user ? { id: user.id, tenantId: user.tenantId, role: user.role } : null
    });
    
    // Si el usuario está autenticado pero no hay tenant, intentar obtenerlo del usuario
    if (!loading && !authLoading && isAuthenticated && user?.tenantId && !currentTenant) {
      console.log("Intentando cargar tenant del usuario:", user.tenantId);
      switchTenant(user.tenantId);
      return; // Salir para esperar a que se cargue el tenant
    }
    
    if (loading || authLoading) return;
    
    // Si estamos en un subdominio (tenant específico)
    if (currentTenant) {
      console.log("Tenant detectado:", currentTenant.name);
      
      // Si el usuario está autenticado, ir al dashboard
      if (isAuthenticated) {
        console.log("Usuario autenticado, redirigiendo a /dashboard");
        navigate('/dashboard', { replace: true });
      } else {
        // Si no está autenticado, ir a la página pública del tenant
        console.log("Usuario no autenticado, redirigiendo a /public");
        navigate('/public', { replace: true });
      }
    } else {
      // Si estamos en el dominio principal, mostrar la página de registro de tenants
      console.log("No hay tenant, redirigiendo a /register-tenant");
      navigate('/register-tenant', { replace: true });
    }
  }, [currentTenant, isAuthenticated, loading, authLoading, navigate, user, switchTenant]);
  
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