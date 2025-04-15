// src/pages/Admin/TenantUsersManagement.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal/Modal';

const Container = styled.div`
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const TenantInfo = styled.div`
  background-color: ${props => props.theme.colors.cardBackground};
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  box-shadow: ${props => props.theme.shadows.small};
`;

const TenantLogo = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 8px;
  background-color: ${props => props.color || '#f0f0f0'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.5rem;
  margin-right: 15px;
`;

const TenantDetails = styled.div`
  flex: 1;
`;

const TenantName = styled.div`
  font-weight: bold;
  font-size: 1.2rem;
  color: ${props => props.theme.colors.text};
`;

const TenantSubdomain = styled.div`
  color: ${props => props.theme.colors.textLight};
`;

const TenantStatus = styled.div`
  background-color: ${props => {
    switch(props.status) {
      case 'active': return '#4caf50';
      case 'trial': return '#ff9800';
      case 'suspended': return '#f44336';
      default: return '#9e9e9e';
    }
  }};
  color: white;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  margin-left: 15px;
`;

const Button = styled.button`
  background-color: ${props => props.$primary ? props.theme.colors.primary : '#6c757d'};
  color: ${props => props.$primary ? props.theme.colors.secondary : 'white'};
  border: none;
  padding: 10px 16px;
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

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: ${props => props.theme.colors.cardBackground};
  border-radius: 8px;
  overflow: hidden;
  box-shadow: ${props => props.theme.shadows.small};
`;

const Th = styled.th`
  text-align: left;
  padding: 12px 15px;
  background-color: ${props => props.theme.colors.secondary};
  color: white;
`;

const Td = styled.td`
  padding: 12px 15px;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    text-align: right;
  }
`;

const Tr = styled.tr`
  &:hover {
    background-color: #f9f9f9;
  }
  
  &:last-child td {
    border-bottom: none;
  }
`;

const UserBadge = styled.span`
  background-color: ${props => {
    switch(props.role) {
      case 'tenantAdmin': return '#2196f3';
      case 'tenantManager': return '#4caf50';
      default: return '#ff9800';
    }
  }};
  color: white;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: bold;
`;

const ActionButton = styled.button`
  background-color: ${props => props.impersonate ? '#9c27b0' : props.danger ? '#f44336' : props.theme.colors.primary};
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 4px;
  margin-left: 5px;
  cursor: pointer;
  font-size: 0.8rem;
  
  &:hover {
    background-color: ${props => props.impersonate ? '#7b1fa2' : props.danger ? '#d32f2f' : props.theme.colors.primaryHover};
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: ${props => props.theme.colors.textLight};
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

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
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
const Row = styled.div`
  display: flex;
  gap: ${props => props.gap || '15px'};
