// src/pages/TenantSettings/TenantSettings.js - versión corregida
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

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-sizing: border-box;
  min-height: 100px;
  resize: vertical;
  
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

const Tabs = styled.div`
  display: flex;
  margin-bottom: 30px;
  border-bottom: 1px solid #ddd;
`;

const Tab = styled.button`
  padding: 10px 20px;
  background-color: ${props => props.active ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.active ? props.theme.colors.secondary : props.theme.colors.text};
  border: none;
  cursor: pointer;
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.active ? props.theme.colors.primary : 'rgba(0,0,0,0.05)'};
  }
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
  color: ${props => props.theme.colors.success || '#4caf50'};
  background-color: rgba(76, 175, 80, 0.1);
  border-left: 3px solid ${props => props.theme.colors.success || '#4caf50'};
  padding: 12px;
  margin-bottom: 20px;
  border-radius: 4px;
`;

const FileInputContainer = styled.div`
  margin-bottom: 20px;
`;

const FileInputLabel = styled.label`
  display: inline-block;
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.secondary};
  padding: 10px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.theme.colors.primaryHover};
    transform: translateY(-2px);
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const FilePreview = styled.div`
  margin-top: 10px;
  
  img {
    max-width: 200px;
    max-height: 100px;
    border-radius: 4px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  }
