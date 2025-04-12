// src/pages/UnauthorizedTenant/UnauthorizedTenant.js
import React from 'react';
import styled from 'styled-components';
import { useTenant } from '../../context/TenantContext';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const Container = styled.div`
  max-width: 600px;
  margin: 80px auto;
  padding: 40px;
  text-align: center;
  background-color: ${props => props.theme.colors.cardBackground};
  border-radius: 8px;
  box-shadow: ${props => props.theme.shadows.medium};
`;

const Icon = styled.div`
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

const UnauthorizedTenant = () => {
  const { currentTenant } = useTenant();
  const { user, logout } = useAuth();
  
  return (
    <Container>
      <Icon>⛔</Icon>
      <Title>Acceso No Autorizado</Title>
      
      <Message>
        {user?.username && currentTenant?.name ? (
          <>
            <strong>{user.username}</strong>, no tienes acceso a <strong>{currentTenant.name}</strong>.
          </>
        ) : (
          'No tienes acceso a este tenant.'
        )}
      </Message>
      
      <Message>
        Si crees que deberías tener acceso, contacta al administrador del tenant
        para solicitar acceso. O bien, puedes cerrar sesión e iniciar con una cuenta diferente.
      </Message>
      
      <Button to="#" onClick={() => logout()}>Cerrar Sesión</Button>
      
      {user.tenantId && (
        <Button secondary to="#" onClick={() => {
          // Redireccionar al tenant del usuario
          window.location.href = `https://${user.tenantId}.tuapp.com`;
        }}>
          Ir a Mi Tenant
        </Button>
      )}
    </Container>
  );
};

export default UnauthorizedTenant;