`;
const TenantUsersManagement = () => {
  const { tenantId } = useParams();
  const { user } = useAuth();
  
  const [tenant, setTenant] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [impersonateToken, setImpersonateToken] = useState(null);
  
  // Estado para el formulario de creación de usuario
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    firstName: '',
    lastName: '',
    role: 'tenantUser'
  });
  
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  
  
  const loadTenantData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
  
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
  
      const [tenantResponse, usersResponse] = await Promise.all([
        axios.get(`${API_URL}/api/admin/tenants/${tenantId}`, config),
        axios.get(`${API_URL}/api/admin/tenant/${tenantId}/users`, config)
      ]);
  
      setTenant(tenantResponse.data);
      setUsers(usersResponse.data);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }, [API_URL, tenantId]); // ✅ Dependencias necesarias

  // Cargar datos del tenant y sus usuarios
  useEffect(() => {
    loadTenantData();
  }, [loadTenantData]); // ✅ Solo depende de la función
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      // Preparar datos del usuario
      const userData = {
        username: formData.username,
        password: formData.password,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        tenantId: tenantId // Asociar al tenant actual
      };
      
      // Enviar petición para crear usuario
      await axios.post(`${API_URL}/api/auth/register`, userData, config);
      
      // Limpiar formulario y cerrar modal
      setFormData({
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
        firstName: '',
        lastName: '',
        role: 'tenantUser'
      });
      
      setSuccess('Usuario creado exitosamente');
      setIsCreateModalOpen(false);
      
      // Recargar lista de usuarios
      loadTenantData();
    } catch (err) {
      console.error('Error al crear usuario:', err);
      
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Error al crear usuario. Por favor, intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleImpersonate = async (userId) => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      // Solicitar token de impersonación
      const response = await axios.post(`${API_URL}/api/admin/impersonate/${userId}`, {}, config);
      
      if (response.data && response.data.token) {
        setImpersonateToken(response.data.token);
        setSuccess('Impersonación exitosa. Copie el token y utilícelo para acceder como este usuario.');
      } else {
        setError('No se pudo obtener token de impersonación');
      }
    } catch (err) {
      console.error('Error al impersonar usuario:', err);
      setError('Error al impersonar usuario. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };
  
  // Verificar si el usuario es un superadmin
  if (!user || user.role !== 'superAdmin') {
    return (
      <Container>
        <ErrorMessage>No tienes permiso para acceder a esta página.</ErrorMessage>
      </Container>
    );
  }
  
  if (loading && !tenant) {
    return (
      <Container>
        <LoadingMessage>Cargando información del tenant...</LoadingMessage>
      </Container>
    );
  }
  
  if (!tenant) {
    return (
      <Container>
        <ErrorMessage>No se encontró el tenant especificado.</ErrorMessage>
      </Container>
    );
  }
  
  return (
    <Container>
      <Header>
        <Title>Gestión de Usuarios del Tenant</Title>
        <Button $primary onClick={() => setIsCreateModalOpen(true)}>
          Crear Nuevo Usuario
        </Button>
      </Header>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}
      
      <TenantInfo>
        <TenantLogo color={tenant.customization?.primaryColor}>
          {tenant.name.charAt(0)}
        </TenantLogo>
        <TenantDetails>
          <TenantName>{tenant.name}</TenantName>
          <TenantSubdomain>{tenant.subdomain}.tuapp.com</TenantSubdomain>
        </TenantDetails>
        <TenantStatus status={tenant.status}>
          {tenant.status === 'active' ? 'Activo' : 
           tenant.status === 'trial' ? 'Prueba' : 
           tenant.status === 'suspended' ? 'Suspendido' : 'Cancelado'}
        </TenantStatus>
      </TenantInfo>
      
      {impersonateToken && (
        <SuccessMessage>
          <p><strong>Token de impersonación:</strong></p>
          <pre style={{ overflow: 'auto', background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
            {impersonateToken}
          </pre>
          <p>
            Para utilizar este token, cópielo y establézcalo como valor de 'token' en localStorage. 
            Luego refresque la página. Este token expirará en 1 hora.
          </p>
          <Button onClick={() => {
            navigator.clipboard.writeText(impersonateToken);
            alert('Token copiado al portapapeles');
          }}>
            Copiar al portapapeles
          </Button>
        </SuccessMessage>
      )}
      
      <Table>
        <thead>
          <tr>
            <Th>Usuario</Th>
            <Th>Email</Th>
            <Th>Rol</Th>
            <Th>Última conexión</Th>
            <Th>Acciones</Th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map(user => (
              <Tr key={user._id}>
                <Td>{user.username}</Td>
                <Td>{user.email || '-'}</Td>
                <Td>
                  <UserBadge role={user.role}>
                    {user.role === 'tenantAdmin' ? 'Admin' : 
                     user.role === 'tenantManager' ? 'Manager' : 'Usuario'}
                  </UserBadge>
                </Td>
                <Td>{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Nunca'}</Td>
                <Td>
                  <ActionButton impersonate onClick={() => handleImpersonate(user._id)}>
                    Impersonar
                  </ActionButton>
                  <ActionButton>
                    Editar
                  </ActionButton>
                  <ActionButton danger>
                    {user.isActive ? 'Desactivar' : 'Activar'}
                  </ActionButton>
                </Td>
              </Tr>
            ))
          ) : (
            <Tr>
              <Td colSpan="5" style={{ textAlign: 'center' }}>No hay usuarios para mostrar</Td>
            </Tr>
          )}
        </tbody>
      </Table>
      
      {/* Modal para crear nuevo usuario */}
      <Modal
        isOpen={isCreateModalOpen}
        title="Crear Nuevo Usuario"
        onClose={() => setIsCreateModalOpen(false)}
      >
        <Form onSubmit={handleCreateUser}>
          <FormGroup>
            <Label htmlFor="username">Nombre de Usuario *</Label>
            <Input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Nombre de usuario"
              required
            />
          </FormGroup>
          
          <Row style={{ display: 'flex', gap: '15px' }}>
            <FormGroup style={{ flex: 1 }}>
              <Label htmlFor="password">Contraseña *</Label>
              <Input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Contraseña"
                required
              />
            </FormGroup>
            
            <FormGroup style={{ flex: 1 }}>
              <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
              <Input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirmar contraseña"
                required
              />
            </FormGroup>
          </Row>
          
          <FormGroup>
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
            />
          </FormGroup>
          
          <Row style={{ display: 'flex', gap: '15px' }}>
            <FormGroup style={{ flex: 1 }}>
              <Label htmlFor="firstName">Nombre</Label>
              <Input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Nombre"
              />
            </FormGroup>
            
            <FormGroup style={{ flex: 1 }}>
              <Label htmlFor="lastName">Apellido</Label>
              <Input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Apellido"
              />
            </FormGroup>
          </Row>
          
          <FormGroup>
            <Label htmlFor="role">Rol</Label>
            <Select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="tenantUser">Usuario</option>
              <option value="tenantManager">Manager</option>
              <option value="tenantAdmin">Administrador</option>
            </Select>
          </FormGroup>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button type="button" onClick={() => setIsCreateModalOpen(false)}>
              Cancelar
            </Button>
            <Button $primary type="submit" disabled={loading}>
              {loading ? 'Creando...' : 'Crear Usuario'}
            </Button>
          </div>
        </Form>
      </Modal>
    </Container>
  );
};

export default TenantUsersManagement;