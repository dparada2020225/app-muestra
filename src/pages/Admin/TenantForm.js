// src/pages/Admin/TenantForm.js
import React, { useState, useEffect, useCallback  } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

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

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
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

const Select = styled.select`
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

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 20px;
`;

const Button = styled.button`
  background-color: ${props => props.$primary ? props.theme.colors.primary : '#6c757d'};
  color: ${props => props.$primary ? props.theme.colors.secondary : 'white'};
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

const SectionTitle = styled.h2`
  color: ${props => props.theme.colors.text};
  font-size: 1.2rem;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
`;

const ColorPreview = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 4px;
  background-color: ${props => props.color};
  margin-right: 10px;
  border: 1px solid #ddd;
  display: inline-block;
  vertical-align: middle;
`;

const Row = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const TenantForm = () => {
  const { id } = useParams(); // Para edición, id será el ID del tenant
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState({
    name: '',
    subdomain: '',
    status: 'trial',
    plan: 'free',
    // Información de contacto
    email: '',
    phone: '',
    address: '',
    taxId: '',
    // Personalización
    primaryColor: '#3b82f6',
    secondaryColor: '#333333',
    currencySymbol: 'Q',
    // Configuraciones
    maxUsers: 5,
    maxProducts: 100,
    maxStorage: 100,
    // Facturación
    planStartDate: new Date().toISOString().split('T')[0],
    planEndDate: '',
    paymentMethod: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  const loadTenantData = useCallback(async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      // Usar el endpoint correcto para obtener detalles del tenant
      const response = await axios.get(`${API_URL}/api/admin/tenants/${id}`, config);
      console.log("Datos del tenant cargados:", response.data);
      
      const tenant = response.data;
      
      // Preparar datos para el formulario asegurando que todas las propiedades necesarias existan
      setFormData({
        name: tenant.name || '',
        subdomain: tenant.subdomain || '',
        status: tenant.status || 'trial',
        plan: tenant.plan || 'free',
        // Información de contacto
        email: tenant.contactInfo?.email || '',
        phone: tenant.contactInfo?.phone || '',
        address: tenant.contactInfo?.address || '',
        taxId: tenant.contactInfo?.taxId || '',
        // Personalización
        primaryColor: tenant.customization?.primaryColor || '#3b82f6',
        secondaryColor: tenant.customization?.secondaryColor || '#333333',
        currencySymbol: tenant.customization?.currencySymbol || 'Q',
        // Configuraciones
        maxUsers: tenant.settings?.maxUsers || 5,
        maxProducts: tenant.settings?.maxProducts || 100,
        maxStorage: tenant.settings?.maxStorage || 100,
        // Facturación
        planStartDate: tenant.billing?.planStartDate ? new Date(tenant.billing.planStartDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        planEndDate: tenant.billing?.planEndDate ? new Date(tenant.billing.planEndDate).toISOString().split('T')[0] : '',
        paymentMethod: tenant.billing?.paymentMethod || ''
      });
    } catch (err) {
      console.error('Error al cargar datos del tenant:', err);
      setError('Error al cargar datos del tenant. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }, [id, API_URL]);
  
  // Cargar los datos del tenant si estamos en modo edición
  useEffect(() => {
    if (isEditing) {
      loadTenantData();
    }
  }, [isEditing, loadTenantData]);
  
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      // Estructurar los datos para la API, asegurando que todos los campos requeridos estén presentes
      const tenantData = {
        name: formData.name,
        subdomain: formData.subdomain,
        status: formData.status,
        plan: formData.plan,
        contactInfo: {
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          taxId: formData.taxId
        },
        customization: {
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor,
          currencySymbol: formData.currencySymbol
        },
        settings: {
          maxUsers: parseInt(formData.maxUsers),
          maxProducts: parseInt(formData.maxProducts),
          maxStorage: parseInt(formData.maxStorage),
          features: []
        },
        billing: {
          planStartDate: formData.planStartDate,
          planEndDate: formData.planEndDate || undefined,
          paymentMethod: formData.paymentMethod
        }
      };
      
      console.log("Enviando datos para actualizar tenant:", tenantData);
      
      let response;
      if (isEditing) {
        // Usar el endpoint correcto para actualizar el tenant
        response = await axios.put(`${API_URL}/api/admin/tenants/${id}`, tenantData, config);
        setSuccess('Tenant actualizado exitosamente');
      } else {
        response = await axios.post(`${API_URL}/api/admin/tenants`, tenantData, config);
        setSuccess('Tenant creado exitosamente');
      }
      
      console.log("Respuesta del servidor:", response.data);
      
      // Después de un tiempo, redirigir al panel de administración
      setTimeout(() => {
        navigate('/admin/tenant-dashboard');
      }, 2000);
    } catch (err) {
      console.error('Error al guardar tenant:', err);
      
      if (err.response) {
        console.error('Detalles del error:', err.response);
        setError(`Error ${err.response.status}: ${err.response.data?.message || 'Error al guardar los datos'}`);
      } else if (err.request) {
        setError('No se recibió respuesta del servidor. Verifica tu conexión.');
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Verificar si el usuario es un superadmin
  if (!user || user.role !== 'superAdmin') {
    return (
      <Container>
        <ErrorMessage>No tienes permiso para acceder a esta página. Esta sección es exclusiva para superadministradores.</ErrorMessage>
      </Container>
    );
  }
  
  return (
    <Container>
      <Title>{isEditing ? 'Editar Tenant' : 'Crear Nuevo Tenant'}</Title>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}
      
      <Card>
        <Form onSubmit={handleSubmit}>
          <SectionTitle>Información Básica</SectionTitle>
          
          <Row>
            <FormGroup>
              <Label htmlFor="name">Nombre del Tenant *</Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nombre del Tenant"
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="subdomain">Subdominio *</Label>
              <Input
                type="text"
                id="subdomain"
                name="subdomain"
                value={formData.subdomain}
                onChange={handleChange}
                placeholder="Subdominio (ej: empresa1)"
                required
                disabled={isEditing} // No permitir cambiar el subdominio en modo edición
              />
            </FormGroup>
          </Row>
          
          <Row>
            <FormGroup>
              <Label htmlFor="status">Estado</Label>
              <Select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="trial">Prueba</option>
                <option value="active">Activo</option>
                <option value="suspended">Suspendido</option>
                <option value="cancelled">Cancelado</option>
              </Select>
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="plan">Plan</Label>
              <Select
                id="plan"
                name="plan"
                value={formData.plan}
                onChange={handleChange}
                required
              >
                <option value="free">Gratuito</option>
                <option value="basic">Básico</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Empresarial</option>
              </Select>
            </FormGroup>
          </Row>
          
          <SectionTitle>Información de Contacto</SectionTitle>
          
          <Row>
            <FormGroup>
              <Label htmlFor="email">Email de Contacto *</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email de contacto"
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
                placeholder="Teléfono de contacto"
              />
            </FormGroup>
          </Row>
          
          <FormGroup>
            <Label htmlFor="address">Dirección</Label>
            <TextArea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Dirección"
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
              placeholder="ID Fiscal o NIT"
            />
          </FormGroup>
          
          <SectionTitle>Personalización</SectionTitle>
          
          <Row>
            <FormGroup>
              <Label htmlFor="primaryColor">Color Primario</Label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <ColorPreview color={formData.primaryColor} />
                <Input
                  type="color"
                  id="primaryColor"
                  name="primaryColor"
                  value={formData.primaryColor}
                  onChange={handleChange}
                />
              </div>
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="secondaryColor">Color Secundario</Label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <ColorPreview color={formData.secondaryColor} />
                <Input
                  type="color"
                  id="secondaryColor"
                  name="secondaryColor"
                  value={formData.secondaryColor}
                  onChange={handleChange}
                />
              </div>
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="currencySymbol">Símbolo de Moneda</Label>
              <Input
                type="text"
                id="currencySymbol"
                name="currencySymbol"
                value={formData.currencySymbol}
                onChange={handleChange}
                placeholder="Símbolo de moneda (ej: Q)"
                maxLength="3"
                style={{ width: '80px' }}
              />
            </FormGroup>
          </Row>
          
          <SectionTitle>Límites del Plan</SectionTitle>
          
          <Row>
            <FormGroup>
              <Label htmlFor="maxUsers">Máximo de Usuarios</Label>
              <Input
                type="number"
                id="maxUsers"
                name="maxUsers"
                value={formData.maxUsers}
                onChange={handleChange}
                min="1"
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="maxProducts">Máximo de Productos</Label>
              <Input
                type="number"
                id="maxProducts"
                name="maxProducts"
                value={formData.maxProducts}
                onChange={handleChange}
                min="1"
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="maxStorage">Almacenamiento Máximo (MB)</Label>
              <Input
                type="number"
                id="maxStorage"
                name="maxStorage"
                value={formData.maxStorage}
                onChange={handleChange}
                min="1"
                required
              />
            </FormGroup>
          </Row>
          
          <SectionTitle>Facturación</SectionTitle>
          
          <Row>
            <FormGroup>
              <Label htmlFor="planStartDate">Fecha Inicio del Plan</Label>
              <Input
                type="date"
                id="planStartDate"
                name="planStartDate"
                value={formData.planStartDate}
                onChange={handleChange}
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="planEndDate">Fecha Fin del Plan</Label>
              <Input
                type="date"
                id="planEndDate"
                name="planEndDate"
                value={formData.planEndDate}
                onChange={handleChange}
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="paymentMethod">Método de Pago</Label>
              <Select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
              >
                <option value="">Sin especificar</option>
                <option value="transfer">Transferencia Bancaria</option>
                <option value="credit_card">Tarjeta de Crédito</option>
                <option value="cash">Efectivo</option>
              </Select>
            </FormGroup>
          </Row>
          
          <ButtonContainer>
            <Button 
              type="button" 
              onClick={() => navigate('/admin/tenant-dashboard')}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              $primary 
              type="submit"
              disabled={loading}
            >
              {loading ? 'Guardando...' : isEditing ? 'Actualizar Tenant' : 'Crear Tenant'}
            </Button>
          </ButtonContainer>
        </Form>
      </Card>
    </Container>
  );
};

export default TenantForm;