`;

const TenantSettings = () => {
  const { currentTenant, loading: tenantLoading, applyTenantSettings } = useTenant();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({
    name: '',
    slogan: '',
    description: '',
    primaryColor: '',
    secondaryColor: '',
    currencySymbol: '',
    dateFormat: 'DD/MM/YYYY',
    // Información de contacto
    email: '',
    phone: '',
    address: '',
    taxId: '',
    // Integraciones y configuraciones adicionales
    enableInventoryAlerts: false,
    lowStockThreshold: 5,
    defaultDateRange: 30
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  useEffect(() => {
    if (currentTenant && !tenantLoading) {
      setFormData({
        name: currentTenant.name || '',
        slogan: currentTenant.slogan || '',
        description: currentTenant.description || '',
        primaryColor: currentTenant.customization?.primaryColor || '#3b82f6',
        secondaryColor: currentTenant.customization?.secondaryColor || '#333333',
        currencySymbol: currentTenant.customization?.currencySymbol || 'Q',
        dateFormat: currentTenant.customization?.dateFormat || 'DD/MM/YYYY',
        // Información de contacto
        email: currentTenant.contactInfo?.email || '',
        phone: currentTenant.contactInfo?.phone || '',
        address: currentTenant.contactInfo?.address || '',
        taxId: currentTenant.contactInfo?.taxId || '',
        // Integraciones y configuraciones adicionales
        enableInventoryAlerts: currentTenant.settings?.enableInventoryAlerts || false,
        lowStockThreshold: currentTenant.settings?.lowStockThreshold || 5,
        defaultDateRange: currentTenant.settings?.defaultDateRange || 30
      });
      
      // Si hay un logo, establecer la URL de vista previa
      if (currentTenant.logo) {
        setLogoPreview(`${API_URL}/images/${currentTenant.logo}`);
      }
    }
  }, [currentTenant, tenantLoading, API_URL]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      
      // Crear URL para preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    // Verificar si el usuario tiene permiso
    if (!isAuthenticated || (user.role !== 'tenantAdmin' && user.role !== 'admin' && user.role !== 'superAdmin')) {
      setError('No tienes permiso para modificar la configuración del tenant');
      setIsLoading(false);
      return;
    }
    
    try {
      let logoId = currentTenant.logo;
      
      // Si hay un nuevo logo, subirlo primero
      if (logoFile) {
        const logoFormData = new FormData();
        logoFormData.append('image', logoFile);
        
        try {
          const uploadResponse = await axios.post(`${API_URL}/upload`, logoFormData);
          logoId = uploadResponse.data.imageId;
        } catch (logoError) {
          console.error('Error al subir logo:', logoError);
          setError('Error al subir el logo. Intenta con otra imagen o más tarde.');
          setIsLoading(false);
          return;
        }
      }
      
      // Preparar datos para actualizar el tenant
      const updateData = {
        name: formData.name,
        slogan: formData.slogan,
        description: formData.description,
        logo: logoId,
        contactInfo: {
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          taxId: formData.taxId
        },
        customization: {
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor,
          currencySymbol: formData.currencySymbol,
          dateFormat: formData.dateFormat
        },
        settings: {
          enableInventoryAlerts: formData.enableInventoryAlerts,
          lowStockThreshold: parseInt(formData.lowStockThreshold),
          defaultDateRange: parseInt(formData.defaultDateRange)
        }
      };
      
      // Corregimos la URL para que apunte al endpoint correcto
      // En lugar de /api/tenants/ID/settings, usamos la API directa
      const response = await axios.put(
        `${API_URL}/api/tenants/${currentTenant.id || currentTenant._id}`,
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      // Si la actualización fue exitosa, actualizar el tenant actual
      if (response.data) {
        console.log("Respuesta del servidor:", response.data);
        
        // Aplicar configuración actualizada si está disponible en la respuesta
        if (response.data.tenant) {
          applyTenantSettings(response.data.tenant);
        }
        
        setSuccess('Configuración actualizada correctamente');
        
        // Actualizamos la vista previa del logo si se subió uno nuevo
        if (logoId && logoId !== currentTenant.logo) {
          setLogoPreview(`${API_URL}/images/${logoId}`);
        }
      }
    } catch (err) {
      console.error('Error al actualizar configuración del tenant:', err);
      
      // Mostrar un mensaje de error más descriptivo
      if (err.response) {
        setError(err.response.data?.message || 'Error al actualizar la configuración: ' + err.response.status);
        console.log("Respuesta de error:", err.response.data);
      } else if (err.request) {
        setError('No se recibió respuesta del servidor. Verifica tu conexión.');
      } else {
        setError('Error al realizar la solicitud: ' + err.message);
      }
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
      
      <Tabs>
        <Tab 
          active={activeTab === 'general'} 
          onClick={() => setActiveTab('general')}
        >
          Información General
        </Tab>
        <Tab 
          active={activeTab === 'appearance'} 
          onClick={() => setActiveTab('appearance')}
        >
          Apariencia
        </Tab>
        <Tab 
          active={activeTab === 'contact'} 
          onClick={() => setActiveTab('contact')}
        >
          Contacto
        </Tab>
        <Tab 
          active={activeTab === 'settings'} 
          onClick={() => setActiveTab('settings')}
        >
          Configuraciones
        </Tab>
      </Tabs>
      
      <form onSubmit={handleSubmit}>
        {/* Pestaña de Información General */}
        {activeTab === 'general' && (
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
              <TextArea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
              />
            </FormGroup>
          </Card>
        )}
        
        {/* Pestaña de Apariencia */}
        {activeTab === 'appearance' && (
          <Card>
            <SectionTitle>Apariencia</SectionTitle>
            
            <FileInputContainer>
              <Label>Logo de la Empresa</Label>
              <FileInputLabel htmlFor="logoInput">Seleccionar Logo</FileInputLabel>
              <HiddenFileInput
                id="logoInput"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
              />
              {logoPreview && (
                <FilePreview>
                  <img src={logoPreview} alt="Logo Preview" />
                </FilePreview>
              )}
            </FileInputContainer>
            
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
            
            <FormGroup>
              <Label htmlFor="dateFormat">Formato de Fecha</Label>
              <select
                id="dateFormat"
                name="dateFormat"
                value={formData.dateFormat}
                onChange={handleChange}
                style={{
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  width: '200px'
                }}
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                <option value="DD-MM-YYYY">DD-MM-YYYY</option>
              </select>
            </FormGroup>
          </Card>
        )}
        
        {/* Pestaña de Contacto */}
        {activeTab === 'contact' && (
          <Card>
            <SectionTitle>Información de Contacto</SectionTitle>
            
            <FormGroup>
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="address">Dirección</Label>
              <TextArea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="taxId">ID Fiscal / NIT</Label>
              <Input
                type="text"
                id="taxId"
                name="taxId"
                value={formData.taxId}
                onChange={handleChange}
              />
            </FormGroup>
          </Card>
        )}
        
        {/* Pestaña de Configuraciones */}
        {activeTab === 'settings' && (
          <Card>
            <SectionTitle>Configuraciones Adicionales</SectionTitle>
            
            <FormGroup>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <input
                  type="checkbox"
                  id="enableInventoryAlerts"
                  name="enableInventoryAlerts"
                  checked={formData.enableInventoryAlerts}
                  onChange={handleChange}
                  style={{ marginRight: '10px' }}
                />
                <Label htmlFor="enableInventoryAlerts" style={{ marginBottom: 0 }}>
                  Activar alertas de inventario bajo
                </Label>
              </div>
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="lowStockThreshold">Umbral de stock bajo</Label>
              <Input
                type="number"
                id="lowStockThreshold"
                name="lowStockThreshold"
                value={formData.lowStockThreshold}
                onChange={handleChange}
                min="1"
                max="100"
                disabled={!formData.enableInventoryAlerts}
              />
              <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                Se enviarán alertas cuando el stock de un producto esté por debajo de este valor.
              </small>
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="defaultDateRange">Rango de fechas predeterminado (días)</Label>
              <Input
                type="number"
                id="defaultDateRange"
                name="defaultDateRange"
                value={formData.defaultDateRange}
                onChange={handleChange}
                min="1"
                max="365"
              />
              <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                Rango de fechas predeterminado para reportes y filtros de transacciones.
              </small>
            </FormGroup>
          </Card>
        )}
        
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