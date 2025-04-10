// src/pages/TenantSettings/TenantSettings.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTenant } from '../../context/TenantContext';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const Container = styled.div`
  max-width: 800px;
  margin: 40px auto;
  padding: 0 20px;
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.text};
  margin-bottom: 30px;
  text-align: center;
`;

const Card = styled.div`
  background-color: ${props => props.theme.colors.cardBackground};
  padding: 25px;
  border-radius: 8px;
  box-shadow: ${props => props.theme.shadows.small};
  margin-bottom: 30px;
`;

const SectionTitle = styled.h2`
  color: ${props => props.theme.colors.text};
  font-size: 1.5rem;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-sizing: border-box;
  
  &:focus {
    border-color: ${props => props.theme.colors.primary};
    outline: none;
    box-shadow: 0 0 0 2px rgba(150, 255, 0, 0.2);
  }
`;

const ColorInput = styled(Input)`
  padding: 5px;
  width: 100px;
  height: 40px;
`;

const ColorPreview = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: ${props => props.color};
  margin-right: 10px;
  border: 1px solid #ddd;
  display: inline-block;
  vertical-align: middle;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
`;

const Button = styled.button`
  background-color: ${props => props.$primary ? 'var(--primary-color)' : '#6c757d'};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.small};
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.danger};
  background-color: rgba(255, 0, 0, 0.1);
  border-left: 3px solid ${props => props.theme.colors.danger};
  padding: 12px;
  margin-bottom: 20px;
  border-radius: 4px;
`;

const SuccessMessage = styled.div`
  color: ${props => props.theme.colors.success};
  background-color: rgba(76, 175, 80, 0.1);
  border-left: 3px solid ${props => props.theme.colors.success};
  padding: 12px;
  margin-bottom: 20px;
  border-radius: 4px;
`;

const TenantSettings = () => {
  const { currentTenant, loading: tenantLoading, applyTenantSettings } = useTenant();
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    slogan: '',
    description: '',
    primaryColor: '',
    secondaryColor: '',
    currencySymbol: '',
    logoText: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  useEffect(() => {
    if (currentTenant && !tenantLoading) {
      setFormData({
        name: currentTenant.name || '',
        slogan: currentTenant.slogan || '',
        description: currentTenant.description || '',
        primaryColor: currentTenant.customization?.primaryColor || '#3b82f6',
        secondaryColor: currentTenant.customization?.secondaryColor || '#333333',
        currencySymbol: currentTenant.customization?.currencySymbol || 'Q',
        logoText: currentTenant.customization?.logoText || currentTenant.name || ''
      });
    }
  }, [currentTenant, tenantLoading]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    // Verificar si el usuario tiene permiso
    if (!isAuthenticated || (user.role !== 'tenantAdmin' && user.role !== 'admin')) {
      setError('No tienes permiso para modificar la configuración del tenant');
      setIsLoading(false);
      return;
    }
    
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await axios.put(
        `${API_URL}/api/tenants/${currentTenant.id}/settings`,
        {
          name: formData.name,
          slogan: formData.slogan,
          description: formData.description,
          customization: {
            primaryColor: formData.primaryColor,
            secondaryColor: formData.secondaryColor,
            currencySymbol: formData.currencySymbol,
            logoText: formData.logoText
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      // Si la actualización fue exitosa, actualizar el tenant actual
      if (response.data && response.data.tenant) {
        // Aplicar configuración actualizada
        applyTenantSettings(response.data.tenant);
        setSuccess('Configuración actualizada correctamente');
      }
    } catch (err) {
      console.error('Error al actualizar configuración del tenant:', err);
      setError(err.response?.data?.message || 'Error al actualizar la configuración');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (tenantLoading) {
    return <Container><div>Cargando configuración...</div></Container>;
  }
  
  if (!currentTenant) {
    return <Container><ErrorMessage>No se encontró información del tenant</ErrorMessage></Container>;
  }
  
  return (
    <Container>
      <Title>Configuración del Tenant</Title>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}
      
      <form onSubmit={handleSubmit}>
        <Card>
          <SectionTitle>Información General</SectionTitle>
          
          <FormGroup>
            <Label htmlFor="name">Nombre del Tenant</Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="slogan">Eslogan</Label>
            <Input
              type="text"
              id="slogan"
              name="slogan"
              value={formData.slogan}
              onChange={handleChange}
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="description">Descripción</Label>
            <Input
              as="textarea"
              rows="4"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </FormGroup>
        </Card>
        
        <Card>
          <SectionTitle>Personalización Visual</SectionTitle>
          
          <FormGroup>
            <Label htmlFor="logoText">Texto del Logo</Label>
            <Input
              type="text"
              id="logoText"
              name="logoText"
              value={formData.logoText}
              onChange={handleChange}
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="primaryColor">Color Primario</Label>
            <Row>
              <ColorPreview color={formData.primaryColor} />
              <ColorInput
                type="color"
                id="primaryColor"
                name="primaryColor"
                value={formData.primaryColor}
                onChange={handleChange}
              />
              <Input
                type="text"
                value={formData.primaryColor}
                onChange={(e) => handleChange({
                  target: { name: 'primaryColor', value: e.target.value }
                })}
                placeholder="#3b82f6"
              />
            </Row>
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="secondaryColor">Color Secundario</Label>
            <Row>
              <ColorPreview color={formData.secondaryColor} />
              <ColorInput
                type="color"
                id="secondaryColor"
                name="secondaryColor"
                value={formData.secondaryColor}
                onChange={handleChange}
              />
              <Input
                type="text"
                value={formData.secondaryColor}
                onChange={(e) => handleChange({
                  target: { name: 'secondaryColor', value: e.target.value }
                })}
                placeholder="#333333"
              />
            </Row>
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="currencySymbol">Símbolo de Moneda</Label>
            <Input
              type="text"
              id="currencySymbol"
              name="currencySymbol"
              value={formData.currencySymbol}
              onChange={handleChange}
              maxLength="3"
              style={{ width: '100px' }}
            />
          </FormGroup>
        </Card>
        
        <ButtonContainer>
          <Button type="button" onClick={() => window.history.back()}>
            Cancelar
          </Button>
          <Button $primary type="submit" disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </ButtonContainer>
      </form>
    </Container>
  );
};

export default TenantSettings;