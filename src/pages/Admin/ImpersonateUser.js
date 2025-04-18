// src/pages/Admin/ImpersonateUser.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const Container = styled.div`
  max-width: 600px;
  margin: 40px auto;
  padding: 0 20px;
`;

const Card = styled.div`
  background-color: ${props => props.theme.colors.cardBackground};
  padding: 25px;
  border-radius: 8px;
  box-shadow: ${props => props.theme.shadows.small};
  margin-bottom: 30px;
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.text};
  margin-bottom: 30px;
  text-align: center;
`;

const UserList = styled.div`
  margin-bottom: 20px;
`;

const UserCard = styled.div`
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
  
  ${props => props.selected && `
    background-color: rgba(150, 255, 0, 0.1);
    border: 1px solid ${props.theme.colors.primary};
  `}
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 15px;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-weight: bold;
  color: ${props => props.theme.colors.text};
`;

const UserRole = styled.div`
  font-size: 0.8rem;
  color: ${props => props.theme.colors.textLight};
`;

const Button = styled.button`
  width: 100%;
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.secondary};
  border: none;
  padding: 12px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 20px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.small};
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const BackButton = styled.button`
  width: 100%;
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 10px;
  
  &:hover {
    transform: translateY(-2px);
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

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: ${props => props.theme.colors.textLight};
`;

const TokenContainer = styled.div`
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 6px;
`;

const TokenTitle = styled.h3`
  margin-bottom: 10px;
  color: ${props => props.theme.colors.text};
  font-size: 1rem;
`;

const TokenCode = styled.pre`
  background-color: #eee;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.8rem;
  margin-bottom: 10px;
`;

const CopyButton = styled.button`
  background-color: ${props => props.theme.colors.secondary};
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  
  &:hover {
    background-color: #333;
  }
`;

const Message = styled.p`
  margin-top: 15px;
  font-size: 0.9rem;
  line-height: 1.5;
  color: ${props => props.theme.colors.textLight};
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  margin-bottom: 15px;
  
  &:focus {
    border-color: ${props => props.theme.colors.primary};
    outline: none;
    box-shadow: 0 0 0 2px rgba(150, 255, 0, 0.2);
  }
`;

const ImpersonateUser = () => {
  const { tenantId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [tenant, setTenant] = useState(null);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [impersonating, setImpersonating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [token, setToken] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  
  // Filtrar usuarios cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);
  
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
      
      // Obtener tenant y sus usuarios en paralelo
      const [tenantResponse, usersResponse] = await Promise.all([
        axios.get(`${API_URL}/api/admin/tenants/${tenantId}`, config),
        axios.get(`${API_URL}/api/admin/tenant/${tenantId}/users`, config)
      ]);
      
      setTenant(tenantResponse.data);
      setUsers(usersResponse.data);
      setFilteredUsers(usersResponse.data);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }, [API_URL, tenantId]);
  
  // Cargar datos del tenant y sus usuarios
  useEffect(() => {
    loadTenantData();
  }, [loadTenantData]);
  
  const handleImpersonate = async () => {
    if (!selectedUser) {
      setError('Por favor, selecciona un usuario para impersonar');
      return;
    }
    
    try {
      setImpersonating(true);
      setError('');
      
      const authToken = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      };
      
      // Solicitar token de impersonación
      const response = await axios.post(`${API_URL}/api/admin/impersonate/${selectedUser._id}`, {}, config);
      
      if (response.data && response.data.token) {
        setToken(response.data.token);
        setSuccess(`Token de impersonación generado para el usuario ${selectedUser.username}`);
      } else {
        setError('No se pudo obtener token de impersonación');
      }
    } catch (err) {
      console.error('Error al impersonar usuario:', err);
      setError('Error al impersonar usuario. Por favor, intenta nuevamente.');
    } finally {
      setImpersonating(false);
    }
  };
  
  const handleCopyToken = () => {
    navigator.clipboard.writeText(token)
      .then(() => {
        alert('Token copiado al portapapeles');
      })
      .catch(err => {
        console.error('Error al copiar:', err);
        alert('No se pudo copiar el token. Por favor, cópielo manualmente.');
      });
  };
  
  const handleUseToken = () => {
    // Guardar token actual para poder volver después
    localStorage.setItem('originalToken', localStorage.getItem('token'));
    
    // Establecer token de impersonación
    localStorage.setItem('token', token);
    
    // Redirigir al dashboard
    window.location.href = `https://${tenant.subdomain}.tuapp.com/products`;
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
      <Title>Impersonar Usuario</Title>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}
      
      <Card>
        <h2 style={{ marginBottom: '20px' }}>Tenant: {tenant.name}</h2>
        
        <SearchInput
          type="text"
          placeholder="Buscar usuario por nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <UserList>
          {filteredUsers.length > 0 ? (
            filteredUsers.map(user => (
              <UserCard 
                key={user._id} 
                onClick={() => setSelectedUser(user)}
                selected={selectedUser && selectedUser._id === user._id}
              >
                <UserAvatar>{user.username.charAt(0).toUpperCase()}</UserAvatar>
                <UserInfo>
                  <UserName>{user.username}</UserName>
                  <UserRole>
                    {user.role === 'tenantAdmin' 
                      ? 'Administrador' 
                      : user.role === 'tenantManager' 
                        ? 'Manager' 
                        : 'Usuario'}
                    {user.email && ` - ${user.email}`}
                  </UserRole>
                </UserInfo>
              </UserCard>
            ))
          ) : (
            <p>No hay usuarios para mostrar</p>
          )}
        </UserList>
        
        <Button 
          disabled={!selectedUser || impersonating} 
          onClick={handleImpersonate}
        >
          {impersonating ? 'Generando token...' : 'Impersonar Usuario Seleccionado'}
        </Button>
        
        <BackButton onClick={() => navigate(-1)}>
          Volver
        </BackButton>
        
        {token && (
          <TokenContainer>
            <TokenTitle>Token de Impersonación:</TokenTitle>
            <TokenCode>{token}</TokenCode>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <CopyButton onClick={handleCopyToken}>
                Copiar Token
              </CopyButton>
              
              <CopyButton onClick={handleUseToken}>
                Usar Token y Redirigir
              </CopyButton>
            </div>
            
            <Message>
              <strong>Nota:</strong> Este token expirará en 1 hora. Para usar manualmente, copia este token
              y establécelo como valor de 'token' en el localStorage del navegador, luego refresca la página.
            </Message>
            
            <Message>
              <strong>Advertencia:</strong> Todas las acciones realizadas mientras impersonas a un usuario
              quedarán registradas con tu identificación como superadmin.
            </Message>
          </TokenContainer>
        )}
      </Card>
    </Container>
  );
};

export default ImpersonateUser;