// src/pages/SuperAdminWelcome/SuperAdminWelcome.js
import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const Container = styled.div`
  max-width: 800px;
  margin: 80px auto;
  padding: 40px;
  background-color: ${props => props.theme.colors.cardBackground};
  border-radius: 10px;
  box-shadow: ${props => props.theme.shadows.medium};
  text-align: center;
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.text};
  margin-bottom: 20px;
`;

const Message = styled.p`
  font-size: 1.2rem;
  color: ${props => props.theme.colors.textLight};
  margin-bottom: 30px;
  line-height: 1.6;
`;

const UserInfo = styled.div`
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
  text-align: left;
`;

const InfoItem = styled.div`
  margin-bottom: 10px;
  
  strong {
    display: inline-block;
    width: 100px;
    color: ${props => props.theme.colors.text};
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
`;

const Button = styled(Link)`
  display: inline-block;
  background-color: ${props => props.secondary ? '#6c757d' : props.theme.colors.primary};
  color: white;
  padding: 12px 24px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: bold;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const SuperAdminWelcome = () => {
  const { user, logout } = useAuth();
  
  if (!user || user.role === 'superAdmin') {
    return (
      <Container>
        <Title>Acceso Denegado</Title>
        <Message>
          Esta página es solo para superadministradores. Por favor, inicia sesión con una cuenta de superadmin.
        </Message>
        <ButtonContainer>
          <Button to="/login">Iniciar Sesión</Button>
        </ButtonContainer>
      </Container>
    );
  }
  
  return (
    <Container>
      <Title>Bienvenido, Superadministrador</Title>
      
      <Message>
        ¡Ya puedes entrar a super admin sin subdominio!
      </Message>
      
      <UserInfo>
        <InfoItem>
          <strong>Usuario:</strong> {user.username}
        </InfoItem>
        <InfoItem>
          <strong>Rol:</strong> {user.role}
        </InfoItem>
        <InfoItem>
          <strong>ID:</strong> {user.id}
        </InfoItem>
      </UserInfo>
      
      <Message>
        Desde aquí puedes administrar todos los tenants y usuarios de la plataforma.
        Próximamente tendrás acceso a más funciones administrativas.
      </Message>
      
      <ButtonContainer>
        <Button to="/profile">Mi Perfil</Button>
        <Button secondary to="#" onClick={() => logout()}>Cerrar Sesión</Button>
      </ButtonContainer>
    </Container>
  );
};

export default SuperAdminWelcome;