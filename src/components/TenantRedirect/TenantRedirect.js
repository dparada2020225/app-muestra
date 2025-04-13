// src/components/TenantRedirect/TenantRedirect.js - versión corregida
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '../../context/TenantContext';
import { useAuth } from '../../context/AuthContext';
import styled from 'styled-components';

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
`;

const Spinner = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: var(--primary-color);
  animation: spin 1s linear infinite;
  margin-bottom: 20px;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const Message = styled.div`
  color: ${props => props.theme.colors.textLight};
  text-align: center;
  max-width: 500px;
  
  h3 {
    margin-bottom: 10px;
    color: ${props => props.theme.colors.text};
  }
  
  p {
    margin-bottom: 20px;
  }
`;

const TenantRedirect = () => {
  const { currentTenant, loading: tenantLoading, error: tenantError } = useTenant();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Verificando información del tenant...');
  const [redirectPath, setRedirectPath] = useState(null);
  
  // Función para determinar la ruta correcta según el rol del usuario
  const getRedirectPathByRole = (userRole) => {
    switch(userRole) {
      case 'superAdmin':
        return '/admin/tenant-dashboard';
      case 'tenantAdmin':
        return '/tenant/dashboard';
      case 'tenantManager':
        return '/admin/transactions';
      default: // tenantUser o cualquier otro
        return '/products';
    }
  };
  
  useEffect(() => {
    console.log("TenantRedirect - Estado:", {
      tenantLoading, 
      authLoading, 
      isAuthenticated, 
      currentTenant: currentTenant?.name,
      user: user ? { id: user.id, tenantId: user.tenantId, role: user.role } : null,
      tenantError
    });
    
    // No hacer nada hasta que se completen todas las verificaciones
    if (tenantLoading || authLoading) {
      setMessage('Cargando...');
      return;
    }
    
    // Si estamos en un subdominio (tenant específico)
    if (currentTenant) {
      console.log("Tenant detectado:", currentTenant.name);
      
      // Verificar si el tenant está activo
      if (currentTenant.status !== 'active' && currentTenant.status !== 'trial') {
        setRedirectPath('/tenant-suspended');
        setMessage(`El tenant ${currentTenant.name} está ${currentTenant.status}. Redirigiendo...`);
        return;
      }
      
      // Si el usuario está autenticado
      if (isAuthenticated) {
        // Verificar si el usuario pertenece a este tenant o es superAdmin
        if (user.role === 'superAdmin' || user.tenantId === currentTenant.id) {
          const path = getRedirectPathByRole(user.role);
          console.log(`Usuario autenticado con rol ${user.role}, redirigiendo a ${path}`);
          setRedirectPath(path);
          setMessage(`Bienvenido a ${currentTenant.name}. Redirigiendo...`);
        } else {
          // Usuario autenticado pero no pertenece a este tenant
          console.log("Usuario no pertenece a este tenant");
          setRedirectPath('/unauthorized-tenant');
          setMessage('No tienes acceso a este tenant. Redirigiendo...');
        }
      } else {
        // No está autenticado, ir a la página pública del tenant
        console.log("Usuario no autenticado, redirigiendo a /public");
        setRedirectPath('/public');
        setMessage(`Bienvenido a ${currentTenant.name}. Redirigiendo...`);
      }
    } else {
      // Si estamos en el dominio principal sin tenant
      console.log("No hay tenant, dominio principal");
      
      if (isAuthenticated) {
        // Si el usuario tiene un tenantId, intentar cargar ese tenant
        if (user?.tenantId) {
          console.log("Intentando cargar tenant del usuario:", user.tenantId);
          navigate('/products');
          return;
        }
        
        // Si es superAdmin, ir al dashboard de superadmin
        if (user?.role === 'superAdmin') {
          setRedirectPath('/admin/tenant-dashboard');
          setMessage('Redirigiendo al panel de SuperAdmin...');
        } else {
          // Usuario autenticado sin tenant asociado
          setRedirectPath('/select-tenant');
          setMessage('No tienes un tenant asignado. Redirigiendo...');
        }
      } else {
        // No autenticado, dominio principal, mostrar landing page o registro de tenant
        console.log("No hay tenant, redirigiendo a /register-tenant");
        setRedirectPath('/register-tenant');
        setMessage('Redirigiendo a registro de tenant...');
      }
    }
  }, [currentTenant, isAuthenticated, tenantLoading, authLoading, user, tenantError, navigate]);
  
  // Realizar la redirección cuando se establece redirectPath
  useEffect(() => {
    if (redirectPath) {
      const timer = setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 500); // Pequeño retraso para mostrar el mensaje
      
      return () => clearTimeout(timer);
    }
  }, [redirectPath, navigate]);
  
  // Mostrar spinner de carga mientras se procesa la redirección
  return (
    <LoadingContainer>
      <Spinner />
      <Message>
        <h3>Preparando tu experiencia</h3>
        <p>{message}</p>
      </Message>
    </LoadingContainer>
  );
};

export default TenantRedirect;