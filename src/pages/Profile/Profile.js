// src/pages/Profile/Profile.js
import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const Container = styled.div`
  max-width: 600px;
  margin: 60px auto;
  padding: 30px;
  background-color: ${props => props.theme.colors.cardBackground};
  border-radius: 8px;
  box-shadow: ${props => props.theme.shadows.medium};
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.text};
  margin-bottom: 30px;
  text-align: center;
`;

const UserInfoCard = styled.div`
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 30px;
`;

const InfoItem = styled.div`
  margin-bottom: 15px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.span`
  font-weight: bold;
  color: ${props => props.theme.colors.textLight};
  display: inline-block;
  width: 120px;
`;

const InfoValue = styled.span`
  color: ${props => props.theme.colors.text};
`;

const RoleBadge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  background-color: ${props => {
    switch(props.role) {
      case 'superAdmin': return '#9c27b0';
      case 'tenantAdmin': return '#2196f3';
      case 'tenantManager': return '#4caf50';
      default: return '#ff9800';
    }
  }};
  color: white;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
`;

const Button = styled(Link)`
  display: inline-block;
  background-color: ${props => props.secondary ? '#6c757d' : props.theme.colors.primary};
  color: white;
  padding: 10px 20px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: bold;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const BackButton = styled(Button)`
  background-color: #6c757d;
  
  &:hover {
    background-color: #5a6268;
  }
`;

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated || !user) {
    return (
      <Container>
        <Title>Acceso Denegado</Title>
        <p>Debes iniciar sesión para ver tu perfil.</p>
        <ButtonContainer>
          <Button to="/login">Iniciar Sesión</Button>
        </ButtonContainer>
      </Container>
    );
  }
  
  // Determinar página de inicio según el rol del usuario
  const getHomePage = () => {
    if (user.role === 'superAdmin') {
      return '/super-admin-welcome';
    } else if (user.role === 'tenantAdmin') {
      return '/tenant/dashboard';
    } else {
      return '/products';
    }
  };
  
  return (
    <Container>
      <Title>Mi Perfil</Title>
      
      <UserInfoCard>
        <InfoItem>
          <InfoLabel>Usuario:</InfoLabel>
          <InfoValue>{user.username}</InfoValue>
        </InfoItem>
        
        <InfoItem>
          <InfoLabel>Rol:</InfoLabel>
          <InfoValue>
            <RoleBadge role={user.role}>
              {user.role === 'superAdmin' ? 'Super Admin' : 
               user.role === 'tenantAdmin' ? 'Tenant Admin' : 
               user.role === 'tenantManager' ? 'Manager' : 'Usuario'}
            </RoleBadge>
          </InfoValue>
        </InfoItem>
        
        {user.email && (
          <InfoItem>
            <InfoLabel>Email:</InfoLabel>
            <InfoValue>{user.email}</InfoValue>
          </InfoItem>
        )}
        
        {user.tenantId && (
          <InfoItem>
            <InfoLabel>Tenant ID:</InfoLabel>
            <InfoValue>{user.tenantId}</InfoValue>
          </InfoItem>
        )}
        
        <InfoItem>
          <InfoLabel>ID de Usuario:</InfoLabel>
          <InfoValue>{user.id}</InfoValue>
        </InfoItem>
      </UserInfoCard>
      
      <ButtonContainer>
        <BackButton to={getHomePage()}>Volver al Inicio</BackButton>
        {user.role === 'superAdmin' && (
          <Button to="/admin/tenant-dashboard">Panel de Control</Button>
        )}
      </ButtonContainer>
    </Container>
  );
};

export default Profile;