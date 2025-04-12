// src/pages/TenantSuspended/TenantSuspended.js
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
  color: #f57c00; /* Naranja para suspensión */
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.text};
  margin-bottom: 15px;
`;

const Message = styled.p`
  color: ${props => props.theme.colors.textLight};
  margin-bottom: 15px;
  line-height: 1.6;
`;

const ContactInfo = styled.div`
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 30px;
  
  h3 {
    color: ${props => props.theme.colors.text};
    margin-bottom: 10px;
    font-size: 1rem;
  }
  
  p {
    margin: 5px 0;
    font-size: 0.9rem;
  }
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

const TenantSuspended = () => {
  const { currentTenant } = useTenant();
  const { logout } = useAuth();
  
  return (
    <Container>
      <Icon>🔒</Icon>
      <Title>Cuenta Suspendida</Title>
      
      <Message>
        {currentTenant?.name
          ? `El acceso a ${currentTenant.name} ha sido suspendido temporalmente.`
          : 'Esta cuenta ha sido suspendida temporalmente.'}
      </Message>
      
      <Message>
        Esto puede deberse a problemas con la facturación, violaciones de los términos de servicio
        o a petición del administrador del tenant.
      </Message>
      
      <ContactInfo>
        <h3>Para reactivar tu cuenta:</h3>
        <p>• Contacta con el administrador de la plataforma</p>
        <p>• Envía un correo a soporte@tuapp.com</p>
        <p>• O llama al +123 456 789</p>
      </ContactInfo>
      
      <Button to="#" onClick={() => logout()}>Cerrar Sesión</Button>
      <Button secondary to="https://tuapp.com" onClick={(e) => {
        e.preventDefault();
        window.location.href = 'https://tuapp.com';
      }}>Ir al Sitio Principal</Button>
    </Container>
  );
};

export default TenantSuspended;