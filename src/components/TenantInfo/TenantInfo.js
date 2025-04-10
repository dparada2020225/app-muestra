// src/components/TenantInfo/TenantInfo.js
import React from 'react';
import styled from 'styled-components';
import { useTenant } from '../../context/TenantContext';

const Container = styled.div`
  background-color: ${props => props.theme.colors.cardBackground};
  border-radius: 8px;
  box-shadow: ${props => props.theme.shadows.small};
  padding: 20px;
  margin-bottom: 20px;
  border-left: 4px solid var(--primary-color);
`;

const TenantName = styled.h2`
  color: ${props => props.theme.colors.text};
  margin: 0 0 10px 0;
  font-size: 1.5rem;
`;

const Slogan = styled.p`
  color: ${props => props.theme.colors.textLight};
  font-style: italic;
  margin: 0 0 15px 0;
`;

const Description = styled.p`
  color: ${props => props.theme.colors.text};
  margin: 0 0 15px 0;
  line-height: 1.5;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-top: 1px solid #eee;
  
  &:last-child {
    border-bottom: 1px solid #eee;
  }
`;

const InfoLabel = styled.span`
  font-weight: 600;
  color: ${props => props.theme.colors.textLight};
`;

const InfoValue = styled.span`
  color: ${props => props.theme.colors.text};
`;

const Logo = styled.img`
  max-width: 100px;
  height: auto;
  margin-bottom: 15px;
`;

const ColorPreview = styled.span`
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background-color: ${props => props.color};
  margin-right: 10px;
  border: 1px solid #ddd;
  vertical-align: middle;
`;

const TenantInfo = ({ showDetails = false }) => {
  const { currentTenant, loading } = useTenant();
  
  if (loading) {
    return <Container>Cargando información del tenant...</Container>;
  }
  
  if (!currentTenant) {
    return <Container>No se encontró información del tenant</Container>;
  }
  
  return (
    <Container>
      {currentTenant.logo && (
        <Logo src={currentTenant.logo} alt={`${currentTenant.name} Logo`} />
      )}
      
      <TenantName>{currentTenant.name}</TenantName>
      
      {currentTenant.slogan && (
        <Slogan>{currentTenant.slogan}</Slogan>
      )}
      
      {currentTenant.description && (
        <Description>{currentTenant.description}</Description>
      )}
      
      {showDetails && (
        <>
          <InfoRow>
            <InfoLabel>Plan</InfoLabel>
            <InfoValue style={{ textTransform: 'capitalize' }}>
              {currentTenant.plan || 'Free'}
            </InfoValue>
          </InfoRow>
          
          <InfoRow>
            <InfoLabel>Estado</InfoLabel>
            <InfoValue style={{ textTransform: 'capitalize' }}>
              {currentTenant.status || 'Activo'}
            </InfoValue>
          </InfoRow>
          
          <InfoRow>
            <InfoLabel>Subdominio</InfoLabel>
            <InfoValue>{currentTenant.subdomain}</InfoValue>
          </InfoRow>
          
          <InfoRow>
            <InfoLabel>Color Primario</InfoLabel>
            <InfoValue>
              <ColorPreview color={currentTenant.customization?.primaryColor || '#3b82f6'} />
              {currentTenant.customization?.primaryColor || '#3b82f6'}
            </InfoValue>
          </InfoRow>
          
          <InfoRow>
            <InfoLabel>Color Secundario</InfoLabel>
            <InfoValue>
              <ColorPreview color={currentTenant.customization?.secondaryColor || '#333333'} />
              {currentTenant.customization?.secondaryColor || '#333333'}
            </InfoValue>
          </InfoRow>
          
          <InfoRow>
            <InfoLabel>Símbolo de Moneda</InfoLabel>
            <InfoValue>{currentTenant.customization?.currencySymbol || 'Q'}</InfoValue>
          </InfoRow>
        </>
      )}
    </Container>
  );
};

export default TenantInfo;