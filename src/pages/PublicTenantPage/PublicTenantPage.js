// src/pages/PublicTenantPage/PublicTenantPage.js
import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useTenant } from '../../context/TenantContext';

const Container = styled.div`
  max-width: 1000px;
  margin: 60px auto;
  padding: 0 20px;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 20px;
  color: var(--primary-color, ${props => props.theme.colors.primary});
`;

const Subtitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 40px;
  color: ${props => props.theme.colors.textLight};
`;

const Description = styled.p`
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 30px;
`;

const LoginButton = styled(Link)`
  display: inline-block;
  background-color: var(--primary-color, ${props => props.theme.colors.primary});
  color: white;
  padding: 14px 28px;
  border-radius: 8px;
  font-weight: bold;
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const Logo = styled.img`
  max-width: 180px;
  margin-bottom: 30px;
`;

const PublicTenantPage = () => {
  const { currentTenant, loading, error } = useTenant();
  
  if (loading) {
    return <Container>Cargando información...</Container>;
  }
  
  if (error || !currentTenant) {
    return (
      <Container>
        <Title>Tenant no encontrado</Title>
        <Description>
          Lo sentimos, no pudimos encontrar la información para este tenant.
        </Description>
      </Container>
    );
  }
  
  return (
    <Container>
      {currentTenant.logo && (
        <Logo src={currentTenant.logo} alt={`${currentTenant.name} Logo`} />
      )}
      
      <Title>Bienvenido a {currentTenant.name}</Title>
      
      <Subtitle>
        {currentTenant.slogan || 'Sistema de Gestión de Inventario'}
      </Subtitle>
      
      <Description>
        {currentTenant.description || 
          'Accede a tu cuenta para gestionar tu inventario, realizar compras, ventas y mucho más.'}
      </Description>
      
      <LoginButton to="/login">
        Iniciar Sesión
      </LoginButton>
    </Container>
  );
};

export default PublicTenantPage;