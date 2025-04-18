// src/pages/Admin/TenantUsersManagement.js
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal/Modal';
import { useParams, useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [tenant, setTenant] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  
  // Estado para el formulario de edición/creación de usuario
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    firstName: '',
    lastName: '',
    role: 'tenantUser',
    isActive: true
  });
  
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  const loadTenantData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
  
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
  
      // Obtener información del tenant
      const tenantResponse = await axios.get(`${API_URL}/api/admin/tenants/${tenantId}`, config);
      setTenant(tenantResponse.data);
      
      // Obtener usuarios del tenant
      const usersResponse = await axios.get(`${API_URL}/api/admin/tenant/${tenantId}/users`, config);
      setUsers(usersResponse.data);
      
      console.log("Información del tenant cargada:", tenantResponse.data);
      console.log("Usuarios cargados:", usersResponse.data);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }, [API_URL, tenantId]);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadTenantData();
  }, [loadTenantData]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      confirmPassword: '',
      email: '',
      firstName: '',
      lastName: '',
      role: 'tenantUser',
      isActive: true
    });
  };
  
  // Manejar clic en editar usuario
  const handleEditClick = (userData) => {
    setSelectedUser(userData);
    setFormData({
      username: userData.username || '',
      email: userData.email || '',
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      role: userData.role || 'tenantUser',
      isActive: userData.isActive !== false, // Por defecto true si no está definido
      // No incluimos password y confirmPassword porque no los editaremos
      password: '',
      confirmPassword: ''
    });
    setIsEditModalOpen(true);
  };
  
  // Manejar desactivación/activación de usuario
// Manejar desactivación/activación de usuario
  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      // Cambiar el estado del usuario usando la ruta correcta según tu controlador
      const response = await axios.put(
        `${API_URL}/api/users/${userId}/status`, 
        { isActive: !currentStatus },
        config
      );
      
      console.log("Respuesta al cambiar estado:", response.data);
      
      // Actualizar la lista de usuarios
      setUsers(users.map(u => {
        if (u._id === userId) {
          return { ...u, isActive: !currentStatus };
        }
        return u;
      }));
      
      setSuccess(`Usuario ${currentStatus ? 'desactivado' : 'activado'} correctamente`);
      
      // Limpiar el mensaje después de 3 segundos
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error al cambiar estado del usuario:', err);
      setError('Error al cambiar el estado del usuario. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };
  
  // Guardar cambios del usuario editado
  const handleSaveUser = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.username || !formData.email) {
      setError('Por favor completa los campos obligatorios');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      // Eliminar campos que no son necesarios para la actualización
      const { confirmPassword, ...dataToSend } = formData;
      
      // Si no se proporciona contraseña, eliminarla del objeto
      if (!dataToSend.password) {
        delete dataToSend.password;
      }
      
      let response;
      
      if (selectedUser) {
        // Actualizar usuario existente - Usar la URL correcta
        console.log(`Actualizando usuario ${selectedUser._id}:`, dataToSend);
        
        // Usar la ruta correcta según el controlador que has proporcionado
        response = await axios.put(
          `${API_URL}/api/users/${selectedUser._id}`,
          dataToSend,
          config
        );
      } else {
        // Crear nuevo usuario (agregar tenantId)
        dataToSend.tenantId = tenantId;
        console.log("Creando nuevo usuario:", dataToSend);
        response = await axios.post(
          `${API_URL}/api/auth/register`,
          dataToSend,
          config
        );
      }
      
      console.log("Respuesta del servidor:", response.data);
      
      // Actualizar la lista de usuarios
      await loadTenantData();
      
      // Resetear formulario y cerrar modales
      resetForm();
      setIsCreateModalOpen(false);
      setIsEditModalOpen(false);
      setSelectedUser(null);
      
      setSuccess(selectedUser ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente');
      
      // Limpiar el mensaje después de 3 segundos
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error al guardar usuario:', err);
      
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Error al guardar usuario');
      } else {
        setError('Error al procesar la solicitud');
      }
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
  
  return (
    <Container>
      <Header>
        <Title>Gestión de Usuarios del Tenant</Title>
        <Button $primary onClick={() => {
          resetForm();
          setSelectedUser(null);
          setIsCreateModalOpen(true);
        }}>
          Crear Nuevo Usuario
        </Button>
      </Header>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}
      
      <TenantInfo>
        <TenantLogo color={tenant?.customization?.primaryColor || '#333'}>
          {tenant?.name?.charAt(0).toUpperCase() || 'E'}
        </TenantLogo>
        <TenantDetails>
          <TenantName>{tenant?.name || 'Tenant'}</TenantName>
          <TenantSubdomain>{tenant?.subdomain || 'demo'}.tuapp.com</TenantSubdomain>
        </TenantDetails>
        <TenantStatus status={tenant?.status || 'active'}>
          {tenant?.status === 'active' ? 'Activo' : 
           tenant?.status === 'trial' ? 'Prueba' : 
           tenant?.status === 'suspended' ? 'Suspendido' : 'Cancelado'}
        </TenantStatus>
      </TenantInfo>
      
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
                  <ActionButton impersonate onClick={() => navigate(`/admin/impersonate/${user._id}`)}>
                    Impersonar
                  </ActionButton>
                  <ActionButton onClick={() => handleEditClick(user)}>
                    Editar
                  </ActionButton>
                  <ActionButton 
                    danger={user.isActive !== false} 
                    onClick={() => handleToggleUserStatus(user._id, user.isActive !== false)}
                  >
                    {user.isActive !== false ? 'Desactivar' : 'Activar'}
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
        <Form onSubmit={handleSaveUser}>
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
          
          <Row>
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
              required
            />
          </FormGroup>
          
          <Row>
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
      
      {/* Modal para editar usuario */}
      <Modal
        isOpen={isEditModalOpen}
        title="Editar Usuario"
        onClose={() => setIsEditModalOpen(false)}
      >
        <Form onSubmit={handleSaveUser}>
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
              disabled // No permitir cambiar el nombre de usuario
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
            />
          </FormGroup>
          
          <Row>
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
          
          <FormGroup>
            <Label htmlFor="isActive">Estado</Label>
            <Select
              id="isActive"
              name="isActive"
              value={formData.isActive.toString()}
              onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}
              required
            >
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </Select>
          </FormGroup>
          
          <Row>
            <FormGroup style={{ flex: 1 }}>
              <Label htmlFor="password">Nueva Contraseña (opcional)</Label>
              <Input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Dejar en blanco para mantener la actual"
              />
            </FormGroup>
            
            <FormGroup style={{ flex: 1 }}>
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <Input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirmar nueva contraseña"
                disabled={!formData.password}
              />
            </FormGroup>
          </Row>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button type="button" onClick={() => setIsEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button $primary type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </Form>
      </Modal>
    </Container>
  );
};

export default TenantUsersManagement;