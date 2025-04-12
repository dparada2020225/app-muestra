// src/pages/TenantError/TenantError.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTenant } from '../../context/TenantContext';
import { useAuth } from '../../context/AuthContext';

const Container = styled.div`
  max-width: 600px;
  margin: 80px auto;
  padding: 40px;
  text-align: center;
  background-color: ${props => props.theme.colors.cardBackground};
  border-radius: 8px;
  box-shadow: ${props => props.theme.shadows.medium};
`;

const ErrorIcon = styled.div`
  font-size: 60px;
  margin-bottom: 20px;
  color: ${props => props.theme.colors.danger};
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.text};
  margin-bottom: 15px;
`;

const Message = styled.p`
  color: ${props => props.theme.colors.textLight};
  margin-bottom: 30px;
  line-height: 1.6;
`;

const Button = styled(Link)`
  display: inline-block;
  background-color: ${props => props.secondary ? '#6c757d' : props.theme.colors.primary};
  color: white;
  padding: 10px 20px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: bold;
  margin: 0 10px;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const TenantError = () => {
  const { currentTenant, error: tenantError } = useTenant();
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  
  // Determinar el tipo de error
  const renderErrorContent = () => {
    // Si hay un tenant pero está suspendido o cancelado
    if (currentTenant && (currentTenant.status === 'suspended' || currentTenant.status === 'cancelled')) {
      return (
        <>
          <ErrorIcon>🔒</ErrorIcon>
          <Title>Tenant Suspendido</Title>
          <Message>
            El acceso a <strong>{currentTenant.name}</strong> ha sido {currentTenant.status === 'suspended' ? 'suspendido temporalmente' : 'cancelado'}.
            {currentTenant.status === 'suspended' ? ' Por favor, contacta al administrador para reactivar tu cuenta.' : ' Esta cuenta ya no está disponible.'}
          </Message>
          {isAuthenticated && (
            <Button to="#" onClick={() => logout()}>Cerrar Sesión</Button>
          )}
          <Button secondary to="https://tuapp.com" onClick={(e) => {
            e.preventDefault();
            window.location.href = 'https://tuapp.com';
          }}>Ir al Sitio Principal</Button>
        </>
      );
    }
    
    // Si el tenant no existe
    if (tenantError && tenantError.includes('no encontrado')) {
      return (
        <>
          <ErrorIcon>🔍</ErrorIcon>
          <Title>Tenant No Encontrado</Title>
          <Message>
            El tenant que estás buscando no existe o ha sido eliminado.
            Por favor, verifica la URL o contacta al administrador si crees que esto es un error.
          </Message>
          <Button to="https://tuapp.com" onClick={(e) => {
            e.preventDefault();
            window.location.href = 'https://tuapp.com';
          }}>Ir al Sitio Principal</Button>
        </>
      );
    }
    
    // Error de acceso no autorizado
    if (tenantError && tenantError.includes('No tienes permiso')) {
      return (
        <>
          <ErrorIcon>⛔</ErrorIcon>
          <Title>Acceso Denegado</Title>
          <Message>
            No tienes permiso para acceder a este tenant.
            Si crees que deberías tener acceso, por favor contacta al administrador.
          </Message>
          {isAuthenticated && (
            <Button to="#" onClick={() => logout()}>Cerrar Sesión</Button>
          )}
          <Button secondary to="https://tuapp.com" onClick={(e) => {
            e.preventDefault();
            window.location.href = 'https://tuapp.com';
          }}>Ir al Sitio Principal</Button>
        </>
      );
    }
    
    // Error genérico
    return (
      <>
        <ErrorIcon>⚠️</ErrorIcon>
        <Title>Error en el Tenant</Title>
        <Message>
          Ha ocurrido un error al acceder a este tenant.
          Por favor, intenta nuevamente más tarde o contacta al soporte técnico.
        </Message>
        <Button to="#" onClick={() => navigate(-1)}>Volver</Button>
        <Button secondary to="https://tuapp.com" onClick={(e) => {
          e.preventDefault();
          window.location.href = 'https://tuapp.com';
        }}>Ir al Sitio Principal</Button>
      </>
    );
  };
  
  return (
    <Container>
      {renderErrorContent()}
    </Container>
  );
};

export default TenantError;